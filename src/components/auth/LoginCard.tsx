"use client";

import { useState } from "react";
import { useAuth } from "@/components/providers/AuthProvider";

export default function LoginCard() {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Mock Credentials based on PRD
    if (username === "admin" && password === "admin123") {
      login("admin", "Super Admin", "Budi Admin");
    } else if (username === "adminpos" && password === "adminpos123") {
      login("adminpos", "Administrator Posyandu", "Siti Aminah");
    } else if (username === "kader" && password === "kader123") {
      login("kader", "Kader Posyandu", "Ibu Tini");
    } else if (username === "bidan" && password === "bidan123") {
      login("bidan", "Bidan Desa", "Ibu Ratna");
    } else if (username === "kades" && password === "kades123") {
      login("kades", "Kepala Desa", "Bapak Joko");
    } else if (username === "ortu" && password === "ortu123") {
      login("ortu", "Orang Tua Balita", "Bapak Anton");
    } else {
      setError(true);
      setTimeout(() => setError(false), 800); // Remove shake class after animation
    }
    setLoading(false);
  };

  return (
    <div className="login-overlay">
      <div className={`login-card ${error ? 'shake' : ''}`}>
        <div className="login-logo">
          <div className="login-icon" style={{ padding: 0, overflow: 'hidden', backgroundColor: 'transparent' }}>
            <img src="/img/logo.jpg" alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
          </div>
          <h2>SiPosMA</h2>
          <p>Sistem Informasi Posyandu Maju Anak</p>
        </div>

        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group-login">
            <i className="fas fa-user input-icon"></i>
            <input 
              type="text" 
              placeholder="Username" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required 
            />
          </div>
          
          <div className="form-group-login">
            <i className="fas fa-lock input-icon"></i>
            <input 
              type={showPassword ? "text" : "password"} 
              placeholder="Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
            <i 
              className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'} password-toggle-icon`}
              onClick={() => setShowPassword(!showPassword)}
            ></i>
          </div>

          {error && <div className="login-error"><i className="fas fa-exclamation-circle"></i> Kredensial tidak valid. Coba lagi.</div>}

          <button type="submit" className="btn-login" disabled={loading}>
            {loading ? <i className="fas fa-spinner fa-spin"></i> : 'Masuk ke Sistem'}
            {!loading && <i className="fas fa-arrow-right"></i>}
          </button>
        </form>
        
        <div className="login-hints">
          <p><strong>Akun Demo:</strong></p>
          <div className="hint-badges">
            <span onClick={() => {setUsername("admin"); setPassword("admin123")}}>admin / admin123</span>
            <span onClick={() => {setUsername("adminpos"); setPassword("adminpos123")}}>adminpos / adminpos123</span>
            <span onClick={() => {setUsername("kader"); setPassword("kader123")}}>kader / kader123</span>
            <span onClick={() => {setUsername("bidan"); setPassword("bidan123")}}>bidan / bidan123</span>
            <span onClick={() => {setUsername("kades"); setPassword("kades123")}}>kades / kades123</span>
            <span onClick={() => {setUsername("ortu"); setPassword("ortu123")}}>ortu / ortu123</span>
          </div>
        </div>
      </div>
    </div>
  );
}
