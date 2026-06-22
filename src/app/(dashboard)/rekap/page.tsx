"use client";

import { useState, useEffect } from "react";
import Header from "@/components/layout/Header";

export default function RekapPage() {
  const [sasaranList, setSasaranList] = useState<any[]>([]);
  const [pemeriksaanList, setPemeriksaanList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [reportType, setReportType] = useState("sasaran");
  const [bulan, setBulan] = useState(new Date().toISOString().slice(0, 7));
  const [generating, setGenerating] = useState<"" | "excel" | "pdf">("");

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

  const formatDate = (d: string) => d ? new Date(d).toLocaleDateString('id-ID') : '-';

  const filteredPemeriksaan = pemeriksaanList.filter(p => {
    if (!bulan) return true;
    return (p.tanggal || '').startsWith(bulan);
  });

  const getReportTitle = () => {
    if (reportType === 'sasaran') return 'Data Sasaran Lengkap';
    if (reportType === 'pemeriksaan') return `Rekap Kunjungan & Pemeriksaan — ${bulan}`;
    if (reportType === 'gizi') return `Status Gizi Balita — ${bulan}`;
    return 'Laporan Posyandu';
  };

  const getHeaders = () => {
    if (reportType === 'sasaran') return ['No', 'Nama', 'Kategori', 'NIK', 'Tanggal Lahir', 'Jenis Kelamin', 'Nama Ibu/Wali', 'Alamat', 'No. HP'];
    if (reportType === 'pemeriksaan') return ['No', 'Tanggal', 'Nama Sasaran', 'Kategori', 'NIK', 'BB (Kg)', 'TB (Cm)', 'LILA (Cm)', 'TD', 'Status Gizi', 'Imunisasi', 'Catatan'];
    if (reportType === 'gizi') return ['No', 'Nama Balita', 'NIK', 'BB (Kg)', 'TB (Cm)', 'LK (Cm)', 'LILA (Cm)', 'Status Gizi', 'Imunisasi', 'Vitamin A', 'Tanggal Periksa'];
    return [];
  };

  const getRows = () => {
    if (reportType === 'sasaran') {
      return sasaranList.map((s, i) => [
        i + 1, s.nama,
        s.kategori === 'ibu_hamil' ? 'Ibu Hamil' : s.kategori === 'balita' ? 'Balita' : 'Lansia',
        s.nik || '-', formatDate(s.tglLahir),
        s.jk === 'L' ? 'Laki-laki' : 'Perempuan',
        s.namaIbu || '-', s.alamat || '-', s.hp || '-'
      ]);
    }
    if (reportType === 'pemeriksaan') {
      return filteredPemeriksaan.map((p, i) => [
        i + 1, formatDate(p.tanggal), p.sasaran?.nama || '-',
        p.sasaran?.kategori === 'ibu_hamil' ? 'Ibu Hamil' : p.sasaran?.kategori || '-',
        p.sasaran?.nik || '-',
        p.bb || p.bbBumil || p.bbLansia || '-',
        p.tb || '-', p.lila || p.lilaBumil || '-',
        p.td || p.tdLansia || '-',
        p.statusGizi || '-', p.imunisasi || '-', p.catatan || '-'
      ]);
    }
    if (reportType === 'gizi') {
      return filteredPemeriksaan
        .filter(p => p.sasaran?.kategori === 'balita')
        .map((p, i) => [
          i + 1, p.sasaran?.nama || '-', p.sasaran?.nik || '-',
          p.bb || '-', p.tb || '-', p.lk || '-', p.lila || '-',
          p.statusGizi || '-', p.imunisasi || 'Tidak Ada',
          p.vitamin || 'Tidak', formatDate(p.tanggal)
        ]);
    }
    return [];
  };

  // ---- Excel Export ----
  const handleExcel = async () => {
    setGenerating("excel");
    try {
      const XLSX = await import('xlsx');
      const headers = getHeaders();
      const rows = getRows();
      const wsData = [headers, ...rows];
      const ws = XLSX.utils.aoa_to_sheet(wsData);

      // Style header row (bold / width)
      const colWidths = headers.map((h: string) => ({ wch: Math.max(h.length + 4, 14) }));
      ws['!cols'] = colWidths;

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Laporan');

      // Add metadata sheet
      const meta = [
        ['Judul Laporan', getReportTitle()],
        ['Tanggal Cetak', new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })],
        ['Total Data', rows.length],
        ['Sistem', 'SiPosMA — Sistem Informasi Posyandu'],
      ];
      const wsMeta = XLSX.utils.aoa_to_sheet(meta);
      XLSX.utils.book_append_sheet(wb, wsMeta, 'Info');

      XLSX.writeFile(wb, `Laporan_${reportType}_${bulan || 'Semua'}.xlsx`);
    } catch (err) {
      console.error("Gagal ekspor Excel:", err);
      alert("Gagal membuat file Excel.");
    } finally {
      setGenerating("");
    }
  };

  // ---- PDF Export ----
  const handlePDF = async () => {
    setGenerating("pdf");
    try {
      const { default: jsPDF } = await import('jspdf');
      const { default: autoTable } = await import('jspdf-autotable');

      const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

      // Header
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('SiPosMA — Sistem Informasi Posyandu', 14, 16);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.text(getReportTitle(), 14, 24);
      doc.setFontSize(9);
      doc.setTextColor(120);
      doc.text(`Dicetak pada: ${new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`, 14, 30);
      doc.setTextColor(0);

      const headers = getHeaders();
      const rows = getRows();

      autoTable(doc, {
        head: [headers],
        body: rows.map(r => r.map(String)),
        startY: 35,
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: { fillColor: [91, 79, 207], textColor: 255, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [245, 246, 250] },
        margin: { left: 14, right: 14 },
      });

      // Footer
      const totalPages = (doc as any).internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(`Halaman ${i} dari ${totalPages} — SiPosMA`, 14, doc.internal.pageSize.getHeight() - 8);
      }

      doc.save(`Laporan_${reportType}_${bulan || 'Semua'}.pdf`);
    } catch (err) {
      console.error("Gagal ekspor PDF:", err);
      alert("Gagal membuat file PDF.");
    } finally {
      setGenerating("");
    }
  };

  // ---- Print ----
  const handlePrint = () => window.print();

  // ---- Stats ----
  const totalBalita = sasaranList.filter(s => s.kategori === 'balita').length;
  const totalBumil = sasaranList.filter(s => s.kategori === 'ibu_hamil').length;
  const totalLansia = sasaranList.filter(s => s.kategori === 'lansia').length;
  const totalKunjungan = filteredPemeriksaan.length;

  const previewRows = getRows().slice(0, 5);
  const previewHeaders = getHeaders();

  return (
    <>
      <Header title="Rekapitulasi & Pelaporan" context="Unduh laporan Excel & PDF" />
      <section className="view-section active">

        <div className="step-banner" style={{ borderLeftColor: 'var(--step6)' }}>
          <div className="step-banner-icon" style={{ background: 'var(--step6)' }}><i className="fas fa-file-invoice"></i></div>
          <div className="step-banner-text">
            <h4>Tahap 6 — Laporan &amp; Rekapitulasi</h4>
            <p>Generate laporan data sasaran, rekap kunjungan, dan status gizi balita dalam format <strong>Excel (.xlsx)</strong> dan <strong>PDF</strong> siap cetak untuk Puskesmas dan Kepala Desa.</p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="stats-grid premium-stats" style={{ marginBottom: '24px' }}>
          {[
            { label: 'Total Sasaran', value: sasaranList.length, icon: 'fa-users', color: 'var(--primary)' },
            { label: 'Balita', value: totalBalita, icon: 'fa-child', color: '#00a878' },
            { label: 'Ibu Hamil', value: totalBumil, icon: 'fa-female', color: '#e8568c' },
            { label: `Kunjungan — ${bulan}`, value: totalKunjungan, icon: 'fa-stethoscope', color: '#e6a817' },
          ].map((s, i) => (
            <div key={i} className="stat-card">
              <div className="stat-card-header">
                <div style={{ background: `${s.color}18`, color: s.color, width: 40, height: 40, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>
                  <i className={`fas ${s.icon}`}></i>
                </div>
              </div>
              <div className="stat-value" style={{ fontSize: '2rem', fontWeight: 800, color: s.color }}>{loading ? '...' : s.value}</div>
              <h4 style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{s.label}</h4>
            </div>
          ))}
        </div>

        {/* Settings */}
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
                <input type="month" value={bulan} onChange={e => setBulan(e.target.value)} />
              </div>
            )}
          </div>

          {/* Download Buttons */}
          <div className="btn-group" style={{ marginTop: '20px', flexWrap: 'wrap', gap: '10px' }}>
            <button
              className="btn btn-success"
              onClick={handleExcel}
              disabled={!!generating || loading}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '160px', justifyContent: 'center' }}
            >
              {generating === 'excel'
                ? <><i className="fas fa-spinner fa-spin"></i> Menyiapkan...</>
                : <><i className="fas fa-file-excel"></i> Unduh Excel (.xlsx)</>
              }
            </button>

            <button
              className="btn btn-danger"
              onClick={handlePDF}
              disabled={!!generating || loading}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '160px', justifyContent: 'center' }}
            >
              {generating === 'pdf'
                ? <><i className="fas fa-spinner fa-spin"></i> Menyiapkan...</>
                : <><i className="fas fa-file-pdf"></i> Unduh PDF</>
              }
            </button>

            <button
              className="btn btn-secondary"
              onClick={handlePrint}
              disabled={!!generating}
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <i className="fas fa-print"></i> Cetak
            </button>
          </div>

          {generating && (
            <p style={{ marginTop: '12px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              <i className="fas fa-info-circle"></i> Sedang mempersiapkan file, mohon tunggu sebentar...
            </p>
          )}
        </div>

        {/* Preview */}
        <div className="card-container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '15px' }}>
            <h3 style={{ margin: 0 }}><i className="fas fa-table"></i> Pratinjau Data</h3>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', background: 'var(--bg-input)', padding: '4px 10px', borderRadius: '20px' }}>
              Total: <strong>{getRows().length}</strong> baris data
            </span>
          </div>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <i className="fas fa-circle-notch fa-spin" style={{ fontSize: '2rem', color: 'var(--primary)' }}></i>
              <p style={{ marginTop: '10px', color: 'var(--text-muted)' }}>Memuat data...</p>
            </div>
          ) : previewRows.length === 0 ? (
            <div className="empty-state">
              <i className="fas fa-folder-open"></i>
              <p>Tidak ada data untuk laporan ini pada periode yang dipilih.</p>
            </div>
          ) : (
            <>
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>{previewHeaders.map((h: string, i: number) => <th key={i}>{h}</th>)}</tr>
                  </thead>
                  <tbody>
                    {previewRows.map((row: any[], i: number) => (
                      <tr key={i}>
                        {row.map((cell, j) => (
                          <td key={j} data-label={previewHeaders[j]}>{cell}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {getRows().length > 5 && (
                <p style={{ textAlign: 'center', marginTop: '10px', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                  ... dan <strong>{getRows().length - 5}</strong> baris lainnya akan tersedia di file yang diunduh.
                </p>
              )}
            </>
          )}
        </div>

      </section>
    </>
  );
}
