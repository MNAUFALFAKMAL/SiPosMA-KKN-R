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
  ArcElement,
  Filler
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement,
  Title, Tooltip, Legend, ArcElement, Filler
);

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalSasaran: 0,
    balitaCount: 0,
    bumilCount: 0,
    lansiaCount: 0,
    totalPemeriksaan: 0
  });
  const [isMobile, setIsMobile] = useState(false);
  const [showLineMenu, setShowLineMenu] = useState(false);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (e) {
      console.error("Failed to fetch stats", e);
    }
  };

  const downloadChart = (chartId: string, filename: string) => {
    const canvas = document.getElementById(chartId) as HTMLCanvasElement;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = filename;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  useEffect(() => {
    fetchStats();

    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);

    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.card-action')) {
        setShowLineMenu(false);
      }
    };
    document.addEventListener("click", handleOutsideClick);

    return () => {
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("click", handleOutsideClick);
    };
  }, []);

  const lineData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun'],
    datasets: [
      {
        label: 'Kunjungan Pemeriksaan',
        data: [120, 135, 125, 145, 160, stats.totalPemeriksaan || 170],
        borderColor: '#5b4fcf',
        backgroundColor: 'rgba(91, 79, 207, 0.15)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#5b4fcf',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6
      }
    ]
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(26, 26, 46, 0.9)',
        padding: 12,
        titleFont: { size: 13, family: "'Bookman Old Style', serif" },
        bodyFont: { size: 14, family: "'Bookman Old Style', serif" },
        displayColors: false,
        callbacks: {
          label: function(context: any) {
            return `${context.parsed.y} Sasaran`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(91, 79, 207, 0.05)', drawBorder: false },
        ticks: { color: '#8888a8', font: { family: "'Bookman Old Style', serif", size: 11 } }
      },
      x: {
        grid: { display: false, drawBorder: false },
        ticks: { color: '#8888a8', font: { family: "'Bookman Old Style', serif", size: 11 } }
      }
    }
  };

  const doughnutData = {
    labels: ['Gizi Normal', 'Risiko Stunting', 'Stunting', 'Gizi Buruk'],
    datasets: [{
      data: [75, 12, 8, 5],
      backgroundColor: ['#00b894', '#fdcb6e', '#e17055', '#d63031'],
      borderWidth: 0,
      hoverOffset: 4
    }]
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '75%',
    plugins: {
      legend: { 
        position: isMobile ? 'bottom' as const : 'right' as const,
        labels: {
          color: '#4a4a6a',
          font: { family: "'Bookman Old Style', serif", size: 12, weight: 600 as any },
          padding: isMobile ? 10 : 20,
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(26, 26, 46, 0.9)',
        padding: 12,
        bodyFont: { size: 14, family: "'Bookman Old Style', serif" }
      }
    }
  };

  return (
    <>
      <Header title="Dashboard" context="Analitik real-time dan metrik utama Posyandu" />

      <section className="view-section active" style={{ animation: "none" }}>
        {/* Welcome Banner */}
        <div className="premium-banner">
          <div className="premium-banner-content">
            <h2>Selamat Datang di SiPosMA Premium ✨</h2>
            <p>Pantau kesehatan balita, ibu hamil, dan lansia dengan antarmuka yang elegan, mulus, dan analitik yang akurat.</p>
          </div>
          <div className="premium-banner-illustration">
             <i className="fas fa-chart-pie"></i>
          </div>
        </div>

        <div className="stats-grid premium-stats">
            <div className="stat-card">
              <div className="stat-card-header">
                <div className="stat-icon stat-icon-1"><i className="fas fa-users"></i></div>
                <span className="stat-trend up"><i className="fas fa-arrow-up"></i> 12%</span>
              </div>
              <div className="stat-info">
                <div className="stat-value">{stats.totalSasaran}</div>
                <h4>Total Penduduk Terdaftar</h4>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-card-header">
                <div className="stat-icon stat-icon-5"><i className="fas fa-child"></i></div>
                <span className="stat-trend up"><i className="fas fa-arrow-up"></i> 5%</span>
              </div>
              <div className="stat-info">
                <div className="stat-value">{stats.balitaCount}</div>
                <h4>Balita Aktif</h4>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-card-header">
                <div className="stat-icon stat-icon-3"><i className="fas fa-female"></i></div>
                <span className="stat-trend neutral"><i className="fas fa-minus"></i> 0%</span>
              </div>
              <div className="stat-info">
                <div className="stat-value">{stats.bumilCount}</div>
                <h4>Ibu Hamil</h4>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-card-header">
                <div className="stat-icon stat-icon-4"><i className="fas fa-blind"></i></div>
                <span className="stat-trend up"><i className="fas fa-arrow-up"></i> 8%</span>
              </div>
              <div className="stat-info">
                <div className="stat-value">{stats.lansiaCount}</div>
                <h4>Lansia Terlayani</h4>
              </div>
            </div>
        </div>
        
        <div className="grid-2">
            <div className="card-container premium-chart-card">
                <div className="card-header">
                  <div>
                    <h3>Tren Kunjungan 6 Bulan Terakhir</h3>
                    <p className="card-subtitle">Peningkatan partisipasi masyarakat ke Posyandu</p>
                  </div>
                  <div className="card-action" style={{ position: 'relative' }}>
                    <button className="btn-icon-light" onClick={() => setShowLineMenu(!showLineMenu)}><i className="fas fa-ellipsis-v"></i></button>
                    {showLineMenu && (
                      <div style={{
                        position: 'absolute',
                        top: '100%',
                        right: 0,
                        backgroundColor: 'white',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-sm)',
                        boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
                        zIndex: 10,
                        width: '180px',
                        padding: '6px 0',
                        marginTop: '4px',
                        textAlign: 'left'
                      }}>
                        <div 
                          onClick={() => { fetchStats(); setShowLineMenu(false); }}
                          style={{ padding: '8px 14px', cursor: 'pointer', fontSize: '0.8rem', color: 'var(--text-secondary)' }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(91,79,207,0.08)'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                          <i className="fas fa-sync-alt" style={{ marginRight: '6px' }}></i> Refresh Data
                        </div>
                        <div 
                          onClick={() => { downloadChart('line-chart', 'tren_kunjungan.png'); setShowLineMenu(false); }}
                          style={{ padding: '8px 14px', cursor: 'pointer', fontSize: '0.8rem', color: 'var(--text-secondary)', borderTop: '1px solid rgba(0,0,0,0.05)' }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(91,79,207,0.08)'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                          <i className="fas fa-file-image" style={{ marginRight: '6px' }}></i> Unduh Grafik (PNG)
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="chart-container" style={{height: "280px", position: "relative", marginTop: '20px'}}>
                    <Line id="line-chart" data={lineData} options={lineOptions} />
                </div>
            </div>
            
            <div className="card-container premium-chart-card">
                <div className="card-header">
                  <div>
                    <h3>Distribusi Status Gizi Balita</h3>
                    <p className="card-subtitle">Persebaran rasio stunting dan gizi normal bulan ini</p>
                  </div>
                  <div className="card-action">
                    <button className="btn-icon-light" onClick={() => downloadChart('doughnut-chart', 'distribusi_status_gizi.png')} title="Unduh Gambar"><i className="fas fa-download"></i></button>
                  </div>
                </div>
                <div className="chart-container" style={{height: "280px", position: "relative", marginTop: '20px', display: 'flex', justifyContent: 'center'}}>
                    <Doughnut id="doughnut-chart" data={doughnutData} options={doughnutOptions} />
                    <div className="doughnut-inner-text">
                      <span className="val">{stats.balitaCount}</span>
                      <span className="lbl">Balita</span>
                    </div>
                </div>
            </div>
        </div>
      </section>
    </>
  );
}
