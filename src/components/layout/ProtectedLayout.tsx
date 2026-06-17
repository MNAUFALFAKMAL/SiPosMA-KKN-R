"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import Sidebar from "@/components/layout/Sidebar";
import LoginCard from "@/components/auth/LoginCard";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

const roleAccessMap: Record<string, string[]> = {
  "/dashboard": ["admin", "adminpos", "kader", "bidan", "kades", "ortu"], // Ortu can view a limited dashboard
  "/pendataan": ["admin", "adminpos", "kader"],
  "/pelayanan": ["admin", "adminpos", "kader"],
  "/validasi": ["admin", "adminpos", "bidan"],
  "/riwayat": ["admin", "adminpos", "kader", "ortu"],
  "/pemantauan": ["admin", "adminpos", "kader", "bidan", "ortu"],
  "/rekap": ["admin", "adminpos", "kades"],
  "/evaluasi": ["admin", "adminpos", "kades"],
  "/pengguna": ["admin"],
  "/anthro": ["admin", "adminpos", "kader", "bidan"],
  "/export": ["admin", "adminpos", "kades"],
  "/integrasi": ["admin"],
};

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, isSidebarOpen, setSidebarOpen } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      const userRole = user.username || 'admin';
      const pathKey = Object.keys(roleAccessMap).find(key => pathname.startsWith(key));
      
      if (pathKey && !roleAccessMap[pathKey].includes(userRole)) {
        router.replace("/dashboard");
      }
    }
  }, [user, isLoading, pathname, router]);

  if (isLoading) {
    return (
      <div style={{ display: 'flex', height: '100vh', width: '100vw', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-body)' }}>
        <i className="fas fa-circle-notch fa-spin" style={{ fontSize: '2rem', color: 'var(--primary)' }}></i>
      </div>
    );
  }

  if (!user) {
    return <LoginCard />;
  }

  // Prevent flash of unauthorized content
  const userRole = user.username || 'admin';
  const pathKey = Object.keys(roleAccessMap).find(key => pathname.startsWith(key));
  if (pathKey && !roleAccessMap[pathKey].includes(userRole)) {
    return (
      <div style={{ display: 'flex', height: '100vh', width: '100vw', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-body)' }}>
        <i className="fas fa-circle-notch fa-spin" style={{ fontSize: '2rem', color: 'var(--primary)' }}></i>
      </div>
    );
  }

  return (
    <>
      <div className="toast-container" id="toast-container"></div>
      <div className={`sidebar-overlay ${isSidebarOpen ? "show" : ""}`} onClick={() => setSidebarOpen(false)}></div>
      <Sidebar />
      <main className="main-content" id="main-content">
        {children}
      </main>
    </>
  );
}
