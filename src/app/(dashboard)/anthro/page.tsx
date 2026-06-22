"use client";

import { useState, useMemo } from "react";
import Header from "@/components/layout/Header";
import { getTBUStatus, getBBUStatus, getBBTBStatus, getAgeCategory, Gender } from "@/lib/whoAnthro";

export default function AnthroPage() {
  const [gender, setGender] = useState<Gender>('L');
  const [age, setAge] = useState<number | "">(24);
  const [weight, setWeight] = useState<number | "">(12);
  const [height, setHeight] = useState<number | "">(87);

  const tbStatus = useMemo(() => getTBUStatus(height === "" ? 0 : height, gender, age === "" ? 0 : age), [height, gender, age]);
  const bbStatus = useMemo(() => getBBUStatus(weight === "" ? 0 : weight, gender, age === "" ? 0 : age), [weight, gender, age]);
  const bbtbStatus = useMemo(() => getBBTBStatus(weight === "" ? 0 : weight, height === "" ? 0 : height, gender), [weight, height, gender]);
  const ageCategory = useMemo(() => getAgeCategory(age === "" ? 0 : age), [age]);

  const getStatusColor = (code: string) => {
    switch (code) {
      case 'normal': return '#00b894';
      case 'risk': return '#fdcb6e';
      case 'stunting': return '#e17055';
      case 'severe': return '#d63031';
      default: return '#5b4fcf';
    }
  };

  const getStatusBg = (code: string) => {
    switch (code) {
      case 'normal': return 'rgba(0, 184, 148, 0.1)';
      case 'risk': return 'rgba(253, 203, 110, 0.1)';
      case 'stunting': return 'rgba(225, 112, 85, 0.1)';
      case 'severe': return 'rgba(214, 48, 49, 0.1)';
      default: return 'rgba(91, 79, 207, 0.1)';
    }
  };

  return (
    <>
      <Header title="Kalkulator WHO Anthro" context="Deteksi Dini Stunting Otomatis" />
      <section className="view-section active">
        
        <div className="premium-banner" style={{ background: 'linear-gradient(135deg, rgba(91, 79, 207, 0.05) 0%, rgba(0, 184, 148, 0.05) 100%)', border: '1px solid rgba(0, 184, 148, 0.2)' }}>
          <div className="premium-banner-content">
            <h2 style={{ color: 'var(--text-primary)' }}><i className="fas fa-calculator" style={{ color: 'var(--primary)', marginRight: '10px' }}></i> Kalkulator Antropometri Pintar</h2>
            <p style={{ color: 'var(--text-secondary)' }}>Masukkan data balita untuk melihat perhitungan Z-Score dan status gizi secara real-time berdasarkan standar WHO.</p>
          </div>
        </div>

        <div className="grid-2" style={{ marginTop: '20px' }}>
          
          {/* FORM PANEL */}
          <div className="card-container premium-chart-card">
            <div className="card-header" style={{ marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '15px' }}>
              <h3>Parameter Balita</h3>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              <div style={{ display: 'flex', gap: '15px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: 600 }}>Jenis Kelamin</label>
                  <select 
                    value={gender} 
                    onChange={e => setGender(e.target.value as Gender)}
                    style={{ width: '100%', padding: '12px 15px', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-light)', color: 'var(--text-primary)', outline: 'none', transition: '0.3s' }}
                  >
                    <option value="L">Laki-laki</option>
                    <option value="P">Perempuan</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: 600 }}>Umur (Bulan)</label>
                  <input 
                    type="number" min="0" max="60"
                    value={age} 
                    onChange={e => setAge(e.target.value === "" ? "" : Number(e.target.value))}
                    style={{ width: '100%', padding: '12px 15px', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-light)', color: 'var(--text-primary)', outline: 'none' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '15px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: 600 }}>Berat Badan (kg)</label>
                  <input 
                    type="number" step="0.1" min="1"
                    value={weight} 
                    onChange={e => setWeight(e.target.value === "" ? "" : Number(e.target.value))}
                    style={{ width: '100%', padding: '12px 15px', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-light)', color: 'var(--text-primary)', outline: 'none' }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: 600 }}>Tinggi Badan (cm)</label>
                  <input 
                    type="number" step="0.1" min="30"
                    value={height} 
                    onChange={e => setHeight(e.target.value === "" ? "" : Number(e.target.value))}
                    style={{ width: '100%', padding: '12px 15px', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-light)', color: 'var(--text-primary)', outline: 'none' }}
                  />
                </div>
              </div>

            </div>
          </div>

          {/* RESULT PANEL */}
          <div className="card-container premium-chart-card">
            <div className="card-header" style={{ marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <h3 style={{ margin: 0 }}>Hasil Analisis Otomatis</h3>
              <span style={{ background: 'var(--primary)', color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 'bold' }}>
                {ageCategory}
              </span>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* TB/U RESULT */}
              <div style={{ padding: '20px', borderRadius: '12px', background: getStatusBg(tbStatus.categoryCode), border: `1px solid ${getStatusColor(tbStatus.categoryCode)}40`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ color: 'var(--text-primary)', margin: 0, fontSize: '1.1rem' }}>Tinggi Badan menurut Umur (TB/U)</h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '5px' }}>Indikator utama risiko stunting</p>
                  <div style={{ marginTop: '10px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    Nilai Z-Score: <strong style={{ color: 'var(--text-primary)' }}>{tbStatus.zScore > 0 ? `+${tbStatus.zScore}` : tbStatus.zScore} SD</strong>
                  </div>
                </div>
                <div style={{ padding: '10px 20px', borderRadius: '8px', background: getStatusColor(tbStatus.categoryCode), color: 'white', fontWeight: 'bold', fontSize: '1rem', boxShadow: `0 4px 15px ${getStatusColor(tbStatus.categoryCode)}60` }}>
                  {tbStatus.status}
                </div>
              </div>

              {/* BB/U RESULT */}
              <div style={{ padding: '20px', borderRadius: '12px', background: getStatusBg(bbStatus.categoryCode), border: `1px solid ${getStatusColor(bbStatus.categoryCode)}40`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ color: 'var(--text-primary)', margin: 0, fontSize: '1.1rem' }}>Berat Badan menurut Umur (BB/U)</h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '5px' }}>Indikator status gizi (berat badan)</p>
                  <div style={{ marginTop: '10px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    Nilai Z-Score: <strong style={{ color: 'var(--text-primary)' }}>{bbStatus.zScore > 0 ? `+${bbStatus.zScore}` : bbStatus.zScore} SD</strong>
                  </div>
                </div>
                <div style={{ padding: '10px 20px', borderRadius: '8px', background: getStatusColor(bbStatus.categoryCode), color: 'white', fontWeight: 'bold', fontSize: '1rem', boxShadow: `0 4px 15px ${getStatusColor(bbStatus.categoryCode)}60` }}>
                  {bbStatus.status}
                </div>
              </div>

              {/* BB/TB RESULT */}
              <div style={{ padding: '20px', borderRadius: '12px', background: getStatusBg(bbtbStatus.categoryCode), border: `1px solid ${getStatusColor(bbtbStatus.categoryCode)}40`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ color: 'var(--text-primary)', margin: 0, fontSize: '1.1rem' }}>Berat Badan menurut Tinggi Badan (BB/TB)</h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '5px' }}>Indikator keidealan tubuh (wasting/obesitas)</p>
                  <div style={{ marginTop: '10px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    Nilai Z-Score: <strong style={{ color: 'var(--text-primary)' }}>{bbtbStatus.zScore > 0 ? `+${bbtbStatus.zScore}` : bbtbStatus.zScore} SD</strong>
                  </div>
                </div>
                <div style={{ padding: '10px 20px', borderRadius: '8px', background: getStatusColor(bbtbStatus.categoryCode), color: 'white', fontWeight: 'bold', fontSize: '1rem', boxShadow: `0 4px 15px ${getStatusColor(bbtbStatus.categoryCode)}60` }}>
                  {bbtbStatus.status}
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>
    </>
  );
}
