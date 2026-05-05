import React, { useState } from 'react';
import axios from 'axios';
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Award, 
  Target, 
  Brain, 
  Sparkles, 
  TrendingUp, 
  Zap, 
  MessageSquare,
  Key,
  Languages 
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
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === 'application/pdf') {
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

  const simulateProgress = () => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15;
      if (progress > 90) {
        progress = 90;
        clearInterval(interval);
      }
      setAnalysisProgress(Math.min(progress, 90));
    }, 500);
    return interval;
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
    setAnalysisProgress(0);

    const progressInterval = simulateProgress();

    try {
      const response = await axios.post(`${API_URL}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      clearInterval(progressInterval);
      setAnalysisProgress(100);

      setTimeout(() => {
        if (response.data.success) {
          setAnalysis(response.data.data);
        } else {
          setError(response.data.error || "Bilinmeyen bir hata oluştu.");
        }
        setLoading(false);
      }, 500);

    } catch (err) {
      clearInterval(progressInterval);
      const errorMsg = err.response?.data?.error || "Sunucuya bağlanılamadı. Lütfen backend'in çalıştığından emin olun.";
      setError(errorMsg);
      console.error("Hata Detayı:", err);
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
        <div className="logo-icon">
          <Sparkles size={32} />
        </div>
        <h1 className="gradient-text">AI CV Analyzer</h1>
        <p className="subtitle">
          Yapay zeka destekli CV analizi ile kariyerinizi şekillendirin
        </p>
        <div className="feature-badges">
          <span className="badge"><Zap size={14} /> Anlık Analiz</span>
          <span className="badge"><Brain size={14} /> AI Destekli</span>
          <span className="badge"><TrendingUp size={14} /> Kariyer Odaklı</span>
        </div>
      </header>

      <main>
        <section className="upload-section glass-effect">
          <div 
            className={`drop-zone ${dragActive ? 'drag-active' : ''} ${file ? 'has-file' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input 
              type="file" 
              onChange={handleFileChange} 
              accept=".pdf" 
              id="cv-upload" 
            />
            <label htmlFor="cv-upload" className="upload-label">
              <div className="upload-icon-wrapper">
                <Upload size={48} className="upload-icon" />
                <div className="upload-pulse"></div>
              </div>
              <div className="upload-text">
                <span className="upload-title">
                  {file ? file.name : "CV'nizi Buraya Sürükleyin"}
                </span>
                <span className="upload-subtitle">
                  {file ? `${(file.size / 1024).toFixed(1)} KB - PDF` : "veya tıklayarak seçin"}
                </span>
              </div>
            </label>
          </div>
          
          <button 
            onClick={handleUpload} 
            disabled={loading || !file} 
            className="analyze-btn"
          >
            {loading ? (
              <div className="btn-loading-content">
                <div className="loading-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <span>Analiz Ediliyor</span>
              </div>
            ) : (
              <>
                <Sparkles size={20} />
                <span>Analizi Başlat</span>
              </>
            )}
          </button>

          {error && (
            <div className="error-msg slide-in">
              <AlertCircle size={20}/> 
              <span>{error}</span>
            </div>
          )}
        </section>

        {loading && (
          <section className="analysis-animation fade-in">
            <div className="analysis-card glass-effect">
              <div className="analysis-content">
                <div className="brain-animation">
                  <Brain size={60} className="brain-icon pulse-animation" />
                  <div className="neural-lines">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className={`neural-line line-${i + 1}`}></div>
                    ))}
                  </div>
                </div>
                
                <h3>CV'niz Analiz Ediliyor</h3>
                
                <div className="progress-container">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${analysisProgress}%` }}
                    ></div>
                  </div>
                  <span className="progress-text">%{Math.round(analysisProgress)}</span>
                </div>

                <div className="analysis-steps">
                  <div className={`step ${analysisProgress > 20 ? 'completed' : ''}`}>
                    <CheckCircle size={16} />
                    <span>CV formatı kontrol ediliyor</span>
                  </div>
                  <div className={`step ${analysisProgress > 40 ? 'completed' : ''}`}>
                    <CheckCircle size={16} />
                    <span>Yetenekler analiz ediliyor</span>
                  </div>
                  <div className={`step ${analysisProgress > 60 ? 'completed' : ''}`}>
                    <CheckCircle size={16} />
                    <span>Deneyimler değerlendiriliyor</span>
                  </div>
                  <div className={`step ${analysisProgress > 80 ? 'completed' : ''}`}>
                    <CheckCircle size={16} />
                    <span>ATS uyumluluğu hesaplanıyor</span>
                  </div>
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
                  <div className="avatar">
                    {analysis.adSoyad?.charAt(0) || "A"}
                  </div>
                  <div>
                    <h2>{analysis.adSoyad || "Aday"}</h2>
                    <p className="result-date">Analiz tamamlandı • {new Date().toLocaleDateString('tr-TR')}</p>
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: '2rem' }}>
                  <div className="score-container">
                    <div className="score-circle" style={{
                      background: `conic-gradient(#10b981 ${analysis.atsUyumlulukSkoru * 3.6}deg, #e5e7eb 0deg)`
                    }}>
                      <div className="score-inner">
                        <span className="score-number">{analysis.atsUyumlulukSkoru || 0}</span>
                        <span className="score-label">% ATS</span>
                      </div>
                    </div>
                  </div>

                  <div className="score-container">
                    <div className="score-circle" style={{
                      background: `conic-gradient(#3b82f6 ${analysis.profesyonellikSkoru * 3.6}deg, #e5e7eb 0deg)`
                    }}>
                      <div className="score-inner">
                        <span className="score-number" style={{ color: '#3b82f6' }}>{analysis.profesyonellikSkoru || 0}</span>
                        <span className="score-label">PROFESYONEL</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Dil ve Ton Analizi */}
            <div className="summary-card glass-effect" style={{ marginTop: '1.5rem', borderLeft: '4px solid #3b82f6' }}>
              <div className="card-header">
                <Languages size={24} color="#3b82f6" className="card-icon"/>
                <h3>Dil Bilgisi ve Profesyonel Ton Analizi</h3>
              </div>
              <div style={{ padding: '1rem', backgroundColor: 'rgba(59, 130, 246, 0.05)', borderRadius: '12px', marginTop: '1rem' }}>
                <p className="summary-text" style={{ color: '#1f2937', fontWeight: '500' }}>
                  {analysis.dilGeriBildirimi || "Analiz yapılamadı."}
                </p>
              </div>
            </div>

            <div className="summary-card glass-effect" style={{ marginTop: '1.5rem' }}>
              <div className="card-header">
                <FileText size={24} className="card-icon"/>
                <h3>Profesyonel Özet</h3>
              </div>
              <p className="summary-text">{analysis.ozet || "Özet hazırlandığında burada görünecek."}</p>
            </div>

            {/* Kritik Eksik Anahtar Kelimeler (ATS) */}
            {analysis.eksikAnahtarKelimeler && analysis.eksikAnahtarKelimeler.length > 0 && (
              <div className="summary-card glass-effect" style={{ marginTop: '1.5rem', borderLeft: '4px solid #f59e0b' }}>
                <div className="card-header">
                  <Key size={24} color="#f59e0b" className="card-icon"/>
                  <h3>Kritik Eksik Anahtar Kelimeler (ATS)</h3>
                </div>
                <div className="tags" style={{ marginTop: '1rem' }}>
                  {analysis.eksikAnahtarKelimeler.map((kelime, i) => (
                    <span key={i} className="tag" style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#d97706', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                      {kelime}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="grid-container">
              <div className="card glass-effect hover-lift">
                <div className="card-header">
                  <Brain size={24} className="card-icon"/>
                  <h3>Yetenekler</h3>
                </div>
                <div className="tags">
                  {(analysis.yetenekler || []).map((y, i) => (
                    <span key={i} className="tag tag-animated">{y}</span>
                  ))}
                </div>
              </div>

              <div className="card glass-effect hover-lift">
                <div className="card-header">
                  <Award size={24} className="card-icon"/>
                  <h3>Güçlü Yanlar</h3>
                </div>
                <ul className="feature-list">
                  {(analysis.gucluYanlar || []).map((g, i) => (
                    <li key={i} className="feature-item">
                      <CheckCircle size={16} color="#10b981" />
                      <span>{g}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="card glass-effect hover-lift">
                <div className="card-header">
                  <Target size={24} className="card-icon"/>
                  <h3>Geliştirilmesi Gerekenler</h3>
                </div>
                <ul className="feature-list">
                  {(analysis.gelistirilmesiGerekenler || []).map((g, i) => (
                    <li key={i} className="feature-item">
                      <AlertCircle size={16} color="#f59e0b" />
                      <span>{g}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="card glass-effect hover-lift">
                <div className="card-header">
                  <FileText size={24} className="card-icon"/>
                  <h3>Önerilen Pozisyonlar</h3>
                </div>
                <ul className="feature-list">
                  {(analysis.onerilenPozisyonlar || []).map((p, i) => (
                    <li key={i} className="feature-item">
                      <TrendingUp size={16} color="#8b5cf6" />
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Mülakat Soruları Bölümü */}
            {analysis.mulakatSorulari && analysis.mulakatSorulari.length > 0 && (
              <div className="summary-card glass-effect" style={{ marginTop: '1.5rem' }}>
                <div className="card-header">
                  <MessageSquare size={24} className="card-icon"/>
                  <h3>Mülakatta Karşılaşabileceğiniz Sorular</h3>
                </div>
                <ul className="feature-list" style={{ marginTop: '1rem' }}>
                  {analysis.mulakatSorulari.map((soru, i) => (
                    <li key={i} className="feature-item" style={{ alignItems: 'flex-start', marginBottom: '1rem' }}>
                      <Brain size={18} color="#3b82f6" style={{ marginTop: '3px', flexShrink: 0 }} />
                      <span style={{ lineHeight: '1.5', fontWeight: '500' }}>{soru}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

          </section>
        )}
      </main>
    </div>
  );
}

export default App;
