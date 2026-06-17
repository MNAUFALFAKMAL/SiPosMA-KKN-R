"use client";

import { useState } from "react";
import Header from "@/components/layout/Header";

export default function IntegrasiPage() {
  const [loading, setLoading] = useState(false);

  const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'success') => {
    const container = document.getElementById('toast-container');
    if (!container) return;
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : type === 'warning' ? 'fa-exclamation-triangle' : 'fa-info-circle'}"></i> <span>${message}</span>`;
    
    container.appendChild(toast);
    
    toast.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(60px)';
      setTimeout(() => {
        toast.remove();
      }, 400);
    }, 3000);
  };

  const handleSync = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      showToast("Sinkronisasi database berhasil diselesaikan! 54 records terupdate.", "success");
    }, 2000);
  };

  return (
    <>
      <Header title="Integrasi & Database" context="Sinkronisasi ke server desa/Puskesmas" />
      <section className="view-section active">
        <div className="card-container">
          <h3><i className="fas fa-cloud-upload-alt"></i> Sinkronisasi Cloud</h3>
          <p>Database saat ini berjalan di SQLite (lokal). Tekan tombol di bawah untuk mensinkronisasi data ke PostgreSQL server pusat (Puskesmas).</p>
          <button 
            className="btn btn-primary" 
            style={{ marginTop: '16px' }}
            onClick={handleSync}
            disabled={loading}
          >
            {loading ? (
              <>
                <i className="fas fa-spinner fa-spin"></i> Menghubungkan ke Server Pusat...
              </>
            ) : (
              <>
                <i className="fas fa-sync"></i> Sinkronisasi Sekarang
              </>
            )}
          </button>
        </div>
      </section>
    </>
  );
}
