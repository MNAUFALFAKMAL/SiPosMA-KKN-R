"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/providers/AuthProvider";

interface HeaderProps {
  title: string;
  context: string;
}

export default function Header({ title, context }: HeaderProps) {
  const [dateStr, setDateStr] = useState("");
  const { setSidebarOpen } = useAuth();
  const [showNotif, setShowNotif] = useState(false);
  const [notifList, setNotifList] = useState<string[]>([]);
  const [hasNew, setHasNew] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggleDarkMode = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  useEffect(() => {
    const today = new Date();
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    setDateStr(today.toLocaleDateString('id-ID', options));

    const loadWarnings = async () => {
      try {
        const res = await fetch('/api/pemeriksaan');
        if (res.ok) {
          const list: any[] = await res.json();
          
          const stunting = list.filter(p => p.sasaran?.kategori === 'balita' && (p.statusGizi || '').toLowerCase().includes('stunting'));
          const kek = list.filter(p => p.sasaran?.kategori === 'ibu_hamil' && p.lilaBumil && p.lilaBumil < 23.5);
          const risti = list.filter(p => p.sasaran?.kategori === 'lansia' && ((p.gula && p.gula > 200) || (p.kolesterol && p.kolesterol > 200)));
          
          const messages: string[] = [];
          if (stunting.length > 0) messages.push(`Terdapat ${stunting.length} balita terindikasi stunting.`);
          if (kek.length > 0) messages.push(`Terdapat ${kek.length} ibu hamil berisiko KEK.`);
          if (risti.length > 0) messages.push(`Terdapat ${risti.length} lansia risiko tinggi PTM.`);
          
          setNotifList(messages);
          setHasNew(stunting.length > 0 || kek.length > 0 || risti.length > 0);
        }
      } catch (e) {
        console.error(e);
      }
    };
    loadWarnings();

    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.btn-notif') && !target.closest('.notif-dropdown')) {
        setShowNotif(false);
      }
    };
    document.addEventListener('click', handleOutsideClick);
    return () => {
      document.removeEventListener('click', handleOutsideClick);
    };
  }, []);

  return (
    <div className="header-top">
      <div className="header-left">
        <button className="btn-sidebar-toggle" onClick={() => setSidebarOpen(true)} aria-label="Buka Menu">
          <i className="fas fa-bars"></i>
        </button>
        <div className="header-title-area">
          <h1 id="view-title">{title}</h1>
          <div className="step-indicator-label" id="step-indicator">
            <i className="fas fa-sitemap"></i>
            <span id="step-context-text">{context}</span>
          </div>
        </div>
      </div>
      <div className="header-meta">
        <div className="meta-badge">
          <i className="fas fa-map-marker-alt"></i> Posyandu Mawar &mdash; Desa Girimulyo
        </div>
        <div className="meta-badge">
          <i className="fas fa-calendar"></i> <span id="header-date">{dateStr}</span>
        </div>
      </div>
      <div className="header-actions-group">
        <button className="btn-notif" onClick={toggleDarkMode} title={isDark ? "Aktifkan Mode Terang" : "Aktifkan Mode Gelap"}>
          <i className={isDark ? "fas fa-sun" : "fas fa-moon"}></i>
        </button>
        <button className="btn-notif" onClick={() => { setShowNotif(!showNotif); setHasNew(false); }} title="Notifikasi">
          <i className="fas fa-bell"></i>
          {hasNew && <span className="notif-dot" id="notif-dot"></span>}
        </button>
        {showNotif && (
          <div className="notif-dropdown" style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            backgroundColor: 'var(--bg-card-solid)',
            border: '1px solid var(--glass-border)',
            borderRadius: 'var(--radius-md)',
            boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
            width: '280px',
            zIndex: 500,
            padding: '14px',
            marginTop: '8px',
            textAlign: 'left'
          }}>
            <h4 style={{ margin: '0 0 10px 0', fontSize: '0.9rem', color: 'var(--text-primary)', borderBottom: '1px solid rgba(0,0,0,0.05)', paddingBottom: '6px' }}>Notifikasi Temuan</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '200px', overflowY: 'auto' }}>
              {notifList.length === 0 ? (
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>Tidak ada notifikasi baru.</p>
              ) : (
                notifList.map((msg, i) => (
                  <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    <i className="fas fa-info-circle" style={{ color: msg.includes('Terdapat') ? 'var(--danger-light)' : 'var(--primary)', marginTop: '2px' }}></i>
                    <span>{msg}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
