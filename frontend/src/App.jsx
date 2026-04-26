import React, { useState } from 'react';
import axios from 'axios';
import { Upload, FileText, CheckCircle, AlertCircle, Loader2, Award, Target, Brain, Sparkles, Zap, TrendingUp, Briefcase, User, Mail, Phone, MapPin, Calendar, Star, BarChart3, Shield } from 'lucide-react';
import './App.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function App() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);
  const [dragActive, setDragActive] = useState(false);

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
      const response = await axios.post(`${API_URL}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.success) {
        setTimeout(() => {
          setAnalysis(response.data.data);
          setLoading(false);
        }, 3000);
      } else {
        setError(response.data.error || "Bilinmeyen bir hata oluştu.");
        setLoading(false);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error || "Sunucuya bağlanılamadı. Lütfen backend'in çalıştığından emin olun.";
      setError(errorMsg);
      console.error("Hata Detayı:", err);
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <div className="bg-gradient"></div>
      
      <nav className="navbar">
        <div className="nav-content">
          <div className="logo">
            <Brain size={28} />
            <span>CV<span>Analyst</span></span>
          </div>
          <div className="nav-links">
            <a href="#">Ana Sayfa</a>
            <a href="#">Özellikler</a>
            <a href="#">Fiyatlandırma</a>
            <a href="#" className="nav-btn">Giriş Yap</a>
          </div>
        </div>
      </nav>

      <main>
        <section className="hero-section">
          <div className="hero-content">
            <div className="hero-badge">
              <Sparkles size={16} />
              Yapay Zeka Destekli CV Analizi
            </div>
            <h1>CV'nizi Analiz Edin,<br />Kariyerinizi <span className="gradient-text">Yükseltin</span></h1>
            <p>Gelişmiş yapay zeka teknolojisi ile CV'nizi analiz edin, güçlü yönlerinizi keşfedin ve ideal işinize bir adım daha yaklaşın.</p>
            
            <div className="stats">
              <div className="stat-item">
                <div className="stat-value">98%</div>
                <div className="stat-label">Doğruluk Oranı</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">10K+</div>
                <div className="stat-label">Analiz Edilen CV</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">500+</div>
                <div className="stat-label">Şirket Ortağı</div>
              </div>
            </div>
          </div>
        </section>

        <section className="upload-section">
          <div className="upload-container">
            <div className="upload-header">
              <h2>CV Analizine Başlayın</h2>
              <p>CV'nizi yükleyin, yapay zekamız detaylı bir analiz yapsın</p>
            </div>

            <div 
              className={`drop-zone ${dragActive ? 'drag-active' : ''} ${file ? 'has-file' : ''}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input type="file" onChange={handleFileChange} accept=".pdf" id="cv-upload" />
              <label htmlFor="cv-upload">
                <div className="upload-icon">
                  <Upload size={48} />
                </div>
                <div className="upload-text">
                  {file ? (
                    <>
                      <FileText size={24} />
                      <span>{file.name}</span>
                      <CheckCircle size={20} className="success-icon" />
                    </>
                  ) : (
                    <>
                      <span>CV'nizi sürükleyin veya tıklayın</span>
                      <small>PDF formatında, max 10MB</small>
                    </>
                  )}
                </div>
              </label>
            </div>

            <button 
              onClick={handleUpload} 
              disabled={loading || !file} 
              className="analyze-btn"
            >
              {loading ? (
                <>
                  <div className="btn-loader"></div>
                  Analiz Ediliyor...
                </>
              ) : (
                <>
                  <Zap size={20} />
                  Analizi Başlat
                </>
              )}
            </button>

            {error && (
              <div className="error-msg">
                <AlertCircle size={20} />
                {error}
              </div>
            )}
          </div>
        </section>

        {loading && (
          <div className="analysis-animation">
            <div className="animation-content">
              <div className="ai-brain">
                <div className="brain-wave"></div>
                <div className="brain-wave delay-1"></div>
                <div className="brain-wave delay-2"></div>
                <Brain size={80} />
              </div>
              <div className="animation-text">
                <h3>Yapay Zeka CV'nizi Analiz Ediyor</h3>
                <div className="progress-steps">
                  <div className="step active">
                    <div className="step-icon">📄</div>
                    <span>CV Okunuyor</span>
                  </div>
                  <div className="step">
                    <div className="step-icon">🔍</div>
                    <span>Veriler Çıkarılıyor</span>
                  </div>
                  <div className="step">
                    <div className="step-icon">📊</div>
                    <span>Analiz Yapılıyor</span>
                  </div>
                  <div className="step">
                    <div className="step-icon">✨</div>
                    <span>Sonuçlar Hazırlanıyor</span>
                  </div>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill"></div>
                </div>
                <p className="animation-subtitle">Bu işlem 30 saniye kadar sürebilir...</p>
              </div>
            </div>
          </div>
        )}

        {analysis && (
          <section className="results-container">
            <div className="result-header">
              <div className="result-title">
                <CheckCircle size={32} />
                <h2>Analiz Tamamlandı</h2>
              </div>
              <div className="score-card">
                <div className="score-circle">
                  <svg viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" fill="none" stroke="#e2e8f0" strokeWidth="8"/>
                    <circle 
                      cx="50" cy="50" r="45" fill="none" 
                      stroke="url(#scoreGradient)" 
                      strokeWidth="8"
                      strokeDasharray={`${(analysis.atsUyumlulukSkoru || 0) * 2.83} 283`}
                      strokeLinecap="round"
                      transform="rotate(-90 50 50)"
                    />
                    <defs>
                      <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#6366f1"/>
                        <stop offset="100%" stopColor="#8b5cf6"/>
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="score-text">
                    <span className="score-value">{analysis.atsUyumlulukSkoru || 0}</span>
                    <span className="score-label">ATS Skoru</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="candidate-info">
              <div className="info-grid">
                <div className="info-item">
                  <User size={18} />
                  <span>{analysis.adSoyad || "Aday"}</span>
                </div>
                <div className="info-item">
                  <Mail size={18} />
                  <span>{analysis.email || "Email bilgisi yok"}</span>
                </div>
                <div className="info-item">
                  <Phone size={18} />
                  <span>{analysis.telefon || "Telefon bilgisi yok"}</span>
                </div>
              </div>
            </div>

            <div className="summary-card">
              <div className="card-header">
                <FileText size={22} />
                <h3>Profesyonel Özet</h3>
              </div>
              <p>{analysis.ozet || "Özet hazırlandığında burada görünecek."}</p>
            </div>

            <div className="grid-container">
              <div className="card">
                <div className="card-header">
                  <Brain size={22} />
                  <h3>Yetenekler</h3>
                </div>
                <div className="tags">
                  {(analysis.yetenekler || []).map((y, i) => (
                    <span key={i} className="tag">{y}</span>
                  ))}
                </div>
              </div>

              <div className="card">
                <div className="card-header">
                  <Award size={22} />
                  <h3>Güçlü Yanlar</h3>
                </div>
                <ul>
                  {(analysis.gucluYanlar || []).map((g, i) => <li key={i}>{g}</li>)}
                </ul>
              </div>

              <div className="card">
                <div className="card-header">
                  <Target size={22} />
                  <h3>Geliştirilmesi Gerekenler</h3>
                </div>
                <ul>
                  {(analysis.gelistirilmesiGerekenler || []).map((g, i) => <li key={i}>{g}</li>)}
                </ul>
              </div>

              <div className="card">
                <div className="card-header">
                  <Briefcase size={22} />
                  <h3>Önerilen Pozisyonlar</h3>
                </div>
                <ul>
                  {(analysis.onerilenPozisyonlar || []).map((p, i) => <li key={i}>{p}</li>)}
                </ul>
              </div>
            </div>

            {analysis.detayliAnaliz && (
              <div className="detailed-analysis">
                <h3><BarChart3 size={22} /> Detaylı Analiz</h3>
                <div className="analysis-metrics">
                  {Object.entries(analysis.detayliAnaliz).map(([key, value]) => (
                    <div key={key} className="metric">
                      <div className="metric-header">
                        <span>{key}</span>
                        <span>{value}%</span>
                      </div>
                      <div className="metric-bar">
                        <div className="metric-fill" style={{ width: `${value}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}
      </main>

      <footer>
        <div className="footer-content">
          <p>&copy; 2024 CV Analyst - Yapay Zeka Destekli CV Analiz Sistemi</p>
          <div className="footer-links">
            <a href="#">Gizlilik Politikası</a>
            <a href="#">Kullanım Şartları</a>
            <a href="#">İletişim</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
