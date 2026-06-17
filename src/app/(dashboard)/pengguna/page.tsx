"use client";

import { useState, useEffect } from "react";
import Header from "@/components/layout/Header";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export default function PenggunaPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "KADER",
  });
  const [submitLoading, setSubmitLoading] = useState(false);
  const [formError, setFormError] = useState("");

  // Fetch Users
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/pengguna");
      if (!res.ok) throw new Error("Gagal mengambil data pengguna");
      const data = await res.json();
      setUsers(data);
      setError("");
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan saat memuat data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Handle Form Change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Handle Submit (Create User)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitLoading(true);
    setFormError("");

    try {
      const res = await fetch("/api/pengguna", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || "Gagal menambahkan pengguna");
      }

      // Success
      setIsModalOpen(false);
      setFormData({ name: "", email: "", password: "", role: "KADER" });
      fetchUsers(); // Refresh list
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setSubmitLoading(false);
    }
  };

  // Handle Delete User
  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus pengguna "${name}"?`)) return;

    try {
      const res = await fetch(`/api/pengguna?id=${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const result = await res.json();
        throw new Error(result.error || "Gagal menghapus pengguna");
      }

      fetchUsers(); // Refresh list
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <>
      <Header title="Manajemen Pengguna" context="Kelola hak akses pengguna sistem" />
      <section className="view-section active">
        <div className="card-container">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <div>
              <h3><i className="fas fa-users-cog"></i> Daftar Pengguna</h3>
              <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "0.9rem" }}>
                Kelola kredensial login untuk Admin dan Kader Posyandu.
              </p>
            </div>
            <button 
              className="btn btn-primary"
              onClick={() => {
                setFormError("");
                setIsModalOpen(true);
              }}
            >
              <i className="fas fa-user-plus"></i> Tambah Pengguna
            </button>
          </div>

          {error && (
            <div className="error-alert" style={{ padding: "12px", background: "rgba(192, 57, 43, 0.1)", borderLeft: "4px solid var(--danger)", color: "var(--danger)", borderRadius: "4px", marginBottom: "16px" }}>
              <i className="fas fa-exclamation-circle"></i> {error}
            </div>
          )}

          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Nama</th>
                  <th>Email / Username</th>
                  <th>Peran</th>
                  <th>Status</th>
                  <th style={{ textAlign: "center" }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: "center", padding: "30px" }}>
                      <i className="fas fa-spinner fa-spin" style={{ fontSize: "1.5rem", color: "var(--primary)" }}></i>
                      <p style={{ marginTop: "8px", margin: 0, color: "var(--text-muted)" }}>Memuat data pengguna...</p>
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: "center", padding: "30px", color: "var(--text-muted)" }}>
                      <i className="fas fa-users" style={{ fontSize: "2rem", marginBottom: "8px" }}></i>
                      <p>Belum ada data pengguna di database.</p>
                    </td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u.id}>
                      <td><strong>{u.name}</strong></td>
                      <td>{u.email}</td>
                      <td>
                        <span className={`badge ${u.role === "ADMIN" ? "badge-danger" : "badge-primary"}`} style={{ textTransform: "uppercase" }}>
                          {u.role}
                        </span>
                      </td>
                      <td>
                        <span className="status-indicator status-normal">Aktif</span>
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <button 
                          onClick={() => handleDelete(u.id, u.name)}
                          className="btn btn-danger btn-sm"
                          title="Hapus Pengguna"
                          style={{ padding: "6px 10px", fontSize: "0.85rem" }}
                        >
                          <i className="fas fa-trash-alt"></i> Hapus
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* MODAL OVERLAY */}
      {isModalOpen && (
        <div className="modal-backdrop" style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)" }}>
          <div className="modal-content" style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-lg)", width: "100%", maxWidth: "450px", padding: "24px", boxShadow: "var(--glass-shadow)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h4 style={{ margin: 0, fontSize: "1.2rem", display: "flex", alignItems: "center", gap: "8px" }}>
                <i className="fas fa-user-plus" style={{ color: "var(--primary)" }}></i> Tambah Pengguna Baru
              </h4>
              <button 
                onClick={() => setIsModalOpen(false)}
                style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "1.2rem" }}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            {formError && (
              <div style={{ padding: "10px", background: "rgba(192, 57, 43, 0.1)", borderLeft: "3px solid var(--danger)", color: "var(--danger)", fontSize: "0.85rem", borderRadius: "4px", marginBottom: "16px" }}>
                <i className="fas fa-exclamation-circle"></i> {formError}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "0.9rem", fontWeight: "bold" }}>Nama Lengkap</label>
                <input 
                  type="text" 
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Contoh: Ibu Rahmawati"
                  style={{ width: "100%", padding: "10px 14px", border: "1px solid var(--border-color)", borderRadius: "var(--radius-sm)", background: "var(--bg-input)", color: "var(--text-primary)" }}
                  required
                />
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "0.9rem", fontWeight: "bold" }}>Email / Username Login</label>
                <input 
                  type="email" 
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Contoh: rahma@siposma.com"
                  style={{ width: "100%", padding: "10px 14px", border: "1px solid var(--border-color)", borderRadius: "var(--radius-sm)", background: "var(--bg-input)", color: "var(--text-primary)" }}
                  required
                />
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "0.9rem", fontWeight: "bold" }}>Password</label>
                <input 
                  type="password" 
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Masukkan password login"
                  style={{ width: "100%", padding: "10px 14px", border: "1px solid var(--border-color)", borderRadius: "var(--radius-sm)", background: "var(--bg-input)", color: "var(--text-primary)" }}
                  required
                />
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "0.9rem", fontWeight: "bold" }}>Hak Akses / Peran</label>
                <select 
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  style={{ width: "100%", padding: "10px 14px", border: "1px solid var(--border-color)", borderRadius: "var(--radius-sm)", background: "var(--bg-input)", color: "var(--text-primary)", cursor: "pointer" }}
                >
                  <option value="KADER">Kader Posyandu</option>
                  <option value="ADMIN">Super Admin / Administrator</option>
                </select>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "24px" }}>
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setIsModalOpen(false)}
                  style={{ padding: "10px 16px" }}
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={submitLoading}
                  style={{ padding: "10px 16px", minWidth: "120px" }}
                >
                  {submitLoading ? <i className="fas fa-spinner fa-spin"></i> : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
