"use client";

import { useState, useEffect } from "react";
import Header from "@/components/layout/Header";

export default function PendataanPage() {
  const [activeTab, setActiveTab] = useState("daftar");
  const [sasaranList, setSasaranList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const [categoryFilter, setCategoryFilter] = useState("semua");

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

  const [formData, setFormData] = useState({
    kategori: "balita",
    nama: "",
    nik: "",
    tglLahir: "",
    jk: "L",
    namaAyah: "",
    namaIbu: "",
    hp: "",
    alamat: "",
    usiaHamil: "",
    hpht: "",
    catatan: ""
  });

  // Fetch data
  const fetchSasaran = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/sasaran');
      if (res.ok) {
        const data = await res.json();
        setSasaranList(data);
      }
    } catch (error) {
      console.error("Gagal mengambil data sasaran", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSasaran();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    // Maps input id to state key (e.g. inp-nama -> nama)
    const key = id.replace('inp-', '').replace(/-([a-z])/g, g => g[1].toUpperCase());
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleEdit = (s: any) => {
    setEditingId(s.id);
    setFormData({
      kategori: s.kategori,
      nama: s.nama,
      nik: s.nik || "",
      tglLahir: s.tglLahir ? s.tglLahir.split('T')[0] : "",
      jk: s.jk || "L",
      namaAyah: s.namaAyah || "",
      namaIbu: s.namaIbu || "",
      hp: s.hp || "",
      alamat: s.alamat || "",
      usiaHamil: s.usiaHamil ? String(s.usiaHamil) : "",
      hpht: s.hpht ? s.hpht.split('T')[0] : "",
      catatan: s.catatan || ""
    });
    setActiveTab("tambah");
  };



  const confirmDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/sasaran?id=${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        showToast("Data sasaran berhasil dihapus!", "success");
        setDeleteTarget(null);
        fetchSasaran();
      } else {
        showToast("Gagal menghapus data.", "error");
      }
    } catch (e) {
      showToast("Terjadi kesalahan sistem.", "error");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = '/api/sasaran';
      const method = editingId ? 'PUT' : 'POST';
      const body = editingId ? { id: editingId, ...formData } : formData;

      const res = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      
      if (res.ok) {
        showToast(editingId ? "Data berhasil diperbarui!" : "Data berhasil disimpan!", "success");
        setFormData({
          kategori: "balita",
          nama: "",
          nik: "",
          tglLahir: "",
          jk: "L",
          namaAyah: "",
          namaIbu: "",
          hp: "",
          alamat: "",
          usiaHamil: "",
          hpht: "",
          catatan: ""
        });
        setEditingId(null);
        setActiveTab("daftar");
        fetchSasaran();
      } else {
        showToast("Gagal menyimpan data.", "error");
      }
    } catch (error) {
      showToast("Terjadi kesalahan.", "error");
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({
      kategori: "balita",
      nama: "",
      nik: "",
      tglLahir: "",
      jk: "L",
      namaAyah: "",
      namaIbu: "",
      hp: "",
      alamat: "",
      usiaHamil: "",
      hpht: "",
      catatan: ""
    });
    setActiveTab("daftar");
  };

  const calculateAgeStr = (dateStr: string) => {
    if (!dateStr) return "-";
    const dob = new Date(dateStr);
    const diff = new Date().getTime() - dob.getTime();
    const ageDate = new Date(diff); 
    const years = ageDate.getUTCFullYear() - 1970;
    const months = ageDate.getUTCMonth();
    return `${years} thn ${months} bln`;
  };

  return (
    <>
      <Header title="Pendataan Sasaran" context="Registrasi balita, ibu hamil, lansia" />
      <section className="view-section active">

        <div className="step-banner" style={{ borderLeftColor: 'var(--step1)' }}>
          <div className="step-banner-icon" style={{ background: 'var(--step1)' }}><i className="fas fa-user-plus"></i></div>
          <div className="step-banner-text">
            <h4>Tahap 1 — Pendataan Sasaran</h4>
            <p>Daftarkan seluruh sasaran posyandu: balita (0–5 tahun), ibu hamil, dan lansia. Data ini menjadi dasar seluruh alur layanan berikutnya.</p>
          </div>
        </div>

        <div className="tabs">
          <button className={`tab-btn ${activeTab === 'daftar' ? 'active' : ''}`} onClick={() => setActiveTab('daftar')}>
            <i className="fas fa-list"></i> Daftar Sasaran
          </button>
          <button className={`tab-btn ${activeTab === 'tambah' ? 'active' : ''}`} onClick={() => setActiveTab('tambah')}>
            <i className="fas fa-plus-circle"></i> {editingId ? "Edit Sasaran" : "Registrasi Baru"}
          </button>
        </div>

        {activeTab === 'daftar' && (
          <div className="tab-content active">
            <div className="card-container">
              <div className="card-header-actions" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
                <h3 style={{ margin: 0 }}><i className="fas fa-users"></i> Data Seluruh Sasaran</h3>
                
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                  {/* Category Filter Buttons */}
                  <div style={{ display: 'flex', background: 'var(--bg-input)', padding: '4px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    {['semua', 'balita', 'ibu_hamil', 'lansia'].map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setCategoryFilter(cat)}
                        style={{
                          padding: '6px 12px',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '0.8rem',
                          fontWeight: 'bold',
                          cursor: 'pointer',
                          background: categoryFilter === cat ? 'var(--primary)' : 'transparent',
                          color: categoryFilter === cat ? 'white' : 'var(--text-secondary)',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        {cat === 'semua' ? 'Semua' : cat === 'balita' ? 'Balita' : cat === 'ibu_hamil' ? 'Ibu Hamil' : 'Lansia'}
                      </button>
                    ))}
                  </div>

                  <div className="search-bar">
                    <div className="search-input-wrapper">
                      <i className="fas fa-search"></i>
                      <input 
                        type="text" 
                        placeholder="Cari nama / NIK..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Nama</th>
                      <th>Kategori</th>
                      <th>Usia</th>
                      <th>Ibu/Wali</th>
                      <th>Alamat</th>
                      <th>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      const filtered = sasaranList.filter(s => {
                        const matchesSearch = s.nama.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (s.nik && s.nik.includes(searchTerm));
                        const matchesCategory = categoryFilter === 'semua' || s.kategori === categoryFilter;
                        return matchesSearch && matchesCategory;
                      });
                      if (filtered.length === 0 && !loading) {
                        return <tr><td colSpan={6} style={{textAlign: 'center'}}>Tidak menemukan data sasaran.</td></tr>;
                      }
                      return filtered.map(s => (
                        <tr key={s.id}>
                          <td data-label="Nama">
                            <div style={{ textAlign: 'left' }} className="mobile-text-right">
                              <strong>{s.nama}</strong><br/>
                              <small style={{ color: 'var(--text-muted)' }}>{s.nik || '-'}</small>
                            </div>
                          </td>
                          <td data-label="Kategori">
                            <span>{s.kategori === 'balita' ? 'Balita' : s.kategori === 'ibu_hamil' ? 'Ibu Hamil' : 'Lansia'}</span>
                          </td>
                          <td data-label="Usia">
                            <span>{calculateAgeStr(s.tglLahir)}</span>
                          </td>
                          <td data-label="Ibu/Wali">
                            <span>{s.namaIbu || '-'}</span>
                          </td>
                          <td data-label="Alamat">
                            <span>{s.alamat || '-'}</span>
                          </td>
                          <td data-label="Aksi">
                            <div style={{ display: 'flex', gap: '6px' }}>
                              <button className="btn btn-sm btn-secondary" onClick={() => handleEdit(s)} title="Edit">
                                <i className="fas fa-edit"></i>
                              </button>
                              <button className="btn btn-sm btn-danger" onClick={() => setDeleteTarget(s)} title="Hapus">
                                <i className="fas fa-trash-alt"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ));
                    })()}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'tambah' && (
          <div className="tab-content active">
            <div className="card-container">
              <h3><i className="fas fa-user-plus"></i> {editingId ? "Edit Data Sasaran" : "Registrasi Sasaran Baru"}</h3>
              <form onSubmit={handleSubmit}>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Kategori Sasaran <span className="req">*</span></label>
                    <select id="inp-kategori" value={formData.kategori} onChange={handleChange} required>
                      <option value="balita">Balita (0–5 Tahun)</option>
                      <option value="ibu_hamil">Ibu Hamil</option>
                      <option value="lansia">Lansia (&gt;60 Tahun)</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Nama Lengkap <span className="req">*</span></label>
                    <input type="text" id="inp-nama" value={formData.nama} onChange={handleChange} required />
                  </div>
                  <div className="form-group">
                    <label>NIK</label>
                    <input type="text" id="inp-nik" maxLength={16} value={formData.nik} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label>Tanggal Lahir <span className="req">*</span></label>
                    <input type="date" id="inp-tgl-lahir" value={formData.tglLahir} onChange={handleChange} required />
                  </div>

                  {formData.kategori === 'balita' && (
                    <>
                      <div className="form-group">
                        <label>Jenis Kelamin</label>
                        <select id="inp-jk" value={formData.jk} onChange={handleChange}>
                          <option value="L">Laki-laki</option>
                          <option value="P">Perempuan</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Nama Ayah</label>
                        <input type="text" id="inp-nama-ayah" value={formData.namaAyah} onChange={handleChange} />
                      </div>
                    </>
                  )}

                  {formData.kategori !== 'lansia' && (
                    <div className="form-group">
                      <label>Nama Ibu / Wali</label>
                      <input type="text" id="inp-nama-ibu" value={formData.namaIbu} onChange={handleChange} />
                    </div>
                  )}

                  <div className="form-group">
                    <label>No. HP (Orang Tua / Pribadi)</label>
                    <input type="tel" id="inp-hp" value={formData.hp} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label>Jalan / Alamat</label>
                    <input type="text" id="inp-alamat" value={formData.alamat} onChange={handleChange} />
                  </div>

                  {formData.kategori === 'ibu_hamil' && (
                    <>
                      <div className="form-group">
                        <label>Usia Kehamilan (minggu)</label>
                        <input type="number" id="inp-usia-hamil" value={formData.usiaHamil} onChange={handleChange} />
                      </div>
                      <div className="form-group">
                        <label>HPHT</label>
                        <input type="date" id="inp-hpht" value={formData.hpht} onChange={handleChange} />
                      </div>
                    </>
                  )}
                </div>
                <div className="form-group" style={{ marginTop: '14px' }}>
                  <label>Catatan Khusus</label>
                  <textarea id="inp-catatan" value={formData.catatan} onChange={handleChange}></textarea>
                </div>
                <div className="btn-group">
                  <button className="btn btn-primary" type="submit"><i className="fas fa-save"></i> {editingId ? "Perbarui" : "Simpan Data"}</button>
                  <button className="btn btn-secondary" type="button" onClick={handleCancel}><i className="fas fa-times"></i> Batal</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {deleteTarget && (
          <div className="modal-overlay show" onClick={() => setDeleteTarget(null)}>
            <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '450px' }}>
              <div className="modal-header">
                <h3 style={{ color: 'var(--danger)' }}><i className="fas fa-trash-alt"></i> Konfirmasi Hapus</h3>
                <button className="modal-close" onClick={() => setDeleteTarget(null)}>
                  <i className="fas fa-times"></i>
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.5', margin: 0 }}>
                  Apakah Anda yakin ingin menghapus data sasaran <strong>{deleteTarget.nama}</strong>?
                  <br />
                  <span style={{ color: 'var(--danger-light)', fontWeight: 600, display: 'block', marginTop: '8px' }}>Tindakan ini bersifat permanen dan akan menghapus seluruh data riwayat pemeriksaan terkait.</span>
                </p>
                
                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                  <button className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setDeleteTarget(null)}>
                    Batal
                  </button>
                  <button className="btn btn-danger" style={{ flex: 1, justifyContent: 'center' }} onClick={() => confirmDelete(deleteTarget.id)}>
                    Ya, Hapus
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
