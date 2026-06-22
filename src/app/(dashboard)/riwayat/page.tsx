"use client";

import { useState, useEffect } from "react";
import Header from "@/components/layout/Header";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend
);

export default function RiwayatPage() {
  const [activeTab, setActiveTab] = useState("pemeriksaan");
  const [pemeriksaanList, setPemeriksaanList] = useState<any[]>([]);
  const [categoryFilter, setCategoryFilter] = useState("semua");
  const [searchTerm, setSearchTerm] = useState("");

  const fetchRiwayat = async () => {
    try {
      const res = await fetch('/api/pemeriksaan');
      if (res.ok) {
        const data = await res.json();
        setPemeriksaanList(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchRiwayat();
  }, []);

  return (
    <>
      <Header title="Penyimpanan Riwayat Layanan" context="Histori pemeriksaan & KMS digital" />
      <section className="view-section active">
        <div className="step-banner" style={{ borderLeftColor: 'var(--step4)' }}>
          <div className="step-banner-icon" style={{ background: 'var(--step4)' }}><i className="fas fa-database"></i></div>
          <div className="step-banner-text">
            <h4>Tahap 4 — Penyimpanan Riwayat Layanan</h4>
            <p>Seluruh rekam jejak pemeriksaan tersimpan dalam basis data lokal. Lihat KMS digital, grafik tumbuh kembang, dan log aktivitas sistem.</p>
          </div>
        </div>

        <div className="tabs">
          <button className={`tab-btn ${activeTab === 'pemeriksaan' ? 'active' : ''}`} onClick={() => setActiveTab('pemeriksaan')}>
            <i className="fas fa-history"></i> Riwayat Pemeriksaan
          </button>
          <button className={`tab-btn ${activeTab === 'kms' ? 'active' : ''}`} onClick={() => setActiveTab('kms')}>
            <i className="fas fa-chart-line"></i> KMS Digital
          </button>
        </div>

        {activeTab === 'pemeriksaan' && (
          <div className="tab-content active">
             <div className="card-container">
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '15px' }}>
                 <h3 style={{ margin: 0 }}><i className="fas fa-history"></i> Semua Rekam Pemeriksaan</h3>
                 
                 <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                   {/* Category Filter Buttons */}
                   <div style={{ display: 'flex', background: 'var(--bg-input)', padding: '4px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                     {['semua', 'balita', 'ibu_hamil', 'lansia'].map((cat) => (
                       <button
                         key={cat}
                         type="button"
                         onClick={() => setCategoryFilter(cat)}
                         style={{
                           padding: '6px 12px',
                           border: 'none',
                           borderRadius: '6px',
                           fontSize: '0.8rem',
                           fontWeight: 'bold',
                           cursor: 'pointer',
                           background: categoryFilter === cat ? 'var(--primary)' : 'transparent',
                           color: categoryFilter === cat ? 'white' : 'var(--text-secondary)',
                           transition: 'all 0.2s ease'
                         }}
                       >
                         {cat === 'semua' ? 'Semua' : cat === 'balita' ? 'Balita' : cat === 'ibu_hamil' ? 'Ibu Hamil' : 'Lansia'}
                       </button>
                     ))}
                   </div>

                   <div className="search-bar">
                     <div className="search-input-wrapper" style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '6px 12px' }}>
                       <i className="fas fa-search" style={{ color: 'var(--text-muted)', marginRight: '8px' }}></i>
                       <input 
                         type="text" 
                         placeholder="Cari nama sasaran..." 
                         value={searchTerm}
                         onChange={(e) => setSearchTerm(e.target.value)}
                         style={{ border: 'none', background: 'transparent', outline: 'none', color: 'var(--text-primary)', fontSize: '0.85rem' }}
                       />
                     </div>
                   </div>
                 </div>
               </div>
               {pemeriksaanList.length === 0 ? (
                 <div className="empty-state">
                   <i className="fas fa-clipboard"></i><p>Belum ada data pemeriksaan.</p>
                 </div>
               ) : (
                <div className="table-wrapper">
                  <table>
                    <thead>
                      <tr><th>Tanggal</th><th>Nama Sasaran</th><th>Kategori</th><th>BB</th><th>TB / LILA</th><th>Status Gizi</th><th>Catatan</th></tr>
                    </thead>
                    <tbody>
                      {(() => {
                        const filtered = pemeriksaanList.filter(p => {
                          const matchesSearch = p.sasaran?.nama.toLowerCase().includes(searchTerm.toLowerCase());
                          const matchesCategory = categoryFilter === 'semua' || p.sasaran?.kategori === categoryFilter;
                          return matchesSearch && matchesCategory;
                        });
                        if (filtered.length === 0) {
                          return <tr><td colSpan={7} style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>Tidak menemukan rekam pemeriksaan yang cocok.</td></tr>;
                        }
                        return filtered.map(p => (
                          <tr key={p.id}>
                            <td data-label="Tanggal">{new Date(p.tanggal).toLocaleDateString('id-ID')}</td>
                            <td data-label="Nama Sasaran">{p.sasaran?.nama}</td>
                            <td data-label="Kategori" style={{ textTransform: 'capitalize' }}>
                              <span style={{
                                padding: '3px 8px',
                                borderRadius: '4px',
                                fontSize: '0.75rem',
                                fontWeight: 'bold',
                                color: 'white',
                                background: p.sasaran?.kategori === 'balita' ? '#00a878' : p.sasaran?.kategori === 'ibu_hamil' ? '#e8568c' : '#e6a817'
                              }}>
                                {p.sasaran?.kategori === 'ibu_hamil' ? 'Ibu Hamil' : p.sasaran?.kategori}
                              </span>
                            </td>
                            <td data-label="BB">{p.bb || p.bbLansia || p.bbBumil || '-'} Kg</td>
                            <td data-label="TB / LILA">{p.tb || p.lilaBumil || '-'}</td>
                            <td data-label="Status Gizi">{p.statusGizi || '-'}</td>
                            <td data-label="Catatan">{p.catatan || '-'}</td>
                          </tr>
                        ));
                      })()}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'kms' && (
          <div className="tab-content active">
            <div className="card-container">
              <h3><i className="fas fa-child"></i> KMS Digital (Demo Balita)</h3>
              <p style={{marginBottom: '16px'}}>Grafik pertumbuhan berat badan terhadap batas standar (Hanya ilustrasi).</p>
              <div className="chart-container" style={{ height: "350px", position: "relative" }}>
                <Line
                  data={{
                    labels: ['Bulan 1', 'Bulan 2', 'Bulan 3', 'Bulan 4', 'Bulan 5', 'Bulan 6'],
                    datasets: [
                      {
                        label: 'BB Aktual Balita (Kg)',
                        data: [3.5, 4.2, 5.0, 5.5, 6.2, 6.5],
                        borderColor: '#3498db',
                        backgroundColor: '#3498db',
                        tension: 0.3
                      },
                      {
                        label: 'Batas Bawah (SD -2)',
                        data: [2.9, 3.8, 4.5, 5.0, 5.4, 5.7],
                        borderColor: '#e74c3c',
                        borderDash: [5, 5],
                        fill: false,
                        pointRadius: 0
                      },
                      {
                        label: 'Batas Atas (SD +2)',
                        data: [4.2, 5.4, 6.2, 7.0, 7.6, 8.2],
                        borderColor: '#2ecc71',
                        borderDash: [5, 5],
                        fill: false,
                        pointRadius: 0
                      }
                    ]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      title: { display: true, text: 'Kurva KMS (Berat Badan / Umur)' }
                    }
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </section>
    </>
  );
}
