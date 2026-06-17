"use client";

import Header from "@/components/layout/Header";

export default function RekapPage() {
  return (
    <>
      <Header title="Rekapitulasi & Pelaporan" context="Generate laporan otomatis" />
      <section className="view-section active">
        <div className="step-banner" style={{ borderLeftColor: 'var(--step6)' }}>
          <div className="step-banner-icon" style={{ background: 'var(--step6)' }}><i className="fas fa-file-invoice"></i></div>
          <div className="step-banner-text">
            <h4>Tahap 6 — Laporan &amp; Rekapitulasi</h4>
            <p>Sistem merangkum seluruh data menjadi laporan (bulanan/tahunan) siap cetak untuk diserahkan ke Kepala Desa dan Puskesmas.</p>
          </div>
        </div>
        <div className="card-container">
          <h3><i className="fas fa-print"></i> Pembuatan Laporan</h3>
          <div className="form-grid" style={{ marginBottom: '16px' }}>
            <div className="form-group">
              <label>Pilih Laporan</label>
              <select>
                <option value="sasaran">Data Sasaran Lengkap</option>
                <option value="pemeriksaan">Rekap Kunjungan</option>
                <option value="gizi">Status Gizi Balita</option>
              </select>
            </div>
          </div>
          <button className="btn btn-primary"><i className="fas fa-download"></i> Unduh Laporan</button>
        </div>
      </section>
    </>
  );
}
