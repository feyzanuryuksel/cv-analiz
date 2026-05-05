import React, { useState } from 'react';
import axios from 'axios';
import { Upload, FileText, CheckCircle, AlertCircle, Loader2, Award, Target, Brain } from 'lucide-react';
import './App.css';

// 🚀 Backend URL'ini ortam değişkeninden alıyoruz. 
// Yerel geliştirme yaparken http://localhost:5000 kullanır.
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function App() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type !== 'application/pdf') {
      setError("Lütfen sadece PDF dosyası yükleyin.");
      setFile(null);
      return;
    }
    setFile(selectedFile);
    setError(null);
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Lütfen önce bir PDF dosyası seçin.");
      return;
    }

    const formData = new FormData();
    formData.append('cv', file);

    setLoading(true);
    setAnalysis(null);
    setError(null);

    try {
      // 🔗 Dinamik URL kullanımı
      const response = await axios.post(`${API_URL}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.success) {
        setAnalysis(response.data.data);
      } else {
        setError(response.data.error || "Bilinmeyen bir hata oluştu.");
      }
    } catch (err) {
      // Daha detaylı hata yakalama
      const errorMsg = err.response?.data?.error || "Sunucuya bağlanılamadı. Lütfen backend'in çalıştığından emin olun.";
      setError(errorMsg);
      console.error("Hata Detayı:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <header>
        <h1>Proje 1: Yapay Zeka Destekli CV Analiz Sistemi</h1>
        <p>Dijital Dönüşümün Yeni Adımı</p>
      </header>

      <main>
        <section className="upload-section">
          <div className={`drop-zone ${file ? 'has-file' : ''}`}>
            <input type="file" onChange={handleFileChange} accept=".pdf" id="cv-upload" />
            <label htmlFor="cv-upload">
              <Upload size={40} />
              <span>{file ? file.name : "CV'nizi Buraya Sürükleyin veya Tıklayın"}</span>
            </label>
          </div>
          
          <button 
            onClick={handleUpload} 
            disabled={loading || !file} 
            className="analyze-btn"
          >
            {loading ? (
              <><Loader2 className="spinner" /> Analiz Ediliyor...</>
            ) : (
              "Analizi Başlat"
            )}
          </button>

          {error && <div className="error-msg"><AlertCircle size={20}/> {error}</div>}
        </section>

        {analysis && (
          <section className="results-container">
            <div className="result-header">
              <h2><CheckCircle color="#10b981" /> Analiz Sonucu: {analysis.adSoyad || "Aday"}</h2>
              <div className="score-badge">ATS Skoru: %{analysis.atsUyumlulukSkoru || 0}</div>
            </div>

            <div className="summary-card">
              <h3><FileText size={20}/> Profesyonel Özet</h3>
              <p>{analysis.ozet || "Özet hazırlandığında burada görünecek."}</p>
            </div>

            <div className="grid-container">
              <div className="card">
                <h3><Brain size={20} color="#6366f1"/> Yetenekler</h3>
                <div className="tags">
                  {(analysis.yetenekler || []).map((y, i) => (
                    <span key={i} className="tag">{y}</span>
                  ))}
                </div>
              </div>

              <div className="card">
                <h3><Award size={20} color="#f59e0b"/> Güçlü Yanlar</h3>
                <ul>
                  {(analysis.gucluYanlar || []).map((g, i) => <li key={i}>{g}</li>)}
                </ul>
              </div>

              <div className="card">
                <h3><Target size={20} color="#ef4444"/> Geliştirilmesi Gerekenler</h3>
                <ul>
                  {(analysis.gelistirilmesiGerekenler || []).map((g, i) => <li key={i}>{g}</li>)}
                </ul>
              </div>

              <div className="card">
                <h3><FileText size={20} color="#8b5cf6"/> Önerilen Pozisyonlar</h3>
                <ul>
                  {(analysis.onerilenPozisyonlar || []).map((p, i) => <li key={i}>{p}</li>)}
                </ul>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default App;
