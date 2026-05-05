const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
require('dotenv').config();

const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const RESET = '\x1b[0m';

const app = express();
const PORT = process.env.PORT || 5000;

const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    }
});

if (!process.env.GEMINI_API_KEY) {
    console.error(`${RED}HATA: GEMINI_API_KEY bulunamadı!${RESET}`);
}
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

app.use(cors());
app.use(express.json());

const uploadDir = './uploads';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

const upload = multer({ dest: 'uploads/' });

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
        return `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${uploadParams.Key}`;
    } catch (err) {
        console.error(`${RED}S3 Yükleme Hatası:${RESET}`, err);
        throw new Error("Dosya buluta yüklenemedi.");
    }
}

async function analyzeCVWithAI(cvText) {
    const prompt = `
    Sen üst düzey bir teknik İK uzmanısın. Aşağıdaki CV metnini analiz et ve SADECE JSON formatında yanıt dön.
    
    Analiz şunları içermeli:
    1. adSoyad, ozet, yetenekler (dizi), gucluYanlar (dizi), gelistirilmesiGerekenler (dizi), onerilenPozisyonlar (dizi), atsUyumlulukSkoru (sayı).
    2. mulakatSorulari: Deneyimlere dayanan 3 adet zorlayıcı teknik mülakat sorusu.
    3. linkedinHakkinda: Profesyonel ve etkileyici bir "Hakkında" metni.
    4. eksikAnahtarKelimeler: ATS için kritik olan, eksik 5 anahtar kelime/teknoloji.
    5. dilAnalizi: { skor: 0-100 arası sayı, geriBildirim: "ton ve gramer hakkında kısa yorum" }.
    6. kariyerYolHaritasi: Önümüzdeki 1-2 yıl için somut gelişim adımları (dizi).

    Format:
    {
      "adSoyad": "",
      "ozet": "",
      "yetenekler": [],
      "gucluYanlar": [],
      "gelistirilmesiGerekenler": [],
      "onerilenPozisyonlar": [],
      "atsUyumlulukSkoru": 0,
      "mulakatSorulari": ["", "", ""],
      "linkedinHakkinda": "",
      "eksikAnahtarKelimeler": [],
      "dilAnalizi": { "skor": 0, "geriBildirim": "" },
      "kariyerYolHaritasi": []
    }

    CV Metni: ${cvText}`;

    try {
        const result = await model.generateContent(prompt);
        let text = result.response.text();
        text = text.replace(/```json/gi, '').replace(/```/gi, '').trim();
        return JSON.parse(text);
    } catch (err) {
        console.error(`${RED}AI HATA:${RESET}`, err.message);
        return null;
    }
}

app.post('/upload', upload.single('cv'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ success: false, error: 'Dosya seçilmedi' });

        const buffer = fs.readFileSync(req.file.path);
        let pdfData;
        try {
            pdfData = await pdfParse(buffer);
        } catch (e) {
            pdfData = await pdfParse.default(buffer);
        }

        const s3Url = await uploadToS3(req.file.path, req.file.originalname);
        const analysis = await analyzeCVWithAI(pdfData.text);

        fs.unlinkSync(req.file.path);

        if (!analysis) throw new Error("Analiz oluşturulamadı.");

        res.json({ success: true, s3Url, data: analysis });
    } catch (err) {
        console.error(`${RED}HATA:${RESET}`, err.message);
        res.status(500).json({ success: false, error: err.message });
    }
});

app.listen(PORT, () => console.log(`${GREEN}Sunucu http://localhost:${PORT} üzerinde çalışıyor.${RESET}`));
