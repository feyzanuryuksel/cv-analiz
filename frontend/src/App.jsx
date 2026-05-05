import React, { useState } from 'react';
import axios from 'axios';
import { Upload, FileText, CheckCircle, AlertCircle, Award, Target, Brain, Sparkles, TrendingUp, Zap } from 'lucide-react';
import './App.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function App() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);

  const handleDrag = (e) => {
    e.preventDefault(); e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault(); e.stopPropagation();
    setDragActive(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile?.type === 'application/pdf') {
      setFile(droppedFile);
      setError(null);
    } else {
      setError("Lütfen sadece PDF dosyası yükleyin.");
    }
  };

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

  // 🕒 Yavaşlatılmış ve senkronize edilmiş analiz barı
  const simulateProgress = () => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 5 + 2; // Daha küçük ve kontrollü artış
      if (progress > 92) {
        progress = 92;
        clearInterval(interval);
      }
      setAnalysisProgress(Math.min(progress, 92));
    }, 850); // Adım süresi artırıldı
    return interval;
  };

  const handleUpload = async () => {
    if (!file) { setError("Lütfen önce bir PDF dosyası seçin."); return; }
    const formData = new FormData();
    formData.append('cv', file);
    setLoading(true); setAnalysis(null); setError(null); setAnalysisProgress(0);
    const progressInterval = simulateProgress();

    try {
      const response = await axios.post(`${API_URL}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      clearInterval(progressInterval);
      setAnalysisProgress(100);
      setTimeout(() => {
        if (response.data.success) setAnalysis(response.data.data);
        else setError(response.data.error || "Bilinmeyen bir hata oluştu.");
        setLoading(false);
      }, 800);
    } catch (err) {
      clearInterval(progressInterval);
      setError(err.response?.data?.error || "Sunucu hatası oluştu.");
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <div className="animated-bg">
        <div className="gradient-sphere sphere-1"></div>
        <div className="gradient-sphere sphere-2"></div>
        <div className="gradient-sphere sphere-3"></div>
      </div>

      <header className="hero-header">
        <div className="logo-icon"><Sparkles size={32} /></div>
        <h1 className="gradient-text">AI CV Analyzer</h1>
        <div className="feature-badges">
          <span className="badge"><Zap size={14} /> Anlık Analiz</span>
          <span className="badge"><Brain size={14} /> AI Destekli</span>
          <span className="badge"><TrendingUp size={14} /> Kariyer Odaklı</span>
        </div>
      </header>

      <main>
        <section className="upload-section glass-effect">
          <div className={`drop-zone ${dragActive ? 'drag-active' : ''} ${file ? 'has-file' : ''}`}
            onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}>
            <input type="file" onChange={handleFileChange} accept=".pdf" id="cv-upload" />
            <label htmlFor="cv-upload" className="upload-label">
              <div className="upload-icon-wrapper">
                <Upload size={48} className="upload-icon" />
                <div className="upload-pulse"></div>
              </div>
              <div className="upload-text">
                <span className="upload-title">{file ? file.name : "CV'nizi Buraya Sürükleyin"}</span>
                <span className="upload-subtitle">{file ? `${(file.size / 1024).toFixed(1)} KB` : "veya tıklayarak seçin"}</span>
              </div>
            </label>
          </div>
          <button onClick={handleUpload} disabled={loading || !file} className="analyze-btn">
            {loading ? "Analiz Ediliyor..." : <><Sparkles size={20} /> Analizi Başlat</>}
          </button>
          {error && <div className="error-msg slide-in"><AlertCircle size={20}/> {error}</div>}
        </section>

        {loading && (
          <section className="analysis-animation fade-in">
            <div className="analysis-card glass-effect">
              <div className="analysis-content">
                <div className="brain-animation">
                  <Brain size={60} className="brain-icon pulse-animation" />
                  <div className="neural-lines">
                    {[...Array(6)].map((_, i) => <div key={i} className={`neural-line line-${i + 1}`}></div>)}
                  </div>
                </div>
                <h3>CV Analiz Motoru Çalışıyor</h3>
                <div className="progress-container">
                  <div className="progress-bar"><div className="progress-fill" style={{ width: `${analysisProgress}%` }}></div></div>
                  <span className="progress-text">%{Math.round(analysisProgress)}</span>
                </div>
                <div className="analysis-steps">
                  <div className={`step ${analysisProgress > 25 ? 'completed' : ''}`}><CheckCircle size={16} /> CV formatı kontrol ediliyor</div>
                  <div className={`step ${analysisProgress > 50 ? 'completed' : ''}`}><CheckCircle size={16} /> Yetenekler analiz ediliyor</div>
                  <div className={`step ${analysisProgress > 75 ? 'completed' : ''}`}><CheckCircle size={16} /> Deneyimler puanlanıyor</div>
                  <div className={`step ${analysisProgress > 90 ? 'completed' : ''}`}><CheckCircle size={16} /> ATS skoru hesaplanıyor</div>
                </div>
              </div>
            </div>
          </section>
        )}

        {analysis && (
          <section className="results-container fade-in">
            <div className="result-header glass-effect">
              <div className="header-content">
                <div className="candidate-info">
                  <div className="avatar">{analysis.adSoyad?.charAt(0) || "A"}</div>
                  <div>
                    <h2>{analysis.adSoyad || "Aday"}</h2>
                    <p className="result-date">Analiz Tarihi: {new Date().toLocaleDateString('tr-TR')}</p>
                  </div>
                </div>
                <div className="score-container">
                  <div className="score-circle" style={{ background: `conic-gradient(#10b981 ${analysis.atsUyumlulukSkoru * 3.6}deg, rgba(255,255,255,0.1) 0deg)` }}>
                    <div className="score-inner">
                      <span className="score-number">{analysis.atsUyumlulukSkoru}</span>
                      <span className="score-label">% ATS</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="summary-card glass-effect">
              <div className="card-header"><FileText size={22} color="#6c5ce7"/> <h3>Profesyonel Özet</h3></div>
              <p className="summary-text">{analysis.ozet}</p>
            </div>

            <div className="grid-container">
              <div className="card glass-effect hover-lift">
                <div className="card-header"><Brain size={22} color="#6c5ce7"/> <h3>Yetenekler</h3></div>
                <div className="tags">{(analysis.yetenekler || []).map((y, i) => <span key={i} className="tag">{y}</span>)}</div>
              </div>
              <div className="card glass-effect hover-lift">
                <div className="card-header"><Award size={22} color="#10b981"/> <h3>Güçlü Yanlar</h3></div>
                <ul className="feature-list">{(analysis.gucluYanlar || []).map((g, i) => <li key={i} className="feature-item"><CheckCircle size={14} color="#10b981"/>{g}</li>)}</ul>
              </div>
              <div className="card glass-effect hover-lift">
                <div className="card-header"><Target size={22} color="#f59e0b"/> <h3>Gelişim Alanları</h3></div>
                <ul className="feature-list">{(analysis.gelistirilmesiGerekenler || []).map((g, i) => <li key={i} className="feature-item"><AlertCircle size={14} color="#f59e0b"/>{g}</li>)}</ul>
              </div>
              <div className="card glass-effect hover-lift">
                <div className="card-header"><TrendingUp size={22} color="#fd79a8"/> <h3>Önerilen Roller</h3></div>
                <ul className="feature-list">{(analysis.onerilenPozisyonlar || []).map((p, i) => <li key={i} className="feature-item"><Sparkles size={14} color="#fd79a8"/>{p}</li>)}</ul>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default App;
