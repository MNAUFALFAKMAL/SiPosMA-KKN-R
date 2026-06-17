import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({ url: "file:./dev.db" });
const prisma = new PrismaClient({ adapter });

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const kategori = searchParams.get('kategori');
    
    const sasaran = await prisma.sasaran.findMany({
      where: kategori ? { kategori } : undefined,
      orderBy: { createdAt: 'desc' }
    });
    
    return NextResponse.json(sasaran);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Convert dates if provided as strings
    if (data.tglLahir) {
      data.tglLahir = new Date(data.tglLahir);
    }
    if (data.hpht) {
      data.hpht = new Date(data.hpht);
    }
    if (data.usiaHamil) {
      data.usiaHamil = parseInt(data.usiaHamil, 10);
    }

    const newSasaran = await prisma.sasaran.create({
      data: {
        kategori: data.kategori,
        nama: data.nama,
        nik: data.nik || null,
        tglLahir: data.tglLahir,
        jk: data.jk || null,
        namaIbu: data.namaIbu || null,
        hp: data.hp || null,
        alamat: data.alamat || null,
        catatan: data.catatan || null,
        usiaHamil: data.usiaHamil || null,
        hpht: data.hpht || null,
      }
    });

    return NextResponse.json(newSasaran, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const data = await request.json();
    const { id, ...updateData } = data;
    
    let tglLahir = undefined;
    if (updateData.tglLahir) {
      tglLahir = new Date(updateData.tglLahir);
    }
    let hpht = null;
    if (updateData.hpht) {
      hpht = new Date(updateData.hpht);
    }
    let usiaHamil = null;
    if (updateData.usiaHamil) {
      usiaHamil = parseInt(updateData.usiaHamil, 10);
    }

    const updatedSasaran = await prisma.sasaran.update({
      where: { id },
      data: {
        kategori: updateData.kategori,
        nama: updateData.nama,
        nik: updateData.nik || null,
        tglLahir: tglLahir,
        jk: updateData.jk || null,
        namaIbu: updateData.namaIbu || null,
        hp: updateData.hp || null,
        alamat: updateData.alamat || null,
        catatan: updateData.catatan || null,
        usiaHamil: usiaHamil,
        hpht: hpht,
      }
    });

    return NextResponse.json(updatedSasaran);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: "Missing id parameter" }, { status: 400 });
    }
    await prisma.sasaran.delete({
      where: { id }
    });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
