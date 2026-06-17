"use client";

import { useState, useEffect } from "react";
import Header from "@/components/layout/Header";

export default function PemantauanPage() {
  const [pemeriksaanList, setPemeriksaanList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("semua");

  const fetchPemeriksaan = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/pemeriksaan');
      if (res.ok) {
        const data = await res.json();
        setPemeriksaanList(data);
      }
    } catch (e) {
      console.error("Gagal mengambil data pemeriksaan", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPemeriksaan();
  }, []);

  // Filter lists
  const stuntingList = pemeriksaanList.filter(p => {
    if (p.sasaran?.kategori !== 'balita') return false;
    const status = (p.statusGizi || '').toLowerCase();
    return status.includes('stunting') || status.includes('kurang') || status.includes('buruk');
  });

  const kekList = pemeriksaanList.filter(p => {
    if (p.sasaran?.kategori !== 'ibu_hamil') return false;
    return p.lilaBumil && p.lilaBumil < 23.5;
  });

  const ristiLansiaList = pemeriksaanList.filter(p => {
    if (p.sasaran?.kategori !== 'lansia') return false;
    return (p.gula && p.gula > 200) || (p.kolesterol && p.kolesterol > 200) || (p.asamUrat && p.asamUrat > 7.5);
  });

  // Unique lists by Sasaran to avoid duplicates if they have multiple checkups
  const getUniqueBySasaran = (list: any[]) => {
    const seen = new Set();
    return list.filter(p => {
      if (!p.sasaranId) return false;
      const duplicate = seen.has(p.sasaranId);
      seen.add(p.sasaranId);
      return !duplicate;
    });
  };

  const uniqueStunting = getUniqueBySasaran(stuntingList);
  const uniqueKek = getUniqueBySasaran(kekList);
  const uniqueRistiLansia = getUniqueBySasaran(ristiLansiaList);

  const getFilteredList = () => {
    switch(activeTab) {
      case "stunting": return uniqueStunting;
      case "kek": return uniqueKek;
      case "lansia": return uniqueRistiLansia;
      default: return [...uniqueStunting, ...uniqueKek, ...uniqueRistiLansia];
    }
  };

  const filteredItems = getFilteredList();

  return (
    <>
      <Header title="Pencarian & Pemantauan Data" context="Monitoring kondisi sasaran berkelanjutan" />
      <section className="view-section active" style={{ animation: 'none' }}>
        <div className="step-banner" style={{ borderLeftColor: 'var(--step5)' }}>
          <div className="step-banner-icon" style={{ background: 'var(--step5)' }}><i className="fas fa-heartbeat"></i></div>
          <div className="step-banner-text">
            <h4>Tahap 5 — Pemantauan Gizi &amp; Kesehatan</h4>
            <p>Pemantauan sasaran dengan kondisi khusus (Stunting/Gizi Kurang, Risiko KEK Ibu Hamil, dan Lansia dengan Penyakit Tidak Menular) secara komprehensif.</p>
          </div>
        </div>

        {/* Dashboard Cards */}
        <div className="stats-grid premium-stats" style={{ marginBottom: '24px' }}>
          <div className={`stat-card ${activeTab === 'stunting' ? 'active-card' : ''}`} onClick={() => setActiveTab(activeTab === 'stunting' ? 'semua' : 'stunting')} style={{ cursor: 'pointer' }}>
            <div className="stat-card-header">
              <div className="stat-icon stat-icon-1" style={{ background: 'rgba(91,79,207,0.1)' }}><i className="fas fa-child"></i></div>
              <span className="badge badge-danger">Gizi Buruk/Stunting</span>
            </div>
            <div className="stat-info">
              <div className="stat-value">{uniqueStunting.length}</div>
              <h4>Balita Stunting / Gizi Kurang</h4>
            </div>
          </div>

          <div className={`stat-card ${activeTab === 'kek' ? 'active-card' : ''}`} onClick={() => setActiveTab(activeTab === 'kek' ? 'semua' : 'kek')} style={{ cursor: 'pointer' }}>
            <div className="stat-card-header">
              <div className="stat-icon stat-icon-3" style={{ background: 'rgba(232,86,140,0.1)' }}><i className="fas fa-female"></i></div>
              <span className="badge badge-warning">Risiko KEK</span>
            </div>
            <div className="stat-info">
              <div className="stat-value">{uniqueKek.length}</div>
              <h4>Bumil LILA &lt; 23.5 cm</h4>
            </div>
          </div>

          <div className={`stat-card ${activeTab === 'lansia' ? 'active-card' : ''}`} onClick={() => setActiveTab(activeTab === 'lansia' ? 'semua' : 'lansia')} style={{ cursor: 'pointer' }}>
            <div className="stat-card-header">
              <div className="stat-icon stat-icon-4" style={{ background: 'rgba(230,168,23,0.1)' }}><i className="fas fa-blind"></i></div>
              <span className="badge badge-secondary">Risiko PTM</span>
            </div>
            <div className="stat-info">
              <div className="stat-value">{uniqueRistiLansia.length}</div>
              <h4>Lansia Risiko Tinggi</h4>
            </div>
          </div>
        </div>

        {/* List Card */}
        <div className="card-container">
          <div className="card-header-actions">
            <h3>
              <i className="fas fa-exclamation-triangle" style={{ color: 'var(--warning)' }}></i> 
              Daftar Pemantauan: {activeTab === 'stunting' ? 'Balita Stunting/Gizi Kurang' : activeTab === 'kek' ? 'Ibu Hamil KEK' : activeTab === 'lansia' ? 'Lansia Risti' : 'Semua Sasaran Berisiko'}
            </h3>
            {activeTab !== 'semua' && (
              <button className="btn btn-sm btn-outline" onClick={() => setActiveTab('semua')}>Tampilkan Semua</button>
            )}
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <i className="fas fa-circle-notch fa-spin" style={{ fontSize: '2rem', color: 'var(--primary)' }}></i>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="empty-state">
              <i className="fas fa-clipboard-check" style={{ color: 'var(--success)', fontSize: '3rem', display: 'block', marginBottom: '10px' }}></i>
              <p>Tidak ada data sasaran berisiko tinggi untuk kategori ini.</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Nama Sasaran</th>
                    <th>Kategori</th>
                    <th>Detail Indikator</th>
                    <th>Catatan / Keluhan</th>
                    <th>Rekomendasi Tindakan</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map((p, idx) => {
                    let detail = "-";
                    let rekomendasi = "Pencegahan rutin";
                    if (p.sasaran?.kategori === 'balita') {
                      detail = `BB: ${p.bb || '-'} Kg, TB: ${p.tb || '-'} Cm (Status: ${p.statusGizi || 'Stunting/Gizi Kurang'})`;
                      rekomendasi = "Rujuk konseling gizi dan pemberian makanan tambahan (PMT) Balita.";
                    } else if (p.sasaran?.kategori === 'ibu_hamil') {
                      detail = `LILA: ${p.lilaBumil || '-'} Cm (Standar KEK: < 23.5)`;
                      rekomendasi = "Pemberian PMT bumil KEK dan pemantauan berat badan ibu secara ketat.";
                    } else if (p.sasaran?.kategori === 'lansia') {
                      const indicators = [];
                      if (p.gula && p.gula > 200) indicators.push(`Gula Darah: ${p.gula} mg/dL`);
                      if (p.kolesterol && p.kolesterol > 200) indicators.push(`Kolesterol: ${p.kolesterol} mg/dL`);
                      if (p.asamUrat && p.asamUrat > 7.5) indicators.push(`Asam Urat: ${p.asamUrat} mg/dL`);
                      detail = indicators.join(', ') || 'Hasil pemeriksaan normal';
                      rekomendasi = "Edukasi pola makan sehat dan koordinasikan untuk rujukan rutin Puskesmas.";
                    }
                    return (
                      <tr key={idx}>
                        <td data-label="Nama Sasaran">
                          <strong>{p.sasaran?.nama}</strong>
                          <br />
                          <small>NIK: {p.sasaran?.nik || '-'}</small>
                        </td>
                        <td data-label="Kategori">
                          <span className={`badge ${p.sasaran?.kategori === 'balita' ? 'badge-primary' : p.sasaran?.kategori === 'ibu_hamil' ? 'badge-warning' : 'badge-secondary'}`}>
                            {p.sasaran?.kategori === 'balita' ? 'Balita' : p.sasaran?.kategori === 'ibu_hamil' ? 'Ibu Hamil' : 'Lansia'}
                          </span>
                        </td>
                        <td data-label="Detail Indikator">{detail}</td>
                        <td data-label="Catatan / Keluhan">{p.catatan || p.keluhan || '-'}</td>
                        <td data-label="Rekomendasi Tindakan">{rekomendasi}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
