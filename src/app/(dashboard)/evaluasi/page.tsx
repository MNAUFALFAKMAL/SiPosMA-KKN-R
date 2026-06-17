"use client";

import { useState, useEffect } from "react";
import Header from "@/components/layout/Header";

export default function EvaluasiPage() {
  const [stats, setStats] = useState<any>(null);
  const [pemeriksaanList, setPemeriksaanList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [statsRes, pemRes] = await Promise.all([
          fetch('/api/stats'),
          fetch('/api/pemeriksaan')
        ]);
        
        if (statsRes.ok && pemRes.ok) {
          const statsData = await statsRes.json();
          const pemData = await pemRes.json();
          setStats(statsData);
          setPemeriksaanList(pemData);
        }
      } catch (error) {
        console.error("Gagal memuat data evaluasi", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Hitung metrik evaluasi
  const totalBalita = stats?.balitaCount || 0;
  const totalBumil = stats?.bumilCount || 0;

  // Filter pemeriksaan untuk balita
  const balitaCheckups = pemeriksaanList.filter(p => p.sasaran?.kategori === 'balita');
  const uniqueBalitaChecked = new Set(balitaCheckups.map(p => p.sasaranId)).size;

  // Rasio D/S (Kehadiran / Sasaran)
  const rasioDS = totalBalita > 0 ? Math.round((uniqueBalitaChecked / totalBalita) * 100) : 0;

  // Rasio N/D (Gizi Baik / Hadir)
  const balitaNormal = balitaCheckups.filter(p => {
    const st = (p.statusGizi || '').toLowerCase();
    return st.includes('normal') || (!st.includes('stunting') && !st.includes('buruk') && p.bb > 0);
  });
  const uniqueBalitaNormal = new Set(balitaNormal.map(p => p.sasaranId)).size;
  const rasioND = uniqueBalitaChecked > 0 ? Math.round((uniqueBalitaNormal / uniqueBalitaChecked) * 100) : 0;

  // Vitamin A
  const vitACount = new Set(balitaCheckups.filter(p => p.vitamin && p.vitamin !== '').map(p => p.sasaranId)).size;
  const rasioVitA = totalBalita > 0 ? Math.round((vitACount / totalBalita) * 100) : 0;

  // Fe Bumil
  const bumilCheckups = pemeriksaanList.filter(p => p.sasaran?.kategori === 'ibu_hamil');
  const feCount = new Set(bumilCheckups.filter(p => p.fe === 'Ya').map(p => p.sasaranId)).size;
  const rasioFe = totalBumil > 0 ? Math.round((feCount / totalBumil) * 100) : 0;

  // Status Evaluasi Kinerja Posyandu
  let statusKinerja = "Pratama (Perlu Peningkatan)";
  let colorClass = "badge-danger";
  let descKinerja = "Partisipasi sasaran (D/S) masih di bawah target 80%. Diperlukan penyuluhan intensif.";

  if (rasioDS >= 80 && rasioND >= 75) {
    statusKinerja = "Mandiri (Sangat Baik) 🌟";
    colorClass = "badge-normal";
    descKinerja = "Partisipasi masyarakat sangat tinggi dan keberhasilan program gizi sangat baik. Pertahankan!";
  } else if (rasioDS >= 60 || rasioND >= 60) {
    statusKinerja = "Purnama (Baik)";
    colorClass = "badge-primary";
    descKinerja = "Kinerja posyandu sudah berjalan dengan baik, tingkatkan frekuensi sosialisasi pada sasaran pasif.";
  } else if (rasioDS >= 40) {
    statusKinerja = "Madya (Cukup)";
    colorClass = "badge-warning";
    descKinerja = "Partisipasi dan cakupan program masih sedang. Tingkatkan sweeping sasaran bersama kader.";
  }

  return (
    <>
      <Header title="Penyajian Informasi & Evaluasi" context="Capaian indikator kinerja" />
      <section className="view-section active" style={{ animation: 'none' }}>
        <div className="step-banner" style={{ borderLeftColor: 'var(--step7)' }}>
          <div className="step-banner-icon" style={{ background: 'var(--step7)' }}><i className="fas fa-star"></i></div>
          <div className="step-banner-text">
            <h4>Tahap 7 — Evaluasi Program &amp; Kinerja</h4>
            <p>Bandingkan hasil capaian program posyandu terhadap Standar Pelayanan Minimal (SPM) untuk indikator cakupan gizi anak dan ibu hamil.</p>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <i className="fas fa-circle-notch fa-spin" style={{ fontSize: '2.5rem', color: 'var(--primary)' }}></i>
          </div>
        ) : (
          <>
            {/* Status Kinerja Card */}
            <div className="card-container" style={{ borderLeft: '4.5px solid var(--primary)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h3 style={{ marginBottom: '6px' }}><i className="fas fa-medal"></i> Status Kinerja Posyandu</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{descKinerja}</p>
                </div>
                <span className={`badge ${colorClass}`} style={{ fontSize: '0.9rem', padding: '6px 14px' }}>
                  {statusKinerja}
                </span>
              </div>
            </div>

            {/* Indicators Grid */}
            <div className="grid-2">
              <div className="card-container">
                <h3><i className="fas fa-chart-line"></i> Indikator Kehadiran &amp; Pertumbuhan (Balita)</h3>
                
                {/* D/S Ratio */}
                <div className="progress-bar-wrap" style={{ marginTop: '16px' }}>
                  <div className="progress-label">
                    <span>Partisipasi Masyarakat (D/S)</span>
                    <span>{rasioDS}%</span>
                  </div>
                  <div className="progress-track">
                    <div className="progress-fill" style={{ width: `${rasioDS}%`, background: 'var(--primary)' }}></div>
                  </div>
                  <small style={{ color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
                    {uniqueBalitaChecked} dari {totalBalita} Balita terdaftar hadir melakukan penimbangan.
                  </small>
                </div>

                {/* N/D Ratio */}
                <div className="progress-bar-wrap" style={{ marginTop: '20px' }}>
                  <div className="progress-label">
                    <span>Tingkat Keberhasilan Program (N/D)</span>
                    <span>{rasioND}%</span>
                  </div>
                  <div className="progress-track">
                    <div className="progress-fill" style={{ width: `${rasioND}%`, background: 'var(--success)' }}></div>
                  </div>
                  <small style={{ color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
                    {uniqueBalitaNormal} dari {uniqueBalitaChecked} Balita ditimbang memiliki status gizi normal/sehat.
                  </small>
                </div>
              </div>

              <div className="card-container">
                <h3><i className="fas fa-pills"></i> Cakupan Suplementasi &amp; Imunisasi</h3>
                
                {/* Vitamin A Coverage */}
                <div className="progress-bar-wrap" style={{ marginTop: '16px' }}>
                  <div className="progress-label">
                    <span>Cakupan Vitamin A Balita</span>
                    <span>{rasioVitA}%</span>
                  </div>
                  <div className="progress-track">
                    <div className="progress-fill" style={{ width: `${rasioVitA}%`, background: 'var(--secondary)' }}></div>
                  </div>
                  <small style={{ color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
                    {vitACount} dari {totalBalita} Balita terdaftar telah menerima Vitamin A bulan ini.
                  </small>
                </div>

                {/* Fe Tablet Coverage */}
                <div className="progress-bar-wrap" style={{ marginTop: '20px' }}>
                  <div className="progress-label">
                    <span>Tablet Fe Ibu Hamil</span>
                    <span>{rasioFe}%</span>
                  </div>
                  <div className="progress-track">
                    <div className="progress-fill" style={{ width: `${rasioFe}%`, background: 'var(--accent)' }}></div>
                  </div>
                  <small style={{ color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
                    {feCount} dari {totalBumil} Ibu hamil terdaftar telah menerima Tablet Tambah Darah (Fe).
                  </small>
                </div>
              </div>
            </div>

            {/* Recommendations Card */}
            <div className="card-container">
              <h3><i className="fas fa-clipboard-list"></i> Rekomendasi Tindak Lanjut Program</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '14px' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <div style={{ color: 'var(--primary)', padding: '6px', background: 'rgba(91,79,207,0.1)', borderRadius: '6px' }}>
                    <i className="fas fa-bullhorn"></i>
                  </div>
                  <div>
                    <h5 style={{ margin: '0 0 2px 0', fontSize: '0.9rem' }}>Penyuluhan Partisipasi Masyarakat</h5>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      Jika rasio D/S di bawah 80%, lakukan gerakan sweeping bersama kader dusun untuk menjemput sasaran balita yang tidak hadir ke Posyandu.
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <div style={{ color: 'var(--success)', padding: '6px', background: 'rgba(0,168,120,0.1)', borderRadius: '6px' }}>
                    <i className="fas fa-apple-alt"></i>
                  </div>
                  <div>
                    <h5 style={{ margin: '0 0 2px 0', fontSize: '0.9rem' }}>Pemberian Makanan Tambahan (PMT)</h5>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      Fokuskan alokasi PMT penyuluhan untuk anak dengan indikator tumbuh kembang tidak naik (T) atau berstatus gizi kurang.
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <div style={{ color: 'var(--warning)', padding: '6px', background: 'rgba(230,168,23,0.1)', borderRadius: '6px' }}>
                    <i className="fas fa-baby-carriage"></i>
                  </div>
                  <div>
                    <h5 style={{ margin: '0 0 2px 0', fontSize: '0.9rem' }}>Kordinasi Bidan Desa</h5>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      Segera laporkan data Ibu Hamil dengan LILA &lt; 23.5 cm (KEK) agar didaftarkan pada program PMT Pemulihan Kabupaten.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </section>
    </>
  );
}
