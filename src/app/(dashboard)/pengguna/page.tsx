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
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "SUPER_ADMIN",
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

  // Handle Edit Click
  const handleEditClick = (u: User) => {
    setEditingId(u.id);
    setFormData({
      name: u.name,
      email: u.email,
      password: "",
      role: u.role,
    });
    setFormError("");
    setIsModalOpen(true);
  };

  // Handle Submit (Create or Update User)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitLoading(true);
    setFormError("");

    try {
      const url = "/api/pengguna";
      const method = editingId ? "PUT" : "POST";
      const payload = editingId ? { id: editingId, ...formData } : formData;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || `Gagal ${editingId ? "mengubah" : "menambahkan"} pengguna`);
      }

      // Success
      setIsModalOpen(false);
      setEditingId(null);
      setFormData({ name: "", email: "", password: "", role: "SUPER_ADMIN" });
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
                setEditingId(null);
                setFormData({ name: "", email: "", password: "", role: "SUPER_ADMIN" });
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
                        {(() => {
                          const roleMap: Record<string, { label: string; color: string }> = {
                            SUPER_ADMIN: { label: "Super Admin", color: "#6c5ce7" },
                            ADMINPOS:    { label: "Admin Posyandu", color: "#0ab5b0" },
                            BIDAN:       { label: "Bidan Desa", color: "#e8568c" },
                            KADES:       { label: "Kepala Desa", color: "#e6a817" },
                            ORTU:        { label: "Orang Tua / Masyarakat", color: "#d45c35" },
                          };
                          const r = roleMap[u.role] || { label: u.role, color: "#8888a8" };
                          return (
                            <span style={{ padding: "3px 10px", borderRadius: "999px", fontSize: "0.78rem", fontWeight: 700, color: "white", background: r.color, whiteSpace: "nowrap" }}>
                              {r.label}
                            </span>
                          );
                        })()}
                      </td>
                      <td>
                        <span className="status-indicator status-normal">Aktif</span>
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                          <button 
                            onClick={() => handleEditClick(u)}
                            className="btn btn-secondary btn-sm"
                            title="Edit Pengguna"
                            style={{ padding: "6px 10px", fontSize: "0.85rem", display: "inline-flex", alignItems: "center", gap: "4px" }}
                          >
                            <i className="fas fa-edit"></i> Edit
                          </button>
                          <button 
                            onClick={() => handleDelete(u.id, u.name)}
                            className="btn btn-danger btn-sm"
                            title="Hapus Pengguna"
                            style={{ padding: "6px 10px", fontSize: "0.85rem", display: "inline-flex", alignItems: "center", gap: "4px" }}
                          >
                            <i className="fas fa-trash-alt"></i> Hapus
                          </button>
                        </div>
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
        <div className="modal-backdrop" style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)" }}>
          <div className="modal-content" style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-lg)", width: "calc(100% - 40px)", maxWidth: "450px", padding: "24px", boxShadow: "0 30px 60px rgba(0,0,0,0.3)", maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h4 style={{ margin: 0, fontSize: "1.2rem", display: "flex", alignItems: "center", gap: "8px" }}>
                <i className={editingId ? "fas fa-user-edit" : "fas fa-user-plus"} style={{ color: "var(--primary)" }}></i> {editingId ? "Edit Pengguna" : "Tambah Pengguna Baru"}
              </h4>
              <button 
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingId(null);
                  setFormData({ name: "", email: "", password: "", role: "SUPER_ADMIN" });
                }}
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
                <label style={{ display: "block", marginBottom: "6px", fontSize: "0.9rem", fontWeight: "bold" }}>Username Login</label>
                <input 
                  type="text" 
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Contoh: kader01 atau rahma@siposma.com"
                  style={{ width: "100%", padding: "10px 14px", border: "1px solid var(--border-color)", borderRadius: "var(--radius-sm)", background: "var(--bg-input)", color: "var(--text-primary)" }}
                  required
                />
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "0.9rem", fontWeight: "bold" }}>
                  Password {editingId && <span style={{ fontWeight: "normal", color: "var(--text-muted)", fontSize: "0.8rem" }}>(Kosongkan jika tidak diubah)</span>}
                </label>
                <input 
                  type="password" 
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder={editingId ? "Kosongkan jika tidak ingin mengubah password" : "Masukkan password login"}
                  style={{ width: "100%", padding: "10px 14px", border: "1px solid var(--border-color)", borderRadius: "var(--radius-sm)", background: "var(--bg-input)", color: "var(--text-primary)" }}
                  required={!editingId}
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
                  <option value="SUPER_ADMIN">Super Admin</option>
                  <option value="ADMINPOS">Admin Posyandu</option>
                  <option value="BIDAN">Bidan Desa</option>
                  <option value="KADES">Kepala Desa</option>
                  <option value="ORTU">Orang Tua / Masyarakat</option>
                </select>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "24px" }}>
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingId(null);
                    setFormData({ name: "", email: "", password: "", role: "SUPER_ADMIN" });
                  }}
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
