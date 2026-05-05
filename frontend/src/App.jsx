import React, { useState } from 'react';
import axios from 'axios';
import { 
  Upload, FileText, CheckCircle, AlertCircle, Award, Target, 
  Brain, Sparkles, TrendingUp, Zap, MessageSquare, Linkedin, 
  Search, Languages, Map 
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
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile?.type === 'application/pdf') {
      setFile(droppedFile);
      setError(null);
    } else setError("Lütfen sadece PDF dosyası yükleyin.");
  };

  const handleUpload = async () => {
    if (!file) return setError("Lütfen önce bir PDF dosyası seçin.");
    
    const formData = new FormData();
    formData.append('cv', file);
    setLoading(true);
    setAnalysis(null);
    setError(null);
    setAnalysisProgress(20);

    try {
      const response = await axios.post(`${API_URL}/upload`, formData);
      setAnalysisProgress(100);
      setTimeout(() => {
        if (response.data.success) setAnalysis(response.data.data);
        else setError(response.data.error);
        setLoading(false);
      }, 500);
    } catch (err) {
      setError("Hata oluştu. Lütfen tekrar deneyin.");
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
        <h1 className="gradient-text">AI CV Analyzer Pro</h1>
        <p className="subtitle">Mülakat hazırlığı ve kariyer yol haritası ile güçlendirilmiş analiz</p>
      </header>

      <main>
        <section className="upload-section glass-effect">
          <div 
            className={`drop-zone ${dragActive ? 'drag-active' : ''} ${file ? 'has-file' : ''}`}
            onDragOver={handleDrag} onDrop={handleDrop}
          >
            <input type="file" onChange={(e) => setFile(e.target.files[0])} accept=".pdf" id="cv-upload" />
            <label htmlFor="cv-upload" className="upload-label">
              <Upload size={48} />
              <span className="upload-title">{file ? file.name : "CV'nizi Yükleyin"}</span>
            </label>
          </div>
          <button onClick={handleUpload} disabled={loading || !file} className="analyze-btn">
            {loading ? "Analiz Ediliyor..." : "Kapsamlı Analizi Başlat"}
          </button>
          {error && <div className="error-msg"><AlertCircle size={20}/> {error}</div>}
        </section>

        {analysis && (
          <section className="results-container fade-in">
            {/* Üst Panel: Skorlar */}
            <div className="grid-container">
              <div className="card glass-effect">
                <div className="score-flex">
                  <div className="score-circle-mini" style={{background: `conic-gradient(#10b981 ${analysis.atsUyumlulukSkoru * 3.6}deg, #eee 0deg)`}}>
                    <span>%{analysis.atsUyumlulukSkoru}</span>
                  </div>
                  <h3>ATS Skor</h3>
                </div>
              </div>
              <div className="card glass-effect">
                <div className="score-flex">
                  <div className="score-circle-mini" style={{background: `conic-gradient(#8b5cf6 ${analysis.dilAnalizi?.skor * 3.6}deg, #eee 0deg)`}}>
                    <span>%{analysis.dilAnalizi?.skor}</span>
                  </div>
                  <h3>Profesyonellik Skoru</h3>
                </div>
                <p className="small-text">{analysis.dilAnalizi?.geriBildirim}</p>
              </div>
            </div>

            {/* LinkedIn & Özet */}
            <div className="summary-card glass-effect">
              <div className="card-header"><Linkedin size={24} color="#0077b5"/> <h3>LinkedIn Hakkında Bölümü</h3></div>
              <p className="summary-text italic">{analysis.linkedinHakkinda}</p>
            </div>

            {/* Detaylı Grid */}
            <div className="grid-container">
              <div className="card glass-effect">
                <div className="card-header"><MessageSquare size={24} color="#3b82f6"/> <h3>Mülakat Hazırlığı</h3></div>
                <ul className="feature-list">
                  {analysis.mulakatSorulari?.map((s, i) => (
                    <li key={i} className="feature-item-alt"><strong>S{i+1}:</strong> {s}</li>
                  ))}
                </ul>
              </div>

              <div className="card glass-effect">
                <div className="card-header"><Search size={24} color="#ef4444"/> <h3>Eksik Anahtar Kelimeler</h3></div>
                <div className="tags">
                  {analysis.eksikAnahtarKelimeler?.map((k, i) => (
                    <span key={i} className="tag tag-missing">{k}</span>
                  ))}
                </div>
              </div>

              <div className="card glass-effect">
                <div className="card-header"><Map size={24} color="#f59e0b"/> <h3>Kariyer Yol Haritası</h3></div>
                <ul className="feature-list">
                  {analysis.kariyerYolHaritasi?.map((h, i) => (
                    <li key={i} className="feature-item"><TrendingUp size={16} /> <span>{h}</span></li>
                  ))}
                </ul>
              </div>

              <div className="card glass-effect">
                <div className="card-header"><Brain size={24} /> <h3>Yetenek Analizi</h3></div>
                <div className="tags">
                  {analysis.yetenekler?.map((y, i) => <span key={i} className="tag">{y}</span>)}
                </div>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default App;
