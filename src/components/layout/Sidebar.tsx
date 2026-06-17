"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout, isSidebarOpen, setSidebarOpen } = useAuth();

  const userRole = user?.username || 'admin'; // Using username as role identifier for simplicity

  const allMenuItems = [
    { id: "dashboard", href: "/dashboard", icon: "fa-th-large", title: "Dashboard & Ringkasan", allowedRoles: ["admin", "adminpos", "kader", "bidan", "kades"] },
    { isWorkflow: true, id: "wf1", allowedRoles: ["admin", "adminpos", "kader", "bidan", "ortu"] },
    { id: "pendataan", step: 1, href: "/pendataan", icon: "fa-user-plus", title: "Pendataan Sasaran", desc: "Registrasi balita, ibu hamil, lansia", allowedRoles: ["admin", "adminpos", "kader"] },
    { isConnector: true, id: "conn1", allowedRoles: ["admin", "adminpos", "kader"] },
    { id: "pelayanan", step: 2, href: "/pelayanan", icon: "fa-stethoscope", title: "Pelayanan & Input Pemeriksaan", desc: "Input hasil timbang, ukur, imunisasi", allowedRoles: ["admin", "adminpos", "kader"] },
    { isConnector: true, id: "conn2", allowedRoles: ["admin", "adminpos", "kader"] },
    { id: "validasi", step: 3, href: "/validasi", icon: "fa-check-double", title: "Validasi & Pengolahan Data", desc: "Cek kelengkapan & hitung status gizi", allowedRoles: ["admin", "adminpos", "bidan"] },
    { isConnector: true, id: "conn3", allowedRoles: ["admin", "adminpos", "bidan", "kader", "ortu"] },
    { id: "riwayat", step: 4, href: "/riwayat", icon: "fa-history", title: "Penyimpanan Riwayat Layanan", desc: "Histori pemeriksaan & KMS digital", allowedRoles: ["admin", "adminpos", "kader", "ortu"] },
    { isConnector: true, id: "conn4", allowedRoles: ["admin", "adminpos", "kader", "bidan", "ortu", "kades"] },
    { id: "pemantauan", step: 5, href: "/pemantauan", icon: "fa-search-plus", title: "Pencarian & Pemantauan Data", desc: "Cari sasaran & pantau tumbuh kembang", allowedRoles: ["admin", "adminpos", "kader", "bidan", "ortu"] },
    { isConnector: true, id: "conn5", allowedRoles: ["admin", "adminpos", "kades"] },
    { id: "rekap", step: 6, href: "/rekap", icon: "fa-file-alt", title: "Rekapitulasi & Pelaporan", desc: "Laporan bulanan & ekspor data", allowedRoles: ["admin", "adminpos", "kades"] },
    { isConnector: true, id: "conn6", allowedRoles: ["admin", "adminpos", "kades"] },
    { id: "evaluasi", step: 7, href: "/evaluasi", icon: "fa-chart-pie", title: "Penyajian Informasi & Evaluasi", desc: "Analisis capaian & rekomendasi", allowedRoles: ["admin", "adminpos", "kades"] },
    { isWorkflow: true, label: "Fitur Tambahan", id: "wf2", allowedRoles: ["admin", "adminpos", "kader", "bidan", "kades"] },
    { id: "pengguna", step: 8, href: "/pengguna", icon: "fa-users-cog", title: "Manajemen Pengguna", desc: "Hak akses sistem", allowedRoles: ["admin"] },
    { id: "anthro", step: 9, href: "/anthro", icon: "fa-weight", title: "Kalkulator WHO Anthro", desc: "Deteksi dini risiko stunting", allowedRoles: ["admin", "adminpos", "kader", "bidan"] },
    { id: "export", step: 10, href: "/export", icon: "fa-file-export", title: "Pelaporan & Ekspor", desc: "Unduh CSV, Excel & Cetak", allowedRoles: ["admin", "adminpos", "kades"] },
    { id: "integrasi", step: 11, href: "/integrasi", icon: "fa-cloud-upload-alt", title: "Integrasi & Database", desc: "Backup, Restore & Sinkronisasi", allowedRoles: ["admin"] },
  ];

  // Filter items based on role, then clean up dangling connectors
  let menuItems = allMenuItems.filter(item => item.allowedRoles.includes(userRole));
  
  // Clean up consecutive or trailing connectors
  menuItems = menuItems.filter((item, index) => {
    if (item.isConnector) {
      // Keep connector only if the next item is NOT a connector AND NOT a workflow label, and there is a next item
      const nextItem = menuItems[index + 1];
      if (!nextItem || nextItem.isConnector || nextItem.isWorkflow) {
        return false;
      }
      
      // Also check if the previous item was a workflow label (don't start with a connector)
      const prevItem = menuItems[index - 1];
      if (!prevItem || prevItem.isWorkflow) {
        return false;
      }
    }
    
    // Clean up empty workflow labels
    if (item.isWorkflow) {
      const nextItem = menuItems[index + 1];
      if (!nextItem || nextItem.isWorkflow) {
         return false; // Remove empty section header
      }
    }
    return true;
  });

  const handleLinkClick = () => {
    setSidebarOpen(false);
  };

  return (
    <nav className={`sidebar ${isSidebarOpen ? "mobile-open" : ""}`} id="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <div className="logo-icon" style={{ padding: 0, overflow: 'hidden' }}>
            <img src="/img/logo.jpg" alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div className="logo-text">
            <h2>SiPosMA</h2>
            <span>Sistem Informasi Posyandu</span>
          </div>
          <button className="btn-sidebar-close" onClick={() => setSidebarOpen(false)} aria-label="Tutup Menu">
            <i className="fas fa-times"></i>
          </button>
        </div>
        <div className="sidebar-alur-label">Alur Sistem Terintegrasi</div>
      </div>

      <div className="nav-menu" style={{ overflowY: 'auto' }}>
        {menuItems.map((item, idx) => {
          if (item.isWorkflow) {
            return (
              <div key={idx} className="workflow-label">
                {item.label || "Alur Proses"}
              </div>
            );
          }

          if (item.isConnector) {
            return <div key={idx} className="step-connector"></div>;
          }

          const isActive = pathname === item.href;

          if (item.id === "dashboard") {
            return (
              <Link href={item.href!} key={item.id} onClick={handleLinkClick} className={`nav-dashboard-link ${isActive ? "active" : ""}`} style={{ textDecoration: 'none' }}>
                <i className={`fas ${item.icon}`}></i> {item.title}
              </Link>
            );
          }

          return (
            <Link href={item.href!} key={item.id} onClick={handleLinkClick} className={`nav-step ${isActive ? "active" : ""}`} style={{ textDecoration: 'none' }}>
              <div className="step-num">{item.step}</div>
              <div>
                {item.title}
                <div className="step-desc">{item.desc}</div>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="sidebar-profile">
        <div className="sidebar-avatar">
          {user?.name.charAt(0) || 'U'}
        </div>
        <div className="sidebar-user-info">
          <h4>{user?.name || 'User'}</h4>
          <p>{user?.role || 'Guest'}</p>
        </div>
        <button onClick={logout} className="btn-logout" title="Keluar">
          <i className="fas fa-sign-out-alt"></i>
        </button>
      </div>

      <div className="sidebar-footer">
        <p>&copy; 2026 SiPosMA &mdash; Posyandu Desa</p>
      </div>
    </nav>
  );
}
