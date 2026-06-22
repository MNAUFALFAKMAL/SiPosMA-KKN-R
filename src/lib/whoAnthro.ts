export type Gender = 'L' | 'P';

// Simple Linear Interpolation for WHO M (Median) values
// Data points at 0, 6, 12, 18, 24, 30, 36, 42, 48, 54, 60 months
const WHO_M_DATA = {
  L: {
    height: [50.5, 67.6, 75.7, 82.3, 87.8, 91.9, 96.1, 99.9, 103.3, 106.7, 110.0],
    weight: [3.3, 7.9, 9.6, 10.9, 12.2, 13.3, 14.3, 15.3, 16.3, 17.3, 18.3]
  },
  P: {
    height: [49.1, 65.7, 74.0, 80.7, 86.4, 90.7, 95.1, 99.0, 102.7, 106.2, 109.4],
    weight: [3.2, 7.3, 8.9, 10.2, 11.5, 12.7, 13.9, 15.0, 16.1, 17.2, 18.2]
  }
};

// Height-Weight lookup for BB/TB median approximation
const BB_TB_HEIGHTS = [50, 60, 70, 80, 90, 100, 110, 120];
const BB_TB_M_L = [3.3, 5.8, 8.4, 10.8, 12.9, 15.5, 18.5, 22.0];
const BB_TB_M_P = [3.2, 5.4, 7.8, 10.2, 12.4, 15.0, 18.0, 21.5];

const S_HEIGHT = 0.04; // ~4% variance
const S_WEIGHT = 0.12; // ~12% variance
const S_W_H = 0.10;    // ~10% variance for Weight-for-Height

export function interpolateMedian(gender: Gender, ageInMonths: number, type: 'height' | 'weight'): number {
  if (ageInMonths <= 0) return WHO_M_DATA[gender][type][0];
  if (ageInMonths >= 60) return WHO_M_DATA[gender][type][10];
  
  const index = Math.floor(ageInMonths / 6);
  const remainder = ageInMonths % 6;
  
  const startVal = WHO_M_DATA[gender][type][index];
  const endVal = WHO_M_DATA[gender][type][index + 1];
  
  return startVal + ((endVal - startVal) * (remainder / 6));
}

export function interpolateBBTBMedian(gender: Gender, heightCm: number): number {
  const heights = BB_TB_HEIGHTS;
  const medians = gender === 'L' ? BB_TB_M_L : BB_TB_M_P;

  if (heightCm <= heights[0]) return medians[0];
  if (heightCm >= heights[heights.length - 1]) return medians[medians.length - 1];

  for (let i = 0; i < heights.length - 1; i++) {
    if (heightCm >= heights[i] && heightCm <= heights[i + 1]) {
      const startH = heights[i];
      const endH = heights[i + 1];
      const startW = medians[i];
      const endW = medians[i + 1];
      const pct = (heightCm - startH) / (endH - startH);
      return startW + (endW - startW) * pct;
    }
  }
  return medians[4];
}

export function calculateZScore(value: number, median: number, s: number): number {
  return (value / median - 1) / s;
}

export interface AnthroResult {
  zScore: number;
  status: string;
  categoryCode: 'normal' | 'risk' | 'stunting' | 'severe';
}

// 1. Kategori Berdasarkan Rentang Usia
export function getAgeCategory(ageInMonths: number): string {
  // We can provide descriptions for all matches
  const categories: string[] = [];
  
  // Neonatus: 0 s/d 28 hari (approximated as 0 months)
  if (ageInMonths === 0) {
    categories.push("Neonatus (0 - 28 Hari)");
  }
  // Bayi: 29 hari s/d 11 bulan (approximated as 1 - 11 months, or 0 if user considers < 28 days separately)
  if (ageInMonths >= 0 && ageInMonths <= 11) {
    categories.push("Bayi (29 Hari - 11 Bulan)");
  }
  // Baduta: 0 s/d 23 bulan
  if (ageInMonths >= 0 && ageInMonths <= 23) {
    categories.push("Baduta (Bawah Dua Tahun)");
  }
  // Balita: 0 s/d 59 bulan
  if (ageInMonths >= 0 && ageInMonths <= 59) {
    categories.push("Balita (Bawah Lima Tahun)");
  }

  return categories.join(" & ") || "Anak-anak (> 5 Tahun)";
}

// 2. A. Kategori Berat Badan (BB menurut Umur)
export function getBBUStatus(weight: number, gender: Gender, ageInMonths: number): AnthroResult {
  const median = interpolateMedian(gender, ageInMonths, 'weight');
  const zScore = calculateZScore(weight, median, S_WEIGHT);
  
  let status = "Berat Badan Normal";
  let categoryCode: 'normal' | 'risk' | 'stunting' | 'severe' = 'normal';
  
  if (zScore < -3) {
    status = "Berat Badan Sangat Kurang (Severely Underweight)";
    categoryCode = 'severe';
  } else if (zScore < -2) {
    status = "Berat Badan Kurang (Underweight)";
    categoryCode = 'stunting';
  } else if (zScore > 1) {
    status = "Risiko Berat Badan Lebih";
    categoryCode = 'risk';
  }
  
  return { zScore: parseFloat(zScore.toFixed(2)), status, categoryCode };
}

// 2. B. Kategori Tinggi Badan (TB menurut Umur)
export function getTBUStatus(height: number, gender: Gender, ageInMonths: number): AnthroResult {
  const median = interpolateMedian(gender, ageInMonths, 'height');
  const zScore = calculateZScore(height, median, S_HEIGHT);
  
  let status = "Normal";
  let categoryCode: 'normal' | 'risk' | 'stunting' | 'severe' = 'normal';
  
  if (zScore < -3) {
    status = "Sangat Pendek (Severely Stunted)";
    categoryCode = 'severe';
  } else if (zScore < -2) {
    status = "Pendek (Stunted)";
    categoryCode = 'stunting';
  } else if (zScore > 3) {
    status = "Tinggi";
    categoryCode = 'risk'; // High Z-Score representation
  }
  
  return { zScore: parseFloat(zScore.toFixed(2)), status, categoryCode };
}

// 2. C. Kategori Keidealan Tubuh (BB menurut Tinggi Badan)
export function getBBTBStatus(weight: number, heightCm: number, gender: Gender): AnthroResult {
  const median = interpolateBBTBMedian(gender, heightCm);
  const zScore = calculateZScore(weight, median, S_W_H);

  let status = "Gizi Baik (Normal)";
  let categoryCode: 'normal' | 'risk' | 'stunting' | 'severe' = 'normal';

  if (zScore < -3) {
    status = "Gizi Buruk (Severely Wasted)";
    categoryCode = 'severe';
  } else if (zScore < -2) {
    status = "Gizi Kurang (Wasted)";
    categoryCode = 'stunting';
  } else if (zScore > 3) {
    status = "Obesitas (Obese)";
    categoryCode = 'severe';
  } else if (zScore > 2) {
    status = "Gizi Lebih (Overweight)";
    categoryCode = 'stunting';
  } else if (zScore > 1) {
    status = "Berisiko Gizi Lebih";
    categoryCode = 'risk';
  }

  return { zScore: parseFloat(zScore.toFixed(2)), status, categoryCode };
}
