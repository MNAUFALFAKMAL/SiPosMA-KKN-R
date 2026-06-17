import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import 'dotenv/config';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Mereset database...");
  await prisma.pemeriksaan.deleteMany({});
  await prisma.sasaran.deleteMany({});
  await prisma.user.deleteMany({});

  console.log("Membuat User Admin & Kader...");
  await prisma.user.createMany({
    data: [
      { name: 'Super Admin', email: 'admin@siposma.com', password: 'hashedpassword', role: 'ADMIN' },
      { name: 'Kader Posyandu', email: 'kader@siposma.com', password: 'hashedpassword', role: 'KADER' }
    ]
  });

  /*
  console.log("Memasukkan data Sasaran...");
  
  // BALITA
  const balitaData = [
    { nama: 'Aditya Putra Utama', namaIbu: 'Ani Nursanti', tglLahir: new Date('2021-10-15'), jk: 'L', alamat: 'Joho RT 1 RW 3' },
    { nama: 'Davin Muflih', namaIbu: 'Catur Wulandari', tglLahir: new Date('2023-06-03'), jk: 'L', alamat: 'Joho RT 1 RW 3' },
    { nama: 'Guntur Permana', namaIbu: 'Sekar Ayuningtyas', tglLahir: new Date('2023-01-09'), jk: 'L', alamat: 'Joho RT 2 RW 2' },
    { nama: 'Nasya Nur Fitri', namaIbu: 'Sulistyowati Eka', tglLahir: new Date('2023-04-10'), jk: 'P', alamat: 'Joho RT 1 RW 4' },
    { nama: 'Melinda Safira', namaIbu: 'Kayla Restu', tglLahir: new Date('2023-07-10'), jk: 'P', alamat: 'Joho RT 2 RW 3' },
    { nama: 'Ridwan', namaIbu: 'Wan', tglLahir: new Date('2023-11-22'), jk: 'L', alamat: 'Solo' },
  ];

  const sasaranIds: string[] = [];
  
  for (const b of balitaData) {
    const s = await prisma.sasaran.create({
      data: {
        kategori: 'balita',
        nama: b.nama,
        tglLahir: b.tglLahir,
        jk: b.jk,
        namaIbu: b.namaIbu,
        alamat: b.alamat,
      }
    });
    sasaranIds.push(s.id);
  }

  // IBU HAMIL
  const bumil1 = await prisma.sasaran.create({
    data: {
      kategori: 'ibu_hamil',
      nama: 'Siti Aminah',
      tglLahir: new Date('1995-05-12'),
      jk: 'P',
      usiaHamil: 24,
      alamat: 'Joho RT 3 RW 1'
    }
  });

  const bumil2 = await prisma.sasaran.create({
    data: {
      kategori: 'ibu_hamil',
      nama: 'Rina Kartika',
      tglLahir: new Date('1998-11-20'),
      jk: 'P',
      usiaHamil: 12,
      alamat: 'Joho RT 2 RW 2'
    }
  });

  // LANSIA
  const lansia1 = await prisma.sasaran.create({
    data: {
      kategori: 'lansia',
      nama: 'Kakek Sugiono',
      tglLahir: new Date('1950-01-01'),
      jk: 'L',
      alamat: 'Joho RT 1 RW 1'
    }
  });

  const lansia2 = await prisma.sasaran.create({
    data: {
      kategori: 'lansia',
      nama: 'Nenek Sumiati',
      tglLahir: new Date('1955-08-17'),
      jk: 'P',
      alamat: 'Joho RT 2 RW 1'
    }
  });

  console.log("Memasukkan data Pemeriksaan...");

  // Pemeriksaan Aditya (id_anak 1) - from dbsipograf
  const adityaId = sasaranIds[0];
  const pemeriksaanAditya = [
    { tanggal: new Date('2023-05-17'), bb: 11, tb: 83.2, catatan: 'Asi Eksklusif', statusGizi: 'Normal' },
    { tanggal: new Date('2023-06-17'), bb: 11.4, tb: 84.2, catatan: 'Asi Eksklusif', statusGizi: 'Normal' },
    { tanggal: new Date('2023-07-17'), bb: 12, tb: 85.3, catatan: 'Asi Eksklusif', statusGizi: 'Normal' },
    { tanggal: new Date('2023-08-18'), bb: 12.3, tb: 86, catatan: 'Asi Eksklusif', statusGizi: 'Normal' },
    { tanggal: new Date('2023-09-18'), bb: 12.5, tb: 86.9, catatan: 'Asi Eksklusif', statusGizi: 'Normal' },
    { tanggal: new Date('2023-10-17'), bb: 12.7, tb: 87.8, catatan: 'Asi Eksklusif', statusGizi: 'Normal' },
    // Empty data to trigger validation rule "BB/TB Kosong"
    { tanggal: new Date('2023-11-17'), bb: null, tb: null, catatan: 'Tidak hadir', statusGizi: null }
  ];

  for (const p of pemeriksaanAditya) {
    await prisma.pemeriksaan.create({
      data: {
        sasaranId: adityaId,
        tanggal: p.tanggal,
        bb: p.bb,
        tb: p.tb,
        catatan: p.catatan,
        statusGizi: p.statusGizi
      }
    });
  }

  // Pemeriksaan Bumil
  await prisma.pemeriksaan.create({
    data: {
      sasaranId: bumil1.id,
      tanggal: new Date('2023-10-10'),
      lilaBumil: 22.0, // TRIGGERS KEK (< 23.5)
      td: '110/70',
      catatan: 'Risiko KEK'
    }
  });

  await prisma.pemeriksaan.create({
    data: {
      sasaranId: bumil2.id,
      tanggal: new Date('2023-10-15'),
      lilaBumil: 25.5,
      td: '120/80',
      catatan: 'Normal'
    }
  });

  // Pemeriksaan Lansia
  await prisma.pemeriksaan.create({
    data: {
      sasaranId: lansia1.id,
      tanggal: new Date('2023-10-05'),
      gula: 250, // TRIGGERS GULA TINGGI (> 200)
      kolesterol: 220, // TRIGGERS KOLESTEROL TINGGI (> 200)
      tdLansia: '140/90',
      catatan: 'Diabetes dan Kolesterol'
    }
  });

  await prisma.pemeriksaan.create({
    data: {
      sasaranId: lansia2.id,
      tanggal: new Date('2023-10-06'),
      gula: 110,
      kolesterol: 180,
      tdLansia: '120/80',
      catatan: 'Sehat'
    }
  });
  */

  console.log("Seeding (Data bersih) selesai!");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
