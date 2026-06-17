"use client";

import { useState } from "react";
import Header from "@/components/layout/Header";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

export default function ExportPage() {
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

  const fetchData = async () => {
    const res = await fetch('/api/pemeriksaan');
    return await res.json();
  };

  const exportPDF = async () => {
    setLoading(true);
    try {
      const data = await fetchData();
      const doc = new jsPDF();
      
      // Header
      doc.setFontSize(18);
      doc.text("Laporan Resmi Posyandu", 14, 22);
      doc.setFontSize(11);
      doc.text(`Dicetak pada: ${new Date().toLocaleDateString('id-ID')}`, 14, 30);
      
      const tableData = data.map((item: any, index: number) => [
        index + 1,
        new Date(item.tanggal).toLocaleDateString('id-ID'),
        item.sasaran?.nama || '-',
        item.sasaran?.kategori || '-',
        item.statusGizi || 'Normal'
      ]);

      autoTable(doc, {
        startY: 40,
        head: [['No', 'Tanggal', 'Nama Sasaran', 'Kategori', 'Status Gizi']],
        body: tableData,
      });

      doc.save("Laporan_Posyandu.pdf");
      showToast("Laporan PDF berhasil diunduh!", "success");
    } catch (e) {
      showToast("Gagal mengekspor data ke PDF", "error");
    } finally {
      setLoading(false);
    }
  };

  const exportExcel = async () => {
    setLoading(true);
    try {
      const data = await fetchData();
      const sheetData = data.map((item: any, index: number) => ({
        "No": index + 1,
        "Tanggal": new Date(item.tanggal).toLocaleDateString('id-ID'),
        "Nama Sasaran": item.sasaran?.nama,
        "Kategori": item.sasaran?.kategori,
        "Status Gizi": item.statusGizi || 'Normal',
        "Catatan": item.catatan || '-'
      }));

      const worksheet = XLSX.utils.json_to_sheet(sheetData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Data_Pemeriksaan");
      XLSX.writeFile(workbook, "Laporan_Posyandu.xlsx");
      showToast("Laporan Excel berhasil diunduh!", "success");
    } catch (e) {
      showToast("Gagal mengekspor data ke Excel", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header title="Pelaporan & Ekspor" context="Unduh laporan dalam format PDF & Excel" />
      <section className="view-section active">
        <div className="card-container">
          <h3><i className="fas fa-file-export"></i> Pusat Unduhan Laporan</h3>
          <p style={{marginBottom: '16px'}}>Export seluruh data pemeriksaan yang ada ke dalam format resmi yang siap dicetak untuk Kepala Desa atau diserahkan ke Puskesmas.</p>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn btn-primary" onClick={exportPDF} disabled={loading}>
              <i className="fas fa-file-pdf"></i> {loading ? 'Memproses...' : 'Export PDF'}
            </button>
            <button className="btn btn-success" onClick={exportExcel} disabled={loading}>
              <i className="fas fa-file-excel"></i> {loading ? 'Memproses...' : 'Export Excel'}
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
