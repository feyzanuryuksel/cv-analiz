# 🚀 AI CV Analyzer Pro

Yapay zeka destekli, modern ve kapsamlı bir CV analiz ve kariyer geliştirme platformu. Bu proje; adayların CV'lerini yükleyerek ATS (Aday Takip Sistemleri) uyumluluğunu ölçmelerini, eksik yeteneklerini görmelerini, mülakatlara hazırlanmalarını ve yapay zeka tarafından optimize edilmiş bir kariyer yol haritası edinmelerini sağlar.

---

## ✨ Özellikler

* 📂 **PDF Yükleme & Bulut Depolama:** CV'ler güvenli bir şekilde AWS S3 üzerinde depolanır.
* 🤖 **AI Destekli Analiz:** Google Gemini 1.5 Flash modeli ile CV metni saniyeler içinde analiz edilir.
* 📊 **Çift Skorlama Sistemi:** Hem **ATS Uyumluluk Skoru** hem de **Dil & Profesyonellik Skoru** hesaplanır.
* 🎯 **Kritik Eksik Anahtar Kelimeler:** Sektör trendlerine göre CV'de bulunması gereken ancak eksik olan 5 kritik yetenek/teknoloji listelenir.
* 💬 **Yapay Zeka Mülakat Soruları:** CV'deki deneyimlere özel olarak hazırlanmış, adayı zorlayabilecek 3 teknik mülakat sorusu üretilir.
* 💼 **LinkedIn "Hakkında" Oluşturucu:** Profilde kullanıma hazır, profesyonel ve etkileyici özet metin tasarlanır.
* 🗺️ **1-2 Yıllık Kariyer Yol Haritası:** Kıdemli pozisyonlara ulaşmak için atılması gereken somut gelişim adımları listelenir.

---

## 🛠️ Teknolojiler

### Frontend
* React (Vite)
* Axios
* Lucide React (Modern İkon Kütüphanesi)
* CSS3 (Cam efekti / Glassmorphism UI)

### Backend
* Node.js & Express
* @google/generative-ai (Gemini API)
* @aws-sdk/client-s3 (AWS SDK v3)
* Multer & PDF-Parse

---

## 🚀 Yerel Kurulum (Local Setup)

Projeyi yerel bilgisayarınızda çalıştırmak için aşağıdaki adımları takip edin:

### 1. Depoyu Klonlayın
# 🚀 AI CV Analyzer Pro

Yapay zeka destekli, modern ve kapsamlı bir CV analiz ve kariyer geliştirme platformu. Bu proje; adayların CV'lerini yükleyerek ATS (Aday Takip Sistemleri) uyumluluğunu ölçmelerini, eksik yeteneklerini görmelerini, mülakatlara hazırlanmalarını ve yapay zeka tarafından optimize edilmiş bir kariyer yol haritası edinmelerini sağlar.

---

## ✨ Özellikler

* 📂 **PDF Yükleme & Bulut Depolama:** CV'ler güvenli bir şekilde AWS S3 üzerinde depolanır.
* 🤖 **AI Destekli Analiz:** Google Gemini 1.5 Flash modeli ile CV metni saniyeler içinde analiz edilir.
* 📊 **Çift Skorlama Sistemi:** Hem **ATS Uyumluluk Skoru** hem de **Dil & Profesyonellik Skoru** hesaplanır.
* 🎯 **Kritik Eksik Anahtar Kelimeler:** Sektör trendlerine göre CV'de bulunması gereken ancak eksik olan 5 kritik yetenek/teknoloji listelenir.
* 💬 **Yapay Zeka Mülakat Soruları:** CV'deki deneyimlere özel olarak hazırlanmış, adayı zorlayabilecek 3 teknik mülakat sorusu üretilir.
* 💼 **LinkedIn "Hakkında" Oluşturucu:** Profilde kullanıma hazır, profesyonel ve etkileyici özet metin tasarlanır.
* 🗺️ **1-2 Yıllık Kariyer Yol Haritası:** Kıdemli pozisyonlara ulaşmak için atılması gereken somut gelişim adımları listelenir.

---

## 🛠️ Teknolojiler

### Frontend
* React (Vite)
* Axios
* Lucide React (Modern İkon Kütüphanesi)
* CSS3 (Cam efekti / Glassmorphism UI)

### Backend
* Node.js & Express
* @google/generative-ai (Gemini API)
* @aws-sdk/client-s3 (AWS SDK v3)
* Multer & PDF-Parse

---

## 🚀 Yerel Kurulum (Local Setup)

Projeyi yerel bilgisayarınızda çalıştırmak için aşağıdaki adımları takip edin:

### 1. Depoyu Klonlayın

###2. Ortam Değişkenlerini Ayarlayın (.env)
Hem backend hem frontend için gerekli olan ortam değişkenlerini tanımlamanız gerekir.

Backend için dizinde .env dosyası oluşturun:
```text
PORT=5000
GEMINI_API_KEY=your_gemini_api_key_here
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=your_aws_region
AWS_BUCKET_NAME=your_s3_bucket_name
```
Frontend için .env veya .env.local dosyası oluşturun:
```text
VITE_API_URL=http://localhost:5000
```

3. Bağımlılıkları Kurun ve Çalıştırın
Backend'i başlatmak için:
```text
# Backend klasöründe veya ana dizinde
npm install
node server.js # veya npm start
```

Frontend'i başlatmak için:
```text
# Frontend klasöründe
npm install
npm run dev
```

☁️ Dağıtım (Deployment)
Proje Vercel ortamına tam uyumludur.

Backend dağıtımı yapılırken Vercel panelinden Environment Variables kısmına .env içindeki tüm gizli anahtarlar eklenmelidir.

Frontend ve Backend aynı repoda ise vercel.json yapılandırması kullanılabilir.
