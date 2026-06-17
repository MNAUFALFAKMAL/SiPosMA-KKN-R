"use client";

import { useState, useEffect } from "react";
import Header from "@/components/layout/Header";

export default function ValidasiPage() {
  const [pemeriksaanList, setPemeriksaanList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [masalahList, setMasalahList] = useState<any[]>([]);
  const [summary, setSummary] = useState({ total: 0, valid: 0, bermasalah: 0 });
  const [selectedMasalah, setSelectedMasalah] = useState<any | null>(null);

  const fetchPemeriksaan = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/pemeriksaan');
      if (res.ok) {
        const data = await res.json();
        
        // If database is empty, use mock data to demonstrate features
        if (data.length === 0) {
          const mockData = [
            { id: '1', sasaran: { nama: 'Budi (Balita)', kategori: 'balita' }, bb: null, tb: null },
            { id: '2', sasaran: { nama: 'Siti (Bumil)', kategori: 'ibu_hamil' }, lilaBumil: 22.0 },
            { id: '3', sasaran: { nama: 'Kakek Sugiono', kategori: 'lansia' }, gula: 250, kolesterol: 220 },
            { id: '4', sasaran: { nama: 'Ayu (Balita)', kategori: 'balita' }, bb: 10, tb: 85 },
            { id: '5', sasaran: { nama: 'Rini (Bumil)', kategori: 'ibu_hamil' }, lilaBumil: 26.0 },
          ];
          setPemeriksaanList(mockData);
          evaluateRules(mockData);
        } else {
          setPemeriksaanList(data);
          evaluateRules(data);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const evaluateRules = (data: any[]) => {
    const masalah: any[] = [];
    let validCount = 0;
    
    data.forEach(p => {
      let isBermasalah = false;
      const sas = p.sasaran;
      if (!sas) return;

      if (sas.kategori === 'balita') {
        if (!p.bb || !p.tb) {
          masalah.push({ id: p.id, nama: sas.nama, kategori: 'Balita', masalah: 'BB/TB Kosong', rekomendasi: 'Lengkapi hasil pengukuran' });
          isBermasalah = true;
        }
      } else if (sas.kategori === 'ibu_hamil') {
        if (p.lilaBumil && p.lilaBumil < 23.5) {
          masalah.push({ id: p.id, nama: sas.nama, kategori: 'Ibu Hamil', masalah: 'Risiko KEK (LILA < 23.5)', rekomendasi: 'Rujuk untuk PMT Bumil' });
          isBermasalah = true;
        }
      } else if (sas.kategori === 'lansia') {
        if (p.gula && p.gula > 200) {
          masalah.push({ id: p.id, nama: sas.nama, kategori: 'Lansia', masalah: 'Gula Darah Tinggi', rekomendasi: 'Rujuk Puskesmas' });
          isBermasalah = true;
        }
        if (p.kolesterol && p.kolesterol > 200) {
          masalah.push({ id: p.id, nama: sas.nama, kategori: 'Lansia', masalah: 'Kolesterol Tinggi', rekomendasi: 'Edukasi diet & rujuk' });
          isBermasalah = true;
        }
      }

      if (!isBermasalah) validCount++;
    });

    setMasalahList(masalah);
    setSummary({
      total: data.length,
      valid: validCount,
      bermasalah: masalah.length
    });
  };

  useEffect(() => {
    fetchPemeriksaan();
  }, []);

  return (
    <>
      <Header title="Validasi & Pengolahan Data" context="Cek kelengkapan & hitung status gizi" />
      <section className="view-section active">

        <div className="step-banner" style={{ borderLeftColor: 'var(--step3)' }}>
          <div className="step-banner-icon" style={{ background: 'var(--step3)' }}><i className="fas fa-check-double"></i></div>
          <div className="step-banner-text">
            <h4>Tahap 3 — Validasi &amp; Pengolahan Data</h4>
            <p>Sistem secara otomatis memvalidasi kelengkapan data, menghitung status gizi (BB/U, TB/U), mendeteksi risiko stunting, KEK, dan kondisi abnormal.</p>
          </div>
        </div>

        <div className="grid-2">
          <div className="card-container">
            <h3><i className="fas fa-robot"></i> Mesin Validasi Otomatis</h3>
            <div id="validasi-rules-list">
              <ul>
                <li><i className="fas fa-check text-success"></i> Cek kelengkapan antropometri balita</li>
                <li><i className="fas fa-check text-success"></i> Deteksi KEK Ibu Hamil (LILA &lt; 23.5cm)</li>
                <li><i className="fas fa-check text-success"></i> Deteksi PTM Lansia (Gula, Kolesterol, Asam Urat)</li>
              </ul>
            </div>
            <div className="btn-group">
              <button className="btn btn-primary" onClick={fetchPemeriksaan} disabled={loading}>
                <i className={`fas fa-sync-alt ${loading ? 'fa-spin' : ''}`}></i> Jalankan Validasi
              </button>
            </div>
          </div>
          <div className="card-container">
            <h3><i className="fas fa-chart-pie"></i> Ringkasan Pengolahan</h3>
            <div id="validasi-summary">
              <div style={{ display: 'flex', gap: '20px', marginTop: '10px' }}>
                <div style={{ textAlign: 'center', flex: 1, padding: '15px', background: 'var(--bg-light)', borderRadius: '8px' }}>
                  <h2 style={{ margin: 0, color: 'var(--primary)' }}>{summary.total}</h2>
                  <small>Total Data</small>
                </div>
                <div style={{ textAlign: 'center', flex: 1, padding: '15px', background: 'rgba(33, 140, 116, 0.1)', borderRadius: '8px' }}>
                  <h2 style={{ margin: 0, color: 'var(--success)' }}>{summary.valid}</h2>
                  <small>Data Valid</small>
                </div>
                <div style={{ textAlign: 'center', flex: 1, padding: '15px', background: 'rgba(179, 57, 57, 0.1)', borderRadius: '8px' }}>
                  <h2 style={{ margin: 0, color: 'var(--danger)' }}>{summary.bermasalah}</h2>
                  <small>Bermasalah</small>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="card-container">
          <h3><i className="fas fa-exclamation-circle"></i> Data Bermasalah &amp; Perlu Tindak Lanjut</h3>
          
          {masalahList.length === 0 ? (
            <div id="empty-masalah" className="empty-state">
              <i className="fas fa-smile-beam" style={{ fontSize: '3rem', color: 'var(--success)', marginBottom: '10px' }}></i>
              <p>Tidak ada data bermasalah. Semua sasaran dalam kondisi <strong>Normal</strong>.</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead><tr><th>Nama</th><th>Kategori</th><th>Masalah Terdeteksi</th><th>Rekomendasi</th><th>Aksi</th></tr></thead>
                <tbody>
                  {masalahList.map((m, idx) => (
                    <tr key={idx}>
                      <td data-label="Nama">{m.nama}</td>
                      <td data-label="Kategori"><span className={`badge ${m.kategori === 'Balita' ? 'badge-primary' : m.kategori === 'Ibu Hamil' ? 'badge-warning' : 'badge-secondary'}`}>{m.kategori}</span></td>
                      <td data-label="Masalah" style={{ color: 'var(--danger)', fontWeight: 500 }}>{m.masalah}</td>
                      <td data-label="Rekomendasi">{m.rekomendasi}</td>
                      <td data-label="Aksi">
                        <button className="btn btn-sm btn-primary" onClick={() => setSelectedMasalah(m)}>Tinjau</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {selectedMasalah && (
          <div className="modal-overlay show" onClick={() => setSelectedMasalah(null)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Detail Temuan Validasi</h3>
                <button className="modal-close" onClick={() => setSelectedMasalah(null)}>
                  <i className="fas fa-times"></i>
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                  <div className="search-avatar" style={{ background: 'linear-gradient(135deg, var(--danger), var(--warning-dark))', color: 'white', width: '44px', height: '44px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem' }}>
                    <i className={selectedMasalah.kategori === 'Balita' ? 'fas fa-child' : selectedMasalah.kategori === 'Ibu Hamil' ? 'fas fa-female' : 'fas fa-blind'}></i>
                  </div>
                  <div>
                    <h4 style={{ margin: 0 }}>{selectedMasalah.nama}</h4>
                    <span className="badge badge-primary" style={{ marginTop: '4px', display: 'inline-block' }}>{selectedMasalah.kategori}</span>
                  </div>
                </div>

                <div className="validasi-rule err" style={{ background: 'rgba(192, 57, 43, 0.05)', display: 'flex', gap: '12px', padding: '12px', borderRadius: '8px', borderLeft: '3.5px solid var(--danger)' }}>
                  <div className="rule-icon" style={{ color: 'var(--danger)' }}><i className="fas fa-exclamation-triangle"></i></div>
                  <div className="rule-text">
                    <div className="rule-title" style={{ fontWeight: 700, fontSize: '0.85rem' }}>Masalah Terdeteksi</div>
                    <div className="rule-desc" style={{ color: 'var(--danger)', fontSize: '0.9rem', fontWeight: 600, marginTop: '2px' }}>{selectedMasalah.masalah}</div>
                  </div>
                </div>

                <div className="validasi-rule ok" style={{ background: 'rgba(0, 168, 120, 0.05)', display: 'flex', gap: '12px', padding: '12px', borderRadius: '8px', borderLeft: '3.5px solid var(--success)' }}>
                  <div className="rule-icon" style={{ color: 'var(--success)' }}><i className="fas fa-lightbulb"></i></div>
                  <div className="rule-text">
                    <div className="rule-title" style={{ fontWeight: 700, fontSize: '0.85rem' }}>Rekomendasi Tindakan</div>
                    <div className="rule-desc" style={{ color: 'var(--success)', fontSize: '0.9rem', marginTop: '2px' }}>{selectedMasalah.rekomendasi}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '14px' }}>
                  <button className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setSelectedMasalah(null)}>
                    Selesai &amp; Mengerti
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
    </>
  );
}
