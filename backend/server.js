const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const pdfParse = require('pdf-parse');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// AWS S3 Yapılandırması
const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    }
});

// AI Yapılandırması
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

app.use(cors());
app.use(express.json());

const upload = multer({ dest: 'uploads/' });

// AI Analiz Fonksiyonu (Etap 4 Genişletilmiş Prompt)
async function analyzeCVWithAI(cvText) {
    const prompt = `
    Sen kıdemli bir İK uzmanı ve kariyer koçusun. Aşağıdaki CV metnini profesyonel bir bakış açısıyla analiz et. 
    SADECE JSON döndür. Başka bir metin ekleme.
    
    JSON Yapısı:
    {
      "adSoyad": "",
      "ozet": "",
      "yetenekler": [],
      "atsUyumlulukSkoru": 0,
      "gucluYanlar": [],
      "gelistirilmesiGerekenler": [],
      "onerilenPozisyonlar": [],
      "mulakatSorulari": [], 
      "linkedinOzet": "", 
      "eksikAnahtarKelimeler": [], 
      "yazimVeTonAnalizi": {
        "skor": 0,
        "geriBildirim": ""
      },
      "kariyerYolHaritasi": [] 
    }

    Kurallar:
    1. mulakatSorulari: Adayın deneyimlerine özel 3 adet teknik veya yetkinlik bazlı soru olsun.
    2. linkedinOzet: LinkedIn "Hakkında" kısmında kullanılabilecek, dikkat çekici bir paragraf olsun.
    3. eksikAnahtarKelimeler: Adayın hedeflediği sektörde (teknoloji/mühendislik) CV'sinde eksik olan 5 kritik terimi belirle.
    4. yazimVeTonAnalizi: Dilin profesyonelliğini 100 üzerinden puanla ve kısa bir geri bildirim ver.
    5. kariyerYolHaritasi: Sertifika ismi vermeden; öğrenilmesi gereken yazılım dilleri, araçlar veya teknik alanları "1. Adım: ...", "2. Adım: ..." şeklinde listeleyerek bir gelişim planı sun.

    CV Metni: ${cvText}`;

    try {
        const result = await model.generateContent(prompt);
        let text = result.response.text();
        // JSON temizleme işlemi
        text = text.replace(/```json/gi, '').replace(/```/gi, '').trim();
        const start = text.indexOf('{');
        const end = text.lastIndexOf('}');
        if (start !== -1 && end !== -1) text = text.substring(start, end + 1);
        return JSON.parse(text);
    } catch (err) {
        console.error("AI HATA:", err.message);
        return null;
    }
}

async function uploadToS3(filePath, fileName) {
    const fileStream = fs.createReadStream(filePath);
    const uploadParams = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: `cv-files/${Date.now()}-${fileName}`,
        Body: fileStream,
        ContentType: 'application/pdf'
    };
    await s3Client.send(new PutObjectCommand(uploadParams));
    return `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${uploadParams.Key}`;
}

app.post('/upload', upload.single('cv'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ success: false, error: 'Dosya seçilmedi' });

        const buffer = fs.readFileSync(req.file.path);
        let pdfData;
        try { pdfData = await pdfParse(buffer); } catch (e) { pdfData = await pdfParse.default(buffer); }

        if (!pdfData.text || pdfData.text.trim().length < 10) throw new Error("PDF metni okunamadı.");

        const s3Url = await uploadToS3(req.file.path, req.file.originalname);
        const analysis = await analyzeCVWithAI(pdfData.text);

        fs.unlinkSync(req.file.path);

        if (!analysis) throw new Error("Analiz başarısız oldu.");

        res.json({ success: true, s3Url, data: analysis });
    } catch (err) {
        if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        res.status(500).json({ success: false, error: err.message });
    }
});

app.listen(PORT, () => console.log(`Backend ${PORT} portunda hazır.`));
