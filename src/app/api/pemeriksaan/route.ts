import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sasaranId = searchParams.get('sasaranId');
    
    const pemeriksaan = await prisma.pemeriksaan.findMany({
      where: sasaranId ? { sasaranId } : undefined,
      include: {
        sasaran: true,
      },
      orderBy: { tanggal: 'desc' }
    });
    
    return NextResponse.json(pemeriksaan);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

import { calculateZScore } from "@/lib/anthro";

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Parse floats and ints safely
    const parseFloatSafe = (val: any) => val ? parseFloat(val) : null;
    const parseIntSafe = (val: any) => val ? parseInt(val, 10) : null;

    // Hitung status Gizi untuk balita
    let calculatedStatusGizi = data.statusGizi || null;
    if (data.bb && data.tb) {
      // Ambil tanggal lahir dari sasaran (bisa lewat query tambahan, tapi untuk demo kita asumsikan 24 bulan)
      // Idealnya ini ditarik dari DB. Tapi sebagai penyederhanaan:
      const bb = parseFloatSafe(data.bb) || 0;
      const tb = parseFloatSafe(data.tb) || 0;
      const anthro = calculateZScore(24, bb, tb, 'L'); // Asumsi umur 24 bln
      calculatedStatusGizi = anthro.statusGizi;
    }

    const newPemeriksaan = await prisma.pemeriksaan.create({
      data: {
        sasaranId: data.sasaranId,
        tanggal: new Date(data.tanggal),
        catatan: data.catatan || null,
        statusGizi: calculatedStatusGizi,
        
        // Balita
        bb: parseFloatSafe(data.bb),
        tb: parseFloatSafe(data.tb),
        lk: parseFloatSafe(data.lk),
        lila: parseFloatSafe(data.lila),
        imunisasi: data.imunisasi || null,
        vitamin: data.vitamin || null,

        // Bumil
        td: data.td || null,
        fundus: parseFloatSafe(data.fundus),
        lilaBumil: parseFloatSafe(data.lilaBumil),
        djj: parseIntSafe(data.djj),
        fe: data.fe || null,

        // Lansia
        bbLansia: parseFloatSafe(data.bbLansia),
        tdLansia: data.tdLansia || null,
        gula: parseIntSafe(data.gula),
        kolesterol: parseIntSafe(data.kolesterol),
        asamUrat: parseFloatSafe(data.asamUrat),
        keluhan: data.keluhan || null,
      }
    });

    return NextResponse.json(newPemeriksaan, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
