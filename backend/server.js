const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3'); // AWS SDK v3
require('dotenv').config();

// Konsol Renkleri
const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const RESET = '\x1b[0m';

const app = express();
const PORT = process.env.PORT || 5000;

// ================= 1. AWS S3 YAPILANDIRMASI =================
const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    }
});

// ================= 2. AI YAPILANDIRMASI =================
if (!process.env.GEMINI_API_KEY) {
    console.error(`${RED}HATA: GEMINI_API_KEY bulunamadı!${RESET}`);
}
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

// ================= 3. MIDDLEWARE & UPLOADS =================
app.use(cors());
app.use(express.json());

const uploadDir = './uploads';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Multer (Geçici olarak sunucuda tutacağız, analizden sonra S3'e atıp sileceğiz)
const upload = multer({ dest: 'uploads/' });

// ================= 4. YARDIMCI FONKSİYONLAR =================

// AWS S3'e Dosya Yükleme Fonksiyonu
async function uploadToS3(filePath, fileName) {
    const fileStream = fs.createReadStream(filePath);
    const uploadParams = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: `cv-files/${Date.now()}-${fileName}`,
        Body: fileStream,
        ContentType: 'application/pdf'
    };

    try {
        await s3Client.send(new PutObjectCommand(uploadParams));
        const fileUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${uploadParams.Key}`;
        return fileUrl;
    } catch (err) {
        console.error(`${RED}S3 Yükleme Hatası:${RESET}`, err);
        throw new Error("Dosya buluta yüklenemedi.");
    }
}

// AI Analiz Fonksiyonu
async function analyzeCVWithAI(cvText) {
    const prompt = `
    Sen bir profesyonel İK uzmanısın. Aşağıdaki CV metnini analiz et ve sonucu SADECE JSON formatında döndür.
    
    JSON Formatı:
    {
      "adSoyad": "",
      "ozet": "",
      "yetenekler": [],
      "deneyimPuani": 0,
      "gucluYanlar": [],
      "gelistirilmesiGerekenler": [],
      "onerilenPozisyonlar": [],
      "atsUyumlulukSkoru": 0,
      "mulakatSorulari": [],
      "linkedinHakkinda": ""
    }
    
    Analiz Talimatları:
    1. "mulakatSorulari": CV'deki teknik deneyimlere dayanarak adayı zorlayacak 3 adet spesifik teknik mülakat sorusu hazırla.
    2. "linkedinHakkinda": CV'deki başarıları ve yetkinlikleri kullanarak, LinkedIn "Hakkında" kısmında kullanılabilecek, profesyonel, etkileyici ve birinci ağızdan (ben diliyle) yazılmış bir özet metin oluştur.
    3. Diğer tüm alanları CV içeriğine göre doldur.
    
    CV Metni: ${cvText}`;

    try {
        const result = await model.generateContent(prompt);
        let text = result.response.text();
        
        // JSON Temizleme (Markdown işaretlerini kaldır)
        text = text.replace(/```json/gi, '').replace(/```/gi, '').trim();
        const start = text.indexOf('{');
        const end = text.lastIndexOf('}');
        if (start !== -1 && end !== -1) text = text.substring(start, end + 1);

        return JSON.parse(text);
    } catch (err) {
        console.error(`${RED}AI HATA:${RESET}`, err.message);
        return null;
    }
}

// ================= 5. ROTALAR =================

app.get('/', (req, res) => {
    res.send('CV Analiz Sistemi API - AWS S3 & Gemini Aktif');
});

app.post('/upload', upload.single('cv'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ success: false, error: 'Dosya seçilmedi' });

        console.log(`${YELLOW}İşlem başlatıldı: ${req.file.originalname}${RESET}`);

        // 1. PDF Metnini Oku
        const buffer = fs.readFileSync(req.file.path);
        let pdfData;
        try {
            pdfData = await pdfParse(buffer);
        } catch (e) {
            pdfData = await pdfParse.default(buffer);
        }

        if (!pdfData.text || pdfData.text.trim().length < 10) {
            throw new Error("PDF okunamadı veya metin içermiyor.");
        }

        // 2. AWS S3'e Yükle
        console.log(`${YELLOW}S3'e yükleniyor...${RESET}`);
        const s3Url = await uploadToS3(req.file.path, req.file.originalname);

        // 3. AI ile Analiz Et
        console.log(`${YELLOW}Gemini analiz ediyor...${RESET}`);
        const analysis = await analyzeCVWithAI(pdfData.text);

        // 4. Geçici dosyayı sunucudan sil
        fs.unlinkSync(req.file.path);

        if (!analysis) throw new Error("Analiz oluşturulamadı.");

        console.log(`${GREEN}Başarılı!${RESET}`);

        // Sonucu dön (S3 URL'i ve Analiz verisi birlikte)
        res.json({
            success: true,
            s3Url: s3Url,
            data: analysis
        });

    } catch (err) {
        console.error(`${RED}HATA:${RESET}`, err.message);
        if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        res.status(500).json({ success: false, error: err.message });
    }
});

// ================= 6. BAŞLAT =================
app.listen(PORT, () => {
    console.log(`
    ${GREEN}==========================================
    🚀 Sunucu hazır: http://localhost:${PORT}
    ☁️  Depolama: AWS S3 Aktif
    🤖 Zeka: Google Gemini 1.5 Flash Aktif
    ==========================================${RESET}
    `);
});
