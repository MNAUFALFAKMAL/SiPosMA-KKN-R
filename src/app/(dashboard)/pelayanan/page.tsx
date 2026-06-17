"use client";

import { useState, useEffect } from "react";
import Header from "@/components/layout/Header";

export default function PelayananPage() {
  const [sasaranList, setSasaranList] = useState<any[]>([]);
  const [selectedSasaran, setSelectedSasaran] = useState<any>(null);
  const [searchText, setSearchText] = useState("");
  
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const [formData, setFormData] = useState({
    sasaranId: "",
    tanggal: new Date().toISOString().split('T')[0],
    
    // Balita
    bb: "", tb: "", lk: "", lila: "", imunisasi: "", vitamin: "",
    
    // Bumil
    bbBumil: "", td: "", fundus: "", lilaBumil: "", djj: "", fe: "",
    
    // Lansia
    bbLansia: "", tdLansia: "", gula: "", kolesterol: "", asamUrat: "",
    
    // Umum
    keluhan: "", catatan: ""
  });

  useEffect(() => {
    // Fetch all sasaran for dropdown
    const fetchSasaran = async () => {
      try {
        const res = await fetch('/api/sasaran');
        if (res.ok) {
          const data = await res.json();
          setSasaranList(data);
        }
      } catch (e) {
        console.error("Gagal mengambil sasaran", e);
      }
    };
    fetchSasaran();
  }, []);

  const handleSelectSasaran = (s: any) => {
    setSelectedSasaran(s);
    setSearchText(s.nama);
    setFormData(prev => ({ ...prev, sasaranId: s.id }));
    setShowSuggestions(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    // Map id e.g. pel-bb -> bb
    let key = id.replace('pel-', '').replace(/-([a-z])/g, g => g[1].toUpperCase());
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.sasaranId) {
      alert("Pilih sasaran terlebih dahulu.");
      return;
    }

    try {
      const res = await fetch('/api/pemeriksaan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        alert("Pemeriksaan berhasil disimpan!");
        // Reset form keeping date
        setFormData({
          sasaranId: "", tanggal: formData.tanggal,
          bb: "", tb: "", lk: "", lila: "", imunisasi: "", vitamin: "",
          bbBumil: "", td: "", fundus: "", lilaBumil: "", djj: "", fe: "",
          bbLansia: "", tdLansia: "", gula: "", kolesterol: "", asamUrat: "",
          keluhan: "", catatan: ""
        });
        setSelectedSasaran(null);
      } else {
        alert("Gagal menyimpan data.");
      }
    } catch (err) {
      alert("Terjadi kesalahan sistem.");
    }
  };

  return (
    <>
      <Header title="Pelayanan & Input Pemeriksaan" context="Input hasil timbang, ukur, imunisasi" />
      <section className="view-section active">

        <div className="step-banner" style={{ borderLeftColor: 'var(--step2)' }}>
          <div className="step-banner-icon" style={{ background: 'var(--step2)' }}><i className="fas fa-stethoscope"></i></div>
          <div className="step-banner-text">
            <h4>Tahap 2 — Pelayanan &amp; Input Pemeriksaan</h4>
            <p>Input hasil pemeriksaan: timbang BB/TB, ukur LILA, lingkar kepala, tekanan darah, pemberian imunisasi dan vitamin.</p>
          </div>
        </div>

        <div className="card-container">
          <h3><i className="fas fa-stethoscope"></i> Input Hasil Pemeriksaan</h3>
          
          <form onSubmit={handleSubmit}>
            <div className="form-grid" style={{ marginBottom: '18px' }}>
              <div className="form-group" style={{ position: 'relative' }}>
                <label>Pilih Sasaran (Cari Nama / NIK) <span className="req">*</span></label>
                <input 
                  type="text" 
                  id="pel-sasaran" 
                  placeholder="Ketik nama atau NIK untuk mencari..." 
                  value={searchText}
                  onChange={(e) => {
                    setSearchText(e.target.value);
                    setShowSuggestions(true);
                    if (e.target.value === "") {
                      setSelectedSasaran(null);
                      setFormData(prev => ({ ...prev, sasaranId: "" }));
                    }
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  required 
                  autoComplete="off"
                />
                {showSuggestions && searchText && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    backgroundColor: 'white',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-sm)',
                    boxShadow: '0 8px 20px rgba(91, 79, 207, 0.1)',
                    zIndex: 100,
                    maxHeight: '200px',
                    overflowY: 'auto',
                    marginTop: '4px'
                  }}>
                    {(() => {
                      const suggestions = sasaranList.filter(s => 
                        s.nama.toLowerCase().includes(searchText.toLowerCase()) || 
                        (s.nik && s.nik.includes(searchText))
                      );
                      if (suggestions.length === 0) {
                        return <div style={{ padding: '10px 14px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Tidak ditemukan hasil</div>;
                      }
                      return suggestions.map(s => (
                        <div 
                          key={s.id} 
                          onClick={() => handleSelectSasaran(s)}
                          style={{
                            padding: '10px 14px',
                            cursor: 'pointer',
                            borderBottom: '1px solid rgba(0,0,0,0.05)',
                            fontSize: '0.85rem',
                            display: 'block',
                            textAlign: 'left'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(91,79,207,0.08)'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                          <strong>{s.nama}</strong> <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>({s.kategori === 'balita' ? 'Balita' : s.kategori === 'ibu_hamil' ? 'Ibu Hamil' : 'Lansia'})</span>
                          <br/>
                          <small style={{ color: 'var(--text-muted)' }}>NIK: {s.nik || '-'} | Lahir: {s.tglLahir.split('T')[0]}</small>
                        </div>
                      ));
                    })()}
                  </div>
                )}
              </div>
              <div className="form-group">
                <label>Tanggal Pemeriksaan <span className="req">*</span></label>
                <input type="date" id="pel-tanggal" value={formData.tanggal} onChange={handleChange} required />
              </div>
            </div>

            {selectedSasaran && (
              <div id="pel-profile" style={{ marginBottom: '18px' }}>
                <div style={{ background: 'var(--bg-input)', borderRadius: 'var(--radius-md)', padding: '14px' }}>
                  <div className="profile-card" style={{ gap: '14px', display: 'flex', alignItems: 'center' }}>
                    <div style={{fontSize: '2rem', color: 'var(--primary)', opacity: '0.8'}}>
                      <i className={selectedSasaran.kategori === 'balita' ? 'fas fa-child' : selectedSasaran.kategori === 'ibu_hamil' ? 'fas fa-female' : 'fas fa-blind'}></i>
                    </div>
                    <div>
                      <h4 style={{margin: 0, fontSize: '1.1rem'}}>{selectedSasaran.nama}</h4>
                      <p style={{margin: '4px 0 0 0', fontSize: '0.9rem', color: 'var(--text-secondary)'}}>
                        Kategori: {selectedSasaran.kategori} | NIK: {selectedSasaran.nik || '-'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {selectedSasaran?.kategori === 'balita' && (
              <div id="pel-form-balita">
                <div className="form-grid-3">
                  <div className="form-group"><label>Berat Badan (Kg) <span className="req">*</span></label><input type="number" step="0.1" id="pel-bb" value={formData.bb} onChange={handleChange} placeholder="e.g. 12.5" required /></div>
                  <div className="form-group"><label>Tinggi Badan (Cm) <span className="req">*</span></label><input type="number" step="0.1" id="pel-tb" value={formData.tb} onChange={handleChange} placeholder="e.g. 85" required /></div>
                  <div className="form-group"><label>Lingkar Kepala (Cm)</label><input type="number" step="0.1" id="pel-lk" value={formData.lk} onChange={handleChange} placeholder="e.g. 46" /></div>
                  <div className="form-group"><label>LILA (Cm)</label><input type="number" step="0.1" id="pel-lila" value={formData.lila} onChange={handleChange} placeholder="e.g. 15" /></div>
                  <div className="form-group">
                    <label>Imunisasi Diberikan</label>
                    <select id="pel-imunisasi" value={formData.imunisasi} onChange={handleChange}>
                      <option value="">Tidak Ada</option>
                      <option value="HB-0">HB-0 (Lahir)</option>
                      <option value="BCG">BCG (1 bln)</option>
                      <option value="Polio-1">Polio-1</option>
                      <option value="DPT-HB-Hib-1">DPT-HB-Hib-1 (2 bln)</option>
                      <option value="Polio-2">Polio-2</option>
                      <option value="DPT-HB-Hib-2">DPT-HB-Hib-2 (3 bln)</option>
                      <option value="Polio-3">Polio-3</option>
                      <option value="DPT-HB-Hib-3">DPT-HB-Hib-3 (4 bln)</option>
                      <option value="Polio-4">Polio-4</option>
                      <option value="IPV">IPV (4 bln)</option>
                      <option value="Campak-Rubella-1">Campak/MR-1 (9 bln)</option>
                      <option value="DPT-HB-Hib-Booster">DPT Booster (18 bln)</option>
                      <option value="Campak-Rubella-2">Campak/MR-2 (18 bln)</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Vitamin A</label>
                    <select id="pel-vitamin" value={formData.vitamin} onChange={handleChange}>
                      <option value="">Tidak</option>
                      <option value="Biru">Ya — Biru (6-11 bln)</option>
                      <option value="Merah">Ya — Merah (12-59 bln)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {selectedSasaran?.kategori === 'ibu_hamil' && (
              <div id="pel-form-bumil">
                <div className="form-grid-3">
                  <div className="form-group"><label>Berat Badan (Kg) <span className="req">*</span></label><input type="number" step="0.1" id="pel-bb-bumil" value={formData.bbBumil} onChange={handleChange} required /></div>
                  <div className="form-group"><label>Tekanan Darah (mmHg)</label><input type="text" id="pel-td" value={formData.td} onChange={handleChange} placeholder="120/80" /></div>
                  <div className="form-group"><label>Tinggi Fundus (Cm)</label><input type="number" step="0.1" id="pel-fundus" value={formData.fundus} onChange={handleChange} /></div>
                  <div className="form-group"><label>LILA (Cm) <span className="req">*</span></label><input type="number" step="0.1" id="pel-lila-bumil" value={formData.lilaBumil} onChange={handleChange} required /></div>
                  <div className="form-group"><label>DJJ (x/menit)</label><input type="number" id="pel-djj" value={formData.djj} onChange={handleChange} /></div>
                  <div className="form-group"><label>Tablet Fe</label><select id="pel-fe" value={formData.fe} onChange={handleChange}><option value="">Tidak</option><option value="Ya">Ya</option></select></div>
                </div>
              </div>
            )}

            {selectedSasaran?.kategori === 'lansia' && (
              <div id="pel-form-lansia">
                <div className="form-grid-3">
                  <div className="form-group"><label>Berat Badan (Kg)</label><input type="number" step="0.1" id="pel-bb-lansia" value={formData.bbLansia} onChange={handleChange} /></div>
                  <div className="form-group"><label>Tekanan Darah</label><input type="text" id="pel-td-lansia" value={formData.tdLansia} onChange={handleChange} placeholder="130/85" /></div>
                  <div className="form-group"><label>Gula Darah (mg/dL)</label><input type="number" id="pel-gula" value={formData.gula} onChange={handleChange} /></div>
                  <div className="form-group"><label>Kolesterol (mg/dL)</label><input type="number" id="pel-kolesterol" value={formData.kolesterol} onChange={handleChange} /></div>
                  <div className="form-group"><label>Asam Urat (mg/dL)</label><input type="number" step="0.1" id="pel-asam-urat" value={formData.asamUrat} onChange={handleChange} /></div>
                </div>
              </div>
            )}

            <div className="form-group" style={{ marginTop: '14px' }}>
              <label>Keluhan Utama</label>
              <input type="text" id="pel-keluhan" value={formData.keluhan} onChange={handleChange} placeholder="Keluhan yang dirasakan..." />
            </div>

            <div className="form-group" style={{ marginTop: '14px' }}>
              <label>Catatan Kader / Petugas</label>
              <textarea id="pel-catatan" value={formData.catatan} onChange={handleChange} placeholder="Catatan tambahan..."></textarea>
            </div>

            <div className="btn-group">
              <button className="btn btn-success" type="submit" disabled={!selectedSasaran}>
                <i className="fas fa-check-circle"></i> Simpan Pemeriksaan
              </button>
            </div>
          </form>
        </div>
      </section>
    </>
  );
}
