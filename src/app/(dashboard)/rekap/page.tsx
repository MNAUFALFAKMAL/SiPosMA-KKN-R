"use client";

import { useState, useEffect } from "react";
import Header from "@/components/layout/Header";

export default function RekapPage() {
  const [sasaranList, setSasaranList] = useState<any[]>([]);
  const [pemeriksaanList, setPemeriksaanList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [reportType, setReportType] = useState("sasaran");
  const [bulan, setBulan] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [sasRes, pemRes] = await Promise.all([
          fetch('/api/sasaran'),
          fetch('/api/pemeriksaan'),
        ]);
        if (sasRes.ok) setSasaranList(await sasRes.json());
        if (pemRes.ok) setPemeriksaanList(await pemRes.json());
      } catch (e) {
        console.error("Gagal mengambil data", e);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  // ---- helpers ----
  const formatDate = (d: string) => d ? new Date(d).toLocaleDateString('id-ID') : '-';

  const filteredPemeriksaan = pemeriksaanList.filter(p => {
    if (!bulan) return true;
    return (p.tanggal || '').startsWith(bulan);
  });

  // ---- CSV Export ----
  const toCSV = (rows: string[][], filename: string) => {
    const bom = '\uFEFF'; // BOM for Excel UTF-8
    const content = bom + rows.map(r => r.map(c => `"${String(c ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownload = () => {
    setGenerating(true);
    try {
      if (reportType === 'sasaran') {
        const headers = ['Nama', 'Kategori', 'NIK', 'Tanggal Lahir', 'Jenis Kelamin', 'Nama Ibu', 'Alamat', 'No. HP'];
        const rows = sasaranList.map(s => [
          s.nama, s.kategori === 'ibu_hamil' ? 'Ibu Hamil' : s.kategori, s.nik || '-',
          formatDate(s.tglLahir), s.jk === 'L' ? 'Laki-laki' : 'Perempuan',
          s.namaIbu || '-', s.alamat || '-', s.hp || '-'
        ]);
        toCSV([headers, ...rows], `Laporan_Data_Sasaran_${new Date().toLocaleDateString('id-ID').replace(/\//g,'-')}.csv`);

      } else if (reportType === 'pemeriksaan') {
        const headers = ['Tanggal', 'Nama Sasaran', 'Kategori', 'NIK', 'BB (Kg)', 'TB (Cm)', 'LILA (Cm)', 'Status Gizi', 'Catatan'];
        const rows = filteredPemeriksaan.map(p => [
          formatDate(p.tanggal), p.sasaran?.nama || '-',
          p.sasaran?.kategori === 'ibu_hamil' ? 'Ibu Hamil' : p.sasaran?.kategori || '-',
          p.sasaran?.nik || '-',
          p.bb || p.bbBumil || p.bbLansia || '-',
          p.tb || '-', p.lila || p.lilaBumil || '-',
          p.statusGizi || '-', p.catatan || '-'
        ]);
        toCSV([headers, ...rows], `Laporan_Kunjungan_${bulan || 'Semua'}.csv`);

      } else if (reportType === 'gizi') {
        const balitaList = filteredPemeriksaan.filter(p => p.sasaran?.kategori === 'balita');
        const headers = ['Nama', 'NIK', 'BB (Kg)', 'TB (Cm)', 'LK (Cm)', 'LILA (Cm)', 'Status Gizi', 'Imunisasi', 'Vitamin A', 'Tanggal Periksa'];
        const rows = balitaList.map(p => [
          p.sasaran?.nama || '-', p.sasaran?.nik || '-',
          p.bb || '-', p.tb || '-', p.lk || '-', p.lila || '-',
          p.statusGizi || '-', p.imunisasi || 'Tidak Ada',
          p.vitamin || 'Tidak', formatDate(p.tanggal)
        ]);
        toCSV([headers, ...rows], `Laporan_Gizi_Balita_${bulan || 'Semua'}.csv`);
      }
    } finally {
      setGenerating(false);
    }
  };

  // ---- Print ----
  const handlePrint = () => {
    window.print();
  };

  // ---- Summary stats ----
  const totalBalita = sasaranList.filter(s => s.kategori === 'balita').length;
  const totalBumil = sasaranList.filter(s => s.kategori === 'ibu_hamil').length;
  const totalLansia = sasaranList.filter(s => s.kategori === 'lansia').length;
  const totalKunjungan = filteredPemeriksaan.length;

  const previewRows = () => {
    if (reportType === 'sasaran') return sasaranList.slice(0, 5);
    if (reportType === 'pemeriksaan') return filteredPemeriksaan.slice(0, 5);
    if (reportType === 'gizi') return filteredPemeriksaan.filter(p => p.sasaran?.kategori === 'balita').slice(0, 5);
    return [];
  };

  return (
    <>
      <Header title="Rekapitulasi & Pelaporan" context="Unduh laporan CSV & Cetak" />
      <section className="view-section active">

        <div className="step-banner" style={{ borderLeftColor: 'var(--step6)' }}>
          <div className="step-banner-icon" style={{ background: 'var(--step6)' }}><i className="fas fa-file-invoice"></i></div>
          <div className="step-banner-text">
            <h4>Tahap 6 — Laporan &amp; Rekapitulasi</h4>
            <p>Generate laporan data sasaran, rekap kunjungan, dan status gizi balita dalam format CSV siap cetak untuk diserahkan ke Puskesmas dan Kepala Desa.</p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="stats-grid premium-stats" style={{ marginBottom: '24px' }}>
          {[
            { label: 'Total Sasaran', value: sasaranList.length, icon: 'fa-users', color: 'var(--primary)' },
            { label: 'Balita Terdaftar', value: totalBalita, icon: 'fa-child', color: '#00a878' },
            { label: 'Ibu Hamil', value: totalBumil, icon: 'fa-female', color: '#e8568c' },
            { label: `Kunjungan (${bulan || 'Semua'})`, value: totalKunjungan, icon: 'fa-stethoscope', color: '#e6a817' },
          ].map((s, i) => (
            <div key={i} className="stat-card">
              <div className="stat-card-header">
                <div className="stat-icon" style={{ background: `${s.color}18`, color: s.color, width: 40, height: 40, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>
                  <i className={`fas ${s.icon}`}></i>
                </div>
              </div>
              <div className="stat-value" style={{ fontSize: '2rem', fontWeight: 800, color: s.color }}>{loading ? '...' : s.value}</div>
              <h4 style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{s.label}</h4>
            </div>
          ))}
        </div>

        {/* Generate Report */}
        <div className="card-container" style={{ marginBottom: '24px' }}>
          <h3><i className="fas fa-cog"></i> Pengaturan Laporan</h3>
          <div className="form-grid" style={{ marginTop: '16px' }}>
            <div className="form-group">
              <label>Jenis Laporan</label>
              <select value={reportType} onChange={e => setReportType(e.target.value)}>
                <option value="sasaran">📋 Data Sasaran Lengkap</option>
                <option value="pemeriksaan">🩺 Rekap Kunjungan & Pemeriksaan</option>
                <option value="gizi">🥗 Status Gizi Balita</option>
              </select>
            </div>
            {reportType !== 'sasaran' && (
              <div className="form-group">
                <label>Filter Bulan</label>
                <input
                  type="month"
                  value={bulan}
                  onChange={e => setBulan(e.target.value)}
                />
              </div>
            )}
          </div>

          <div className="btn-group" style={{ marginTop: '20px' }}>
            <button
              className="btn btn-primary"
              onClick={handleDownload}
              disabled={generating || loading}
            >
              {generating
                ? <><i className="fas fa-spinner fa-spin"></i> Menyiapkan...</>
                : <><i className="fas fa-file-csv"></i> Unduh CSV</>
              }
            </button>
            <button className="btn btn-secondary" onClick={handlePrint}>
              <i className="fas fa-print"></i> Cetak Halaman
            </button>
          </div>
        </div>

        {/* Preview Table */}
        <div className="card-container">
          <div className="card-header-actions" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0 }}><i className="fas fa-table"></i> Pratinjau Data (5 data pertama)</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Total: {reportType === 'sasaran' ? sasaranList.length : reportType === 'gizi' ? filteredPemeriksaan.filter(p => p.sasaran?.kategori === 'balita').length : filteredPemeriksaan.length} data
            </span>
          </div>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <i className="fas fa-circle-notch fa-spin" style={{ fontSize: '2rem', color: 'var(--primary)' }}></i>
              <p style={{ marginTop: '10px', color: 'var(--text-muted)' }}>Memuat data...</p>
            </div>
          ) : previewRows().length === 0 ? (
            <div className="empty-state">
              <i className="fas fa-folder-open"></i>
              <p>Tidak ada data untuk laporan ini.</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    {reportType === 'sasaran' && <><th>Nama</th><th>Kategori</th><th>NIK</th><th>Tgl Lahir</th><th>Alamat</th></>}
                    {reportType === 'pemeriksaan' && <><th>Tanggal</th><th>Nama</th><th>Kategori</th><th>BB (Kg)</th><th>TB (Cm)</th><th>Status Gizi</th></>}
                    {reportType === 'gizi' && <><th>Nama Balita</th><th>BB (Kg)</th><th>TB (Cm)</th><th>Status Gizi</th><th>Tgl Periksa</th></>}
                  </tr>
                </thead>
                <tbody>
                  {previewRows().map((row: any, i: number) => (
                    <tr key={i}>
                      {reportType === 'sasaran' && <>
                        <td><strong>{row.nama}</strong></td>
                        <td>
                          <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700, color: 'white', background: row.kategori === 'balita' ? '#00a878' : row.kategori === 'ibu_hamil' ? '#e8568c' : '#e6a817' }}>
                            {row.kategori === 'ibu_hamil' ? 'Ibu Hamil' : row.kategori}
                          </span>
                        </td>
                        <td>{row.nik || '-'}</td>
                        <td>{formatDate(row.tglLahir)}</td>
                        <td>{row.alamat || '-'}</td>
                      </>}
                      {reportType === 'pemeriksaan' && <>
                        <td>{formatDate(row.tanggal)}</td>
                        <td><strong>{row.sasaran?.nama}</strong></td>
                        <td>{row.sasaran?.kategori === 'ibu_hamil' ? 'Ibu Hamil' : row.sasaran?.kategori}</td>
                        <td>{row.bb || row.bbBumil || row.bbLansia || '-'}</td>
                        <td>{row.tb || '-'}</td>
                        <td>{row.statusGizi || '-'}</td>
                      </>}
                      {reportType === 'gizi' && <>
                        <td><strong>{row.sasaran?.nama}</strong></td>
                        <td>{row.bb || '-'}</td>
                        <td>{row.tb || '-'}</td>
                        <td>{row.statusGizi || '-'}</td>
                        <td>{formatDate(row.tanggal)}</td>
                      </>}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </section>
    </>
  );
}
