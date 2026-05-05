import React, { useState } from 'react';
import axios from 'axios';
import { 
  Upload, FileText, CheckCircle, AlertCircle, Award, Target, Brain, 
  Sparkles, TrendingUp, Zap, MessageSquare, Linkedin, Key, PenTool, Map 
} from 'lucide-react';
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

  // 🕒 Yavaşlatılmış analiz barı (İstediğin gibi)
  const simulateProgress = () => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 6; 
      if (progress > 92) {
        progress = 92;
        clearInterval(interval);
      }
      setAnalysisProgress(Math.min(progress, 92));
    }, 850); 
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
      }, 700);
    } catch (err) {
      clearInterval(progressInterval);
      setError(err.response?.data?.error || "Sunucuya bağlanılamadı.");
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <div className="animated-bg">
        <div className="gradient-sphere sphere-1"></div>
        <div className="gradient-sphere sphere-2"></div>
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
              <Upload size={48} className="upload-icon" />
              <div className="upload-text">
                <span className="upload-title">{file ? file.name : "CV'nizi Buraya Sürükleyin"}</span>
                <span className="upload-subtitle">veya tıklayarak seçin</span>
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
              <div className="brain-animation"><Brain size={60} className="pulse-animation" /></div>
              <h3>Mühendislik Analizi Yapılıyor</h3>
              <div className="progress-container">
                <div className="progress-bar"><div className="progress-fill" style={{ width: `${analysisProgress}%` }}></div></div>
                <span className="progress-text">%{Math.round(analysisProgress)}</span>
              </div>
            </div>
          </section>
        )}

        {analysis && (
          <section className="results-container fade-in">
            {/* 7. MADDE: Ton Analizi */}
            <div className="tone-alert glass-effect">
              <PenTool size={20} color="#6c5ce7" />
              <span><strong>Dil ve Ton Skoru: %{analysis.yazimVeTonAnalizi?.skor}</strong> - {analysis.yazimVeTonAnalizi?.geriBildirim}</span>
            </div>

            <div className="grid-container">
              {/* ATS SKORU */}
              <div className="card glass-effect hover-lift">
                <div className="score-circle" style={{ background: `conic-gradient(#10b981 ${analysis.atsUyumlulukSkoru * 3.6}deg, rgba(255,255,255,0.1) 0deg)` }}>
                  <div className="score-inner">
                    <span className="score-number">{analysis.atsUyumlulukSkoru}</span>
                    <span className="score-label">% ATS</span>
                  </div>
                </div>
              </div>

              {/* 5. MADDE: LinkedIn Özeti */}
              <div className="card glass-effect hover-lift">
                <div className="card-header"><Linkedin size={22} color="#0077b5"/> <h3>LinkedIn Hakkında</h3></div>
                <p className="small-text">{analysis.linkedinOzet}</p>
                <button className="copy-btn" onClick={() => navigator.clipboard.writeText(analysis.linkedinOzet)}>Metni Kopyala</button>
              </div>

              {/* 6. MADDE: Eksik Anahtar Kelimeler */}
              <div className="card glass-effect hover-lift">
                <div className="card-header"><Key size={22} color="#ef4444"/> <h3>Eksik Anahtar Kelimeler</h3></div>
                <div className="tags">
                  {(analysis.eksikAnahtarKelimeler || []).map((k, i) => <span key={i} className="tag tag-missing">{k}</span>)}
                </div>
              </div>

              {/* 3. MADDE: Mülakat Hazırlığı */}
              <div className="card glass-effect hover-lift">
                <div className="card-header"><MessageSquare size={22} color="#10b981"/> <h3>Mülakat Hazırlığı</h3></div>
                <ul className="feature-list">
                  {(analysis.mulakatSorulari || []).map((s, i) => <li key={i} className="feature-item"><strong>Soru:</strong> {s}</li>)}
                </ul>
              </div>

              {/* 8. MADDE: Kariyer Yol Haritası */}
              <div className="card glass-effect hover-lift full-width">
                <div className="card-header"><Map size={22} color="#fd79a8"/> <h3>Adım Adım Gelişim Yol Haritası</h3></div>
                <div className="roadmap-list">
                  {(analysis.kariyerYolHaritasi || []).map((step, i) => (
                    <div key={i} className="roadmap-step">
                      <div className="step-number">{i + 1}</div>
                      <p>{step}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* STANDART KARTLAR */}
              <div className="card glass-effect hover-lift">
                <div className="card-header"><Brain size={22} color="#6c5ce7"/> <h3>Yetenekler</h3></div>
                <div className="tags">{(analysis.yetenekler || []).map((y, i) => <span key={i} className="tag">{y}</span>)}</div>
              </div>

              <div className="card glass-effect hover-lift">
                <div className="card-header"><Award size={22} color="#10b981"/> <h3>Güçlü Yanlar</h3></div>
                <ul className="feature-list">{(analysis.gucluYanlar || []).map((g, i) => <li key={i} className="feature-item"><CheckCircle size={14} color="#10b981"/> {g}</li>)}</ul>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default App;
