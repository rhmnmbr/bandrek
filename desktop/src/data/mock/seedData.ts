// Bandrek — Ported seed data from docs/prototype/seed.js
// 80 siswa, 12 subjek, 8 kelas, 6 mapel, 48 materi, 3 tempat, 9 ruangan, 5 jenis, 64 ceklis manual, 133 kegiatan.
import type {
  Siswa,
  Subjek,
  Kelas,
  MataPelajaran,
  Materi,
  Tempat,
  Ruangan,
  JenisKegiatan,
} from '../types/master';
import type { CeklisManual } from '../types/matriks';
import type { RawStatusKegiatan } from '../types/kegiatan';
import type { Realisasi } from '../types/realisasi';

export interface RawKegiatanSeed {
  id: string;
  nama: string;
  jenis: string;
  mapel: string | null;
  materi: string | null;
  kelas: string | null;
  tanggal: string;
  mulai: string;
  selesai: string;
  sepanjangHari?: boolean;
  ruangan: string;
  tempatCustom?: string | null;
  subjek: Array<{ id: string; peran: any }>;
  siswa: string[];
  catatan: string;
  status: RawStatusKegiatan;
  realisasi: Realisasi | null;
  pembatalan?: {
    alasan: string;
    keterangan: string;
    pada: string;
  } | null;
  penjadwalanUlang?: {
    alasan: string;
    keterangan: string;
    pada: string;
  } | null;
  jadwalUlangDari?: string | null;
  jadwalUlangKe?: string | null;
}

export interface SeedData {
  today: string;
  now: string;
  siswa: Siswa[];
  subjek: Subjek[];
  kelas: Kelas[];
  mapel: MataPelajaran[];
  materi: Materi[];
  tempat: Tempat[];
  ruangan: Ruangan[];
  jenis: JenisKegiatan[];
  alasanBatal: string[];
  alasanJadwalUlang: string[];
  ceklisManual: CeklisManual[];
  kegiatan: RawKegiatanSeed[];
}

export const INITIAL_SEED: SeedData = {
  "today": "2026-09-16",
  "now": "11:39",
  "siswa": [
    {
      "id": "S1",
      "nama": "Cahya Dwi Puspitasari",
      "jenjang": "SD",
      "aktif": true,
      "lahir": "2015-09-26",
      "kelamin": "L",
      "asal": "SD Muhammadiyah 4",
      "waliNama": "Ibu Yuni",
      "waliWa": "0829-xxxx-1958",
      "bergabung": "2026-04-02",
      "catatan": ""
    },
    {
      "id": "S2",
      "nama": "Jihan Maulana Ramadhan",
      "jenjang": "SD",
      "aktif": false,
      "lahir": "2015-01-05",
      "kelamin": "P",
      "asal": "SD Muhammadiyah 4",
      "waliNama": "Ibu Tuti",
      "waliWa": "0835-xxxx-8489",
      "bergabung": "2026-01-04",
      "catatan": ""
    },
    {
      "id": "S3",
      "nama": "Putra Tri Utami",
      "jenjang": "SMP",
      "aktif": true,
      "lahir": "2013-10-21",
      "kelamin": "P",
      "asal": "",
      "waliNama": "Ibu Nurhayati",
      "waliWa": "0824-xxxx-9122",
      "bergabung": "2026-01-19",
      "catatan": ""
    },
    {
      "id": "S4",
      "nama": "Nadia Dwi Kurnia",
      "jenjang": "SMP",
      "aktif": true,
      "lahir": "2011-08-12",
      "kelamin": "L",
      "asal": "SMPN 27 Bandung",
      "waliNama": "Ibu Wati",
      "waliWa": "0840-xxxx-7058",
      "bergabung": "2026-03-14",
      "catatan": ""
    },
    {
      "id": "S5",
      "nama": "Naufal Bagus Utami",
      "jenjang": "SMA",
      "aktif": true,
      "lahir": "2009-12-04",
      "kelamin": "L",
      "asal": "SMAN 8 Bandung",
      "waliNama": "Bapak Dedi",
      "waliWa": "0837-xxxx-1163",
      "bergabung": "2025-08-02",
      "catatan": ""
    },
    {
      "id": "S6",
      "nama": "Galuh Kusuma Wulandari",
      "jenjang": "SD",
      "aktif": true,
      "lahir": "2017-08-19",
      "kelamin": "L",
      "asal": "SD Muhammadiyah 4",
      "waliNama": "Ibu Dina",
      "waliWa": "0866-xxxx-4327",
      "bergabung": "2026-02-28",
      "catatan": ""
    },
    {
      "id": "S7",
      "nama": "Jasmine Saputra",
      "jenjang": "SMP",
      "aktif": true,
      "lahir": "2012-06-23",
      "kelamin": "L",
      "asal": "SMPN 9 Bandung",
      "waliNama": "Bapak Rudi",
      "waliWa": "0816-xxxx-3286",
      "bergabung": "2026-01-26",
      "catatan": ""
    },
    {
      "id": "S8",
      "nama": "Salsabila Pratama Rahmawati",
      "jenjang": "SMP",
      "aktif": false,
      "lahir": "2013-12-03",
      "kelamin": "P",
      "asal": "SMPN 14 Bandung",
      "waliNama": "Ibu Wati",
      "waliWa": "0872-xxxx-3248",
      "bergabung": "2026-05-09",
      "catatan": ""
    },
    {
      "id": "S9",
      "nama": "Maharani Kusuma Situmorang",
      "jenjang": "SMA",
      "aktif": false,
      "lahir": "2010-06-17",
      "kelamin": "P",
      "asal": "",
      "waliNama": "Bapak Herman",
      "waliWa": "0869-xxxx-8683",
      "bergabung": "2025-08-28",
      "catatan": ""
    },
    {
      "id": "S10",
      "nama": "Fajar Pratama Kusumaningtyas",
      "jenjang": "SMA",
      "aktif": true,
      "lahir": "2008-07-07",
      "kelamin": "L",
      "asal": "SMA Pasundan 2",
      "waliNama": "Ibu Lastri",
      "waliWa": "0811-xxxx-3209",
      "bergabung": "2025-04-15",
      "catatan": ""
    },
    {
      "id": "S11",
      "nama": "Jasmine Kusuma Ramadhan",
      "jenjang": "SD",
      "aktif": true,
      "lahir": "2017-09-11",
      "kelamin": "P",
      "asal": "SDN Merdeka 5",
      "waliNama": "Ibu Sri",
      "waliWa": "0866-xxxx-9709",
      "bergabung": "2026-05-24",
      "catatan": ""
    },
    {
      "id": "S12",
      "nama": "Dewi Syahputra Dharmawangsa",
      "jenjang": "SMP",
      "aktif": true,
      "lahir": "2011-03-19",
      "kelamin": "P",
      "asal": "SMP Al-Falah",
      "waliNama": "Ibu Ratna",
      "waliWa": "0831-xxxx-3335",
      "bergabung": "2026-07-24",
      "catatan": ""
    },
    {
      "id": "S13",
      "nama": "Mega Kusuma Ramadhan",
      "jenjang": "SD",
      "aktif": false,
      "lahir": "2016-08-01",
      "kelamin": "L",
      "asal": "SD Kristen Bina Bakti",
      "waliNama": "Bapak Rudi",
      "waliWa": "0829-xxxx-4017",
      "bergabung": "2026-01-24",
      "catatan": ""
    },
    {
      "id": "S14",
      "nama": "Andreas Parlindungan Simanjuntak",
      "jenjang": "SMP",
      "aktif": true,
      "lahir": "2013-04-04",
      "kelamin": "P",
      "asal": "SMPN 2 Cimahi",
      "waliNama": "Bapak Dedi",
      "waliWa": "0858-xxxx-6175",
      "bergabung": "2026-06-05",
      "catatan": ""
    },
    {
      "id": "S15",
      "nama": "Galuh Wibowo",
      "jenjang": "SMP",
      "aktif": false,
      "lahir": "2012-04-05",
      "kelamin": "L",
      "asal": "SMP Al-Falah",
      "waliNama": "Bapak Bambang",
      "waliWa": "0825-xxxx-1695",
      "bergabung": "2026-01-08",
      "catatan": ""
    },
    {
      "id": "S16",
      "nama": "Galuh Nugroho Hutagalung",
      "jenjang": "SMP",
      "aktif": true,
      "lahir": "2013-01-04",
      "kelamin": "L",
      "asal": "",
      "waliNama": "Ibu Sri",
      "waliWa": "0846-xxxx-1987",
      "bergabung": "2026-03-27",
      "catatan": ""
    },
    {
      "id": "S17",
      "nama": "Jihan Putri Nugroho",
      "jenjang": "SMA",
      "aktif": true,
      "lahir": "2009-01-27",
      "kelamin": "P",
      "asal": "SMAN 20 Bandung",
      "waliNama": "Bapak Hadi",
      "waliWa": "0837-xxxx-8032",
      "bergabung": "2025-04-07",
      "catatan": ""
    },
    {
      "id": "S18",
      "nama": "Utami Syahputra Firdaus",
      "jenjang": "SD",
      "aktif": true,
      "lahir": "2014-05-23",
      "kelamin": "P",
      "asal": "SDN Pasirkaliki 3",
      "waliNama": "Bapak Herman",
      "waliWa": "0878-xxxx-5659",
      "bergabung": "2026-08-19",
      "catatan": ""
    },
    {
      "id": "S19",
      "nama": "Kartika Syahputra Nainggolan",
      "jenjang": "SMP",
      "aktif": true,
      "lahir": "2011-12-03",
      "kelamin": "P",
      "asal": "SMPN 27 Bandung",
      "waliNama": "Ibu Siska",
      "waliWa": "0866-xxxx-3245",
      "bergabung": "2026-04-15",
      "catatan": ""
    },
    {
      "id": "S20",
      "nama": "Nabila Syifa Ramadhani Hutagalung",
      "jenjang": "SD",
      "aktif": true,
      "lahir": "2017-10-16",
      "kelamin": "P",
      "asal": "",
      "waliNama": "Bapak Slamet",
      "waliWa": "0827-xxxx-1045",
      "bergabung": "2026-02-17",
      "catatan": ""
    },
    {
      "id": "S21",
      "nama": "Arif Putri Nugroho",
      "jenjang": "SMA",
      "aktif": true,
      "lahir": "2008-03-05",
      "kelamin": "L",
      "asal": "",
      "waliNama": "Bapak Dedi",
      "waliWa": "0877-xxxx-3140",
      "bergabung": "2025-03-05",
      "catatan": ""
    },
    {
      "id": "S22",
      "nama": "Gilang Nugroho Wulandari",
      "jenjang": "SMA",
      "aktif": false,
      "lahir": "2010-07-14",
      "kelamin": "P",
      "asal": "",
      "waliNama": "Ibu Ratna",
      "waliWa": "0853-xxxx-3126",
      "bergabung": "2025-01-10",
      "catatan": ""
    },
    {
      "id": "S23",
      "nama": "Gilang Pratama",
      "jenjang": "SMP",
      "aktif": true,
      "lahir": "2011-01-12",
      "kelamin": "P",
      "asal": "SMPN 2 Cimahi",
      "waliNama": "Ibu Dina",
      "waliWa": "0867-xxxx-3715",
      "bergabung": "2026-08-16",
      "catatan": ""
    },
    {
      "id": "S24",
      "nama": "Teguh Kusuma Rahmawati",
      "jenjang": "SMP",
      "aktif": false,
      "lahir": "2011-04-07",
      "kelamin": "L",
      "asal": "SMPN 2 Cimahi",
      "waliNama": "Ibu Nurhayati",
      "waliWa": "0827-xxxx-3748",
      "bergabung": "2026-02-14",
      "catatan": ""
    },
    {
      "id": "S25",
      "nama": "Jihan Salsabila",
      "jenjang": "SMA",
      "aktif": true,
      "lahir": "2008-08-25",
      "kelamin": "L",
      "asal": "SMAN 20 Bandung",
      "waliNama": "Ibu Siska",
      "waliWa": "0834-xxxx-4505",
      "bergabung": "2025-06-13",
      "catatan": ""
    },
    {
      "id": "S26",
      "nama": "Putra Wulandari",
      "jenjang": "SD",
      "aktif": true,
      "lahir": "2015-08-17",
      "kelamin": "P",
      "asal": "SD Muhammadiyah 4",
      "waliNama": "Bapak Slamet",
      "waliWa": "0839-xxxx-6839",
      "bergabung": "2026-02-08",
      "catatan": ""
    },
    {
      "id": "S27",
      "nama": "Farhan Nur Utami",
      "jenjang": "SMA",
      "aktif": false,
      "lahir": "2010-04-09",
      "kelamin": "P",
      "asal": "SMA Santa Angela",
      "waliNama": "Bapak Joko",
      "waliWa": "0874-xxxx-3432",
      "bergabung": "2025-08-21",
      "catatan": ""
    },
    {
      "id": "S28",
      "nama": "Gilang Bagus Anggraini",
      "jenjang": "SMP",
      "aktif": true,
      "lahir": "2012-08-08",
      "kelamin": "L",
      "asal": "SMP Taruna Bakti",
      "waliNama": "Ibu Ratna",
      "waliWa": "0837-xxxx-5059",
      "bergabung": "2026-06-28",
      "catatan": ""
    },
    {
      "id": "S29",
      "nama": "Arif Nainggolan",
      "jenjang": "SD",
      "aktif": true,
      "lahir": "2017-02-06",
      "kelamin": "P",
      "asal": "SDN Cibeunying 2",
      "waliNama": "Ibu Endang",
      "waliWa": "0856-xxxx-6086",
      "bergabung": "2026-04-07",
      "catatan": ""
    },
    {
      "id": "S30",
      "nama": "Aisyah Pratama Salsabila",
      "jenjang": "SMP",
      "aktif": true,
      "lahir": "2013-02-12",
      "kelamin": "L",
      "asal": "SMPN 9 Bandung",
      "waliNama": "Bapak Rudi",
      "waliWa": "0875-xxxx-9266",
      "bergabung": "2026-01-28",
      "catatan": ""
    },
    {
      "id": "S31",
      "nama": "Aisyah Wicaksono",
      "jenjang": "SD",
      "aktif": true,
      "lahir": "2017-05-04",
      "kelamin": "L",
      "asal": "SD Islam Al-Hikmah",
      "waliNama": "Bapak Slamet",
      "waliWa": "0834-xxxx-5442",
      "bergabung": "2026-07-11",
      "catatan": ""
    },
    {
      "id": "S32",
      "nama": "Gusti Ayu Made Puspitaningrum",
      "jenjang": "SD",
      "aktif": true,
      "lahir": "2016-04-14",
      "kelamin": "P",
      "asal": "SDN Sukajadi 1",
      "waliNama": "Ibu Dina",
      "waliWa": "0844-xxxx-5835",
      "bergabung": "2026-04-09",
      "catatan": ""
    },
    {
      "id": "S33",
      "nama": "Bagas Rizki Nugroho",
      "jenjang": "SMP",
      "aktif": true,
      "lahir": "2011-12-06",
      "kelamin": "L",
      "asal": "SMPN 14 Bandung",
      "waliNama": "Bapak Rudi",
      "waliWa": "0812-xxxx-8966",
      "bergabung": "2026-07-07",
      "catatan": ""
    },
    {
      "id": "S34",
      "nama": "Kartika Wibowo",
      "jenjang": "SD",
      "aktif": false,
      "lahir": "2015-02-12",
      "kelamin": "P",
      "asal": "SDN Sukajadi 1",
      "waliNama": "Ibu Yuni",
      "waliWa": "0862-xxxx-8518",
      "bergabung": "2026-05-19",
      "catatan": ""
    },
    {
      "id": "S35",
      "nama": "Oscar Syahputra Situmorang",
      "jenjang": "SD",
      "aktif": true,
      "lahir": "2016-12-08",
      "kelamin": "P",
      "asal": "SDN Sukajadi 1",
      "waliNama": "Ibu Wati",
      "waliWa": "0857-xxxx-9414",
      "bergabung": "2026-06-10",
      "catatan": ""
    },
    {
      "id": "S36",
      "nama": "Fajar Maulana Situmorang",
      "jenjang": "SMP",
      "aktif": true,
      "lahir": "2011-05-05",
      "kelamin": "L",
      "asal": "SMPN 27 Bandung",
      "waliNama": "Bapak Rudi",
      "waliWa": "0825-xxxx-2771",
      "bergabung": "2026-04-27",
      "catatan": ""
    },
    {
      "id": "S37",
      "nama": "Eka Kusuma Kurnia",
      "jenjang": "SD",
      "aktif": true,
      "lahir": "2017-04-13",
      "kelamin": "P",
      "asal": "SDN Sukajadi 1",
      "waliNama": "Ibu Wati",
      "waliWa": "0847-xxxx-7746",
      "bergabung": "2026-06-28",
      "catatan": ""
    },
    {
      "id": "S38",
      "nama": "Siti Nurhaliza Azzahra Putri",
      "jenjang": "SMA",
      "aktif": false,
      "lahir": "2009-02-06",
      "kelamin": "P",
      "asal": "SMAN 3 Bandung",
      "waliNama": "Bapak Dedi",
      "waliWa": "0828-xxxx-9890",
      "bergabung": "2025-03-12",
      "catatan": ""
    },
    {
      "id": "S39",
      "nama": "Olivia Wijaya Simanjuntak",
      "jenjang": "SMP",
      "aktif": true,
      "lahir": "2011-03-20",
      "kelamin": "P",
      "asal": "SMP Al-Falah",
      "waliNama": "Ibu Lastri",
      "waliWa": "0864-xxxx-7949",
      "bergabung": "2026-04-16",
      "catatan": ""
    },
    {
      "id": "S40",
      "nama": "Cahya Ayu Anggraini",
      "jenjang": "SD",
      "aktif": true,
      "lahir": "2016-03-08",
      "kelamin": "L",
      "asal": "SDN Cibeunying 2",
      "waliNama": "Ibu Endang",
      "waliWa": "0818-xxxx-9924",
      "bergabung": "2026-05-11",
      "catatan": ""
    },
    {
      "id": "S41",
      "nama": "Utami Anggraini Wulandari",
      "jenjang": "SD",
      "aktif": true,
      "lahir": "2017-06-08",
      "kelamin": "L",
      "asal": "SD Islam Al-Hikmah",
      "waliNama": "Bapak Slamet",
      "waliWa": "0820-xxxx-5995",
      "bergabung": "2026-01-27",
      "catatan": ""
    },
    {
      "id": "S42",
      "nama": "Oscar Anggraini Prasetyaningrum",
      "jenjang": "SMA",
      "aktif": true,
      "lahir": "2010-03-10",
      "kelamin": "P",
      "asal": "",
      "waliNama": "Bapak Rudi",
      "waliWa": "0822-xxxx-1873",
      "bergabung": "2025-03-23",
      "catatan": ""
    },
    {
      "id": "S43",
      "nama": "Elang Tri Wibowo",
      "jenjang": "SD",
      "aktif": true,
      "lahir": "2015-07-16",
      "kelamin": "P",
      "asal": "SD Muhammadiyah 4",
      "waliNama": "Ibu Sri",
      "waliWa": "0824-xxxx-6038",
      "bergabung": "2026-02-26",
      "catatan": ""
    },
    {
      "id": "S44",
      "nama": "Galuh Putri Cahyani",
      "jenjang": "SD",
      "aktif": true,
      "lahir": "2015-11-14",
      "kelamin": "L",
      "asal": "SDN Merdeka 5",
      "waliNama": "Bapak Herman",
      "waliWa": "0872-xxxx-8279",
      "bergabung": "2026-04-08",
      "catatan": ""
    },
    {
      "id": "S45",
      "nama": "Yusuf Kusuma Cahyani",
      "jenjang": "SMP",
      "aktif": true,
      "lahir": "2011-09-17",
      "kelamin": "P",
      "asal": "SMPN 9 Bandung",
      "waliNama": "Ibu Ratna",
      "waliWa": "0852-xxxx-5918",
      "bergabung": "2026-08-23",
      "catatan": ""
    },
    {
      "id": "S46",
      "nama": "Dewi Ayu Kusumaningtyas Wijaya",
      "jenjang": "SMP",
      "aktif": true,
      "lahir": "2013-09-28",
      "kelamin": "P",
      "asal": "SMPN 27 Bandung",
      "waliNama": "Bapak Joko",
      "waliWa": "0875-xxxx-7984",
      "bergabung": "2026-07-16",
      "catatan": ""
    },
    {
      "id": "S47",
      "nama": "Aisyah Syahputra Prasetyaningrum",
      "jenjang": "SD",
      "aktif": true,
      "lahir": "2015-04-09",
      "kelamin": "P",
      "asal": "SDN Pasirkaliki 3",
      "waliNama": "Bapak Anwar",
      "waliWa": "0860-xxxx-5294",
      "bergabung": "2026-03-05",
      "catatan": ""
    },
    {
      "id": "S48",
      "nama": "Jasmine Nugroho Kurnia",
      "jenjang": "SMA",
      "aktif": true,
      "lahir": "2010-08-11",
      "kelamin": "P",
      "asal": "SMA Pasundan 2",
      "waliNama": "Bapak Herman",
      "waliWa": "0847-xxxx-9403",
      "bergabung": "2025-03-08",
      "catatan": ""
    },
    {
      "id": "S49",
      "nama": "Hana Kusuma Pratama",
      "jenjang": "SD",
      "aktif": true,
      "lahir": "2015-04-15",
      "kelamin": "L",
      "asal": "SDN Sukajadi 1",
      "waliNama": "Bapak Rudi",
      "waliWa": "0871-xxxx-9367",
      "bergabung": "2026-01-16",
      "catatan": ""
    },
    {
      "id": "S50",
      "nama": "Yusuf Wijaya Setiawan",
      "jenjang": "SMA",
      "aktif": true,
      "lahir": "2010-04-18",
      "kelamin": "L",
      "asal": "SMA Santa Angela",
      "waliNama": "Bapak Anwar",
      "waliWa": "0845-xxxx-7523",
      "bergabung": "2025-04-01",
      "catatan": ""
    },
    {
      "id": "S51",
      "nama": "Naufal Cahyani",
      "jenjang": "SMA",
      "aktif": true,
      "lahir": "2008-01-15",
      "kelamin": "P",
      "asal": "SMA Pasundan 2",
      "waliNama": "Bapak Herman",
      "waliWa": "0819-xxxx-5376",
      "bergabung": "2025-06-15",
      "catatan": ""
    },
    {
      "id": "S52",
      "nama": "Kirana Adi Rahmawati",
      "jenjang": "SD",
      "aktif": true,
      "lahir": "2017-08-16",
      "kelamin": "P",
      "asal": "SD Kristen Bina Bakti",
      "waliNama": "Ibu Wati",
      "waliWa": "0860-xxxx-8643",
      "bergabung": "2026-07-06",
      "catatan": ""
    },
    {
      "id": "S53",
      "nama": "Fajar Pratama Hidayat",
      "jenjang": "SD",
      "aktif": true,
      "lahir": "2016-06-25",
      "kelamin": "P",
      "asal": "SD Islam Al-Hikmah",
      "waliNama": "Ibu Ratna",
      "waliWa": "0873-xxxx-9341",
      "bergabung": "2026-02-12",
      "catatan": ""
    },
    {
      "id": "S54",
      "nama": "Nadia Anggraini Cahyani",
      "jenjang": "SMP",
      "aktif": true,
      "lahir": "2011-04-11",
      "kelamin": "P",
      "asal": "SMP Taruna Bakti",
      "waliNama": "Bapak Rudi",
      "waliWa": "0828-xxxx-5428",
      "bergabung": "2026-05-14",
      "catatan": ""
    },
    {
      "id": "S55",
      "nama": "Citra Pratama Wulandari",
      "jenjang": "SD",
      "aktif": true,
      "lahir": "2014-05-09",
      "kelamin": "P",
      "asal": "",
      "waliNama": "Bapak Dedi",
      "waliWa": "0835-xxxx-6425",
      "bergabung": "2026-03-16",
      "catatan": ""
    },
    {
      "id": "S56",
      "nama": "Hana Syahputra Puspitasari",
      "jenjang": "SD",
      "aktif": true,
      "lahir": "2017-01-21",
      "kelamin": "P",
      "asal": "SDN Sukajadi 1",
      "waliNama": "Bapak Hadi",
      "waliWa": "0854-xxxx-6516",
      "bergabung": "2026-08-24",
      "catatan": ""
    },
    {
      "id": "S57",
      "nama": "Aisyah Wijaya Wicaksono",
      "jenjang": "SD",
      "aktif": true,
      "lahir": "2017-01-07",
      "kelamin": "P",
      "asal": "SDN Merdeka 5",
      "waliNama": "Bapak Rudi",
      "waliWa": "0878-xxxx-7029",
      "bergabung": "2026-05-15",
      "catatan": ""
    },
    {
      "id": "S58",
      "nama": "Kirana Wijaya Puspitasari",
      "jenjang": "SMA",
      "aktif": true,
      "lahir": "2010-09-02",
      "kelamin": "L",
      "asal": "SMA Pasundan 2",
      "waliNama": "Ibu Dina",
      "waliWa": "0830-xxxx-9006",
      "bergabung": "2025-05-11",
      "catatan": ""
    },
    {
      "id": "S59",
      "nama": "Hana Wicaksono",
      "jenjang": "SD",
      "aktif": true,
      "lahir": "2017-09-14",
      "kelamin": "L",
      "asal": "",
      "waliNama": "Bapak Dedi",
      "waliWa": "0828-xxxx-3209",
      "bergabung": "2026-02-23",
      "catatan": ""
    },
    {
      "id": "S60",
      "nama": "Oscar Rizki Ramadhan",
      "jenjang": "SD",
      "aktif": true,
      "lahir": "2014-07-01",
      "kelamin": "L",
      "asal": "SD Islam Al-Hikmah",
      "waliNama": "Ibu Wati",
      "waliWa": "0818-xxxx-4507",
      "bergabung": "2026-06-18",
      "catatan": ""
    },
    {
      "id": "S61",
      "nama": "Citra Syahputra Utami",
      "jenjang": "SMA",
      "aktif": true,
      "lahir": "2008-02-24",
      "kelamin": "P",
      "asal": "SMA Santa Angela",
      "waliNama": "Bapak Joko",
      "waliWa": "0859-xxxx-5157",
      "bergabung": "2025-08-02",
      "catatan": ""
    },
    {
      "id": "S62",
      "nama": "Zahra Hakim",
      "jenjang": "SD",
      "aktif": true,
      "lahir": "2017-09-03",
      "kelamin": "P",
      "asal": "SDN Pasirkaliki 3",
      "waliNama": "Bapak Anwar",
      "waliWa": "0835-xxxx-6623",
      "bergabung": "2026-08-22",
      "catatan": ""
    },
    {
      "id": "S63",
      "nama": "Putra Rizki Anggraini",
      "jenjang": "SD",
      "aktif": true,
      "lahir": "2014-12-02",
      "kelamin": "P",
      "asal": "SDN Cibeunying 2",
      "waliNama": "Bapak Dedi",
      "waliWa": "0859-xxxx-1009",
      "bergabung": "2026-05-12",
      "catatan": ""
    },
    {
      "id": "S64",
      "nama": "Qonita Kusuma Saputra",
      "jenjang": "SMP",
      "aktif": true,
      "lahir": "2013-12-12",
      "kelamin": "P",
      "asal": "SMPN 9 Bandung",
      "waliNama": "Bapak Bambang",
      "waliWa": "0848-xxxx-5090",
      "bergabung": "2026-03-07",
      "catatan": ""
    },
    {
      "id": "S65",
      "nama": "Muhammad Rizky Ramadhan Pratama",
      "jenjang": "SD",
      "aktif": true,
      "lahir": "2016-10-18",
      "kelamin": "P",
      "asal": "SDN Cibeunying 2",
      "waliNama": "Ibu Dina",
      "waliWa": "0835-xxxx-3279",
      "bergabung": "2026-08-17",
      "catatan": ""
    },
    {
      "id": "S66",
      "nama": "Utami Anggraini",
      "jenjang": "SMA",
      "aktif": true,
      "lahir": "2010-01-02",
      "kelamin": "P",
      "asal": "",
      "waliNama": "Ibu Dina",
      "waliWa": "0834-xxxx-5266",
      "bergabung": "2025-04-08",
      "catatan": ""
    },
    {
      "id": "S67",
      "nama": "Qonita Rizki Kurnia",
      "jenjang": "SMP",
      "aktif": true,
      "lahir": "2011-02-20",
      "kelamin": "P",
      "asal": "SMP Al-Falah",
      "waliNama": "Ibu Nurhayati",
      "waliWa": "0826-xxxx-2957",
      "bergabung": "2026-06-02",
      "catatan": ""
    },
    {
      "id": "S68",
      "nama": "Dimas Permana",
      "jenjang": "SD",
      "aktif": true,
      "lahir": "2017-07-24",
      "kelamin": "L",
      "asal": "SD Muhammadiyah 4",
      "waliNama": "Ibu Siska",
      "waliWa": "0871-xxxx-7251",
      "bergabung": "2026-01-17",
      "catatan": ""
    },
    {
      "id": "S69",
      "nama": "Citra Bagus Wibowo",
      "jenjang": "SMP",
      "aktif": true,
      "lahir": "2011-02-21",
      "kelamin": "P",
      "asal": "SMPN 27 Bandung",
      "waliNama": "Ibu Ratna",
      "waliWa": "0840-xxxx-1294",
      "bergabung": "2026-08-26",
      "catatan": ""
    },
    {
      "id": "S70",
      "nama": "Cahya Bagus Setiawan",
      "jenjang": "SD",
      "aktif": true,
      "lahir": "2015-06-18",
      "kelamin": "P",
      "asal": "SDN Sukajadi 1",
      "waliNama": "Ibu Tuti",
      "waliWa": "0841-xxxx-7649",
      "bergabung": "2026-04-01",
      "catatan": ""
    },
    {
      "id": "S71",
      "nama": "Citra Nur Ramadhan",
      "jenjang": "SD",
      "aktif": true,
      "lahir": "2017-03-17",
      "kelamin": "P",
      "asal": "SD Islam Al-Hikmah",
      "waliNama": "Ibu Endang",
      "waliWa": "0831-xxxx-7763",
      "bergabung": "2026-01-02",
      "catatan": ""
    },
    {
      "id": "S72",
      "nama": "Lukman Kusuma Setiawan",
      "jenjang": "SMP",
      "aktif": true,
      "lahir": "2011-06-06",
      "kelamin": "L",
      "asal": "SMPN 2 Cimahi",
      "waliNama": "Bapak Anwar",
      "waliWa": "0879-xxxx-6262",
      "bergabung": "2026-03-05",
      "catatan": ""
    },
    {
      "id": "S73",
      "nama": "Qonita Wibowo",
      "jenjang": "SMP",
      "aktif": true,
      "lahir": "2013-04-26",
      "kelamin": "L",
      "asal": "",
      "waliNama": "Bapak Joko",
      "waliWa": "0862-xxxx-8531",
      "bergabung": "2026-04-07",
      "catatan": ""
    },
    {
      "id": "S74",
      "nama": "Bintang Maulana Dharmawangsa",
      "jenjang": "SMP",
      "aktif": true,
      "lahir": "2012-08-13",
      "kelamin": "P",
      "asal": "SMP Taruna Bakti",
      "waliNama": "Bapak Bambang",
      "waliWa": "0858-xxxx-2645",
      "bergabung": "2026-05-17",
      "catatan": ""
    },
    {
      "id": "S75",
      "nama": "Teguh Wijaya Wulandari",
      "jenjang": "SD",
      "aktif": true,
      "lahir": "2016-12-14",
      "kelamin": "P",
      "asal": "SDN Pasirkaliki 3",
      "waliNama": "Ibu Ratna",
      "waliWa": "0856-xxxx-3629",
      "bergabung": "2026-01-04",
      "catatan": ""
    },
    {
      "id": "S76",
      "nama": "Jihan Rizki Permana",
      "jenjang": "SMA",
      "aktif": true,
      "lahir": "2008-07-24",
      "kelamin": "L",
      "asal": "SMAN 20 Bandung",
      "waliNama": "Ibu Sri",
      "waliWa": "0830-xxxx-9945",
      "bergabung": "2025-04-03",
      "catatan": ""
    },
    {
      "id": "S77",
      "nama": "Raden Bagus Anggoro Wicaksono",
      "jenjang": "SMA",
      "aktif": true,
      "lahir": "2010-11-16",
      "kelamin": "L",
      "asal": "",
      "waliNama": "Bapak Slamet",
      "waliWa": "0853-xxxx-6396",
      "bergabung": "2025-02-28",
      "catatan": ""
    },
    {
      "id": "S78",
      "nama": "Nadia Utami",
      "jenjang": "SMP",
      "aktif": true,
      "lahir": "2011-11-23",
      "kelamin": "L",
      "asal": "SMPN 9 Bandung",
      "waliNama": "Ibu Nurhayati",
      "waliWa": "0865-xxxx-3648",
      "bergabung": "2026-03-18",
      "catatan": ""
    },
    {
      "id": "S79",
      "nama": "Aisyah Tri Cahyani",
      "jenjang": "SMP",
      "aktif": true,
      "lahir": "2011-01-28",
      "kelamin": "P",
      "asal": "SMP Taruna Bakti",
      "waliNama": "Bapak Hadi",
      "waliWa": "0843-xxxx-1318",
      "bergabung": "2026-06-10",
      "catatan": ""
    },
    {
      "id": "S80",
      "nama": "Dimas Pratama Prasetyaningrum",
      "jenjang": "SMP",
      "aktif": true,
      "lahir": "2012-06-01",
      "kelamin": "L",
      "asal": "SMP Taruna Bakti",
      "waliNama": "Ibu Siska",
      "waliWa": "0858-xxxx-9974",
      "bergabung": "2026-02-10",
      "catatan": ""
    }
  ],
  "subjek": [
    {
      "id": "U1",
      "nama": "Bu Sari",
      "kelamin": "P",
      "peran": "Pengisi",
      "aktif": true,
      "mapel": [
        "M4"
      ],
      "kontak": "0819-xxxx-9220"
    },
    {
      "id": "U2",
      "nama": "Pak Andi",
      "kelamin": "L",
      "peran": "Pengisi",
      "aktif": true,
      "mapel": [
        "M6",
        "M3"
      ],
      "kontak": "0845-xxxx-5855"
    },
    {
      "id": "U3",
      "nama": "Bu Rina",
      "kelamin": "P",
      "peran": "Pengisi",
      "aktif": true,
      "mapel": [
        "M5"
      ],
      "kontak": "0844-xxxx-5874"
    },
    {
      "id": "U4",
      "nama": "Pak Dedi",
      "kelamin": "L",
      "peran": "Pengisi",
      "aktif": true,
      "mapel": [
        "M3",
        "M1",
        "M2"
      ],
      "kontak": "0855-xxxx-3121"
    },
    {
      "id": "U5",
      "nama": "Bu Maya",
      "kelamin": "P",
      "peran": "Pengisi",
      "aktif": true,
      "mapel": [
        "M2",
        "M1",
        "M4"
      ],
      "kontak": "0857-xxxx-4536"
    },
    {
      "id": "U6",
      "nama": "Pak Hendra",
      "kelamin": "L",
      "peran": "Pengisi",
      "aktif": true,
      "mapel": [
        "M1",
        "M4",
        "M2"
      ],
      "kontak": "0862-xxxx-4641"
    },
    {
      "id": "U7",
      "nama": "Bu Ningsih",
      "kelamin": "P",
      "peran": "Pengisi",
      "aktif": true,
      "mapel": [
        "M3",
        "M5"
      ],
      "kontak": "0858-xxxx-1999"
    },
    {
      "id": "U8",
      "nama": "Pak Bagus",
      "kelamin": "L",
      "peran": "Pengisi",
      "aktif": true,
      "mapel": [
        "M5",
        "M6"
      ],
      "kontak": "0814-xxxx-7955"
    },
    {
      "id": "U9",
      "nama": "Bu Ratih",
      "kelamin": "P",
      "peran": "Pengisi",
      "aktif": true,
      "mapel": [
        "M2",
        "M5",
        "M1"
      ],
      "kontak": "0836-xxxx-2306"
    },
    {
      "id": "U10",
      "nama": "Pak Yudi",
      "kelamin": "L",
      "peran": "Support",
      "aktif": true,
      "mapel": [],
      "kontak": "0848-xxxx-3605"
    },
    {
      "id": "U11",
      "nama": "Bu Lilis",
      "kelamin": "P",
      "peran": "Wali",
      "aktif": true,
      "mapel": [],
      "kontak": "0840-xxxx-4132"
    },
    {
      "id": "U12",
      "nama": "Pak Surya",
      "kelamin": "L",
      "peran": "Pendamping",
      "aktif": false,
      "mapel": [],
      "kontak": "0874-xxxx-5172"
    }
  ],
  "kelas": [
    {
      "id": "K1",
      "nama": "Kelas SD Sore",
      "jenjang": "SD",
      "keterangan": "Sesi sore Senin & Rabu",
      "anggota": [
        "S2",
        "S6",
        "S11",
        "S18",
        "S29",
        "S31",
        "S37",
        "S41",
        "S44",
        "S47",
        "S49",
        "S53",
        "S55",
        "S56",
        "S57",
        "S63",
        "S65",
        "S71"
      ]
    },
    {
      "id": "K2",
      "nama": "Kelas SD Pagi",
      "jenjang": "SD",
      "keterangan": "Sesi pagi Selasa & Kamis",
      "anggota": [
        "S1",
        "S11",
        "S20",
        "S29",
        "S37",
        "S43",
        "S49",
        "S53",
        "S55",
        "S57",
        "S59",
        "S68"
      ]
    },
    {
      "id": "K3",
      "nama": "Kelas SD Kecil",
      "jenjang": "SD",
      "keterangan": "Pendampingan intensif",
      "anggota": [
        "S18",
        "S20",
        "S40",
        "S52",
        "S71"
      ]
    },
    {
      "id": "K4",
      "nama": "Kelas SMP Pagi",
      "jenjang": "SMP",
      "keterangan": "Sesi pagi Selasa & Kamis",
      "anggota": [
        "S3",
        "S8",
        "S12",
        "S15",
        "S16",
        "S19",
        "S23",
        "S24",
        "S28",
        "S30",
        "S33",
        "S36",
        "S45",
        "S54",
        "S64",
        "S67",
        "S73",
        "S78",
        "S79",
        "S80"
      ]
    },
    {
      "id": "K5",
      "nama": "Kelas SMP Sore",
      "jenjang": "SMP",
      "keterangan": "Sesi sore Senin & Rabu",
      "anggota": [
        "S7",
        "S12",
        "S16",
        "S23",
        "S28",
        "S33",
        "S36",
        "S39",
        "S45",
        "S46",
        "S54",
        "S64",
        "S74",
        "S79"
      ]
    },
    {
      "id": "K6",
      "nama": "Kelas SMP Olimpiade",
      "jenjang": "SMP",
      "keterangan": "Persiapan lomba",
      "anggota": [
        "S3",
        "S8",
        "S16",
        "S33",
        "S74",
        "S79"
      ]
    },
    {
      "id": "K7",
      "nama": "Kelas SMA Intensif",
      "jenjang": "SMA",
      "keterangan": "Persiapan ujian",
      "anggota": [
        "S5",
        "S9",
        "S10",
        "S17",
        "S21",
        "S22",
        "S25",
        "S27",
        "S42",
        "S51",
        "S61",
        "S66",
        "S76"
      ]
    },
    {
      "id": "K8",
      "nama": "Kelas SMA Akhir Pekan",
      "jenjang": "SMA",
      "keterangan": "Sabtu penuh",
      "anggota": [
        "S5",
        "S9",
        "S21",
        "S27",
        "S42",
        "S48",
        "S51",
        "S76"
      ]
    }
  ],
  "mapel": [
    {
      "id": "M1",
      "nama": "Matematika",
      "aktif": true
    },
    {
      "id": "M2",
      "nama": "IPA",
      "aktif": true
    },
    {
      "id": "M3",
      "nama": "B. Indonesia",
      "aktif": true
    },
    {
      "id": "M4",
      "nama": "B. Inggris",
      "aktif": true
    },
    {
      "id": "M5",
      "nama": "IPS",
      "aktif": true
    },
    {
      "id": "M6",
      "nama": "Seni Budaya",
      "aktif": true
    }
  ],
  "materi": [
    {
      "id": "T1",
      "mapel": "M1",
      "nama": "Bilangan Bulat",
      "jenjang": [
        "SD",
        "SMP"
      ],
      "aktif": true
    },
    {
      "id": "T2",
      "mapel": "M1",
      "nama": "Pecahan",
      "jenjang": [
        "SD",
        "SMP"
      ],
      "aktif": true
    },
    {
      "id": "T3",
      "mapel": "M1",
      "nama": "Perkalian",
      "jenjang": [
        "SD"
      ],
      "aktif": true
    },
    {
      "id": "T4",
      "mapel": "M1",
      "nama": "Pembagian Bersusun",
      "jenjang": [
        "SD"
      ],
      "aktif": true
    },
    {
      "id": "T5",
      "mapel": "M1",
      "nama": "Pengukuran",
      "jenjang": [
        "SD",
        "SMP"
      ],
      "aktif": true
    },
    {
      "id": "T6",
      "mapel": "M1",
      "nama": "Bangun Datar",
      "jenjang": [
        "SD",
        "SMP"
      ],
      "aktif": true
    },
    {
      "id": "T7",
      "mapel": "M1",
      "nama": "Bangun Ruang",
      "jenjang": [
        "SMP"
      ],
      "aktif": true
    },
    {
      "id": "T8",
      "mapel": "M1",
      "nama": "Statistika Dasar",
      "jenjang": [
        "SMP",
        "SMA"
      ],
      "aktif": true
    },
    {
      "id": "T9",
      "mapel": "M1",
      "nama": "Aljabar Pengantar",
      "jenjang": [
        "SMP",
        "SMA"
      ],
      "aktif": true
    },
    {
      "id": "T10",
      "mapel": "M1",
      "nama": "Peluang",
      "jenjang": [
        "SMA"
      ],
      "aktif": true
    },
    {
      "id": "T11",
      "mapel": "M2",
      "nama": "Fotosintesis",
      "jenjang": [
        "SD",
        "SMP"
      ],
      "aktif": true
    },
    {
      "id": "T12",
      "mapel": "M2",
      "nama": "Sistem Pencernaan",
      "jenjang": [
        "SD",
        "SMP"
      ],
      "aktif": true
    },
    {
      "id": "T13",
      "mapel": "M2",
      "nama": "Gaya dan Gerak",
      "jenjang": [
        "SD",
        "SMP"
      ],
      "aktif": true
    },
    {
      "id": "T14",
      "mapel": "M2",
      "nama": "Energi",
      "jenjang": [
        "SD",
        "SMP",
        "SMA"
      ],
      "aktif": true
    },
    {
      "id": "T15",
      "mapel": "M2",
      "nama": "Tata Surya",
      "jenjang": [
        "SD",
        "SMP"
      ],
      "aktif": true
    },
    {
      "id": "T16",
      "mapel": "M2",
      "nama": "Sistem Pernapasan",
      "jenjang": [
        "SMP"
      ],
      "aktif": true
    },
    {
      "id": "T17",
      "mapel": "M2",
      "nama": "Zat dan Perubahannya",
      "jenjang": [
        "SMP",
        "SMA"
      ],
      "aktif": true
    },
    {
      "id": "T18",
      "mapel": "M2",
      "nama": "Listrik Sederhana",
      "jenjang": [
        "SMP",
        "SMA"
      ],
      "aktif": true
    },
    {
      "id": "T19",
      "mapel": "M2",
      "nama": "Ekosistem",
      "jenjang": [
        "SD",
        "SMP",
        "SMA"
      ],
      "aktif": true
    },
    {
      "id": "T20",
      "mapel": "M3",
      "nama": "Teks Deskripsi",
      "jenjang": [
        "SD",
        "SMP"
      ],
      "aktif": true
    },
    {
      "id": "T21",
      "mapel": "M3",
      "nama": "Teks Narasi",
      "jenjang": [
        "SD",
        "SMP"
      ],
      "aktif": true
    },
    {
      "id": "T22",
      "mapel": "M3",
      "nama": "Puisi",
      "jenjang": [
        "SD",
        "SMP",
        "SMA"
      ],
      "aktif": true
    },
    {
      "id": "T23",
      "mapel": "M3",
      "nama": "Kalimat Efektif",
      "jenjang": [
        "SMP",
        "SMA"
      ],
      "aktif": true
    },
    {
      "id": "T24",
      "mapel": "M3",
      "nama": "Teks Eksposisi",
      "jenjang": [
        "SMP",
        "SMA"
      ],
      "aktif": true
    },
    {
      "id": "T25",
      "mapel": "M3",
      "nama": "Pantun",
      "jenjang": [
        "SD",
        "SMP"
      ],
      "aktif": true
    },
    {
      "id": "T26",
      "mapel": "M3",
      "nama": "Surat Resmi",
      "jenjang": [
        "SMP",
        "SMA"
      ],
      "aktif": true
    },
    {
      "id": "T27",
      "mapel": "M3",
      "nama": "Teks Prosedur",
      "jenjang": [
        "SD",
        "SMP"
      ],
      "aktif": true
    },
    {
      "id": "T28",
      "mapel": "M4",
      "nama": "Simple Present",
      "jenjang": [
        "SD",
        "SMP"
      ],
      "aktif": true
    },
    {
      "id": "T29",
      "mapel": "M4",
      "nama": "Simple Past",
      "jenjang": [
        "SMP",
        "SMA"
      ],
      "aktif": true
    },
    {
      "id": "T30",
      "mapel": "M4",
      "nama": "Reading",
      "jenjang": [
        "SD",
        "SMP",
        "SMA"
      ],
      "aktif": true
    },
    {
      "id": "T31",
      "mapel": "M4",
      "nama": "Vocabulary",
      "jenjang": [
        "SD",
        "SMP",
        "SMA"
      ],
      "aktif": true
    },
    {
      "id": "T32",
      "mapel": "M4",
      "nama": "Speaking",
      "jenjang": [
        "SD",
        "SMP",
        "SMA"
      ],
      "aktif": true
    },
    {
      "id": "T33",
      "mapel": "M4",
      "nama": "Present Continuous",
      "jenjang": [
        "SMP",
        "SMA"
      ],
      "aktif": true
    },
    {
      "id": "T34",
      "mapel": "M4",
      "nama": "Descriptive Text",
      "jenjang": [
        "SMP",
        "SMA"
      ],
      "aktif": true
    },
    {
      "id": "T35",
      "mapel": "M4",
      "nama": "Listening",
      "jenjang": [
        "SD",
        "SMP",
        "SMA"
      ],
      "aktif": true
    },
    {
      "id": "T36",
      "mapel": "M5",
      "nama": "Peta dan Denah",
      "jenjang": [
        "SD",
        "SMP"
      ],
      "aktif": true
    },
    {
      "id": "T37",
      "mapel": "M5",
      "nama": "Kegiatan Ekonomi",
      "jenjang": [
        "SD",
        "SMP"
      ],
      "aktif": true
    },
    {
      "id": "T38",
      "mapel": "M5",
      "nama": "Sejarah Kemerdekaan",
      "jenjang": [
        "SD",
        "SMP",
        "SMA"
      ],
      "aktif": true
    },
    {
      "id": "T39",
      "mapel": "M5",
      "nama": "Keragaman Budaya",
      "jenjang": [
        "SD",
        "SMP"
      ],
      "aktif": true
    },
    {
      "id": "T40",
      "mapel": "M5",
      "nama": "Kependudukan",
      "jenjang": [
        "SMP",
        "SMA"
      ],
      "aktif": true
    },
    {
      "id": "T41",
      "mapel": "M5",
      "nama": "Interaksi Sosial",
      "jenjang": [
        "SMP",
        "SMA"
      ],
      "aktif": true
    },
    {
      "id": "T42",
      "mapel": "M5",
      "nama": "Sumber Daya Alam",
      "jenjang": [
        "SD",
        "SMP",
        "SMA"
      ],
      "aktif": true
    },
    {
      "id": "T43",
      "mapel": "M6",
      "nama": "Menggambar Bentuk",
      "jenjang": [
        "SD",
        "SMP"
      ],
      "aktif": true
    },
    {
      "id": "T44",
      "mapel": "M6",
      "nama": "Ritme dan Nada",
      "jenjang": [
        "SD",
        "SMP"
      ],
      "aktif": true
    },
    {
      "id": "T45",
      "mapel": "M6",
      "nama": "Tari Daerah",
      "jenjang": [
        "SD",
        "SMP",
        "SMA"
      ],
      "aktif": true
    },
    {
      "id": "T46",
      "mapel": "M6",
      "nama": "Kerajinan Tangan",
      "jenjang": [
        "SD",
        "SMP"
      ],
      "aktif": true
    },
    {
      "id": "T47",
      "mapel": "M6",
      "nama": "Apresiasi Musik",
      "jenjang": [
        "SMP",
        "SMA"
      ],
      "aktif": true
    },
    {
      "id": "T48",
      "mapel": "M6",
      "nama": "Seni Rupa Terapan",
      "jenjang": [
        "SMP",
        "SMA"
      ],
      "aktif": true
    }
  ],
  "tempat": [
    {
      "id": "P1",
      "nama": "Bandrek Pusat"
    },
    {
      "id": "P2",
      "nama": "Cabang Utara"
    },
    {
      "id": "P3",
      "nama": "Cabang Timur"
    }
  ],
  "ruangan": [
    {
      "id": "R1",
      "tempat": "P1",
      "nama": "R. Melati",
      "kapasitas": 12
    },
    {
      "id": "R2",
      "tempat": "P1",
      "nama": "R. Anggrek",
      "kapasitas": 14
    },
    {
      "id": "R3",
      "tempat": "P1",
      "nama": "R. Rapat",
      "kapasitas": 8
    },
    {
      "id": "R4",
      "tempat": "P1",
      "nama": "R. Kenanga",
      "kapasitas": 20
    },
    {
      "id": "R5",
      "tempat": "P2",
      "nama": "Lap. Utama",
      "kapasitas": 30
    },
    {
      "id": "R6",
      "tempat": "P2",
      "nama": "R. Cempaka",
      "kapasitas": 16
    },
    {
      "id": "R7",
      "tempat": "P2",
      "nama": "R. Dahlia",
      "kapasitas": 10
    },
    {
      "id": "R8",
      "tempat": "P3",
      "nama": "R. Bougenville",
      "kapasitas": 12
    },
    {
      "id": "R9",
      "tempat": "P3",
      "nama": "Aula Timur",
      "kapasitas": 40
    }
  ],
  "jenis": [
    {
      "id": "J1",
      "nama": "Pembelajaran",
      "warna": "pembelajaran",
      "materiWajib": true,
      "siswaWajib": true
    },
    {
      "id": "J2",
      "nama": "Rapat",
      "warna": "rapat",
      "materiWajib": false,
      "siswaWajib": false
    },
    {
      "id": "J3",
      "nama": "Olahraga",
      "warna": "olahraga",
      "materiWajib": false,
      "siswaWajib": true
    },
    {
      "id": "J4",
      "nama": "Ujian",
      "warna": "ujian",
      "materiWajib": true,
      "siswaWajib": true
    },
    {
      "id": "J5",
      "nama": "Konsultasi",
      "warna": "lainnya",
      "materiWajib": false,
      "siswaWajib": true
    }
  ],
  "alasanBatal": [
    "Pengajar berhalangan",
    "Siswa berhalangan",
    "Ruangan tidak tersedia",
    "Libur",
    "Alasan lain"
  ],
  "alasanJadwalUlang": [
    "Bentrok agenda pengajar",
    "Permintaan wali",
    "Ruangan dipakai",
    "Kondisi cuaca",
    "Alasan lain"
  ],
  "ceklisManual": [
    {
      "id": "cm1",
      "siswa": "S7",
      "materi": "T12",
      "tanggal": "2026-07-23",
      "catatan": "Belajar mandiri, sudah dicek",
      "oleh": "Bu Ningsih",
      "dicatat": "2026-08-23 15:55",
      "sumber": "manual"
    },
    {
      "id": "cm2",
      "siswa": "S31",
      "materi": "T32",
      "tanggal": "2026-09-05",
      "catatan": "Ikut kelas tambahan di luar jadwal",
      "oleh": "Bu Ratih",
      "dicatat": "2026-08-19 14:47",
      "sumber": "manual"
    },
    {
      "id": "cm3",
      "siswa": "S38",
      "materi": "T5",
      "tanggal": null,
      "catatan": "Riwayat lama, dimasukkan saat migrasi catatan kertas",
      "oleh": "Pak Bagus",
      "dicatat": "2026-08-29 13:23",
      "sumber": "manual"
    },
    {
      "id": "cm4",
      "siswa": "S32",
      "materi": "T21",
      "tanggal": "2026-08-30",
      "catatan": "Ikut kelas tambahan di luar jadwal",
      "oleh": "Bu Ratih",
      "dicatat": "2026-08-17 09:43",
      "sumber": "manual"
    },
    {
      "id": "cm5",
      "siswa": "S65",
      "materi": "T27",
      "tanggal": "2026-05-20",
      "catatan": "Menyusul sendiri setelah izin",
      "oleh": "Bu Ningsih",
      "dicatat": "2026-08-27 15:26",
      "sumber": "manual"
    },
    {
      "id": "cm6",
      "siswa": "S68",
      "materi": "T8",
      "tanggal": "2026-08-13",
      "catatan": "Sudah dikuasai dari sekolah asal",
      "oleh": "Bu Ningsih",
      "dicatat": "2026-09-02 11:48",
      "sumber": "manual"
    },
    {
      "id": "cm7",
      "siswa": "S32",
      "materi": "T20",
      "tanggal": null,
      "catatan": "Ikut kelas tambahan di luar jadwal",
      "oleh": "Pak Bagus",
      "dicatat": "2026-09-12 10:43",
      "sumber": "manual"
    },
    {
      "id": "cm8",
      "siswa": "S50",
      "materi": "T10",
      "tanggal": "2026-08-06",
      "catatan": "Menyusul sendiri setelah izin",
      "oleh": "Bu Maya",
      "dicatat": "2026-09-09 11:09",
      "sumber": "manual"
    },
    {
      "id": "cm9",
      "siswa": "S65",
      "materi": "T34",
      "tanggal": "2026-05-27",
      "catatan": "Sudah dikuasai dari sekolah asal",
      "oleh": "Bu Sari",
      "dicatat": "2026-08-19 13:13",
      "sumber": "manual"
    },
    {
      "id": "cm10",
      "siswa": "S80",
      "materi": "T8",
      "tanggal": "2026-07-22",
      "catatan": "Sudah dikuasai dari sekolah asal",
      "oleh": "Pak Bagus",
      "dicatat": "2026-08-13 11:08",
      "sumber": "manual"
    },
    {
      "id": "cm11",
      "siswa": "S72",
      "materi": "T44",
      "tanggal": "2026-07-20",
      "catatan": "",
      "oleh": "Bu Rina",
      "dicatat": "2026-08-27 10:00",
      "sumber": "manual"
    },
    {
      "id": "cm12",
      "siswa": "S49",
      "materi": "T15",
      "tanggal": null,
      "catatan": "",
      "oleh": "Bu Ratih",
      "dicatat": "2026-08-08 15:41",
      "sumber": "manual"
    },
    {
      "id": "cm13",
      "siswa": "S57",
      "materi": "T28",
      "tanggal": null,
      "catatan": "Belajar mandiri, sudah dicek",
      "oleh": "Pak Hendra",
      "dicatat": "2026-09-09 14:04",
      "sumber": "manual"
    },
    {
      "id": "cm14",
      "siswa": "S62",
      "materi": "T1",
      "tanggal": "2026-08-04",
      "catatan": "Ikut kelas tambahan di luar jadwal",
      "oleh": "Pak Dedi",
      "dicatat": "2026-08-27 08:42",
      "sumber": "manual"
    },
    {
      "id": "cm15",
      "siswa": "S13",
      "materi": "T15",
      "tanggal": "2026-07-18",
      "catatan": "Menyusul sendiri setelah izin",
      "oleh": "Bu Ratih",
      "dicatat": "2026-08-15 16:29",
      "sumber": "manual"
    },
    {
      "id": "cm16",
      "siswa": "S46",
      "materi": "T5",
      "tanggal": "2026-05-28",
      "catatan": "Ikut kelas tambahan di luar jadwal",
      "oleh": "Bu Sari",
      "dicatat": "2026-08-29 18:23",
      "sumber": "manual"
    },
    {
      "id": "cm17",
      "siswa": "S30",
      "materi": "T12",
      "tanggal": "2026-07-21",
      "catatan": "Menyusul sendiri setelah izin",
      "oleh": "Pak Dedi",
      "dicatat": "2026-09-14 17:16",
      "sumber": "manual"
    },
    {
      "id": "cm18",
      "siswa": "S14",
      "materi": "T31",
      "tanggal": null,
      "catatan": "",
      "oleh": "Bu Sari",
      "dicatat": "2026-09-15 18:33",
      "sumber": "manual"
    },
    {
      "id": "cm19",
      "siswa": "S35",
      "materi": "T40",
      "tanggal": "2026-09-06",
      "catatan": "Menyusul sendiri setelah izin",
      "oleh": "Pak Bagus",
      "dicatat": "2026-09-06 19:55",
      "sumber": "manual"
    },
    {
      "id": "cm20",
      "siswa": "S23",
      "materi": "T27",
      "tanggal": "2026-07-22",
      "catatan": "Sudah dikuasai dari sekolah asal",
      "oleh": "Bu Maya",
      "dicatat": "2026-09-10 18:29",
      "sumber": "manual"
    },
    {
      "id": "cm21",
      "siswa": "S47",
      "materi": "T36",
      "tanggal": "2026-08-23",
      "catatan": "Ikut kelas tambahan di luar jadwal",
      "oleh": "Pak Andi",
      "dicatat": "2026-08-13 15:02",
      "sumber": "manual"
    },
    {
      "id": "cm22",
      "siswa": "S63",
      "materi": "T47",
      "tanggal": "2026-05-29",
      "catatan": "Riwayat lama, dimasukkan saat migrasi catatan kertas",
      "oleh": "Pak Andi",
      "dicatat": "2026-08-14 19:53",
      "sumber": "manual"
    },
    {
      "id": "cm23",
      "siswa": "S19",
      "materi": "T45",
      "tanggal": "2026-06-28",
      "catatan": "Belajar mandiri, sudah dicek",
      "oleh": "Pak Hendra",
      "dicatat": "2026-08-22 17:41",
      "sumber": "manual"
    },
    {
      "id": "cm24",
      "siswa": "S41",
      "materi": "T32",
      "tanggal": "2026-06-01",
      "catatan": "Ikut kelas tambahan di luar jadwal",
      "oleh": "Bu Ratih",
      "dicatat": "2026-08-24 19:42",
      "sumber": "manual"
    },
    {
      "id": "cm25",
      "siswa": "S24",
      "materi": "T13",
      "tanggal": "2026-07-23",
      "catatan": "Menyusul sendiri setelah izin",
      "oleh": "Pak Bagus",
      "dicatat": "2026-08-17 17:14",
      "sumber": "manual"
    },
    {
      "id": "cm26",
      "siswa": "S2",
      "materi": "T47",
      "tanggal": "2026-06-03",
      "catatan": "Riwayat lama, dimasukkan saat migrasi catatan kertas",
      "oleh": "Bu Maya",
      "dicatat": "2026-09-06 08:16",
      "sumber": "manual"
    },
    {
      "id": "cm27",
      "siswa": "S36",
      "materi": "T10",
      "tanggal": "2026-07-28",
      "catatan": "Sudah dikuasai dari sekolah asal",
      "oleh": "Bu Ratih",
      "dicatat": "2026-08-31 09:16",
      "sumber": "manual"
    },
    {
      "id": "cm28",
      "siswa": "S30",
      "materi": "T14",
      "tanggal": "2026-06-06",
      "catatan": "Sudah dikuasai dari sekolah asal",
      "oleh": "Pak Andi",
      "dicatat": "2026-09-08 14:34",
      "sumber": "manual"
    },
    {
      "id": "cm29",
      "siswa": "S59",
      "materi": "T26",
      "tanggal": "2026-07-14",
      "catatan": "Menyusul sendiri setelah izin",
      "oleh": "Bu Ratih",
      "dicatat": "2026-09-10 19:16",
      "sumber": "manual"
    },
    {
      "id": "cm30",
      "siswa": "S75",
      "materi": "T37",
      "tanggal": "2026-08-22",
      "catatan": "Belajar mandiri, sudah dicek",
      "oleh": "Bu Sari",
      "dicatat": "2026-08-23 15:07",
      "sumber": "manual"
    },
    {
      "id": "cm31",
      "siswa": "S18",
      "materi": "T26",
      "tanggal": "2026-08-27",
      "catatan": "Riwayat lama, dimasukkan saat migrasi catatan kertas",
      "oleh": "Bu Maya",
      "dicatat": "2026-08-24 09:50",
      "sumber": "manual"
    },
    {
      "id": "cm32",
      "siswa": "S41",
      "materi": "T15",
      "tanggal": null,
      "catatan": "Menyusul sendiri setelah izin",
      "oleh": "Pak Hendra",
      "dicatat": "2026-08-08 15:22",
      "sumber": "manual"
    },
    {
      "id": "cm33",
      "siswa": "S63",
      "materi": "T42",
      "tanggal": null,
      "catatan": "Ikut kelas tambahan di luar jadwal",
      "oleh": "Bu Rina",
      "dicatat": "2026-09-14 08:21",
      "sumber": "manual"
    },
    {
      "id": "cm34",
      "siswa": "S75",
      "materi": "T35",
      "tanggal": "2026-07-19",
      "catatan": "Belajar mandiri, sudah dicek",
      "oleh": "Pak Dedi",
      "dicatat": "2026-09-15 14:46",
      "sumber": "manual"
    },
    {
      "id": "cm35",
      "siswa": "S44",
      "materi": "T40",
      "tanggal": "2026-07-21",
      "catatan": "Menyusul sendiri setelah izin",
      "oleh": "Bu Maya",
      "dicatat": "2026-08-09 15:53",
      "sumber": "manual"
    },
    {
      "id": "cm36",
      "siswa": "S66",
      "materi": "T23",
      "tanggal": "2026-05-23",
      "catatan": "Riwayat lama, dimasukkan saat migrasi catatan kertas",
      "oleh": "Bu Ningsih",
      "dicatat": "2026-09-15 16:15",
      "sumber": "manual"
    },
    {
      "id": "cm37",
      "siswa": "S44",
      "materi": "T8",
      "tanggal": "2026-06-07",
      "catatan": "Menyusul sendiri setelah izin",
      "oleh": "Pak Dedi",
      "dicatat": "2026-08-10 10:40",
      "sumber": "manual"
    },
    {
      "id": "cm38",
      "siswa": "S75",
      "materi": "T11",
      "tanggal": "2026-06-06",
      "catatan": "Menyusul sendiri setelah izin",
      "oleh": "Bu Ratih",
      "dicatat": "2026-08-21 14:02",
      "sumber": "manual"
    },
    {
      "id": "cm39",
      "siswa": "S18",
      "materi": "T27",
      "tanggal": null,
      "catatan": "",
      "oleh": "Bu Rina",
      "dicatat": "2026-09-10 16:08",
      "sumber": "manual"
    },
    {
      "id": "cm40",
      "siswa": "S17",
      "materi": "T46",
      "tanggal": "2026-06-01",
      "catatan": "Sudah dikuasai dari sekolah asal",
      "oleh": "Bu Sari",
      "dicatat": "2026-08-31 13:29",
      "sumber": "manual"
    },
    {
      "id": "cm41",
      "siswa": "S3",
      "materi": "T45",
      "tanggal": "2026-08-29",
      "catatan": "Sudah dikuasai dari sekolah asal",
      "oleh": "Pak Dedi",
      "dicatat": "2026-09-04 19:46",
      "sumber": "manual"
    },
    {
      "id": "cm42",
      "siswa": "S41",
      "materi": "T36",
      "tanggal": "2026-07-05",
      "catatan": "Ikut kelas tambahan di luar jadwal",
      "oleh": "Pak Bagus",
      "dicatat": "2026-08-20 11:06",
      "sumber": "manual"
    },
    {
      "id": "cm43",
      "siswa": "S53",
      "materi": "T5",
      "tanggal": "2026-08-12",
      "catatan": "Riwayat lama, dimasukkan saat migrasi catatan kertas",
      "oleh": "Pak Bagus",
      "dicatat": "2026-08-22 11:52",
      "sumber": "manual"
    },
    {
      "id": "cm44",
      "siswa": "S4",
      "materi": "T19",
      "tanggal": null,
      "catatan": "Sudah dikuasai dari sekolah asal",
      "oleh": "Bu Ratih",
      "dicatat": "2026-09-07 11:02",
      "sumber": "manual"
    },
    {
      "id": "cm45",
      "siswa": "S66",
      "materi": "T10",
      "tanggal": null,
      "catatan": "Riwayat lama, dimasukkan saat migrasi catatan kertas",
      "oleh": "Pak Hendra",
      "dicatat": "2026-09-16 14:43",
      "sumber": "manual"
    },
    {
      "id": "cm46",
      "siswa": "S60",
      "materi": "T36",
      "tanggal": "2026-08-26",
      "catatan": "Belajar mandiri, sudah dicek",
      "oleh": "Bu Maya",
      "dicatat": "2026-08-28 18:29",
      "sumber": "manual"
    },
    {
      "id": "cm47",
      "siswa": "S19",
      "materi": "T14",
      "tanggal": "2026-05-20",
      "catatan": "Riwayat lama, dimasukkan saat migrasi catatan kertas",
      "oleh": "Bu Ningsih",
      "dicatat": "2026-09-13 17:23",
      "sumber": "manual"
    },
    {
      "id": "cm48",
      "siswa": "S79",
      "materi": "T38",
      "tanggal": null,
      "catatan": "Riwayat lama, dimasukkan saat migrasi catatan kertas",
      "oleh": "Bu Ningsih",
      "dicatat": "2026-08-11 19:49",
      "sumber": "manual"
    },
    {
      "id": "cm49",
      "siswa": "S65",
      "materi": "T37",
      "tanggal": "2026-06-30",
      "catatan": "Riwayat lama, dimasukkan saat migrasi catatan kertas",
      "oleh": "Bu Ningsih",
      "dicatat": "2026-08-31 19:01",
      "sumber": "manual"
    },
    {
      "id": "cm50",
      "siswa": "S69",
      "materi": "T39",
      "tanggal": "2026-05-28",
      "catatan": "",
      "oleh": "Pak Bagus",
      "dicatat": "2026-09-15 18:18",
      "sumber": "manual"
    },
    {
      "id": "cm51",
      "siswa": "S51",
      "materi": "T39",
      "tanggal": "2026-08-31",
      "catatan": "Menyusul sendiri setelah izin",
      "oleh": "Bu Rina",
      "dicatat": "2026-08-11 19:29",
      "sumber": "manual"
    },
    {
      "id": "cm52",
      "siswa": "S22",
      "materi": "T32",
      "tanggal": "2026-07-14",
      "catatan": "Belajar mandiri, sudah dicek",
      "oleh": "Pak Dedi",
      "dicatat": "2026-08-26 15:09",
      "sumber": "manual"
    },
    {
      "id": "cm53",
      "siswa": "S41",
      "materi": "T44",
      "tanggal": "2026-06-04",
      "catatan": "Riwayat lama, dimasukkan saat migrasi catatan kertas",
      "oleh": "Bu Ningsih",
      "dicatat": "2026-08-16 10:50",
      "sumber": "manual"
    },
    {
      "id": "cm54",
      "siswa": "S59",
      "materi": "T32",
      "tanggal": "2026-05-20",
      "catatan": "Riwayat lama, dimasukkan saat migrasi catatan kertas",
      "oleh": "Pak Hendra",
      "dicatat": "2026-08-10 17:03",
      "sumber": "manual"
    },
    {
      "id": "cm55",
      "siswa": "S50",
      "materi": "T5",
      "tanggal": "2026-05-22",
      "catatan": "Ikut kelas tambahan di luar jadwal",
      "oleh": "Pak Andi",
      "dicatat": "2026-09-08 15:47",
      "sumber": "manual"
    },
    {
      "id": "cm56",
      "siswa": "S78",
      "materi": "T27",
      "tanggal": "2026-09-01",
      "catatan": "Sudah dikuasai dari sekolah asal",
      "oleh": "Bu Rina",
      "dicatat": "2026-09-05 09:13",
      "sumber": "manual"
    },
    {
      "id": "cm57",
      "siswa": "S75",
      "materi": "T34",
      "tanggal": "2026-09-01",
      "catatan": "Riwayat lama, dimasukkan saat migrasi catatan kertas",
      "oleh": "Pak Dedi",
      "dicatat": "2026-08-09 17:44",
      "sumber": "manual"
    },
    {
      "id": "cm58",
      "siswa": "S15",
      "materi": "T2",
      "tanggal": "2026-07-05",
      "catatan": "",
      "oleh": "Pak Andi",
      "dicatat": "2026-08-13 08:01",
      "sumber": "manual"
    },
    {
      "id": "cm59",
      "siswa": "S51",
      "materi": "T16",
      "tanggal": null,
      "catatan": "Menyusul sendiri setelah izin",
      "oleh": "Pak Bagus",
      "dicatat": "2026-08-30 08:14",
      "sumber": "manual"
    },
    {
      "id": "cm60",
      "siswa": "S11",
      "materi": "T17",
      "tanggal": null,
      "catatan": "",
      "oleh": "Pak Andi",
      "dicatat": "2026-09-04 08:38",
      "sumber": "manual"
    },
    {
      "id": "cm61",
      "siswa": "S8",
      "materi": "T37",
      "tanggal": "2026-05-24",
      "catatan": "Ikut kelas tambahan di luar jadwal",
      "oleh": "Pak Bagus",
      "dicatat": "2026-08-10 12:46",
      "sumber": "manual"
    },
    {
      "id": "cm62",
      "siswa": "S57",
      "materi": "T44",
      "tanggal": "2026-07-31",
      "catatan": "Sudah dikuasai dari sekolah asal",
      "oleh": "Pak Andi",
      "dicatat": "2026-09-03 12:35",
      "sumber": "manual"
    },
    {
      "id": "cm63",
      "siswa": "S63",
      "materi": "T35",
      "tanggal": "2026-07-01",
      "catatan": "Sudah dikuasai dari sekolah asal",
      "oleh": "Bu Sari",
      "dicatat": "2026-09-15 15:38",
      "sumber": "manual"
    },
    {
      "id": "cm64",
      "siswa": "S75",
      "materi": "T43",
      "tanggal": "2026-06-20",
      "catatan": "Riwayat lama, dimasukkan saat migrasi catatan kertas",
      "oleh": "Bu Ningsih",
      "dicatat": "2026-08-31 18:13",
      "sumber": "manual"
    }
  ],
  "kegiatan": [
    {
      "id": "e01",
      "mapel": "M1",
      "materi": "T1",
      "kelas": "K1",
      "catatan": "",
      "realisasi": {
        "mulai": "15:00",
        "selesai": "16:35",
        "materi": "T1",
        "ketuntasan": "sebagian",
        "catatan": "Perlu pengulangan di pertemuan berikutnya.",
        "kehadiran": {
          "S2": "hadir",
          "S6": "hadir",
          "S11": "izin",
          "S18": "hadir",
          "S29": "hadir",
          "S31": "hadir",
          "S37": "izin",
          "S41": "izin",
          "S47": "hadir",
          "S49": "hadir",
          "S53": "izin",
          "S55": "hadir",
          "S56": "hadir",
          "S57": "hadir",
          "S63": "hadir",
          "S71": "hadir"
        },
        "catatanSiswa": {
          "S11": "Izin dari wali"
        },
        "kehadiranSubjek": {
          "U4": "sakit",
          "U10": "hadir"
        },
        "catatanSubjek": {
          "U4": "Digantikan sementara"
        },
        "diisiOleh": "Pak Dedi",
        "diisiPada": "2026-08-05 17:09"
      },
      "nama": "Matematika Kelas SD Sore",
      "jenis": "J1",
      "tanggal": "2026-08-05",
      "mulai": "15:00",
      "selesai": "16:30",
      "ruangan": "R1",
      "subjek": [
        {
          "id": "U4",
          "peran": "Pengisi"
        },
        {
          "id": "U10",
          "peran": "Support"
        }
      ],
      "siswa": [
        "S2",
        "S6",
        "S11",
        "S18",
        "S29",
        "S31",
        "S37",
        "S41",
        "S47",
        "S49",
        "S53",
        "S55",
        "S56",
        "S57",
        "S63",
        "S71"
      ],
      "status": "terealisasi"
    },
    {
      "id": "e02",
      "mapel": "M3",
      "materi": "T21",
      "kelas": "K5",
      "catatan": "",
      "realisasi": {
        "mulai": "16:10",
        "selesai": "17:30",
        "materi": "T21",
        "ketuntasan": "sebagian",
        "catatan": "Diskusi kelompok berjalan bagus.",
        "kehadiran": {
          "S7": "hadir",
          "S12": "hadir",
          "S16": "izin",
          "S23": "hadir",
          "S28": "hadir",
          "S33": "izin",
          "S36": "hadir",
          "S39": "alpa",
          "S46": "hadir",
          "S54": "hadir",
          "S64": "izin",
          "S74": "hadir",
          "S79": "izin"
        },
        "catatanSiswa": {
          "S16": "Menyusul materi minggu depan",
          "S33": "Menyusul materi minggu depan",
          "S64": "Ada acara keluarga",
          "S74": "Sudah paham, beri soal pengayaan",
          "S79": "Menyusul materi minggu depan"
        },
        "kehadiranSubjek": {
          "U4": "hadir",
          "U10": "hadir"
        },
        "catatanSubjek": {},
        "diisiOleh": "Pak Dedi",
        "diisiPada": "2026-08-05 17:56"
      },
      "nama": "B. Indonesia Kelas SMP Sore",
      "jenis": "J1",
      "tanggal": "2026-08-05",
      "mulai": "16:00",
      "selesai": "17:30",
      "ruangan": "R6",
      "subjek": [
        {
          "id": "U4",
          "peran": "Pengisi"
        },
        {
          "id": "U10",
          "peran": "Support"
        }
      ],
      "siswa": [
        "S7",
        "S12",
        "S16",
        "S23",
        "S28",
        "S33",
        "S36",
        "S39",
        "S46",
        "S54",
        "S64",
        "S74",
        "S79"
      ],
      "status": "terealisasi"
    },
    {
      "id": "e03",
      "mapel": "M1",
      "materi": "T2",
      "kelas": "K6",
      "catatan": "",
      "realisasi": null,
      "nama": "Matematika Kelas SMP Olimpiade",
      "jenis": "J1",
      "tanggal": "2026-08-07",
      "mulai": "08:00",
      "selesai": "10:00",
      "ruangan": "R8",
      "subjek": [
        {
          "id": "U6",
          "peran": "Pengisi"
        },
        {
          "id": "U10",
          "peran": "Support"
        }
      ],
      "siswa": [
        "S3",
        "S8",
        "S16",
        "S33",
        "S74",
        "S79"
      ],
      "status": "dibatalkan",
      "pembatalan": {
        "alasan": "Alasan lain",
        "keterangan": "Sudah dikabarkan ke wali.",
        "pada": "2026-08-06 20:19"
      }
    },
    {
      "id": "e04",
      "mapel": null,
      "materi": null,
      "kelas": null,
      "catatan": "",
      "realisasi": null,
      "nama": "Olahraga Pagi Bersama",
      "jenis": "J3",
      "tanggal": "2026-08-08",
      "mulai": "07:00",
      "selesai": "09:00",
      "ruangan": "R5",
      "subjek": [
        {
          "id": "U10",
          "peran": "Pengisi"
        }
      ],
      "siswa": [
        "S41",
        "S54",
        "S46",
        "S33",
        "S21",
        "S43",
        "S36",
        "S72",
        "S30",
        "S6",
        "S1",
        "S50",
        "S79",
        "S47",
        "S59",
        "S77",
        "S25",
        "S68",
        "S14"
      ],
      "status": "belum"
    },
    {
      "id": "e05",
      "mapel": "M4",
      "materi": "T32",
      "kelas": "K8",
      "catatan": "",
      "realisasi": {
        "mulai": "09:00",
        "selesai": "10:55",
        "materi": "T32",
        "ketuntasan": "tidak",
        "catatan": "Waktu terpotong karena peralatan telat siap.",
        "kehadiran": {
          "S5": "hadir",
          "S9": "hadir",
          "S21": "sakit",
          "S27": "hadir",
          "S42": "hadir",
          "S48": "hadir",
          "S51": "hadir",
          "S76": "hadir"
        },
        "catatanSiswa": {
          "S21": "Demam, ada surat"
        },
        "kehadiranSubjek": {
          "U6": "hadir"
        },
        "catatanSubjek": {},
        "diisiOleh": "Pak Hendra",
        "diisiPada": "2026-08-08 11:17"
      },
      "nama": "B. Inggris Kelas SMA Akhir Pekan",
      "jenis": "J1",
      "tanggal": "2026-08-08",
      "mulai": "09:00",
      "selesai": "11:00",
      "ruangan": "R9",
      "subjek": [
        {
          "id": "U6",
          "peran": "Pengisi"
        }
      ],
      "siswa": [
        "S5",
        "S9",
        "S21",
        "S27",
        "S42",
        "S48",
        "S51",
        "S76"
      ],
      "status": "terealisasi"
    },
    {
      "id": "e06",
      "mapel": "M1",
      "materi": "T5",
      "kelas": "K1",
      "catatan": "",
      "realisasi": {
        "mulai": "15:15",
        "selesai": "16:25",
        "materi": "T5",
        "ketuntasan": "sebagian",
        "catatan": "Materi tersampaikan penuh, sisa waktu untuk tanya jawab.",
        "kehadiran": {
          "S2": "izin",
          "S6": "hadir",
          "S11": "hadir",
          "S18": "hadir",
          "S29": "hadir",
          "S31": "izin",
          "S37": "sakit",
          "S41": "hadir",
          "S44": "hadir",
          "S47": "izin",
          "S49": "hadir",
          "S55": "hadir",
          "S56": "hadir",
          "S57": "hadir",
          "S63": "sakit",
          "S65": "hadir",
          "S71": "hadir"
        },
        "catatanSiswa": {
          "S31": "Izin dari wali",
          "S37": "Demam, ada surat",
          "S47": "Ada acara keluarga",
          "S55": "Masih ragu di soal cerita",
          "S63": "Izin sakit dari wali"
        },
        "kehadiranSubjek": {
          "U6": "hadir",
          "U10": "hadir"
        },
        "catatanSubjek": {},
        "diisiOleh": "Pak Hendra",
        "diisiPada": "2026-08-10 17:00"
      },
      "nama": "Matematika Kelas SD Sore",
      "jenis": "J1",
      "tanggal": "2026-08-10",
      "mulai": "15:00",
      "selesai": "16:30",
      "ruangan": "R1",
      "subjek": [
        {
          "id": "U6",
          "peran": "Pengisi"
        },
        {
          "id": "U10",
          "peran": "Support"
        }
      ],
      "siswa": [
        "S2",
        "S6",
        "S11",
        "S18",
        "S29",
        "S31",
        "S37",
        "S41",
        "S44",
        "S47",
        "S49",
        "S55",
        "S56",
        "S57",
        "S63",
        "S65",
        "S71"
      ],
      "status": "terealisasi"
    },
    {
      "id": "e07",
      "mapel": "M3",
      "materi": "T22",
      "kelas": "K5",
      "catatan": "",
      "realisasi": {
        "mulai": "15:55",
        "selesai": "17:30",
        "materi": "T22",
        "ketuntasan": "sebagian",
        "catatan": "Perlu pengulangan di pertemuan berikutnya.",
        "kehadiran": {
          "S7": "hadir",
          "S12": "izin",
          "S16": "hadir",
          "S23": "hadir",
          "S28": "hadir",
          "S33": "hadir",
          "S36": "hadir",
          "S39": "hadir",
          "S45": "hadir",
          "S46": "izin",
          "S54": "hadir",
          "S64": "izin",
          "S74": "hadir",
          "S79": "hadir"
        },
        "catatanSiswa": {},
        "kehadiranSubjek": {
          "U4": "hadir",
          "U11": "hadir"
        },
        "catatanSubjek": {},
        "diisiOleh": "Pak Dedi",
        "diisiPada": "2026-08-10 18:11"
      },
      "nama": "B. Indonesia Kelas SMP Sore",
      "jenis": "J1",
      "tanggal": "2026-08-10",
      "mulai": "16:00",
      "selesai": "17:30",
      "ruangan": "R6",
      "subjek": [
        {
          "id": "U4",
          "peran": "Pengisi"
        },
        {
          "id": "U11",
          "peran": "Wali"
        }
      ],
      "siswa": [
        "S7",
        "S12",
        "S16",
        "S23",
        "S28",
        "S33",
        "S36",
        "S39",
        "S45",
        "S46",
        "S54",
        "S64",
        "S74",
        "S79"
      ],
      "status": "terealisasi"
    },
    {
      "id": "e08",
      "mapel": "M2",
      "materi": "T13",
      "kelas": "K4",
      "catatan": "",
      "realisasi": null,
      "nama": "IPA Kelas SMP Pagi",
      "jenis": "J1",
      "tanggal": "2026-08-11",
      "mulai": "08:00",
      "selesai": "09:30",
      "ruangan": "R4",
      "subjek": [
        {
          "id": "U5",
          "peran": "Pengisi"
        },
        {
          "id": "U11",
          "peran": "Wali"
        }
      ],
      "siswa": [
        "S3",
        "S8",
        "S12",
        "S15",
        "S16",
        "S19",
        "S23",
        "S28",
        "S30",
        "S33",
        "S36",
        "S45",
        "S54",
        "S64",
        "S67",
        "S79",
        "S80"
      ],
      "status": "belum"
    },
    {
      "id": "e09",
      "mapel": null,
      "materi": null,
      "kelas": null,
      "catatan": "",
      "realisasi": {
        "mulai": "11:10",
        "selesai": "12:00",
        "materi": null,
        "ketuntasan": null,
        "catatan": "Perlu pengulangan di pertemuan berikutnya.",
        "kehadiran": {},
        "catatanSiswa": {},
        "kehadiranSubjek": {
          "U3": "hadir",
          "U8": "hadir",
          "U6": "hadir",
          "U7": "hadir",
          "U4": "hadir"
        },
        "catatanSubjek": {},
        "diisiOleh": "Bu Rina",
        "diisiPada": "2026-08-11 12:27"
      },
      "nama": "Rapat Pengajar Mingguan",
      "jenis": "J2",
      "tanggal": "2026-08-11",
      "mulai": "11:00",
      "selesai": "12:00",
      "ruangan": "R3",
      "subjek": [
        {
          "id": "U3",
          "peran": "Pengisi"
        },
        {
          "id": "U8",
          "peran": "Support"
        },
        {
          "id": "U6",
          "peran": "Support"
        },
        {
          "id": "U7",
          "peran": "Support"
        },
        {
          "id": "U4",
          "peran": "Support"
        }
      ],
      "siswa": [],
      "status": "terealisasi"
    },
    {
      "id": "e10",
      "mapel": "M6",
      "materi": "T43",
      "kelas": "K3",
      "catatan": "",
      "realisasi": {
        "mulai": "07:55",
        "selesai": "08:50",
        "materi": "T43",
        "ketuntasan": "tidak",
        "catatan": "Diskusi kelompok berjalan bagus.",
        "kehadiran": {
          "S18": "izin",
          "S20": "hadir",
          "S40": "sakit",
          "S71": "izin"
        },
        "catatanSiswa": {
          "S71": "Izin dari wali"
        },
        "kehadiranSubjek": {
          "U2": "hadir"
        },
        "catatanSubjek": {},
        "diisiOleh": "Pak Andi",
        "diisiPada": "2026-08-12 09:43"
      },
      "nama": "Seni Budaya Kelas SD Kecil",
      "jenis": "J1",
      "tanggal": "2026-08-12",
      "mulai": "08:00",
      "selesai": "09:00",
      "ruangan": "R7",
      "subjek": [
        {
          "id": "U2",
          "peran": "Pengisi"
        }
      ],
      "siswa": [
        "S18",
        "S20",
        "S40",
        "S71"
      ],
      "status": "terealisasi"
    },
    {
      "id": "e11",
      "mapel": "M3",
      "materi": "T20",
      "kelas": "K1",
      "catatan": "",
      "realisasi": {
        "mulai": "15:00",
        "selesai": "16:35",
        "materi": "T20",
        "ketuntasan": "sebagian",
        "catatan": "Materi tersampaikan penuh, sisa waktu untuk tanya jawab.",
        "kehadiran": {
          "S2": "hadir",
          "S6": "hadir",
          "S11": "hadir",
          "S18": "hadir",
          "S29": "hadir",
          "S31": "hadir",
          "S37": "hadir",
          "S41": "hadir",
          "S44": "hadir",
          "S49": "hadir",
          "S55": "hadir",
          "S56": "hadir",
          "S57": "hadir",
          "S63": "hadir",
          "S65": "hadir"
        },
        "catatanSiswa": {
          "S37": "Masih ragu di soal cerita",
          "S44": "Sudah paham, beri soal pengayaan"
        },
        "kehadiranSubjek": {
          "U2": "hadir",
          "U10": "hadir"
        },
        "catatanSubjek": {},
        "diisiOleh": "Pak Andi",
        "diisiPada": "2026-08-12 16:48"
      },
      "nama": "B. Indonesia Kelas SD Sore",
      "jenis": "J1",
      "tanggal": "2026-08-12",
      "mulai": "15:00",
      "selesai": "16:30",
      "ruangan": "R1",
      "subjek": [
        {
          "id": "U2",
          "peran": "Pengisi"
        },
        {
          "id": "U10",
          "peran": "Support"
        }
      ],
      "siswa": [
        "S2",
        "S6",
        "S11",
        "S18",
        "S29",
        "S31",
        "S37",
        "S41",
        "S44",
        "S49",
        "S55",
        "S56",
        "S57",
        "S63",
        "S65"
      ],
      "status": "terealisasi"
    },
    {
      "id": "e12",
      "mapel": "M4",
      "materi": "T29",
      "kelas": "K5",
      "catatan": "",
      "realisasi": {
        "mulai": "16:05",
        "selesai": "17:30",
        "materi": "T29",
        "ketuntasan": "sebagian",
        "catatan": "Perlu pengulangan di pertemuan berikutnya.",
        "kehadiran": {
          "S7": "hadir",
          "S12": "hadir",
          "S16": "hadir",
          "S23": "sakit",
          "S28": "hadir",
          "S33": "hadir",
          "S39": "alpa",
          "S45": "izin",
          "S46": "hadir",
          "S54": "alpa",
          "S64": "hadir",
          "S74": "hadir",
          "S79": "hadir"
        },
        "catatanSiswa": {
          "S16": "Perlu pengulangan",
          "S39": "Tidak hadir tanpa kabar",
          "S45": "Ada acara keluarga",
          "S54": "Tidak hadir tanpa kabar"
        },
        "kehadiranSubjek": {
          "U1": "hadir",
          "U11": "hadir"
        },
        "catatanSubjek": {},
        "diisiOleh": "Bu Sari",
        "diisiPada": "2026-08-12 17:51"
      },
      "nama": "B. Inggris Kelas SMP Sore",
      "jenis": "J1",
      "tanggal": "2026-08-12",
      "mulai": "16:00",
      "selesai": "17:30",
      "ruangan": "R6",
      "subjek": [
        {
          "id": "U1",
          "peran": "Pengisi"
        },
        {
          "id": "U11",
          "peran": "Wali"
        }
      ],
      "siswa": [
        "S7",
        "S12",
        "S16",
        "S23",
        "S28",
        "S33",
        "S39",
        "S45",
        "S46",
        "S54",
        "S64",
        "S74",
        "S79"
      ],
      "status": "terealisasi"
    },
    {
      "id": "e13",
      "mapel": "M4",
      "materi": "T30",
      "kelas": "K4",
      "catatan": "",
      "realisasi": {
        "mulai": "08:05",
        "selesai": "09:30",
        "materi": "T30",
        "ketuntasan": "sebagian",
        "catatan": "",
        "kehadiran": {
          "S3": "hadir",
          "S8": "hadir",
          "S12": "hadir",
          "S15": "hadir",
          "S16": "sakit",
          "S19": "hadir",
          "S23": "hadir",
          "S24": "hadir",
          "S30": "hadir",
          "S33": "hadir",
          "S36": "hadir",
          "S45": "hadir",
          "S54": "hadir",
          "S64": "izin",
          "S67": "alpa",
          "S73": "izin",
          "S78": "hadir",
          "S79": "hadir",
          "S80": "izin"
        },
        "catatanSiswa": {
          "S16": "Sakit perut, pulang lebih awal",
          "S64": "Izin dari wali",
          "S73": "Ada acara keluarga"
        },
        "kehadiranSubjek": {
          "U1": "hadir",
          "U11": "hadir"
        },
        "catatanSubjek": {},
        "diisiOleh": "Bu Sari",
        "diisiPada": "2026-08-13 10:04"
      },
      "nama": "B. Inggris Kelas SMP Pagi",
      "jenis": "J1",
      "tanggal": "2026-08-13",
      "mulai": "08:00",
      "selesai": "09:30",
      "ruangan": "R4",
      "subjek": [
        {
          "id": "U1",
          "peran": "Pengisi"
        },
        {
          "id": "U11",
          "peran": "Wali"
        }
      ],
      "siswa": [
        "S3",
        "S8",
        "S12",
        "S15",
        "S16",
        "S19",
        "S23",
        "S24",
        "S30",
        "S33",
        "S36",
        "S45",
        "S54",
        "S64",
        "S67",
        "S73",
        "S78",
        "S79",
        "S80"
      ],
      "status": "terealisasi"
    },
    {
      "id": "e14",
      "mapel": "M2",
      "materi": "T14",
      "kelas": "K6",
      "catatan": "",
      "realisasi": {
        "mulai": "08:00",
        "selesai": "09:55",
        "materi": "T14",
        "ketuntasan": "tuntas",
        "catatan": "",
        "kehadiran": {
          "S3": "hadir",
          "S8": "hadir",
          "S16": "izin",
          "S33": "hadir",
          "S74": "izin"
        },
        "catatanSiswa": {
          "S8": "Aktif bertanya",
          "S16": "Ada acara keluarga"
        },
        "kehadiranSubjek": {
          "U5": "hadir",
          "U10": "hadir"
        },
        "catatanSubjek": {},
        "diisiOleh": "Bu Maya",
        "diisiPada": "2026-08-14 10:36"
      },
      "nama": "IPA Kelas SMP Olimpiade",
      "jenis": "J1",
      "tanggal": "2026-08-14",
      "mulai": "08:00",
      "selesai": "10:00",
      "ruangan": "R8",
      "subjek": [
        {
          "id": "U5",
          "peran": "Pengisi"
        },
        {
          "id": "U10",
          "peran": "Support"
        }
      ],
      "siswa": [
        "S3",
        "S8",
        "S16",
        "S33",
        "S74"
      ],
      "status": "terealisasi"
    },
    {
      "id": "e15",
      "mapel": null,
      "materi": null,
      "kelas": null,
      "catatan": "Laporan perkembangan kuartal.",
      "realisasi": {
        "mulai": "13:15",
        "selesai": "14:35",
        "materi": null,
        "ketuntasan": null,
        "catatan": "Waktu terpotong karena peralatan telat siap.",
        "kehadiran": {
          "S10": "izin",
          "S68": "hadir",
          "S42": "hadir"
        },
        "catatanSiswa": {
          "S10": "Izin dari wali",
          "S68": "Masih ragu di soal cerita"
        },
        "kehadiranSubjek": {
          "U9": "hadir",
          "U11": "hadir"
        },
        "catatanSubjek": {},
        "diisiOleh": "Bu Ratih",
        "diisiPada": "2026-08-14 15:11"
      },
      "nama": "Konsultasi Wali Murid",
      "jenis": "J5",
      "tanggal": "2026-08-14",
      "mulai": "13:00",
      "selesai": "14:30",
      "ruangan": "R3",
      "subjek": [
        {
          "id": "U9",
          "peran": "Pengisi"
        },
        {
          "id": "U11",
          "peran": "Wali"
        }
      ],
      "siswa": [
        "S10",
        "S68",
        "S42"
      ],
      "status": "terealisasi"
    },
    {
      "id": "e16",
      "mapel": "M5",
      "materi": "T39",
      "kelas": "K8",
      "catatan": "",
      "realisasi": null,
      "nama": "IPS Kelas SMA Akhir Pekan",
      "jenis": "J1",
      "tanggal": "2026-08-15",
      "mulai": "09:00",
      "selesai": "11:00",
      "ruangan": "R9",
      "subjek": [
        {
          "id": "U8",
          "peran": "Pengisi"
        },
        {
          "id": "U10",
          "peran": "Support"
        }
      ],
      "siswa": [
        "S5",
        "S9",
        "S21",
        "S27",
        "S42",
        "S48",
        "S51",
        "S76"
      ],
      "status": "dibatalkan",
      "pembatalan": {
        "alasan": "Pengajar berhalangan",
        "keterangan": "Menyusul dijadwalkan ulang.",
        "pada": "2026-08-14 17:54"
      }
    },
    {
      "id": "e17",
      "mapel": "M3",
      "materi": "T21",
      "kelas": "K1",
      "catatan": "",
      "realisasi": {
        "mulai": "15:00",
        "selesai": "16:35",
        "materi": "T21",
        "ketuntasan": "tuntas",
        "catatan": "Materi tersampaikan penuh, sisa waktu untuk tanya jawab.",
        "kehadiran": {
          "S2": "hadir",
          "S6": "alpa",
          "S11": "hadir",
          "S18": "sakit",
          "S29": "hadir",
          "S31": "hadir",
          "S37": "hadir",
          "S44": "hadir",
          "S47": "izin",
          "S49": "hadir",
          "S53": "hadir",
          "S55": "izin",
          "S56": "hadir",
          "S57": "hadir",
          "S63": "alpa",
          "S65": "alpa",
          "S71": "hadir"
        },
        "catatanSiswa": {
          "S6": "Wali sudah dihubungi",
          "S18": "Izin sakit dari wali",
          "S55": "Ada acara keluarga",
          "S63": "Tidak hadir tanpa kabar",
          "S65": "Tidak hadir tanpa kabar"
        },
        "kehadiranSubjek": {
          "U7": "hadir",
          "U11": "hadir"
        },
        "catatanSubjek": {},
        "diisiOleh": "Bu Ningsih",
        "diisiPada": "2026-08-17 16:59"
      },
      "nama": "B. Indonesia Kelas SD Sore",
      "jenis": "J1",
      "tanggal": "2026-08-17",
      "mulai": "15:00",
      "selesai": "16:30",
      "ruangan": "R1",
      "subjek": [
        {
          "id": "U7",
          "peran": "Pengisi"
        },
        {
          "id": "U11",
          "peran": "Wali"
        }
      ],
      "siswa": [
        "S2",
        "S6",
        "S11",
        "S18",
        "S29",
        "S31",
        "S37",
        "S44",
        "S47",
        "S49",
        "S53",
        "S55",
        "S56",
        "S57",
        "S63",
        "S65",
        "S71"
      ],
      "status": "terealisasi"
    },
    {
      "id": "e18",
      "mapel": "M4",
      "materi": "T31",
      "kelas": "K5",
      "catatan": "",
      "realisasi": {
        "mulai": "16:05",
        "selesai": "17:25",
        "materi": "T31",
        "ketuntasan": "tidak",
        "catatan": "Diskusi kelompok berjalan bagus.",
        "kehadiran": {
          "S7": "hadir",
          "S12": "hadir",
          "S16": "izin",
          "S23": "izin",
          "S28": "hadir",
          "S33": "hadir",
          "S36": "hadir",
          "S39": "hadir",
          "S45": "alpa",
          "S46": "hadir",
          "S54": "hadir",
          "S64": "hadir",
          "S79": "hadir"
        },
        "catatanSiswa": {
          "S16": "Menyusul materi minggu depan",
          "S23": "Menyusul materi minggu depan",
          "S45": "Wali sudah dihubungi",
          "S46": "Masih ragu di soal cerita"
        },
        "kehadiranSubjek": {
          "U1": "hadir",
          "U11": "hadir"
        },
        "catatanSubjek": {},
        "diisiOleh": "Bu Sari",
        "diisiPada": "2026-08-17 18:02"
      },
      "nama": "B. Inggris Kelas SMP Sore",
      "jenis": "J1",
      "tanggal": "2026-08-17",
      "mulai": "16:00",
      "selesai": "17:30",
      "ruangan": "R6",
      "subjek": [
        {
          "id": "U1",
          "peran": "Pengisi"
        },
        {
          "id": "U11",
          "peran": "Wali"
        }
      ],
      "siswa": [
        "S7",
        "S12",
        "S16",
        "S23",
        "S28",
        "S33",
        "S36",
        "S39",
        "S45",
        "S46",
        "S54",
        "S64",
        "S79"
      ],
      "status": "terealisasi"
    },
    {
      "id": "e19",
      "mapel": "M2",
      "materi": "T11",
      "kelas": "K2",
      "catatan": "",
      "realisasi": {
        "mulai": "08:00",
        "selesai": "09:30",
        "materi": "T11",
        "ketuntasan": "tuntas",
        "catatan": "Sebagian besar sudah paham, latihan diperbanyak minggu depan.",
        "kehadiran": {
          "S1": "hadir",
          "S11": "hadir",
          "S20": "hadir",
          "S29": "sakit",
          "S37": "hadir",
          "S43": "hadir",
          "S49": "hadir",
          "S53": "hadir",
          "S55": "hadir",
          "S57": "hadir",
          "S59": "izin",
          "S68": "hadir"
        },
        "catatanSiswa": {
          "S29": "Demam, ada surat"
        },
        "kehadiranSubjek": {
          "U4": "hadir"
        },
        "catatanSubjek": {},
        "diisiOleh": "Pak Dedi",
        "diisiPada": "2026-08-18 09:42"
      },
      "nama": "IPA Kelas SD Pagi",
      "jenis": "J1",
      "tanggal": "2026-08-18",
      "mulai": "08:00",
      "selesai": "09:30",
      "ruangan": "R2",
      "subjek": [
        {
          "id": "U4",
          "peran": "Pengisi"
        }
      ],
      "siswa": [
        "S1",
        "S11",
        "S20",
        "S29",
        "S37",
        "S43",
        "S49",
        "S53",
        "S55",
        "S57",
        "S59",
        "S68"
      ],
      "status": "terealisasi"
    },
    {
      "id": "e20",
      "mapel": "M4",
      "materi": "T32",
      "kelas": "K4",
      "catatan": "",
      "realisasi": {
        "mulai": "07:55",
        "selesai": "09:30",
        "materi": "T32",
        "ketuntasan": "tidak",
        "catatan": "Perlu pengulangan di pertemuan berikutnya.",
        "kehadiran": {
          "S3": "hadir",
          "S8": "hadir",
          "S12": "izin",
          "S15": "hadir",
          "S16": "hadir",
          "S19": "izin",
          "S24": "alpa",
          "S28": "hadir",
          "S30": "hadir",
          "S33": "hadir",
          "S36": "hadir",
          "S45": "hadir",
          "S54": "hadir",
          "S64": "hadir",
          "S73": "sakit",
          "S78": "hadir",
          "S79": "hadir",
          "S80": "hadir"
        },
        "catatanSiswa": {
          "S19": "Menyusul materi minggu depan",
          "S24": "Wali sudah dihubungi",
          "S73": "Sakit perut, pulang lebih awal"
        },
        "kehadiranSubjek": {
          "U6": "hadir",
          "U10": "hadir"
        },
        "catatanSubjek": {},
        "diisiOleh": "Pak Hendra",
        "diisiPada": "2026-08-18 09:48"
      },
      "nama": "B. Inggris Kelas SMP Pagi",
      "jenis": "J1",
      "tanggal": "2026-08-18",
      "mulai": "08:00",
      "selesai": "09:30",
      "ruangan": "R4",
      "subjek": [
        {
          "id": "U6",
          "peran": "Pengisi"
        },
        {
          "id": "U10",
          "peran": "Support"
        }
      ],
      "siswa": [
        "S3",
        "S8",
        "S12",
        "S15",
        "S16",
        "S19",
        "S24",
        "S28",
        "S30",
        "S33",
        "S36",
        "S45",
        "S54",
        "S64",
        "S73",
        "S78",
        "S79",
        "S80"
      ],
      "status": "terealisasi"
    },
    {
      "id": "e21",
      "mapel": null,
      "materi": null,
      "kelas": null,
      "catatan": "",
      "realisasi": {
        "mulai": "11:00",
        "selesai": "12:00",
        "materi": null,
        "ketuntasan": null,
        "catatan": "Diskusi kelompok berjalan bagus.",
        "kehadiran": {},
        "catatanSiswa": {},
        "kehadiranSubjek": {
          "U6": "izin",
          "U2": "hadir",
          "U9": "hadir",
          "U5": "sakit",
          "U1": "hadir"
        },
        "catatanSubjek": {
          "U6": "Menyusul di sesi berikutnya",
          "U5": "Digantikan sementara"
        },
        "diisiOleh": "Pak Hendra",
        "diisiPada": "2026-08-18 12:40"
      },
      "nama": "Rapat Pengajar Mingguan",
      "jenis": "J2",
      "tanggal": "2026-08-18",
      "mulai": "11:00",
      "selesai": "12:00",
      "ruangan": "R3",
      "subjek": [
        {
          "id": "U6",
          "peran": "Pengisi"
        },
        {
          "id": "U2",
          "peran": "Support"
        },
        {
          "id": "U9",
          "peran": "Support"
        },
        {
          "id": "U5",
          "peran": "Support"
        },
        {
          "id": "U1",
          "peran": "Support"
        }
      ],
      "siswa": [],
      "status": "terealisasi"
    },
    {
      "id": "e22",
      "mapel": "M1",
      "materi": "T8",
      "kelas": "K3",
      "catatan": "",
      "realisasi": null,
      "nama": "Matematika Kelas SD Kecil",
      "jenis": "J1",
      "tanggal": "2026-08-19",
      "mulai": "08:00",
      "selesai": "09:00",
      "ruangan": "R7",
      "subjek": [
        {
          "id": "U5",
          "peran": "Pengisi"
        }
      ],
      "siswa": [
        "S18",
        "S20",
        "S40",
        "S52",
        "S71"
      ],
      "status": "dibatalkan",
      "pembatalan": {
        "alasan": "Alasan lain",
        "keterangan": "Sudah dikabarkan ke wali.",
        "pada": "2026-08-18 19:03"
      }
    },
    {
      "id": "e23",
      "mapel": "M1",
      "materi": "T1",
      "kelas": "K1",
      "catatan": "",
      "realisasi": null,
      "nama": "Matematika Kelas SD Sore",
      "jenis": "J1",
      "tanggal": "2026-08-19",
      "mulai": "08:00",
      "selesai": "09:30",
      "ruangan": "R1",
      "subjek": [
        {
          "id": "U9",
          "peran": "Pengisi"
        }
      ],
      "siswa": [
        "S2",
        "S29",
        "S41",
        "S49",
        "S53",
        "S57",
        "S63",
        "S71"
      ],
      "status": "belum"
    },
    {
      "id": "e24",
      "mapel": "M3",
      "materi": "T21",
      "kelas": "K2",
      "catatan": "",
      "realisasi": {
        "mulai": "07:55",
        "selesai": "09:20",
        "materi": "T21",
        "ketuntasan": "sebagian",
        "catatan": "Perlu pengulangan di pertemuan berikutnya.",
        "kehadiran": {
          "S29": "hadir",
          "S37": "izin",
          "S49": "hadir",
          "S53": "hadir",
          "S55": "hadir",
          "S57": "alpa",
          "S68": "alpa"
        },
        "catatanSiswa": {
          "S37": "Menyusul materi minggu depan",
          "S49": "Perlu pengulangan",
          "S57": "Wali sudah dihubungi",
          "S68": "Tidak ada kabar"
        },
        "kehadiranSubjek": {
          "U7": "hadir"
        },
        "catatanSubjek": {},
        "diisiOleh": "Bu Ningsih",
        "diisiPada": "2026-08-19 09:45"
      },
      "nama": "B. Indonesia Kelas SD Pagi",
      "jenis": "J1",
      "tanggal": "2026-08-19",
      "mulai": "08:00",
      "selesai": "09:30",
      "ruangan": "R2",
      "subjek": [
        {
          "id": "U7",
          "peran": "Pengisi"
        }
      ],
      "siswa": [
        "S29",
        "S37",
        "S49",
        "S53",
        "S55",
        "S57",
        "S68"
      ],
      "status": "terealisasi"
    },
    {
      "id": "e25",
      "mapel": "M5",
      "materi": "T42",
      "kelas": "K3",
      "catatan": "",
      "realisasi": {
        "mulai": "08:00",
        "selesai": "09:25",
        "materi": "T42",
        "ketuntasan": "tuntas",
        "catatan": "Perlu pengulangan di pertemuan berikutnya.",
        "kehadiran": {
          "S18": "izin",
          "S20": "hadir",
          "S40": "sakit",
          "S52": "izin",
          "S71": "alpa"
        },
        "catatanSiswa": {
          "S18": "Izin dari wali",
          "S40": "Sakit perut, pulang lebih awal",
          "S71": "Tidak hadir tanpa kabar"
        },
        "kehadiranSubjek": {
          "U3": "hadir",
          "U11": "hadir"
        },
        "catatanSubjek": {},
        "diisiOleh": "Bu Rina",
        "diisiPada": "2026-08-19 09:50"
      },
      "nama": "IPS Kelas SD Kecil",
      "jenis": "J1",
      "tanggal": "2026-08-19",
      "mulai": "08:00",
      "selesai": "09:30",
      "ruangan": "R3",
      "subjek": [
        {
          "id": "U3",
          "peran": "Pengisi"
        },
        {
          "id": "U11",
          "peran": "Wali"
        }
      ],
      "siswa": [
        "S18",
        "S20",
        "S40",
        "S52",
        "S71"
      ],
      "status": "terealisasi"
    },
    {
      "id": "e26",
      "mapel": "M4",
      "materi": "T31",
      "kelas": "K4",
      "catatan": "",
      "realisasi": {
        "mulai": "08:00",
        "selesai": "09:25",
        "materi": "T31",
        "ketuntasan": "tuntas",
        "catatan": "Waktu terpotong karena peralatan telat siap.",
        "kehadiran": {
          "S8": "alpa",
          "S19": "sakit",
          "S23": "hadir",
          "S54": "hadir",
          "S64": "hadir",
          "S79": "sakit"
        },
        "catatanSiswa": {
          "S8": "Wali sudah dihubungi",
          "S19": "Demam, ada surat"
        },
        "kehadiranSubjek": {
          "U6": "sakit"
        },
        "catatanSubjek": {
          "U6": "Digantikan sementara"
        },
        "diisiOleh": "Pak Hendra",
        "diisiPada": "2026-08-19 09:52"
      },
      "nama": "B. Inggris Kelas SMP Pagi",
      "jenis": "J1",
      "tanggal": "2026-08-19",
      "mulai": "08:00",
      "selesai": "09:30",
      "ruangan": "R4",
      "subjek": [
        {
          "id": "U6",
          "peran": "Pengisi"
        }
      ],
      "siswa": [
        "S8",
        "S19",
        "S23",
        "S54",
        "S64",
        "S79"
      ],
      "status": "terealisasi"
    },
    {
      "id": "e27",
      "mapel": "M6",
      "materi": "T44",
      "kelas": "K5",
      "catatan": "",
      "realisasi": {
        "mulai": "08:00",
        "selesai": "09:30",
        "materi": "T44",
        "ketuntasan": "tuntas",
        "catatan": "Sebagian besar sudah paham, latihan diperbanyak minggu depan.",
        "kehadiran": {
          "S7": "hadir",
          "S12": "hadir",
          "S16": "hadir",
          "S28": "hadir",
          "S33": "alpa",
          "S39": "izin",
          "S45": "hadir",
          "S46": "hadir",
          "S54": "hadir",
          "S64": "hadir",
          "S74": "hadir"
        },
        "catatanSiswa": {
          "S7": "Sudah paham, beri soal pengayaan",
          "S33": "Tidak ada kabar",
          "S39": "Menyusul materi minggu depan"
        },
        "kehadiranSubjek": {
          "U2": "hadir"
        },
        "catatanSubjek": {},
        "diisiOleh": "Pak Andi",
        "diisiPada": "2026-08-19 10:09"
      },
      "nama": "Seni Budaya Kelas SMP Sore",
      "jenis": "J1",
      "tanggal": "2026-08-19",
      "mulai": "08:00",
      "selesai": "09:30",
      "ruangan": "R6",
      "subjek": [
        {
          "id": "U2",
          "peran": "Pengisi"
        }
      ],
      "siswa": [
        "S7",
        "S12",
        "S16",
        "S28",
        "S33",
        "S39",
        "S45",
        "S46",
        "S54",
        "S64",
        "S74"
      ],
      "status": "terealisasi"
    },
    {
      "id": "e28",
      "mapel": "M2",
      "materi": "T18",
      "kelas": "K6",
      "catatan": "Bawa alat tulis sendiri.",
      "realisasi": {
        "mulai": "08:00",
        "selesai": "09:35",
        "materi": "T18",
        "ketuntasan": "tidak",
        "catatan": "Waktu terpotong karena peralatan telat siap.",
        "kehadiran": {
          "S3": "hadir",
          "S8": "sakit",
          "S16": "sakit",
          "S33": "hadir",
          "S74": "sakit",
          "S79": "hadir"
        },
        "catatanSiswa": {
          "S16": "Demam, ada surat",
          "S33": "Rapi mencatat",
          "S74": "Demam, ada surat"
        },
        "kehadiranSubjek": {
          "U4": "hadir",
          "U11": "hadir"
        },
        "catatanSubjek": {},
        "diisiOleh": "Pak Dedi",
        "diisiPada": "2026-08-19 10:01"
      },
      "nama": "Ujian IPA Kelas SMP Olimpiade",
      "jenis": "J4",
      "tanggal": "2026-08-19",
      "mulai": "08:00",
      "selesai": "09:30",
      "ruangan": "R8",
      "subjek": [
        {
          "id": "U4",
          "peran": "Pengisi"
        },
        {
          "id": "U11",
          "peran": "Wali"
        }
      ],
      "siswa": [
        "S3",
        "S8",
        "S16",
        "S33",
        "S74",
        "S79"
      ],
      "status": "terealisasi"
    },
    {
      "id": "e29",
      "mapel": "M2",
      "materi": "T12",
      "kelas": "K1",
      "catatan": "",
      "realisasi": {
        "mulai": "15:10",
        "selesai": "16:20",
        "materi": "T12",
        "ketuntasan": "sebagian",
        "catatan": "Sebagian besar sudah paham, latihan diperbanyak minggu depan.",
        "kehadiran": {
          "S2": "hadir",
          "S6": "hadir",
          "S18": "hadir",
          "S29": "hadir",
          "S31": "hadir",
          "S37": "hadir",
          "S41": "izin",
          "S44": "hadir",
          "S47": "izin",
          "S49": "alpa",
          "S53": "hadir",
          "S55": "hadir",
          "S56": "hadir",
          "S57": "hadir",
          "S63": "hadir",
          "S65": "izin",
          "S71": "hadir"
        },
        "catatanSiswa": {
          "S2": "Perlu pengulangan",
          "S6": "Sudah paham, beri soal pengayaan",
          "S44": "Masih ragu di soal cerita",
          "S47": "Menyusul materi minggu depan",
          "S49": "Tidak ada kabar",
          "S65": "Ada acara keluarga",
          "S71": "Aktif bertanya"
        },
        "kehadiranSubjek": {
          "U4": "hadir",
          "U11": "hadir"
        },
        "catatanSubjek": {},
        "diisiOleh": "Pak Dedi",
        "diisiPada": "2026-08-19 17:13"
      },
      "nama": "IPA Kelas SD Sore",
      "jenis": "J1",
      "tanggal": "2026-08-19",
      "mulai": "15:00",
      "selesai": "16:30",
      "ruangan": "R1",
      "subjek": [
        {
          "id": "U4",
          "peran": "Pengisi"
        },
        {
          "id": "U11",
          "peran": "Wali"
        }
      ],
      "siswa": [
        "S2",
        "S6",
        "S18",
        "S29",
        "S31",
        "S37",
        "S41",
        "S44",
        "S47",
        "S49",
        "S53",
        "S55",
        "S56",
        "S57",
        "S63",
        "S65",
        "S71"
      ],
      "status": "terealisasi"
    },
    {
      "id": "e30",
      "mapel": "M5",
      "materi": "T37",
      "kelas": "K5",
      "catatan": "",
      "realisasi": {
        "mulai": "15:55",
        "selesai": "17:30",
        "materi": "T37",
        "ketuntasan": "tidak",
        "catatan": "",
        "kehadiran": {
          "S7": "hadir",
          "S12": "hadir",
          "S16": "hadir",
          "S23": "sakit",
          "S28": "hadir",
          "S33": "hadir",
          "S36": "alpa",
          "S39": "hadir",
          "S45": "alpa",
          "S46": "hadir",
          "S54": "hadir",
          "S64": "izin",
          "S74": "hadir",
          "S79": "hadir"
        },
        "catatanSiswa": {
          "S23": "Sakit perut, pulang lebih awal",
          "S36": "Wali sudah dihubungi",
          "S45": "Wali sudah dihubungi",
          "S64": "Ada acara keluarga"
        },
        "kehadiranSubjek": {
          "U7": "hadir",
          "U11": "hadir"
        },
        "catatanSubjek": {},
        "diisiOleh": "Bu Ningsih",
        "diisiPada": "2026-08-19 17:54"
      },
      "nama": "IPS Kelas SMP Sore",
      "jenis": "J1",
      "tanggal": "2026-08-19",
      "mulai": "16:00",
      "selesai": "17:30",
      "ruangan": "R6",
      "subjek": [
        {
          "id": "U7",
          "peran": "Pengisi"
        },
        {
          "id": "U11",
          "peran": "Wali"
        }
      ],
      "siswa": [
        "S7",
        "S12",
        "S16",
        "S23",
        "S28",
        "S33",
        "S36",
        "S39",
        "S45",
        "S46",
        "S54",
        "S64",
        "S74",
        "S79"
      ],
      "status": "terealisasi"
    },
    {
      "id": "e31",
      "mapel": "M1",
      "materi": "T3",
      "kelas": "K4",
      "catatan": "",
      "realisasi": {
        "mulai": "08:15",
        "selesai": "09:35",
        "materi": "T3",
        "ketuntasan": "sebagian",
        "catatan": "Diskusi kelompok berjalan bagus.",
        "kehadiran": {
          "S3": "hadir",
          "S8": "alpa",
          "S12": "hadir",
          "S15": "izin",
          "S16": "hadir",
          "S19": "izin",
          "S23": "izin",
          "S24": "hadir",
          "S28": "sakit",
          "S30": "hadir",
          "S33": "hadir",
          "S36": "hadir",
          "S54": "hadir",
          "S64": "alpa",
          "S67": "hadir",
          "S73": "hadir",
          "S78": "hadir",
          "S79": "hadir",
          "S80": "hadir"
        },
        "catatanSiswa": {
          "S8": "Wali sudah dihubungi",
          "S19": "Menyusul materi minggu depan",
          "S23": "Ada acara keluarga",
          "S67": "Aktif bertanya",
          "S73": "Rapi mencatat"
        },
        "kehadiranSubjek": {
          "U4": "hadir",
          "U11": "izin"
        },
        "catatanSubjek": {
          "U11": "Digantikan sementara"
        },
        "diisiOleh": "Pak Dedi",
        "diisiPada": "2026-08-20 10:15"
      },
      "nama": "Matematika Kelas SMP Pagi",
      "jenis": "J1",
      "tanggal": "2026-08-20",
      "mulai": "08:00",
      "selesai": "09:30",
      "ruangan": "R4",
      "subjek": [
        {
          "id": "U4",
          "peran": "Pengisi"
        },
        {
          "id": "U11",
          "peran": "Wali"
        }
      ],
      "siswa": [
        "S3",
        "S8",
        "S12",
        "S15",
        "S16",
        "S19",
        "S23",
        "S24",
        "S28",
        "S30",
        "S33",
        "S36",
        "S54",
        "S64",
        "S67",
        "S73",
        "S78",
        "S79",
        "S80"
      ],
      "status": "terealisasi"
    },
    {
      "id": "e32",
      "mapel": "M1",
      "materi": "T4",
      "kelas": "K6",
      "catatan": "",
      "realisasi": {
        "mulai": "08:05",
        "selesai": "09:50",
        "materi": "T4",
        "ketuntasan": "sebagian",
        "catatan": "Diskusi kelompok berjalan bagus.",
        "kehadiran": {
          "S3": "hadir",
          "S8": "hadir",
          "S16": "izin",
          "S33": "hadir",
          "S74": "hadir",
          "S79": "hadir"
        },
        "catatanSiswa": {},
        "kehadiranSubjek": {
          "U9": "hadir",
          "U10": "hadir"
        },
        "catatanSubjek": {},
        "diisiOleh": "Bu Ratih",
        "diisiPada": "2026-08-21 10:33"
      },
      "nama": "Matematika Kelas SMP Olimpiade",
      "jenis": "J1",
      "tanggal": "2026-08-21",
      "mulai": "08:00",
      "selesai": "10:00",
      "ruangan": "R8",
      "subjek": [
        {
          "id": "U9",
          "peran": "Pengisi"
        },
        {
          "id": "U10",
          "peran": "Support"
        }
      ],
      "siswa": [
        "S3",
        "S8",
        "S16",
        "S33",
        "S74",
        "S79"
      ],
      "status": "terealisasi"
    },
    {
      "id": "e33",
      "mapel": null,
      "materi": null,
      "kelas": null,
      "catatan": "",
      "realisasi": null,
      "nama": "Olahraga Pagi Bersama",
      "jenis": "J3",
      "tanggal": "2026-08-22",
      "mulai": "07:00",
      "selesai": "09:00",
      "ruangan": "R5",
      "subjek": [
        {
          "id": "U10",
          "peran": "Pengisi"
        }
      ],
      "siswa": [
        "S46",
        "S54",
        "S45",
        "S52",
        "S26",
        "S12",
        "S5",
        "S58",
        "S69",
        "S49",
        "S42",
        "S14",
        "S76",
        "S39",
        "S55",
        "S10",
        "S59",
        "S74",
        "S62",
        "S77",
        "S78",
        "S61"
      ],
      "status": "belum"
    },
    {
      "id": "e34",
      "mapel": "M5",
      "materi": "T38",
      "kelas": "K5",
      "catatan": "",
      "realisasi": null,
      "nama": "IPS Kelas SMP Sore",
      "jenis": "J1",
      "tanggal": "2026-08-24",
      "mulai": "16:00",
      "selesai": "17:30",
      "ruangan": "R6",
      "subjek": [
        {
          "id": "U7",
          "peran": "Pengisi"
        }
      ],
      "siswa": [
        "S7",
        "S12",
        "S23",
        "S28",
        "S33",
        "S39",
        "S45",
        "S46",
        "S54",
        "S64",
        "S74",
        "S79"
      ],
      "status": "belum"
    },
    {
      "id": "e35",
      "mapel": null,
      "materi": null,
      "kelas": null,
      "catatan": "",
      "realisasi": {
        "mulai": "11:00",
        "selesai": "12:00",
        "materi": null,
        "ketuntasan": null,
        "catatan": "Materi tersampaikan penuh, sisa waktu untuk tanya jawab.",
        "kehadiran": {},
        "catatanSiswa": {},
        "kehadiranSubjek": {
          "U2": "hadir",
          "U4": "sakit",
          "U6": "hadir",
          "U3": "hadir"
        },
        "catatanSubjek": {
          "U4": "Digantikan sementara"
        },
        "diisiOleh": "Pak Andi",
        "diisiPada": "2026-08-25 12:34"
      },
      "nama": "Rapat Pengajar Mingguan",
      "jenis": "J2",
      "tanggal": "2026-08-25",
      "mulai": "11:00",
      "selesai": "12:00",
      "ruangan": "R3",
      "subjek": [
        {
          "id": "U2",
          "peran": "Pengisi"
        },
        {
          "id": "U4",
          "peran": "Support"
        },
        {
          "id": "U6",
          "peran": "Support"
        },
        {
          "id": "U3",
          "peran": "Support"
        }
      ],
      "siswa": [],
      "status": "terealisasi"
    },
    {
      "id": "e36",
      "mapel": "M6",
      "materi": "T44",
      "kelas": "K3",
      "catatan": "",
      "realisasi": {
        "mulai": "08:10",
        "selesai": "08:55",
        "materi": "T44",
        "ketuntasan": "tidak",
        "catatan": "Waktu terpotong karena peralatan telat siap.",
        "kehadiran": {
          "S18": "sakit",
          "S20": "sakit",
          "S40": "hadir",
          "S52": "alpa"
        },
        "catatanSiswa": {
          "S18": "Sakit perut, pulang lebih awal",
          "S20": "Demam, ada surat"
        },
        "kehadiranSubjek": {
          "U8": "hadir",
          "U11": "hadir"
        },
        "catatanSubjek": {},
        "diisiOleh": "Pak Bagus",
        "diisiPada": "2026-08-26 09:36"
      },
      "nama": "Seni Budaya Kelas SD Kecil",
      "jenis": "J1",
      "tanggal": "2026-08-26",
      "mulai": "08:00",
      "selesai": "09:00",
      "ruangan": "R7",
      "subjek": [
        {
          "id": "U8",
          "peran": "Pengisi"
        },
        {
          "id": "U11",
          "peran": "Wali"
        }
      ],
      "siswa": [
        "S18",
        "S20",
        "S40",
        "S52"
      ],
      "status": "terealisasi"
    },
    {
      "id": "e37",
      "mapel": "M2",
      "materi": "T15",
      "kelas": "K4",
      "catatan": "",
      "realisasi": {
        "mulai": "08:15",
        "selesai": "09:20",
        "materi": "T15",
        "ketuntasan": "sebagian",
        "catatan": "Diskusi kelompok berjalan bagus.",
        "kehadiran": {
          "S3": "hadir",
          "S8": "hadir",
          "S12": "hadir",
          "S15": "izin",
          "S16": "hadir",
          "S19": "hadir",
          "S23": "hadir",
          "S24": "izin",
          "S28": "hadir",
          "S30": "hadir",
          "S33": "hadir",
          "S36": "hadir",
          "S45": "hadir",
          "S54": "hadir",
          "S64": "hadir",
          "S67": "hadir",
          "S73": "hadir",
          "S78": "hadir",
          "S79": "hadir"
        },
        "catatanSiswa": {
          "S15": "Ada acara keluarga",
          "S67": "Aktif bertanya"
        },
        "kehadiranSubjek": {
          "U9": "hadir",
          "U11": "hadir"
        },
        "catatanSubjek": {},
        "diisiOleh": "Bu Ratih",
        "diisiPada": "2026-08-27 10:08"
      },
      "nama": "IPA Kelas SMP Pagi",
      "jenis": "J1",
      "tanggal": "2026-08-27",
      "mulai": "08:00",
      "selesai": "09:30",
      "ruangan": "R4",
      "subjek": [
        {
          "id": "U9",
          "peran": "Pengisi"
        },
        {
          "id": "U11",
          "peran": "Wali"
        }
      ],
      "siswa": [
        "S3",
        "S8",
        "S12",
        "S15",
        "S16",
        "S19",
        "S23",
        "S24",
        "S28",
        "S30",
        "S33",
        "S36",
        "S45",
        "S54",
        "S64",
        "S67",
        "S73",
        "S78",
        "S79"
      ],
      "status": "terealisasi"
    },
    {
      "id": "e38",
      "mapel": "M4",
      "materi": "T31",
      "kelas": "K7",
      "catatan": "",
      "realisasi": null,
      "nama": "B. Inggris Kelas SMA Intensif",
      "jenis": "J1",
      "tanggal": "2026-08-27",
      "mulai": "13:00",
      "selesai": "15:00",
      "ruangan": "R9",
      "subjek": [
        {
          "id": "U1",
          "peran": "Pengisi"
        }
      ],
      "siswa": [
        "S5",
        "S9",
        "S17",
        "S21",
        "S22",
        "S25",
        "S27",
        "S42",
        "S51",
        "S61",
        "S66",
        "S76"
      ],
      "status": "dibatalkan",
      "pembatalan": {
        "alasan": "Ruangan tidak tersedia",
        "keterangan": "Pengajar sakit mendadak.",
        "pada": "2026-08-26 19:38"
      }
    },
    {
      "id": "e39",
      "mapel": "M4",
      "materi": "T32",
      "kelas": "K8",
      "catatan": "",
      "realisasi": {
        "mulai": "09:00",
        "selesai": "11:05",
        "materi": "T32",
        "ketuntasan": "sebagian",
        "catatan": "",
        "kehadiran": {
          "S5": "hadir",
          "S9": "hadir",
          "S21": "hadir",
          "S27": "izin",
          "S42": "hadir",
          "S48": "hadir",
          "S51": "hadir",
          "S76": "hadir"
        },
        "catatanSiswa": {
          "S27": "Ada acara keluarga",
          "S48": "Sudah paham, beri soal pengayaan"
        },
        "kehadiranSubjek": {
          "U5": "hadir",
          "U10": "hadir"
        },
        "catatanSubjek": {},
        "diisiOleh": "Bu Maya",
        "diisiPada": "2026-08-29 11:34"
      },
      "nama": "B. Inggris Kelas SMA Akhir Pekan",
      "jenis": "J1",
      "tanggal": "2026-08-29",
      "mulai": "09:00",
      "selesai": "11:00",
      "ruangan": "R9",
      "subjek": [
        {
          "id": "U5",
          "peran": "Pengisi"
        },
        {
          "id": "U10",
          "peran": "Support"
        }
      ],
      "siswa": [
        "S5",
        "S9",
        "S21",
        "S27",
        "S42",
        "S48",
        "S51",
        "S76"
      ],
      "status": "terealisasi"
    },
    {
      "id": "e40",
      "mapel": "M3",
      "materi": "T24",
      "kelas": "K5",
      "catatan": "",
      "realisasi": {
        "mulai": "16:00",
        "selesai": "17:25",
        "materi": "T24",
        "ketuntasan": "tuntas",
        "catatan": "Materi tersampaikan penuh, sisa waktu untuk tanya jawab.",
        "kehadiran": {
          "S7": "hadir",
          "S12": "hadir",
          "S16": "hadir",
          "S23": "hadir",
          "S28": "hadir",
          "S33": "hadir",
          "S36": "hadir",
          "S39": "hadir",
          "S45": "sakit",
          "S46": "hadir",
          "S54": "izin",
          "S64": "hadir",
          "S74": "hadir",
          "S79": "hadir"
        },
        "catatanSiswa": {
          "S45": "Izin sakit dari wali",
          "S54": "Izin dari wali",
          "S79": "Sudah paham, beri soal pengayaan"
        },
        "kehadiranSubjek": {
          "U7": "hadir",
          "U11": "sakit"
        },
        "catatanSubjek": {
          "U11": "Digantikan sementara"
        },
        "diisiOleh": "Bu Ningsih",
        "diisiPada": "2026-08-31 17:40"
      },
      "nama": "B. Indonesia Kelas SMP Sore",
      "jenis": "J1",
      "tanggal": "2026-08-31",
      "mulai": "16:00",
      "selesai": "17:30",
      "ruangan": "R6",
      "subjek": [
        {
          "id": "U7",
          "peran": "Pengisi"
        },
        {
          "id": "U11",
          "peran": "Wali"
        }
      ],
      "siswa": [
        "S7",
        "S12",
        "S16",
        "S23",
        "S28",
        "S33",
        "S36",
        "S39",
        "S45",
        "S46",
        "S54",
        "S64",
        "S74",
        "S79"
      ],
      "status": "terealisasi"
    },
    {
      "id": "e41",
      "mapel": "M1",
      "materi": "T5",
      "kelas": "K2",
      "catatan": "",
      "realisasi": {
        "mulai": "07:55",
        "selesai": "09:30",
        "materi": "T5",
        "ketuntasan": "tuntas",
        "catatan": "",
        "kehadiran": {
          "S1": "hadir",
          "S11": "alpa",
          "S20": "sakit",
          "S29": "hadir",
          "S37": "hadir",
          "S43": "hadir",
          "S49": "hadir",
          "S53": "izin",
          "S55": "hadir",
          "S57": "sakit",
          "S59": "hadir",
          "S68": "alpa"
        },
        "catatanSiswa": {
          "S1": "Aktif bertanya",
          "S11": "Wali sudah dihubungi",
          "S20": "Izin sakit dari wali",
          "S53": "Menyusul materi minggu depan",
          "S57": "Demam, ada surat",
          "S59": "Rapi mencatat"
        },
        "kehadiranSubjek": {
          "U6": "hadir"
        },
        "catatanSubjek": {},
        "diisiOleh": "Pak Hendra",
        "diisiPada": "2026-09-01 09:46"
      },
      "nama": "Matematika Kelas SD Pagi",
      "jenis": "J1",
      "tanggal": "2026-09-01",
      "mulai": "08:00",
      "selesai": "09:30",
      "ruangan": "R2",
      "subjek": [
        {
          "id": "U6",
          "peran": "Pengisi"
        }
      ],
      "siswa": [
        "S1",
        "S11",
        "S20",
        "S29",
        "S37",
        "S43",
        "S49",
        "S53",
        "S55",
        "S57",
        "S59",
        "S68"
      ],
      "status": "terealisasi"
    },
    {
      "id": "e42",
      "mapel": null,
      "materi": null,
      "kelas": null,
      "catatan": "",
      "realisasi": {
        "mulai": "11:10",
        "selesai": "11:50",
        "materi": null,
        "ketuntasan": null,
        "catatan": "Waktu terpotong karena peralatan telat siap.",
        "kehadiran": {},
        "catatanSiswa": {},
        "kehadiranSubjek": {
          "U9": "hadir",
          "U5": "hadir",
          "U2": "hadir",
          "U1": "hadir"
        },
        "catatanSubjek": {},
        "diisiOleh": "Bu Ratih",
        "diisiPada": "2026-09-01 12:39"
      },
      "nama": "Rapat Pengajar Mingguan",
      "jenis": "J2",
      "tanggal": "2026-09-01",
      "mulai": "11:00",
      "selesai": "12:00",
      "ruangan": "R3",
      "subjek": [
        {
          "id": "U9",
          "peran": "Pengisi"
        },
        {
          "id": "U5",
          "peran": "Support"
        },
        {
          "id": "U2",
          "peran": "Support"
        },
        {
          "id": "U1",
          "peran": "Support"
        }
      ],
      "siswa": [],
      "status": "terealisasi"
    },
    {
      "id": "e43",
      "mapel": "M4",
      "materi": "T33",
      "kelas": "K7",
      "catatan": "",
      "realisasi": {
        "mulai": "12:55",
        "selesai": "14:55",
        "materi": "T33",
        "ketuntasan": "sebagian",
        "catatan": "Materi tersampaikan penuh, sisa waktu untuk tanya jawab.",
        "kehadiran": {
          "S5": "hadir",
          "S9": "izin",
          "S17": "hadir",
          "S22": "sakit",
          "S25": "hadir",
          "S27": "hadir",
          "S42": "hadir",
          "S51": "hadir",
          "S61": "hadir",
          "S66": "hadir",
          "S76": "hadir"
        },
        "catatanSiswa": {
          "S5": "Masih ragu di soal cerita",
          "S9": "Menyusul materi minggu depan",
          "S22": "Demam, ada surat",
          "S42": "Masih ragu di soal cerita"
        },
        "kehadiranSubjek": {
          "U1": "hadir",
          "U11": "sakit"
        },
        "catatanSubjek": {
          "U11": "Menyusul di sesi berikutnya"
        },
        "diisiOleh": "Bu Sari",
        "diisiPada": "2026-09-01 15:40"
      },
      "nama": "B. Inggris Kelas SMA Intensif",
      "jenis": "J1",
      "tanggal": "2026-09-01",
      "mulai": "13:00",
      "selesai": "15:00",
      "ruangan": "R9",
      "subjek": [
        {
          "id": "U1",
          "peran": "Pengisi"
        },
        {
          "id": "U11",
          "peran": "Wali"
        }
      ],
      "siswa": [
        "S5",
        "S9",
        "S17",
        "S22",
        "S25",
        "S27",
        "S42",
        "S51",
        "S61",
        "S66",
        "S76"
      ],
      "status": "terealisasi"
    },
    {
      "id": "e44",
      "mapel": "M1",
      "materi": "T7",
      "kelas": "K3",
      "catatan": "",
      "realisasi": null,
      "nama": "Matematika Kelas SD Kecil",
      "jenis": "J1",
      "tanggal": "2026-09-02",
      "mulai": "08:00",
      "selesai": "09:00",
      "ruangan": "R7",
      "subjek": [
        {
          "id": "U4",
          "peran": "Pengisi"
        }
      ],
      "siswa": [
        "S18",
        "S20",
        "S40",
        "S52",
        "S71"
      ],
      "status": "dijadwal-ulang",
      "jadwalUlangKe": "e132",
      "penjadwalanUlang": {
        "alasan": "Ruangan dipakai",
        "keterangan": "Ruangan dipakai acara lain.",
        "pada": "2026-08-31 17:38"
      }
    },
    {
      "id": "e45",
      "mapel": "M3",
      "materi": "T24",
      "kelas": "K3",
      "catatan": "",
      "realisasi": {
        "mulai": "08:00",
        "selesai": "09:30",
        "materi": "T24",
        "ketuntasan": "sebagian",
        "catatan": "Materi tersampaikan penuh, sisa waktu untuk tanya jawab.",
        "kehadiran": {
          "S18": "hadir",
          "S20": "hadir",
          "S40": "hadir",
          "S52": "izin",
          "S71": "hadir"
        },
        "catatanSiswa": {
          "S52": "Menyusul materi minggu depan"
        },
        "kehadiranSubjek": {
          "U7": "hadir",
          "U10": "hadir"
        },
        "catatanSubjek": {},
        "diisiOleh": "Bu Ningsih",
        "diisiPada": "2026-09-02 09:59"
      },
      "nama": "B. Indonesia Kelas SD Kecil",
      "jenis": "J1",
      "tanggal": "2026-09-02",
      "mulai": "08:00",
      "selesai": "09:30",
      "ruangan": "R1",
      "subjek": [
        {
          "id": "U7",
          "peran": "Pengisi"
        },
        {
          "id": "U10",
          "peran": "Support"
        }
      ],
      "siswa": [
        "S18",
        "S20",
        "S40",
        "S52",
        "S71"
      ],
      "status": "terealisasi"
    },
    {
      "id": "e46",
      "mapel": "M2",
      "materi": "T19",
      "kelas": "K4",
      "catatan": "",
      "realisasi": {
        "mulai": "08:15",
        "selesai": "09:30",
        "materi": "T19",
        "ketuntasan": "tuntas",
        "catatan": "",
        "kehadiran": {
          "S15": "hadir",
          "S16": "hadir",
          "S30": "hadir",
          "S45": "hadir",
          "S67": "sakit",
          "S73": "hadir",
          "S80": "izin"
        },
        "catatanSiswa": {
          "S80": "Menyusul materi minggu depan"
        },
        "kehadiranSubjek": {
          "U9": "hadir"
        },
        "catatanSubjek": {},
        "diisiOleh": "Bu Ratih",
        "diisiPada": "2026-09-02 10:05"
      },
      "nama": "IPA Kelas SMP Pagi",
      "jenis": "J1",
      "tanggal": "2026-09-02",
      "mulai": "08:00",
      "selesai": "09:30",
      "ruangan": "R2",
      "subjek": [
        {
          "id": "U9",
          "peran": "Pengisi"
        }
      ],
      "siswa": [
        "S15",
        "S16",
        "S30",
        "S45",
        "S67",
        "S73",
        "S80"
      ],
      "status": "terealisasi"
    },
    {
      "id": "e47",
      "mapel": "M6",
      "materi": "T45",
      "kelas": "K5",
      "catatan": "",
      "realisasi": null,
      "nama": "Seni Budaya Kelas SMP Sore",
      "jenis": "J1",
      "tanggal": "2026-09-02",
      "mulai": "08:00",
      "selesai": "09:30",
      "ruangan": "R3",
      "subjek": [
        {
          "id": "U2",
          "peran": "Pengisi"
        },
        {
          "id": "U10",
          "peran": "Support"
        }
      ],
      "siswa": [
        "S7",
        "S12",
        "S16",
        "S23",
        "S28",
        "S33",
        "S36",
        "S39",
        "S46",
        "S54",
        "S64"
      ],
      "status": "dijadwal-ulang",
      "jadwalUlangKe": "e127",
      "penjadwalanUlang": {
        "alasan": "Ruangan dipakai",
        "keterangan": "Diminta wali murid.",
        "pada": "2026-08-31 16:29"
      }
    },
    {
      "id": "e48",
      "mapel": "M1",
      "materi": "T8",
      "kelas": "K6",
      "catatan": "",
      "realisasi": {
        "mulai": "08:05",
        "selesai": "09:30",
        "materi": "T8",
        "ketuntasan": "sebagian",
        "catatan": "Sebagian besar sudah paham, latihan diperbanyak minggu depan.",
        "kehadiran": {
          "S3": "hadir",
          "S8": "hadir",
          "S16": "sakit",
          "S74": "izin",
          "S79": "hadir"
        },
        "catatanSiswa": {
          "S16": "Sakit perut, pulang lebih awal",
          "S74": "Ada acara keluarga"
        },
        "kehadiranSubjek": {
          "U4": "hadir"
        },
        "catatanSubjek": {},
        "diisiOleh": "Pak Dedi",
        "diisiPada": "2026-09-02 09:45"
      },
      "nama": "Matematika Kelas SMP Olimpiade",
      "jenis": "J1",
      "tanggal": "2026-09-02",
      "mulai": "08:00",
      "selesai": "09:30",
      "ruangan": "R4",
      "subjek": [
        {
          "id": "U4",
          "peran": "Pengisi"
        }
      ],
      "siswa": [
        "S3",
        "S8",
        "S16",
        "S74",
        "S79"
      ],
      "status": "terealisasi"
    },
    {
      "id": "e49",
      "mapel": "M5",
      "materi": "T39",
      "kelas": "K7",
      "catatan": "",
      "realisasi": null,
      "nama": "IPS Kelas SMA Intensif",
      "jenis": "J1",
      "tanggal": "2026-09-02",
      "mulai": "08:00",
      "selesai": "09:30",
      "ruangan": "R6",
      "subjek": [
        {
          "id": "U9",
          "peran": "Pengisi"
        },
        {
          "id": "U11",
          "peran": "Wali"
        }
      ],
      "siswa": [
        "S9",
        "S21",
        "S25",
        "S27",
        "S42"
      ],
      "status": "dibatalkan",
      "pembatalan": {
        "alasan": "Alasan lain",
        "keterangan": "",
        "pada": "2026-09-01 17:12"
      }
    },
    {
      "id": "e50",
      "mapel": "M4",
      "materi": "T31",
      "kelas": "K8",
      "catatan": "Bawa alat tulis sendiri.",
      "realisasi": null,
      "nama": "Ujian B. Inggris Kelas SMA Akhir Pekan",
      "jenis": "J4",
      "tanggal": "2026-09-02",
      "mulai": "08:00",
      "selesai": "09:30",
      "ruangan": "R8",
      "subjek": [
        {
          "id": "U1",
          "peran": "Pengisi"
        }
      ],
      "siswa": [
        "S5",
        "S9",
        "S21",
        "S27",
        "S42",
        "S48",
        "S51",
        "S76"
      ],
      "status": "dibatalkan",
      "pembatalan": {
        "alasan": "Pengajar berhalangan",
        "keterangan": "",
        "pada": "2026-09-01 19:53"
      }
    },
    {
      "id": "e51",
      "mapel": "M3",
      "materi": "T24",
      "kelas": "K1",
      "catatan": "",
      "realisasi": {
        "mulai": "14:55",
        "selesai": "16:25",
        "materi": "T24",
        "ketuntasan": "sebagian",
        "catatan": "Materi tersampaikan penuh, sisa waktu untuk tanya jawab.",
        "kehadiran": {
          "S2": "hadir",
          "S6": "hadir",
          "S11": "hadir",
          "S18": "hadir",
          "S29": "hadir",
          "S31": "hadir",
          "S37": "hadir",
          "S41": "hadir",
          "S44": "hadir",
          "S47": "hadir",
          "S49": "hadir",
          "S53": "sakit",
          "S55": "izin",
          "S56": "hadir",
          "S57": "izin",
          "S63": "hadir",
          "S65": "hadir",
          "S71": "hadir"
        },
        "catatanSiswa": {
          "S47": "Sudah paham, beri soal pengayaan",
          "S57": "Izin dari wali"
        },
        "kehadiranSubjek": {
          "U2": "hadir",
          "U10": "hadir"
        },
        "catatanSubjek": {},
        "diisiOleh": "Pak Andi",
        "diisiPada": "2026-09-02 16:42"
      },
      "nama": "B. Indonesia Kelas SD Sore",
      "jenis": "J1",
      "tanggal": "2026-09-02",
      "mulai": "15:00",
      "selesai": "16:30",
      "ruangan": "R1",
      "subjek": [
        {
          "id": "U2",
          "peran": "Pengisi"
        },
        {
          "id": "U10",
          "peran": "Support"
        }
      ],
      "siswa": [
        "S2",
        "S6",
        "S11",
        "S18",
        "S29",
        "S31",
        "S37",
        "S41",
        "S44",
        "S47",
        "S49",
        "S53",
        "S55",
        "S56",
        "S57",
        "S63",
        "S65",
        "S71"
      ],
      "status": "terealisasi"
    },
    {
      "id": "e52",
      "mapel": "M4",
      "materi": "T35",
      "kelas": "K5",
      "catatan": "",
      "realisasi": {
        "mulai": "16:00",
        "selesai": "17:25",
        "materi": "T35",
        "ketuntasan": "tuntas",
        "catatan": "Sebagian besar sudah paham, latihan diperbanyak minggu depan.",
        "kehadiran": {
          "S7": "alpa",
          "S12": "hadir",
          "S16": "hadir",
          "S23": "hadir",
          "S28": "hadir",
          "S33": "hadir",
          "S36": "hadir",
          "S39": "hadir",
          "S45": "hadir",
          "S46": "hadir",
          "S54": "hadir",
          "S64": "hadir",
          "S74": "hadir",
          "S79": "hadir"
        },
        "catatanSiswa": {
          "S7": "Tidak hadir tanpa kabar",
          "S28": "Masih ragu di soal cerita",
          "S33": "Rapi mencatat"
        },
        "kehadiranSubjek": {
          "U1": "hadir",
          "U10": "hadir"
        },
        "catatanSubjek": {},
        "diisiOleh": "Bu Sari",
        "diisiPada": "2026-09-02 17:43"
      },
      "nama": "B. Inggris Kelas SMP Sore",
      "jenis": "J1",
      "tanggal": "2026-09-02",
      "mulai": "16:00",
      "selesai": "17:30",
      "ruangan": "R6",
      "subjek": [
        {
          "id": "U1",
          "peran": "Pengisi"
        },
        {
          "id": "U10",
          "peran": "Support"
        }
      ],
      "siswa": [
        "S7",
        "S12",
        "S16",
        "S23",
        "S28",
        "S33",
        "S36",
        "S39",
        "S45",
        "S46",
        "S54",
        "S64",
        "S74",
        "S79"
      ],
      "status": "terealisasi"
    },
    {
      "id": "e53",
      "mapel": "M4",
      "materi": "T29",
      "kelas": "K4",
      "catatan": "",
      "realisasi": null,
      "nama": "B. Inggris Kelas SMP Pagi",
      "jenis": "J1",
      "tanggal": "2026-09-03",
      "mulai": "08:00",
      "selesai": "09:30",
      "ruangan": "R4",
      "subjek": [
        {
          "id": "U6",
          "peran": "Pengisi"
        },
        {
          "id": "U10",
          "peran": "Support"
        }
      ],
      "siswa": [
        "S3",
        "S8",
        "S12",
        "S15",
        "S16",
        "S19",
        "S23",
        "S24",
        "S28",
        "S30",
        "S33",
        "S36",
        "S45",
        "S54",
        "S64",
        "S67",
        "S73",
        "S78",
        "S79",
        "S80"
      ],
      "status": "dijadwal-ulang",
      "jadwalUlangKe": "e130",
      "penjadwalanUlang": {
        "alasan": "Bentrok agenda pengajar",
        "keterangan": "Dua pengisi ada urusan keluarga.",
        "pada": "2026-09-01 17:06"
      }
    },
    {
      "id": "e54",
      "mapel": "M3",
      "materi": "T25",
      "kelas": "K7",
      "catatan": "",
      "realisasi": {
        "mulai": "13:15",
        "selesai": "15:00",
        "materi": "T25",
        "ketuntasan": "sebagian",
        "catatan": "Diskusi kelompok berjalan bagus.",
        "kehadiran": {
          "S5": "hadir",
          "S9": "hadir",
          "S10": "izin",
          "S17": "hadir",
          "S21": "sakit",
          "S22": "hadir",
          "S25": "hadir",
          "S42": "hadir",
          "S51": "hadir",
          "S61": "hadir",
          "S76": "hadir"
        },
        "catatanSiswa": {
          "S5": "Aktif bertanya"
        },
        "kehadiranSubjek": {
          "U2": "hadir"
        },
        "catatanSubjek": {},
        "diisiOleh": "Pak Andi",
        "diisiPada": "2026-09-03 15:19"
      },
      "nama": "B. Indonesia Kelas SMA Intensif",
      "jenis": "J1",
      "tanggal": "2026-09-03",
      "mulai": "13:00",
      "selesai": "15:00",
      "ruangan": "R9",
      "subjek": [
        {
          "id": "U2",
          "peran": "Pengisi"
        }
      ],
      "siswa": [
        "S5",
        "S9",
        "S10",
        "S17",
        "S21",
        "S22",
        "S25",
        "S42",
        "S51",
        "S61",
        "S76"
      ],
      "status": "terealisasi"
    },
    {
      "id": "e55",
      "mapel": "M1",
      "materi": "T8",
      "kelas": "K6",
      "catatan": "",
      "realisasi": null,
      "nama": "Matematika Kelas SMP Olimpiade",
      "jenis": "J1",
      "tanggal": "2026-09-04",
      "mulai": "08:00",
      "selesai": "10:00",
      "ruangan": "R8",
      "subjek": [
        {
          "id": "U6",
          "peran": "Pengisi"
        }
      ],
      "siswa": [
        "S3",
        "S8",
        "S16",
        "S33",
        "S79"
      ],
      "status": "dijadwal-ulang",
      "jadwalUlangKe": "e133",
      "penjadwalanUlang": {
        "alasan": "Ruangan dipakai",
        "keterangan": "Ruangan dipakai acara lain.",
        "pada": "2026-09-02 17:10"
      }
    },
    {
      "id": "e132",
      "mapel": "M1",
      "materi": "T7",
      "kelas": "K3",
      "catatan": "Pindahan dari 2026-09-02.",
      "realisasi": {
        "mulai": "08:05",
        "selesai": "09:00",
        "materi": "T7",
        "ketuntasan": "sebagian",
        "catatan": "Materi tersampaikan penuh, sisa waktu untuk tanya jawab.",
        "kehadiran": {
          "S18": "hadir",
          "S20": "hadir",
          "S40": "hadir",
          "S52": "hadir",
          "S71": "hadir"
        },
        "catatanSiswa": {},
        "kehadiranSubjek": {
          "U4": "hadir"
        },
        "catatanSubjek": {},
        "diisiOleh": "Pak Dedi",
        "diisiPada": "2026-09-04 09:10"
      },
      "nama": "Matematika Kelas SD Kecil",
      "jenis": "J1",
      "tanggal": "2026-09-04",
      "mulai": "08:00",
      "selesai": "09:00",
      "ruangan": "R7",
      "subjek": [
        {
          "id": "U4",
          "peran": "Pengisi"
        }
      ],
      "siswa": [
        "S18",
        "S20",
        "S40",
        "S52",
        "S71"
      ],
      "status": "terealisasi",
      "jadwalUlangDari": "e44"
    },
    {
      "id": "e56",
      "mapel": null,
      "materi": null,
      "kelas": null,
      "catatan": "Laporan perkembangan kuartal.",
      "realisasi": {
        "mulai": "13:15",
        "selesai": "14:20",
        "materi": null,
        "ketuntasan": null,
        "catatan": "Sebagian besar sudah paham, latihan diperbanyak minggu depan.",
        "kehadiran": {
          "S18": "alpa",
          "S71": "izin",
          "S14": "hadir",
          "S65": "hadir"
        },
        "catatanSiswa": {
          "S18": "Tidak ada kabar",
          "S71": "Ada acara keluarga"
        },
        "kehadiranSubjek": {
          "U8": "hadir",
          "U10": "izin"
        },
        "catatanSubjek": {
          "U10": "Menyusul di sesi berikutnya"
        },
        "diisiOleh": "Pak Bagus",
        "diisiPada": "2026-09-04 14:41"
      },
      "nama": "Konsultasi Wali Murid",
      "jenis": "J5",
      "tanggal": "2026-09-04",
      "mulai": "13:00",
      "selesai": "14:30",
      "ruangan": "R3",
      "subjek": [
        {
          "id": "U8",
          "peran": "Pengisi"
        },
        {
          "id": "U10",
          "peran": "Wali"
        }
      ],
      "siswa": [
        "S18",
        "S71",
        "S14",
        "S65"
      ],
      "status": "terealisasi"
    },
    {
      "id": "e57",
      "mapel": null,
      "materi": null,
      "kelas": null,
      "catatan": "",
      "realisasi": null,
      "nama": "Olahraga Pagi Bersama",
      "jenis": "J3",
      "tanggal": "2026-09-05",
      "mulai": "07:00",
      "selesai": "09:00",
      "ruangan": "R5",
      "subjek": [
        {
          "id": "U10",
          "peran": "Pengisi"
        }
      ],
      "siswa": [
        "S47",
        "S17",
        "S78",
        "S21",
        "S63",
        "S14",
        "S57",
        "S5",
        "S55",
        "S60",
        "S53",
        "S37",
        "S11",
        "S67",
        "S77",
        "S61",
        "S72",
        "S58",
        "S71",
        "S36",
        "S35",
        "S54"
      ],
      "status": "dijadwal-ulang",
      "jadwalUlangKe": "e131",
      "penjadwalanUlang": {
        "alasan": "Alasan lain",
        "keterangan": "",
        "pada": "2026-09-03 18:04"
      }
    },
    {
      "id": "e127",
      "mapel": "M6",
      "materi": "T45",
      "kelas": "K5",
      "catatan": "Pindahan dari 2026-09-02.",
      "realisasi": null,
      "nama": "Seni Budaya Kelas SMP Sore",
      "jenis": "J1",
      "tanggal": "2026-09-05",
      "mulai": "08:00",
      "selesai": "09:30",
      "ruangan": "R3",
      "subjek": [
        {
          "id": "U2",
          "peran": "Pengisi"
        },
        {
          "id": "U10",
          "peran": "Support"
        }
      ],
      "siswa": [
        "S7",
        "S12",
        "S16",
        "S23",
        "S28",
        "S33",
        "S36",
        "S39",
        "S46",
        "S54",
        "S64"
      ],
      "status": "dijadwal-ulang",
      "jadwalUlangDari": "e47",
      "jadwalUlangKe": "e128",
      "penjadwalanUlang": {
        "alasan": "Bentrok agenda pengajar",
        "keterangan": "Ruangan dipakai acara lain.",
        "pada": "2026-09-03 15:30"
      }
    },
    {
      "id": "e58",
      "mapel": "M5",
      "materi": "T40",
      "kelas": "K8",
      "catatan": "",
      "realisasi": {
        "mulai": "09:15",
        "selesai": "10:55",
        "materi": "T40",
        "ketuntasan": "tuntas",
        "catatan": "Diskusi kelompok berjalan bagus.",
        "kehadiran": {
          "S5": "hadir",
          "S9": "hadir",
          "S21": "hadir",
          "S27": "hadir",
          "S42": "hadir",
          "S48": "hadir",
          "S51": "hadir",
          "S76": "alpa"
        },
        "catatanSiswa": {
          "S5": "Rapi mencatat",
          "S21": "Perlu pengulangan"
        },
        "kehadiranSubjek": {
          "U3": "hadir"
        },
        "catatanSubjek": {},
        "diisiOleh": "Bu Rina",
        "diisiPada": "2026-09-05 11:19"
      },
      "nama": "IPS Kelas SMA Akhir Pekan",
      "jenis": "J1",
      "tanggal": "2026-09-05",
      "mulai": "09:00",
      "selesai": "11:00",
      "ruangan": "R9",
      "subjek": [
        {
          "id": "U3",
          "peran": "Pengisi"
        }
      ],
      "siswa": [
        "S5",
        "S9",
        "S21",
        "S27",
        "S42",
        "S48",
        "S51",
        "S76"
      ],
      "status": "terealisasi"
    },
    {
      "id": "e130",
      "mapel": "M4",
      "materi": "T29",
      "kelas": "K4",
      "catatan": "Pindahan dari 2026-09-03.",
      "realisasi": {
        "mulai": "08:15",
        "selesai": "09:30",
        "materi": "T29",
        "ketuntasan": "sebagian",
        "catatan": "Perlu pengulangan di pertemuan berikutnya.",
        "kehadiran": {
          "S3": "hadir",
          "S8": "hadir",
          "S12": "hadir",
          "S15": "hadir",
          "S16": "hadir",
          "S19": "hadir",
          "S23": "hadir",
          "S24": "hadir",
          "S28": "izin",
          "S30": "hadir",
          "S33": "hadir",
          "S36": "hadir",
          "S45": "hadir",
          "S54": "hadir",
          "S64": "izin",
          "S67": "hadir",
          "S73": "hadir",
          "S78": "hadir",
          "S79": "alpa",
          "S80": "hadir"
        },
        "catatanSiswa": {
          "S28": "Ada acara keluarga",
          "S45": "Masih ragu di soal cerita",
          "S64": "Ada acara keluarga",
          "S78": "Masih ragu di soal cerita",
          "S79": "Tidak ada kabar"
        },
        "kehadiranSubjek": {
          "U6": "hadir",
          "U10": "hadir"
        },
        "catatanSubjek": {},
        "diisiOleh": "Pak Hendra",
        "diisiPada": "2026-09-07 10:12"
      },
      "nama": "B. Inggris Kelas SMP Pagi",
      "jenis": "J1",
      "tanggal": "2026-09-07",
      "mulai": "08:00",
      "selesai": "09:30",
      "ruangan": "R4",
      "subjek": [
        {
          "id": "U6",
          "peran": "Pengisi"
        },
        {
          "id": "U10",
          "peran": "Support"
        }
      ],
      "siswa": [
        "S3",
        "S8",
        "S12",
        "S15",
        "S16",
        "S19",
        "S23",
        "S24",
        "S28",
        "S30",
        "S33",
        "S36",
        "S45",
        "S54",
        "S64",
        "S67",
        "S73",
        "S78",
        "S79",
        "S80"
      ],
      "status": "terealisasi",
      "jadwalUlangDari": "e53"
    },
    {
      "id": "e59",
      "mapel": "M4",
      "materi": "T30",
      "kelas": "K5",
      "catatan": "",
      "realisasi": {
        "mulai": "16:10",
        "selesai": "17:30",
        "materi": "T30",
        "ketuntasan": "tidak",
        "catatan": "Sebagian besar sudah paham, latihan diperbanyak minggu depan.",
        "kehadiran": {
          "S7": "hadir",
          "S12": "hadir",
          "S16": "hadir",
          "S23": "hadir",
          "S28": "hadir",
          "S33": "hadir",
          "S36": "hadir",
          "S39": "hadir",
          "S45": "hadir",
          "S46": "hadir",
          "S54": "hadir",
          "S64": "alpa",
          "S74": "hadir",
          "S79": "hadir"
        },
        "catatanSiswa": {
          "S28": "Masih ragu di soal cerita",
          "S64": "Tidak ada kabar",
          "S74": "Rapi mencatat"
        },
        "kehadiranSubjek": {
          "U6": "hadir",
          "U10": "hadir"
        },
        "catatanSubjek": {},
        "diisiOleh": "Pak Hendra",
        "diisiPada": "2026-09-07 18:09"
      },
      "nama": "B. Inggris Kelas SMP Sore",
      "jenis": "J1",
      "tanggal": "2026-09-07",
      "mulai": "16:00",
      "selesai": "17:30",
      "ruangan": "R6",
      "subjek": [
        {
          "id": "U6",
          "peran": "Pengisi"
        },
        {
          "id": "U10",
          "peran": "Support"
        }
      ],
      "siswa": [
        "S7",
        "S12",
        "S16",
        "S23",
        "S28",
        "S33",
        "S36",
        "S39",
        "S45",
        "S46",
        "S54",
        "S64",
        "S74",
        "S79"
      ],
      "status": "terealisasi"
    },
    {
      "id": "e60",
      "mapel": "M4",
      "materi": "T31",
      "kelas": "K4",
      "catatan": "",
      "realisasi": {
        "mulai": "08:15",
        "selesai": "09:30",
        "materi": "T31",
        "ketuntasan": "sebagian",
        "catatan": "",
        "kehadiran": {
          "S3": "alpa",
          "S8": "hadir",
          "S12": "alpa",
          "S15": "hadir",
          "S16": "hadir",
          "S23": "izin",
          "S24": "hadir",
          "S28": "hadir",
          "S30": "izin",
          "S33": "hadir",
          "S36": "hadir",
          "S45": "hadir",
          "S54": "hadir",
          "S64": "hadir",
          "S67": "alpa",
          "S73": "hadir",
          "S78": "hadir",
          "S79": "hadir",
          "S80": "hadir"
        },
        "catatanSiswa": {
          "S3": "Tidak ada kabar",
          "S12": "Wali sudah dihubungi",
          "S23": "Izin dari wali",
          "S30": "Menyusul materi minggu depan",
          "S45": "Perlu pengulangan",
          "S54": "Perlu pengulangan",
          "S67": "Wali sudah dihubungi",
          "S73": "Aktif bertanya"
        },
        "kehadiranSubjek": {
          "U6": "hadir",
          "U11": "hadir"
        },
        "catatanSubjek": {},
        "diisiOleh": "Pak Hendra",
        "diisiPada": "2026-09-08 09:55"
      },
      "nama": "B. Inggris Kelas SMP Pagi",
      "jenis": "J1",
      "tanggal": "2026-09-08",
      "mulai": "08:00",
      "selesai": "09:30",
      "ruangan": "R4",
      "subjek": [
        {
          "id": "U6",
          "peran": "Pengisi"
        },
        {
          "id": "U11",
          "peran": "Wali"
        }
      ],
      "siswa": [
        "S3",
        "S8",
        "S12",
        "S15",
        "S16",
        "S23",
        "S24",
        "S28",
        "S30",
        "S33",
        "S36",
        "S45",
        "S54",
        "S64",
        "S67",
        "S73",
        "S78",
        "S79",
        "S80"
      ],
      "status": "terealisasi"
    },
    {
      "id": "e133",
      "mapel": "M1",
      "materi": "T8",
      "kelas": "K6",
      "catatan": "Pindahan dari 2026-09-04.",
      "realisasi": {
        "mulai": "08:00",
        "selesai": "09:55",
        "materi": "T8",
        "ketuntasan": "sebagian",
        "catatan": "Materi tersampaikan penuh, sisa waktu untuk tanya jawab.",
        "kehadiran": {
          "S3": "hadir",
          "S8": "hadir",
          "S16": "izin",
          "S33": "hadir",
          "S79": "hadir"
        },
        "catatanSiswa": {
          "S16": "Izin dari wali"
        },
        "kehadiranSubjek": {
          "U6": "hadir"
        },
        "catatanSubjek": {},
        "diisiOleh": "Pak Hendra",
        "diisiPada": "2026-09-08 10:25"
      },
      "nama": "Matematika Kelas SMP Olimpiade",
      "jenis": "J1",
      "tanggal": "2026-09-08",
      "mulai": "08:00",
      "selesai": "10:00",
      "ruangan": "R8",
      "subjek": [
        {
          "id": "U6",
          "peran": "Pengisi"
        }
      ],
      "siswa": [
        "S3",
        "S8",
        "S16",
        "S33",
        "S79"
      ],
      "status": "terealisasi",
      "jadwalUlangDari": "e55"
    },
    {
      "id": "e61",
      "mapel": null,
      "materi": null,
      "kelas": null,
      "catatan": "",
      "realisasi": {
        "mulai": "11:15",
        "selesai": "12:00",
        "materi": null,
        "ketuntasan": null,
        "catatan": "Waktu terpotong karena peralatan telat siap.",
        "kehadiran": {},
        "catatanSiswa": {},
        "kehadiranSubjek": {
          "U7": "hadir",
          "U5": "hadir",
          "U8": "hadir",
          "U4": "hadir"
        },
        "catatanSubjek": {},
        "diisiOleh": "Bu Ningsih",
        "diisiPada": "2026-09-08 12:35"
      },
      "nama": "Rapat Pengajar Mingguan",
      "jenis": "J2",
      "tanggal": "2026-09-08",
      "mulai": "11:00",
      "selesai": "12:00",
      "ruangan": "R3",
      "subjek": [
        {
          "id": "U7",
          "peran": "Pengisi"
        },
        {
          "id": "U5",
          "peran": "Support"
        },
        {
          "id": "U8",
          "peran": "Support"
        },
        {
          "id": "U4",
          "peran": "Support"
        }
      ],
      "siswa": [],
      "status": "terealisasi"
    },
    {
      "id": "e62",
      "mapel": "M3",
      "materi": "T23",
      "kelas": "K7",
      "catatan": "",
      "realisasi": {
        "mulai": "12:55",
        "selesai": "14:55",
        "materi": "T23",
        "ketuntasan": "sebagian",
        "catatan": "Diskusi kelompok berjalan bagus.",
        "kehadiran": {
          "S9": "hadir",
          "S10": "hadir",
          "S21": "sakit",
          "S22": "hadir",
          "S25": "hadir",
          "S27": "hadir",
          "S42": "hadir",
          "S51": "hadir",
          "S61": "hadir",
          "S66": "alpa",
          "S76": "hadir"
        },
        "catatanSiswa": {
          "S10": "Masih ragu di soal cerita",
          "S61": "Masih ragu di soal cerita",
          "S66": "Tidak hadir tanpa kabar"
        },
        "kehadiranSubjek": {
          "U2": "hadir"
        },
        "catatanSubjek": {},
        "diisiOleh": "Pak Andi",
        "diisiPada": "2026-09-08 15:40"
      },
      "nama": "B. Indonesia Kelas SMA Intensif",
      "jenis": "J1",
      "tanggal": "2026-09-08",
      "mulai": "13:00",
      "selesai": "15:00",
      "ruangan": "R9",
      "subjek": [
        {
          "id": "U2",
          "peran": "Pengisi"
        }
      ],
      "siswa": [
        "S9",
        "S10",
        "S21",
        "S22",
        "S25",
        "S27",
        "S42",
        "S51",
        "S61",
        "S66",
        "S76"
      ],
      "status": "terealisasi"
    },
    {
      "id": "e131",
      "mapel": null,
      "materi": null,
      "kelas": null,
      "catatan": "Pindahan dari 2026-09-05.",
      "realisasi": {
        "mulai": "07:05",
        "selesai": "09:05",
        "materi": null,
        "ketuntasan": null,
        "catatan": "",
        "kehadiran": {
          "S47": "hadir",
          "S17": "hadir",
          "S78": "izin",
          "S21": "hadir",
          "S63": "hadir",
          "S14": "hadir",
          "S57": "hadir",
          "S5": "hadir",
          "S55": "sakit",
          "S60": "hadir",
          "S53": "hadir",
          "S37": "sakit",
          "S11": "hadir",
          "S67": "hadir",
          "S77": "hadir",
          "S61": "hadir",
          "S72": "hadir",
          "S58": "hadir",
          "S71": "hadir",
          "S36": "hadir",
          "S35": "alpa",
          "S54": "alpa"
        },
        "catatanSiswa": {
          "S78": "Ada acara keluarga",
          "S55": "Izin sakit dari wali",
          "S67": "Aktif bertanya",
          "S71": "Masih ragu di soal cerita",
          "S35": "Wali sudah dihubungi",
          "S54": "Wali sudah dihubungi"
        },
        "kehadiranSubjek": {
          "U10": "hadir"
        },
        "catatanSubjek": {},
        "diisiOleh": "Pak Yudi",
        "diisiPada": "2026-09-09 09:23"
      },
      "nama": "Olahraga Pagi Bersama",
      "jenis": "J3",
      "tanggal": "2026-09-09",
      "mulai": "07:00",
      "selesai": "09:00",
      "ruangan": "R5",
      "subjek": [
        {
          "id": "U10",
          "peran": "Pengisi"
        }
      ],
      "siswa": [
        "S47",
        "S17",
        "S78",
        "S21",
        "S63",
        "S14",
        "S57",
        "S5",
        "S55",
        "S60",
        "S53",
        "S37",
        "S11",
        "S67",
        "S77",
        "S61",
        "S72",
        "S58",
        "S71",
        "S36",
        "S35",
        "S54"
      ],
      "status": "terealisasi",
      "jadwalUlangDari": "e57"
    },
    {
      "id": "e63",
      "mapel": "M6",
      "materi": "T47",
      "kelas": "K3",
      "catatan": "",
      "realisasi": null,
      "nama": "Seni Budaya Kelas SD Kecil",
      "jenis": "J1",
      "tanggal": "2026-09-09",
      "mulai": "08:00",
      "selesai": "09:00",
      "ruangan": "R7",
      "subjek": [
        {
          "id": "U8",
          "peran": "Pengisi"
        },
        {
          "id": "U11",
          "peran": "Wali"
        }
      ],
      "siswa": [
        "S18",
        "S20",
        "S40",
        "S52",
        "S71"
      ],
      "status": "belum"
    },
    {
      "id": "e64",
      "mapel": "M2",
      "materi": "T18",
      "kelas": "K1",
      "catatan": "",
      "realisasi": {
        "mulai": "15:05",
        "selesai": "16:35",
        "materi": "T18",
        "ketuntasan": "tidak",
        "catatan": "Waktu terpotong karena peralatan telat siap.",
        "kehadiran": {
          "S2": "hadir",
          "S6": "hadir",
          "S11": "sakit",
          "S18": "hadir",
          "S29": "hadir",
          "S31": "hadir",
          "S41": "hadir",
          "S44": "hadir",
          "S47": "izin",
          "S49": "hadir",
          "S53": "izin",
          "S55": "hadir",
          "S56": "hadir",
          "S57": "sakit",
          "S63": "hadir",
          "S65": "hadir",
          "S71": "alpa"
        },
        "catatanSiswa": {
          "S11": "Demam, ada surat",
          "S47": "Izin dari wali",
          "S53": "Izin dari wali",
          "S55": "Sudah paham, beri soal pengayaan",
          "S57": "Izin sakit dari wali"
        },
        "kehadiranSubjek": {
          "U6": "hadir",
          "U11": "hadir"
        },
        "catatanSubjek": {},
        "diisiOleh": "Pak Hendra",
        "diisiPada": "2026-09-09 17:12"
      },
      "nama": "IPA Kelas SD Sore",
      "jenis": "J1",
      "tanggal": "2026-09-09",
      "mulai": "15:00",
      "selesai": "16:30",
      "ruangan": "R1",
      "subjek": [
        {
          "id": "U6",
          "peran": "Pengisi"
        },
        {
          "id": "U11",
          "peran": "Wali"
        }
      ],
      "siswa": [
        "S2",
        "S6",
        "S11",
        "S18",
        "S29",
        "S31",
        "S41",
        "S44",
        "S47",
        "S49",
        "S53",
        "S55",
        "S56",
        "S57",
        "S63",
        "S65",
        "S71"
      ],
      "status": "terealisasi"
    },
    {
      "id": "e65",
      "mapel": "M5",
      "materi": "T39",
      "kelas": "K5",
      "catatan": "",
      "realisasi": {
        "mulai": "16:00",
        "selesai": "17:30",
        "materi": "T39",
        "ketuntasan": "tuntas",
        "catatan": "Sebagian besar sudah paham, latihan diperbanyak minggu depan.",
        "kehadiran": {
          "S7": "hadir",
          "S12": "sakit",
          "S16": "hadir",
          "S23": "hadir",
          "S28": "hadir",
          "S33": "hadir",
          "S36": "alpa",
          "S39": "hadir",
          "S45": "hadir",
          "S46": "izin",
          "S54": "hadir",
          "S64": "hadir",
          "S74": "hadir",
          "S79": "hadir"
        },
        "catatanSiswa": {
          "S36": "Tidak hadir tanpa kabar",
          "S45": "Aktif bertanya"
        },
        "kehadiranSubjek": {
          "U9": "hadir",
          "U11": "hadir"
        },
        "catatanSubjek": {},
        "diisiOleh": "Bu Ratih",
        "diisiPada": "2026-09-09 17:55"
      },
      "nama": "IPS Kelas SMP Sore",
      "jenis": "J1",
      "tanggal": "2026-09-09",
      "mulai": "16:00",
      "selesai": "17:30",
      "ruangan": "R6",
      "subjek": [
        {
          "id": "U9",
          "peran": "Pengisi"
        },
        {
          "id": "U11",
          "peran": "Wali"
        }
      ],
      "siswa": [
        "S7",
        "S12",
        "S16",
        "S23",
        "S28",
        "S33",
        "S36",
        "S39",
        "S45",
        "S46",
        "S54",
        "S64",
        "S74",
        "S79"
      ],
      "status": "terealisasi"
    },
    {
      "id": "e66",
      "mapel": "M1",
      "materi": "T9",
      "kelas": "K4",
      "catatan": "",
      "realisasi": {
        "mulai": "08:15",
        "selesai": "09:20",
        "materi": "T9",
        "ketuntasan": "sebagian",
        "catatan": "",
        "kehadiran": {
          "S3": "hadir",
          "S8": "hadir",
          "S12": "hadir",
          "S16": "sakit",
          "S19": "hadir",
          "S23": "izin",
          "S24": "izin",
          "S28": "hadir",
          "S30": "hadir",
          "S33": "hadir",
          "S36": "hadir",
          "S54": "hadir",
          "S64": "hadir",
          "S67": "hadir",
          "S73": "hadir",
          "S78": "hadir",
          "S79": "alpa",
          "S80": "hadir"
        },
        "catatanSiswa": {
          "S23": "Izin dari wali",
          "S24": "Izin dari wali",
          "S79": "Wali sudah dihubungi",
          "S80": "Sudah paham, beri soal pengayaan"
        },
        "kehadiranSubjek": {
          "U5": "hadir",
          "U10": "hadir"
        },
        "catatanSubjek": {},
        "diisiOleh": "Bu Maya",
        "diisiPada": "2026-09-10 09:50"
      },
      "nama": "Matematika Kelas SMP Pagi",
      "jenis": "J1",
      "tanggal": "2026-09-10",
      "mulai": "08:00",
      "selesai": "09:30",
      "ruangan": "R4",
      "subjek": [
        {
          "id": "U5",
          "peran": "Pengisi"
        },
        {
          "id": "U10",
          "peran": "Support"
        }
      ],
      "siswa": [
        "S3",
        "S8",
        "S12",
        "S16",
        "S19",
        "S23",
        "S24",
        "S28",
        "S30",
        "S33",
        "S36",
        "S54",
        "S64",
        "S67",
        "S73",
        "S78",
        "S79",
        "S80"
      ],
      "status": "terealisasi"
    },
    {
      "id": "e67",
      "mapel": "M1",
      "materi": "T6",
      "kelas": "K7",
      "catatan": "",
      "realisasi": {
        "mulai": "13:00",
        "selesai": "15:00",
        "materi": "T6",
        "ketuntasan": "sebagian",
        "catatan": "",
        "kehadiran": {
          "S5": "hadir",
          "S9": "hadir",
          "S10": "izin",
          "S21": "hadir",
          "S22": "alpa",
          "S27": "hadir",
          "S42": "hadir",
          "S51": "hadir",
          "S61": "hadir",
          "S66": "hadir",
          "S76": "hadir"
        },
        "catatanSiswa": {
          "S66": "Sudah paham, beri soal pengayaan"
        },
        "kehadiranSubjek": {
          "U5": "hadir",
          "U10": "hadir"
        },
        "catatanSubjek": {},
        "diisiOleh": "Bu Maya",
        "diisiPada": "2026-09-10 15:25"
      },
      "nama": "Matematika Kelas SMA Intensif",
      "jenis": "J1",
      "tanggal": "2026-09-10",
      "mulai": "13:00",
      "selesai": "15:00",
      "ruangan": "R9",
      "subjek": [
        {
          "id": "U5",
          "peran": "Pengisi"
        },
        {
          "id": "U10",
          "peran": "Support"
        }
      ],
      "siswa": [
        "S5",
        "S9",
        "S10",
        "S21",
        "S22",
        "S27",
        "S42",
        "S51",
        "S61",
        "S66",
        "S76"
      ],
      "status": "terealisasi"
    },
    {
      "id": "e68",
      "mapel": "M2",
      "materi": "T12",
      "kelas": "K6",
      "catatan": "",
      "realisasi": null,
      "nama": "IPA Kelas SMP Olimpiade",
      "jenis": "J1",
      "tanggal": "2026-09-11",
      "mulai": "08:00",
      "selesai": "10:00",
      "ruangan": "R8",
      "subjek": [
        {
          "id": "U9",
          "peran": "Pengisi"
        },
        {
          "id": "U10",
          "peran": "Support"
        }
      ],
      "siswa": [
        "S3",
        "S8",
        "S33",
        "S74"
      ],
      "status": "belum"
    },
    {
      "id": "e128",
      "mapel": "M6",
      "materi": "T45",
      "kelas": "K5",
      "catatan": "Pindahan dari 2026-09-05.",
      "realisasi": {
        "mulai": "08:10",
        "selesai": "09:30",
        "materi": "T45",
        "ketuntasan": "tuntas",
        "catatan": "Diskusi kelompok berjalan bagus.",
        "kehadiran": {
          "S7": "izin",
          "S12": "hadir",
          "S16": "hadir",
          "S23": "hadir",
          "S28": "hadir",
          "S33": "hadir",
          "S36": "izin",
          "S39": "alpa",
          "S46": "hadir",
          "S54": "hadir",
          "S64": "hadir"
        },
        "catatanSiswa": {
          "S33": "Rapi mencatat",
          "S39": "Wali sudah dihubungi"
        },
        "kehadiranSubjek": {
          "U2": "izin",
          "U10": "hadir"
        },
        "catatanSubjek": {
          "U2": "Digantikan sementara"
        },
        "diisiOleh": "Pak Andi",
        "diisiPada": "2026-09-11 09:44"
      },
      "nama": "Seni Budaya Kelas SMP Sore",
      "jenis": "J1",
      "tanggal": "2026-09-11",
      "mulai": "08:00",
      "selesai": "09:30",
      "ruangan": "R3",
      "subjek": [
        {
          "id": "U2",
          "peran": "Pengisi"
        },
        {
          "id": "U10",
          "peran": "Support"
        }
      ],
      "siswa": [
        "S7",
        "S12",
        "S16",
        "S23",
        "S28",
        "S33",
        "S36",
        "S39",
        "S46",
        "S54",
        "S64"
      ],
      "status": "terealisasi",
      "jadwalUlangDari": "e127"
    },
    {
      "id": "e69",
      "mapel": "M6",
      "materi": "T47",
      "kelas": "K8",
      "catatan": "",
      "realisasi": {
        "mulai": "09:00",
        "selesai": "10:55",
        "materi": "T47",
        "ketuntasan": "tuntas",
        "catatan": "Diskusi kelompok berjalan bagus.",
        "kehadiran": {
          "S5": "hadir",
          "S9": "hadir",
          "S21": "hadir",
          "S27": "hadir",
          "S42": "izin",
          "S48": "hadir",
          "S51": "sakit",
          "S76": "sakit"
        },
        "catatanSiswa": {
          "S42": "Menyusul materi minggu depan",
          "S51": "Izin sakit dari wali"
        },
        "kehadiranSubjek": {
          "U8": "hadir",
          "U10": "hadir"
        },
        "catatanSubjek": {},
        "diisiOleh": "Pak Bagus",
        "diisiPada": "2026-09-12 11:15"
      },
      "nama": "Seni Budaya Kelas SMA Akhir Pekan",
      "jenis": "J1",
      "tanggal": "2026-09-12",
      "mulai": "09:00",
      "selesai": "11:00",
      "ruangan": "R9",
      "subjek": [
        {
          "id": "U8",
          "peran": "Pengisi"
        },
        {
          "id": "U10",
          "peran": "Support"
        }
      ],
      "siswa": [
        "S5",
        "S9",
        "S21",
        "S27",
        "S42",
        "S48",
        "S51",
        "S76"
      ],
      "status": "terealisasi"
    },
    {
      "id": "e70",
      "mapel": "M2",
      "materi": "T11",
      "kelas": "K1",
      "catatan": "",
      "realisasi": {
        "mulai": "14:55",
        "selesai": "16:20",
        "materi": "T11",
        "ketuntasan": "tuntas",
        "catatan": "",
        "kehadiran": {
          "S2": "hadir",
          "S6": "hadir",
          "S11": "hadir",
          "S29": "alpa",
          "S31": "hadir",
          "S37": "hadir",
          "S41": "hadir",
          "S44": "hadir",
          "S47": "hadir",
          "S49": "hadir",
          "S53": "hadir",
          "S55": "hadir",
          "S56": "hadir",
          "S57": "hadir",
          "S63": "hadir",
          "S65": "hadir",
          "S71": "hadir"
        },
        "catatanSiswa": {
          "S2": "Aktif bertanya",
          "S29": "Wali sudah dihubungi"
        },
        "kehadiranSubjek": {
          "U9": "hadir",
          "U10": "hadir"
        },
        "catatanSubjek": {},
        "diisiOleh": "Bu Ratih",
        "diisiPada": "2026-09-14 16:48"
      },
      "nama": "IPA Kelas SD Sore",
      "jenis": "J1",
      "tanggal": "2026-09-14",
      "mulai": "15:00",
      "selesai": "16:30",
      "ruangan": "R1",
      "subjek": [
        {
          "id": "U9",
          "peran": "Pengisi"
        },
        {
          "id": "U10",
          "peran": "Support"
        }
      ],
      "siswa": [
        "S2",
        "S6",
        "S11",
        "S29",
        "S31",
        "S37",
        "S41",
        "S44",
        "S47",
        "S49",
        "S53",
        "S55",
        "S56",
        "S57",
        "S63",
        "S65",
        "S71"
      ],
      "status": "terealisasi"
    },
    {
      "id": "e71",
      "mapel": "M5",
      "materi": "T40",
      "kelas": "K5",
      "catatan": "",
      "realisasi": {
        "mulai": "16:00",
        "selesai": "17:30",
        "materi": "T40",
        "ketuntasan": "tuntas",
        "catatan": "Sebagian besar sudah paham, latihan diperbanyak minggu depan.",
        "kehadiran": {
          "S7": "hadir",
          "S12": "hadir",
          "S16": "hadir",
          "S23": "hadir",
          "S28": "sakit",
          "S33": "hadir",
          "S36": "hadir",
          "S39": "hadir",
          "S45": "hadir",
          "S46": "hadir",
          "S54": "alpa",
          "S64": "hadir",
          "S74": "sakit",
          "S79": "sakit"
        },
        "catatanSiswa": {
          "S7": "Sudah paham, beri soal pengayaan",
          "S16": "Masih ragu di soal cerita",
          "S28": "Demam, ada surat",
          "S54": "Tidak ada kabar",
          "S74": "Sakit perut, pulang lebih awal",
          "S79": "Sakit perut, pulang lebih awal"
        },
        "kehadiranSubjek": {
          "U9": "hadir",
          "U10": "hadir"
        },
        "catatanSubjek": {},
        "diisiOleh": "Bu Ratih",
        "diisiPada": "2026-09-14 17:43"
      },
      "nama": "IPS Kelas SMP Sore",
      "jenis": "J1",
      "tanggal": "2026-09-14",
      "mulai": "16:00",
      "selesai": "17:30",
      "ruangan": "R6",
      "subjek": [
        {
          "id": "U9",
          "peran": "Pengisi"
        },
        {
          "id": "U10",
          "peran": "Support"
        }
      ],
      "siswa": [
        "S7",
        "S12",
        "S16",
        "S23",
        "S28",
        "S33",
        "S36",
        "S39",
        "S45",
        "S46",
        "S54",
        "S64",
        "S74",
        "S79"
      ],
      "status": "terealisasi"
    },
    {
      "id": "e72",
      "mapel": "M5",
      "materi": "T37",
      "kelas": "K2",
      "catatan": "",
      "realisasi": {
        "mulai": "08:05",
        "selesai": "09:20",
        "materi": "T37",
        "ketuntasan": "sebagian",
        "catatan": "",
        "kehadiran": {
          "S1": "sakit",
          "S11": "hadir",
          "S37": "sakit",
          "S43": "hadir",
          "S49": "hadir",
          "S55": "sakit",
          "S57": "hadir",
          "S68": "hadir"
        },
        "catatanSiswa": {
          "S37": "Izin sakit dari wali"
        },
        "kehadiranSubjek": {
          "U7": "hadir"
        },
        "catatanSubjek": {},
        "diisiOleh": "Bu Ningsih",
        "diisiPada": "2026-09-15 10:11"
      },
      "nama": "IPS Kelas SD Pagi",
      "jenis": "J1",
      "tanggal": "2026-09-15",
      "mulai": "08:00",
      "selesai": "09:30",
      "ruangan": "R2",
      "subjek": [
        {
          "id": "U7",
          "peran": "Pengisi"
        }
      ],
      "siswa": [
        "S1",
        "S11",
        "S37",
        "S43",
        "S49",
        "S55",
        "S57",
        "S68"
      ],
      "status": "terealisasi"
    },
    {
      "id": "e73",
      "mapel": null,
      "materi": null,
      "kelas": null,
      "catatan": "",
      "realisasi": null,
      "nama": "Rapat Pengajar Mingguan",
      "jenis": "J2",
      "tanggal": "2026-09-15",
      "mulai": "11:00",
      "selesai": "12:00",
      "ruangan": "R3",
      "subjek": [
        {
          "id": "U5",
          "peran": "Pengisi"
        },
        {
          "id": "U1",
          "peran": "Support"
        },
        {
          "id": "U2",
          "peran": "Support"
        },
        {
          "id": "U7",
          "peran": "Support"
        },
        {
          "id": "U8",
          "peran": "Support"
        }
      ],
      "siswa": [],
      "status": "belum"
    },
    {
      "id": "e74",
      "mapel": "M1",
      "materi": "T10",
      "kelas": "K7",
      "catatan": "",
      "realisasi": {
        "mulai": "13:00",
        "selesai": "14:50",
        "materi": "T10",
        "ketuntasan": "sebagian",
        "catatan": "Waktu terpotong karena peralatan telat siap.",
        "kehadiran": {
          "S5": "hadir",
          "S9": "hadir",
          "S10": "sakit",
          "S17": "hadir",
          "S21": "hadir",
          "S22": "hadir",
          "S27": "hadir",
          "S42": "hadir",
          "S61": "hadir",
          "S66": "izin",
          "S76": "hadir"
        },
        "catatanSiswa": {
          "S9": "Rapi mencatat"
        },
        "kehadiranSubjek": {
          "U4": "sakit",
          "U10": "hadir"
        },
        "catatanSubjek": {
          "U4": "Menyusul di sesi berikutnya"
        },
        "diisiOleh": "Pak Dedi",
        "diisiPada": "2026-09-15 15:44"
      },
      "nama": "Matematika Kelas SMA Intensif",
      "jenis": "J1",
      "tanggal": "2026-09-15",
      "mulai": "13:00",
      "selesai": "15:00",
      "ruangan": "R9",
      "subjek": [
        {
          "id": "U4",
          "peran": "Pengisi"
        },
        {
          "id": "U10",
          "peran": "Support"
        }
      ],
      "siswa": [
        "S5",
        "S9",
        "S10",
        "S17",
        "S21",
        "S22",
        "S27",
        "S42",
        "S61",
        "S66",
        "S76"
      ],
      "status": "terealisasi"
    },
    {
      "id": "e75",
      "mapel": "M1",
      "materi": "T1",
      "kelas": "K3",
      "catatan": "",
      "realisasi": {
        "mulai": "08:00",
        "selesai": "08:55",
        "materi": "T1",
        "ketuntasan": "tuntas",
        "catatan": "Waktu terpotong karena peralatan telat siap.",
        "kehadiran": {
          "S18": "hadir",
          "S20": "hadir",
          "S40": "sakit",
          "S52": "hadir",
          "S71": "hadir"
        },
        "catatanSiswa": {
          "S18": "Perlu pengulangan",
          "S40": "Demam, ada surat"
        },
        "kehadiranSubjek": {
          "U6": "hadir"
        },
        "catatanSubjek": {},
        "diisiOleh": "Pak Hendra",
        "diisiPada": "2026-09-16 09:25"
      },
      "nama": "Matematika Kelas SD Kecil",
      "jenis": "J1",
      "tanggal": "2026-09-16",
      "mulai": "08:00",
      "selesai": "09:00",
      "ruangan": "R7",
      "subjek": [
        {
          "id": "U6",
          "peran": "Pengisi"
        }
      ],
      "siswa": [
        "S18",
        "S20",
        "S40",
        "S52",
        "S71"
      ],
      "status": "terealisasi"
    },
    {
      "id": "e76",
      "mapel": "M1",
      "materi": "T9",
      "kelas": "K5",
      "catatan": "",
      "realisasi": {
        "mulai": "08:05",
        "selesai": "09:20",
        "materi": "T9",
        "ketuntasan": "sebagian",
        "catatan": "Perlu pengulangan di pertemuan berikutnya.",
        "kehadiran": {
          "S7": "hadir",
          "S12": "hadir",
          "S16": "hadir",
          "S23": "hadir",
          "S28": "hadir",
          "S33": "hadir",
          "S39": "hadir",
          "S46": "izin",
          "S74": "hadir",
          "S79": "hadir"
        },
        "catatanSiswa": {
          "S46": "Menyusul materi minggu depan"
        },
        "kehadiranSubjek": {
          "U6": "hadir"
        },
        "catatanSubjek": {},
        "diisiOleh": "Pak Hendra",
        "diisiPada": "2026-09-16 10:04"
      },
      "nama": "Matematika Kelas SMP Sore",
      "jenis": "J1",
      "tanggal": "2026-09-16",
      "mulai": "08:00",
      "selesai": "09:30",
      "ruangan": "R1",
      "subjek": [
        {
          "id": "U6",
          "peran": "Pengisi"
        }
      ],
      "siswa": [
        "S7",
        "S12",
        "S16",
        "S23",
        "S28",
        "S33",
        "S39",
        "S46",
        "S74",
        "S79"
      ],
      "status": "terealisasi"
    },
    {
      "id": "e77",
      "mapel": "M3",
      "materi": "T23",
      "kelas": "K6",
      "catatan": "",
      "realisasi": {
        "mulai": "08:05",
        "selesai": "09:25",
        "materi": "T23",
        "ketuntasan": "tuntas",
        "catatan": "Sebagian besar sudah paham, latihan diperbanyak minggu depan.",
        "kehadiran": {
          "S3": "hadir",
          "S8": "izin",
          "S16": "hadir",
          "S74": "hadir",
          "S79": "hadir"
        },
        "catatanSiswa": {
          "S74": "Sudah paham, beri soal pengayaan"
        },
        "kehadiranSubjek": {
          "U2": "hadir",
          "U10": "hadir"
        },
        "catatanSubjek": {},
        "diisiOleh": "Pak Andi",
        "diisiPada": "2026-09-16 10:11"
      },
      "nama": "B. Indonesia Kelas SMP Olimpiade",
      "jenis": "J1",
      "tanggal": "2026-09-16",
      "mulai": "08:00",
      "selesai": "09:30",
      "ruangan": "R2",
      "subjek": [
        {
          "id": "U2",
          "peran": "Pengisi"
        },
        {
          "id": "U10",
          "peran": "Support"
        }
      ],
      "siswa": [
        "S3",
        "S8",
        "S16",
        "S74",
        "S79"
      ],
      "status": "terealisasi"
    },
    {
      "id": "e78",
      "mapel": "M5",
      "materi": "T40",
      "kelas": "K7",
      "catatan": "",
      "realisasi": null,
      "nama": "IPS Kelas SMA Intensif",
      "jenis": "J1",
      "tanggal": "2026-09-16",
      "mulai": "08:00",
      "selesai": "09:30",
      "ruangan": "R3",
      "subjek": [
        {
          "id": "U3",
          "peran": "Pengisi"
        }
      ],
      "siswa": [
        "S5",
        "S10",
        "S17",
        "S21",
        "S25",
        "S27",
        "S42",
        "S51",
        "S66",
        "S76"
      ],
      "status": "dijadwal-ulang",
      "jadwalUlangKe": "e129",
      "penjadwalanUlang": {
        "alasan": "Ruangan dipakai",
        "keterangan": "Diminta wali murid.",
        "pada": "2026-09-14 15:27"
      }
    },
    {
      "id": "e79",
      "mapel": "M4",
      "materi": "T32",
      "kelas": "K8",
      "catatan": "",
      "realisasi": {
        "mulai": "08:00",
        "selesai": "09:20",
        "materi": "T32",
        "ketuntasan": "sebagian",
        "catatan": "Perlu pengulangan di pertemuan berikutnya.",
        "kehadiran": {
          "S5": "hadir",
          "S9": "hadir",
          "S21": "izin",
          "S27": "izin",
          "S42": "izin",
          "S48": "hadir",
          "S51": "hadir",
          "S76": "izin"
        },
        "catatanSiswa": {
          "S5": "Aktif bertanya",
          "S9": "Aktif bertanya",
          "S21": "Ada acara keluarga",
          "S42": "Izin dari wali",
          "S76": "Izin dari wali"
        },
        "kehadiranSubjek": {
          "U5": "hadir",
          "U11": "hadir"
        },
        "catatanSubjek": {},
        "diisiOleh": "Bu Maya",
        "diisiPada": "2026-09-16 10:09"
      },
      "nama": "B. Inggris Kelas SMA Akhir Pekan",
      "jenis": "J1",
      "tanggal": "2026-09-16",
      "mulai": "08:00",
      "selesai": "09:30",
      "ruangan": "R4",
      "subjek": [
        {
          "id": "U5",
          "peran": "Pengisi"
        },
        {
          "id": "U11",
          "peran": "Wali"
        }
      ],
      "siswa": [
        "S5",
        "S9",
        "S21",
        "S27",
        "S42",
        "S48",
        "S51",
        "S76"
      ],
      "status": "terealisasi"
    },
    {
      "id": "e80",
      "mapel": "M2",
      "materi": "T18",
      "kelas": "K1",
      "catatan": "",
      "realisasi": {
        "mulai": "08:05",
        "selesai": "09:25",
        "materi": "T18",
        "ketuntasan": "tuntas",
        "catatan": "Perlu pengulangan di pertemuan berikutnya.",
        "kehadiran": {
          "S11": "hadir",
          "S31": "hadir",
          "S47": "hadir",
          "S53": "hadir",
          "S55": "hadir",
          "S63": "hadir",
          "S65": "hadir"
        },
        "catatanSiswa": {},
        "kehadiranSubjek": {
          "U4": "hadir",
          "U11": "hadir"
        },
        "catatanSubjek": {},
        "diisiOleh": "Pak Dedi",
        "diisiPada": "2026-09-16 10:11"
      },
      "nama": "IPA Kelas SD Sore",
      "jenis": "J1",
      "tanggal": "2026-09-16",
      "mulai": "08:00",
      "selesai": "09:30",
      "ruangan": "R6",
      "subjek": [
        {
          "id": "U4",
          "peran": "Pengisi"
        },
        {
          "id": "U11",
          "peran": "Wali"
        }
      ],
      "siswa": [
        "S11",
        "S31",
        "S47",
        "S53",
        "S55",
        "S63",
        "S65"
      ],
      "status": "terealisasi"
    },
    {
      "id": "e81",
      "mapel": "M6",
      "materi": "T47",
      "kelas": "K2",
      "catatan": "Bawa alat tulis sendiri.",
      "realisasi": {
        "mulai": "08:15",
        "selesai": "09:20",
        "materi": "T47",
        "ketuntasan": "tuntas",
        "catatan": "Diskusi kelompok berjalan bagus.",
        "kehadiran": {
          "S1": "hadir",
          "S11": "alpa",
          "S29": "hadir",
          "S37": "alpa",
          "S43": "sakit",
          "S49": "izin",
          "S53": "hadir",
          "S55": "sakit",
          "S57": "hadir",
          "S59": "hadir",
          "S68": "hadir"
        },
        "catatanSiswa": {
          "S11": "Wali sudah dihubungi",
          "S37": "Tidak hadir tanpa kabar",
          "S43": "Izin sakit dari wali",
          "S49": "Menyusul materi minggu depan",
          "S55": "Demam, ada surat"
        },
        "kehadiranSubjek": {
          "U2": "hadir",
          "U10": "hadir"
        },
        "catatanSubjek": {},
        "diisiOleh": "Pak Andi",
        "diisiPada": "2026-09-16 10:07"
      },
      "nama": "Ujian Seni Budaya Kelas SD Pagi",
      "jenis": "J4",
      "tanggal": "2026-09-16",
      "mulai": "08:00",
      "selesai": "09:30",
      "ruangan": "R8",
      "subjek": [
        {
          "id": "U2",
          "peran": "Pengisi"
        },
        {
          "id": "U10",
          "peran": "Support"
        }
      ],
      "siswa": [
        "S1",
        "S11",
        "S29",
        "S37",
        "S43",
        "S49",
        "S53",
        "S55",
        "S57",
        "S59",
        "S68"
      ],
      "status": "terealisasi"
    },
    {
      "id": "e82",
      "mapel": "M1",
      "materi": "T8",
      "kelas": "K1",
      "catatan": "",
      "realisasi": null,
      "nama": "Matematika Kelas SD Sore",
      "jenis": "J1",
      "tanggal": "2026-09-16",
      "mulai": "15:00",
      "selesai": "16:30",
      "ruangan": "R1",
      "subjek": [
        {
          "id": "U4",
          "peran": "Pengisi"
        },
        {
          "id": "U10",
          "peran": "Support"
        }
      ],
      "siswa": [
        "S2",
        "S6",
        "S11",
        "S18",
        "S29",
        "S31",
        "S37",
        "S41",
        "S44",
        "S47",
        "S49",
        "S53",
        "S55",
        "S56",
        "S57",
        "S63",
        "S65",
        "S71"
      ],
      "status": "terjadwal"
    },
    {
      "id": "e83",
      "mapel": "M3",
      "materi": "T27",
      "kelas": "K5",
      "catatan": "",
      "realisasi": null,
      "nama": "B. Indonesia Kelas SMP Sore",
      "jenis": "J1",
      "tanggal": "2026-09-16",
      "mulai": "16:00",
      "selesai": "17:30",
      "ruangan": "R6",
      "subjek": [
        {
          "id": "U2",
          "peran": "Pengisi"
        },
        {
          "id": "U11",
          "peran": "Wali"
        }
      ],
      "siswa": [
        "S7",
        "S23",
        "S28",
        "S33",
        "S36",
        "S39",
        "S46",
        "S54",
        "S64",
        "S74",
        "S79"
      ],
      "status": "terjadwal"
    },
    {
      "id": "e84",
      "mapel": "M2",
      "materi": "T13",
      "kelas": "K4",
      "catatan": "",
      "realisasi": null,
      "nama": "IPA Kelas SMP Pagi",
      "jenis": "J1",
      "tanggal": "2026-09-17",
      "mulai": "08:00",
      "selesai": "09:30",
      "ruangan": "R4",
      "subjek": [
        {
          "id": "U9",
          "peran": "Pengisi"
        },
        {
          "id": "U11",
          "peran": "Wali"
        }
      ],
      "siswa": [
        "S3",
        "S8",
        "S12",
        "S15",
        "S16",
        "S19",
        "S23",
        "S24",
        "S28",
        "S30",
        "S36",
        "S45",
        "S54",
        "S64",
        "S67",
        "S73",
        "S78"
      ],
      "status": "terjadwal"
    },
    {
      "id": "e85",
      "mapel": "M4",
      "materi": "T31",
      "kelas": "K7",
      "catatan": "",
      "realisasi": null,
      "nama": "B. Inggris Kelas SMA Intensif",
      "jenis": "J1",
      "tanggal": "2026-09-17",
      "mulai": "13:00",
      "selesai": "15:00",
      "ruangan": "R9",
      "subjek": [
        {
          "id": "U1",
          "peran": "Pengisi"
        },
        {
          "id": "U11",
          "peran": "Wali"
        }
      ],
      "siswa": [
        "S5",
        "S9",
        "S10",
        "S17",
        "S21",
        "S22",
        "S25",
        "S27",
        "S42",
        "S51",
        "S61",
        "S66",
        "S76"
      ],
      "status": "terjadwal"
    },
    {
      "id": "e86",
      "mapel": "M1",
      "materi": "T2",
      "kelas": "K6",
      "catatan": "",
      "realisasi": null,
      "nama": "Matematika Kelas SMP Olimpiade",
      "jenis": "J1",
      "tanggal": "2026-09-18",
      "mulai": "08:00",
      "selesai": "10:00",
      "ruangan": "R8",
      "subjek": [
        {
          "id": "U4",
          "peran": "Pengisi"
        },
        {
          "id": "U10",
          "peran": "Support"
        }
      ],
      "siswa": [
        "S3",
        "S8",
        "S16",
        "S33",
        "S74",
        "S79"
      ],
      "status": "terjadwal"
    },
    {
      "id": "e87",
      "mapel": null,
      "materi": null,
      "kelas": null,
      "catatan": "",
      "realisasi": null,
      "nama": "Olahraga Pagi Bersama",
      "jenis": "J3",
      "tanggal": "2026-09-19",
      "mulai": "07:00",
      "selesai": "09:00",
      "ruangan": "R5",
      "subjek": [
        {
          "id": "U10",
          "peran": "Pengisi"
        }
      ],
      "siswa": [
        "S60",
        "S72",
        "S25",
        "S80",
        "S63",
        "S50",
        "S18",
        "S51",
        "S17",
        "S5",
        "S59",
        "S68",
        "S28",
        "S58",
        "S39",
        "S30",
        "S66",
        "S20"
      ],
      "status": "terjadwal"
    },
    {
      "id": "e88",
      "mapel": "M4",
      "materi": "T32",
      "kelas": "K8",
      "catatan": "",
      "realisasi": null,
      "nama": "B. Inggris Kelas SMA Akhir Pekan",
      "jenis": "J1",
      "tanggal": "2026-09-19",
      "mulai": "09:00",
      "selesai": "11:00",
      "ruangan": "R9",
      "subjek": [
        {
          "id": "U6",
          "peran": "Pengisi"
        }
      ],
      "siswa": [
        "S5",
        "S9",
        "S21",
        "S27",
        "S42",
        "S48",
        "S51",
        "S76"
      ],
      "status": "terjadwal"
    },
    {
      "id": "e129",
      "mapel": "M5",
      "materi": "T40",
      "kelas": "K7",
      "catatan": "Pindahan dari 2026-09-16.",
      "realisasi": null,
      "nama": "IPS Kelas SMA Intensif",
      "jenis": "J1",
      "tanggal": "2026-09-21",
      "mulai": "08:00",
      "selesai": "09:30",
      "ruangan": "R3",
      "subjek": [
        {
          "id": "U3",
          "peran": "Pengisi"
        }
      ],
      "siswa": [
        "S5",
        "S10",
        "S17",
        "S21",
        "S25",
        "S27",
        "S42",
        "S51",
        "S66",
        "S76"
      ],
      "status": "terjadwal",
      "jadwalUlangDari": "e78"
    },
    {
      "id": "e89",
      "mapel": "M1",
      "materi": "T2",
      "kelas": "K1",
      "catatan": "",
      "realisasi": null,
      "nama": "Matematika Kelas SD Sore",
      "jenis": "J1",
      "tanggal": "2026-09-21",
      "mulai": "15:00",
      "selesai": "16:30",
      "ruangan": "R1",
      "subjek": [
        {
          "id": "U5",
          "peran": "Pengisi"
        },
        {
          "id": "U11",
          "peran": "Wali"
        }
      ],
      "siswa": [
        "S2",
        "S6",
        "S11",
        "S18",
        "S29",
        "S31",
        "S37",
        "S41",
        "S44",
        "S47",
        "S49",
        "S53",
        "S55",
        "S56",
        "S57",
        "S63",
        "S65",
        "S71"
      ],
      "status": "terjadwal"
    },
    {
      "id": "e90",
      "mapel": "M1",
      "materi": "T5",
      "kelas": "K2",
      "catatan": "",
      "realisasi": null,
      "nama": "Matematika Kelas SD Pagi",
      "jenis": "J1",
      "tanggal": "2026-09-22",
      "mulai": "08:00",
      "selesai": "09:30",
      "ruangan": "R2",
      "subjek": [
        {
          "id": "U4",
          "peran": "Pengisi"
        },
        {
          "id": "U11",
          "peran": "Wali"
        }
      ],
      "siswa": [
        "S1",
        "S11",
        "S20",
        "S29",
        "S37",
        "S43",
        "S49",
        "S53",
        "S55",
        "S57",
        "S59",
        "S68"
      ],
      "status": "terjadwal"
    },
    {
      "id": "e91",
      "mapel": "M2",
      "materi": "T14",
      "kelas": "K4",
      "catatan": "",
      "realisasi": null,
      "nama": "IPA Kelas SMP Pagi",
      "jenis": "J1",
      "tanggal": "2026-09-22",
      "mulai": "08:00",
      "selesai": "09:30",
      "ruangan": "R4",
      "subjek": [
        {
          "id": "U9",
          "peran": "Pengisi"
        },
        {
          "id": "U11",
          "peran": "Wali"
        }
      ],
      "siswa": [
        "S3",
        "S8",
        "S15",
        "S16",
        "S19",
        "S23",
        "S24",
        "S28",
        "S30",
        "S33",
        "S36",
        "S45",
        "S54",
        "S64",
        "S67",
        "S73",
        "S78",
        "S79",
        "S80"
      ],
      "status": "terjadwal"
    },
    {
      "id": "e92",
      "mapel": null,
      "materi": null,
      "kelas": null,
      "catatan": "",
      "realisasi": null,
      "nama": "Rapat Pengajar Mingguan",
      "jenis": "J2",
      "tanggal": "2026-09-22",
      "mulai": "11:00",
      "selesai": "12:00",
      "ruangan": "R3",
      "subjek": [
        {
          "id": "U3",
          "peran": "Pengisi"
        },
        {
          "id": "U4",
          "peran": "Support"
        },
        {
          "id": "U8",
          "peran": "Support"
        },
        {
          "id": "U1",
          "peran": "Support"
        },
        {
          "id": "U2",
          "peran": "Support"
        }
      ],
      "siswa": [],
      "status": "terjadwal"
    },
    {
      "id": "e93",
      "mapel": "M4",
      "materi": "T33",
      "kelas": "K7",
      "catatan": "",
      "realisasi": null,
      "nama": "B. Inggris Kelas SMA Intensif",
      "jenis": "J1",
      "tanggal": "2026-09-22",
      "mulai": "13:00",
      "selesai": "15:00",
      "ruangan": "R9",
      "subjek": [
        {
          "id": "U6",
          "peran": "Pengisi"
        }
      ],
      "siswa": [
        "S5",
        "S9",
        "S10",
        "S17",
        "S21",
        "S22",
        "S25",
        "S27",
        "S51",
        "S61",
        "S66",
        "S76"
      ],
      "status": "terjadwal"
    },
    {
      "id": "e94",
      "mapel": "M6",
      "materi": "T43",
      "kelas": "K3",
      "catatan": "",
      "realisasi": null,
      "nama": "Seni Budaya Kelas SD Kecil",
      "jenis": "J1",
      "tanggal": "2026-09-23",
      "mulai": "08:00",
      "selesai": "09:00",
      "ruangan": "R7",
      "subjek": [
        {
          "id": "U2",
          "peran": "Pengisi"
        }
      ],
      "siswa": [
        "S18",
        "S20",
        "S40",
        "S52",
        "S71"
      ],
      "status": "terjadwal"
    },
    {
      "id": "e95",
      "mapel": "M4",
      "materi": "T32",
      "kelas": "K5",
      "catatan": "",
      "realisasi": null,
      "nama": "B. Inggris Kelas SMP Sore",
      "jenis": "J1",
      "tanggal": "2026-09-23",
      "mulai": "16:00",
      "selesai": "17:30",
      "ruangan": "R6",
      "subjek": [
        {
          "id": "U5",
          "peran": "Pengisi"
        },
        {
          "id": "U10",
          "peran": "Support"
        }
      ],
      "siswa": [
        "S7",
        "S12",
        "S16",
        "S23",
        "S28",
        "S33",
        "S36",
        "S45",
        "S46",
        "S54",
        "S64",
        "S74",
        "S79"
      ],
      "status": "terjadwal"
    },
    {
      "id": "e96",
      "mapel": "M4",
      "materi": "T35",
      "kelas": "K4",
      "catatan": "",
      "realisasi": null,
      "nama": "B. Inggris Kelas SMP Pagi",
      "jenis": "J1",
      "tanggal": "2026-09-24",
      "mulai": "08:00",
      "selesai": "09:30",
      "ruangan": "R4",
      "subjek": [
        {
          "id": "U1",
          "peran": "Pengisi"
        },
        {
          "id": "U11",
          "peran": "Wali"
        }
      ],
      "siswa": [
        "S3",
        "S12",
        "S16",
        "S19",
        "S23",
        "S24",
        "S28",
        "S30",
        "S33",
        "S36",
        "S45",
        "S54",
        "S64",
        "S67",
        "S73",
        "S78",
        "S79",
        "S80"
      ],
      "status": "terjadwal"
    },
    {
      "id": "e97",
      "mapel": "M3",
      "materi": "T24",
      "kelas": "K7",
      "catatan": "",
      "realisasi": null,
      "nama": "B. Indonesia Kelas SMA Intensif",
      "jenis": "J1",
      "tanggal": "2026-09-24",
      "mulai": "13:00",
      "selesai": "15:00",
      "ruangan": "R9",
      "subjek": [
        {
          "id": "U2",
          "peran": "Pengisi"
        },
        {
          "id": "U10",
          "peran": "Support"
        }
      ],
      "siswa": [
        "S5",
        "S9",
        "S10",
        "S17",
        "S21",
        "S22",
        "S25",
        "S27",
        "S42",
        "S51",
        "S61",
        "S66",
        "S76"
      ],
      "status": "terjadwal"
    },
    {
      "id": "e98",
      "mapel": "M2",
      "materi": "T15",
      "kelas": "K6",
      "catatan": "",
      "realisasi": null,
      "nama": "IPA Kelas SMP Olimpiade",
      "jenis": "J1",
      "tanggal": "2026-09-25",
      "mulai": "08:00",
      "selesai": "10:00",
      "ruangan": "R8",
      "subjek": [
        {
          "id": "U6",
          "peran": "Pengisi"
        }
      ],
      "siswa": [
        "S3",
        "S8",
        "S16",
        "S33",
        "S74",
        "S79"
      ],
      "status": "terjadwal"
    },
    {
      "id": "e99",
      "mapel": null,
      "materi": null,
      "kelas": null,
      "catatan": "Laporan perkembangan kuartal.",
      "realisasi": null,
      "nama": "Konsultasi Wali Murid",
      "jenis": "J5",
      "tanggal": "2026-09-25",
      "mulai": "13:00",
      "selesai": "14:30",
      "ruangan": "R3",
      "subjek": [
        {
          "id": "U4",
          "peran": "Pengisi"
        },
        {
          "id": "U10",
          "peran": "Wali"
        }
      ],
      "siswa": [
        "S25",
        "S58",
        "S67",
        "S60",
        "S75",
        "S14"
      ],
      "status": "terjadwal"
    },
    {
      "id": "e100",
      "mapel": "M5",
      "materi": "T41",
      "kelas": "K8",
      "catatan": "",
      "realisasi": null,
      "nama": "IPS Kelas SMA Akhir Pekan",
      "jenis": "J1",
      "tanggal": "2026-09-26",
      "mulai": "09:00",
      "selesai": "11:00",
      "ruangan": "R9",
      "subjek": [
        {
          "id": "U9",
          "peran": "Pengisi"
        }
      ],
      "siswa": [
        "S5",
        "S9",
        "S21",
        "S27",
        "S42",
        "S48",
        "S51",
        "S76"
      ],
      "status": "terjadwal"
    },
    {
      "id": "e101",
      "mapel": "M3",
      "materi": "T20",
      "kelas": "K1",
      "catatan": "",
      "realisasi": null,
      "nama": "B. Indonesia Kelas SD Sore",
      "jenis": "J1",
      "tanggal": "2026-09-28",
      "mulai": "15:00",
      "selesai": "16:30",
      "ruangan": "R1",
      "subjek": [
        {
          "id": "U7",
          "peran": "Pengisi"
        },
        {
          "id": "U11",
          "peran": "Wali"
        }
      ],
      "siswa": [
        "S2",
        "S11",
        "S18",
        "S29",
        "S31",
        "S37",
        "S41",
        "S44",
        "S47",
        "S49",
        "S53",
        "S55",
        "S57",
        "S63",
        "S65",
        "S71"
      ],
      "status": "terjadwal"
    },
    {
      "id": "e102",
      "mapel": "M4",
      "materi": "T29",
      "kelas": "K5",
      "catatan": "",
      "realisasi": null,
      "nama": "B. Inggris Kelas SMP Sore",
      "jenis": "J1",
      "tanggal": "2026-09-28",
      "mulai": "16:00",
      "selesai": "17:30",
      "ruangan": "R6",
      "subjek": [
        {
          "id": "U1",
          "peran": "Pengisi"
        }
      ],
      "siswa": [
        "S12",
        "S16",
        "S23",
        "S28",
        "S33",
        "S36",
        "S45",
        "S46",
        "S54",
        "S64",
        "S74",
        "S79"
      ],
      "status": "terjadwal"
    },
    {
      "id": "e103",
      "mapel": "M2",
      "materi": "T12",
      "kelas": "K2",
      "catatan": "",
      "realisasi": null,
      "nama": "IPA Kelas SD Pagi",
      "jenis": "J1",
      "tanggal": "2026-09-29",
      "mulai": "08:00",
      "selesai": "09:30",
      "ruangan": "R2",
      "subjek": [
        {
          "id": "U5",
          "peran": "Pengisi"
        }
      ],
      "siswa": [
        "S1",
        "S11",
        "S20",
        "S29",
        "S37",
        "S43",
        "S49",
        "S53",
        "S55",
        "S57",
        "S59",
        "S68"
      ],
      "status": "terjadwal"
    },
    {
      "id": "e104",
      "mapel": "M4",
      "materi": "T30",
      "kelas": "K4",
      "catatan": "",
      "realisasi": null,
      "nama": "B. Inggris Kelas SMP Pagi",
      "jenis": "J1",
      "tanggal": "2026-09-29",
      "mulai": "08:00",
      "selesai": "09:30",
      "ruangan": "R4",
      "subjek": [
        {
          "id": "U1",
          "peran": "Pengisi"
        },
        {
          "id": "U10",
          "peran": "Support"
        }
      ],
      "siswa": [
        "S3",
        "S8",
        "S12",
        "S15",
        "S16",
        "S19",
        "S23",
        "S24",
        "S28",
        "S30",
        "S33",
        "S36",
        "S45",
        "S54",
        "S64",
        "S67",
        "S73",
        "S78",
        "S79",
        "S80"
      ],
      "status": "terjadwal"
    },
    {
      "id": "e105",
      "mapel": null,
      "materi": null,
      "kelas": null,
      "catatan": "",
      "realisasi": null,
      "nama": "Rapat Pengajar Mingguan",
      "jenis": "J2",
      "tanggal": "2026-09-29",
      "mulai": "11:00",
      "selesai": "12:00",
      "ruangan": "R3",
      "subjek": [
        {
          "id": "U9",
          "peran": "Pengisi"
        },
        {
          "id": "U7",
          "peran": "Support"
        },
        {
          "id": "U5",
          "peran": "Support"
        }
      ],
      "siswa": [],
      "status": "dibatalkan",
      "pembatalan": {
        "alasan": "Alasan lain",
        "keterangan": "",
        "pada": "2026-09-28 19:19"
      }
    },
    {
      "id": "e106",
      "mapel": "M3",
      "materi": "T25",
      "kelas": "K7",
      "catatan": "",
      "realisasi": null,
      "nama": "B. Indonesia Kelas SMA Intensif",
      "jenis": "J1",
      "tanggal": "2026-09-29",
      "mulai": "13:00",
      "selesai": "15:00",
      "ruangan": "R9",
      "subjek": [
        {
          "id": "U7",
          "peran": "Pengisi"
        },
        {
          "id": "U11",
          "peran": "Wali"
        }
      ],
      "siswa": [
        "S5",
        "S9",
        "S10",
        "S17",
        "S21",
        "S22",
        "S25",
        "S27",
        "S42",
        "S51",
        "S61",
        "S66",
        "S76"
      ],
      "status": "terjadwal"
    },
    {
      "id": "e107",
      "mapel": "M1",
      "materi": "T7",
      "kelas": "K3",
      "catatan": "",
      "realisasi": null,
      "nama": "Matematika Kelas SD Kecil",
      "jenis": "J1",
      "tanggal": "2026-09-30",
      "mulai": "08:00",
      "selesai": "09:00",
      "ruangan": "R7",
      "subjek": [
        {
          "id": "U5",
          "peran": "Pengisi"
        },
        {
          "id": "U11",
          "peran": "Wali"
        }
      ],
      "siswa": [
        "S18",
        "S20",
        "S40",
        "S71"
      ],
      "status": "terjadwal"
    },
    {
      "id": "e108",
      "mapel": "M4",
      "materi": "T33",
      "kelas": "K7",
      "catatan": "",
      "realisasi": null,
      "nama": "B. Inggris Kelas SMA Intensif",
      "jenis": "J1",
      "tanggal": "2026-09-30",
      "mulai": "08:00",
      "selesai": "09:30",
      "ruangan": "R1",
      "subjek": [
        {
          "id": "U6",
          "peran": "Pengisi"
        },
        {
          "id": "U10",
          "peran": "Support"
        }
      ],
      "siswa": [
        "S5",
        "S10",
        "S17",
        "S22",
        "S25",
        "S51",
        "S61",
        "S66",
        "S76"
      ],
      "status": "terjadwal"
    },
    {
      "id": "e109",
      "mapel": "M5",
      "materi": "T41",
      "kelas": "K8",
      "catatan": "",
      "realisasi": null,
      "nama": "IPS Kelas SMA Akhir Pekan",
      "jenis": "J1",
      "tanggal": "2026-09-30",
      "mulai": "08:00",
      "selesai": "09:30",
      "ruangan": "R2",
      "subjek": [
        {
          "id": "U8",
          "peran": "Pengisi"
        },
        {
          "id": "U11",
          "peran": "Wali"
        }
      ],
      "siswa": [
        "S9",
        "S21",
        "S27",
        "S48",
        "S51",
        "S76"
      ],
      "status": "terjadwal"
    },
    {
      "id": "e110",
      "mapel": "M6",
      "materi": "T43",
      "kelas": "K1",
      "catatan": "",
      "realisasi": null,
      "nama": "Seni Budaya Kelas SD Sore",
      "jenis": "J1",
      "tanggal": "2026-09-30",
      "mulai": "08:00",
      "selesai": "09:30",
      "ruangan": "R3",
      "subjek": [
        {
          "id": "U2",
          "peran": "Pengisi"
        }
      ],
      "siswa": [
        "S6",
        "S11",
        "S18",
        "S37",
        "S47",
        "S53"
      ],
      "status": "terjadwal"
    },
    {
      "id": "e111",
      "mapel": "M1",
      "materi": "T2",
      "kelas": "K2",
      "catatan": "",
      "realisasi": null,
      "nama": "Matematika Kelas SD Pagi",
      "jenis": "J1",
      "tanggal": "2026-09-30",
      "mulai": "08:00",
      "selesai": "09:30",
      "ruangan": "R4",
      "subjek": [
        {
          "id": "U4",
          "peran": "Pengisi"
        }
      ],
      "siswa": [
        "S11",
        "S20",
        "S55",
        "S59",
        "S68"
      ],
      "status": "dibatalkan",
      "pembatalan": {
        "alasan": "Ruangan tidak tersedia",
        "keterangan": "",
        "pada": "2026-09-29 21:52"
      }
    },
    {
      "id": "e112",
      "mapel": "M2",
      "materi": "T11",
      "kelas": "K3",
      "catatan": "",
      "realisasi": null,
      "nama": "IPA Kelas SD Kecil",
      "jenis": "J1",
      "tanggal": "2026-09-30",
      "mulai": "08:00",
      "selesai": "09:30",
      "ruangan": "R6",
      "subjek": [
        {
          "id": "U5",
          "peran": "Pengisi"
        },
        {
          "id": "U11",
          "peran": "Wali"
        }
      ],
      "siswa": [
        "S18",
        "S20",
        "S40",
        "S52",
        "S71"
      ],
      "status": "terjadwal"
    },
    {
      "id": "e113",
      "mapel": "M3",
      "materi": "T24",
      "kelas": "K4",
      "catatan": "Bawa alat tulis sendiri.",
      "realisasi": null,
      "nama": "Ujian B. Indonesia Kelas SMP Pagi",
      "jenis": "J4",
      "tanggal": "2026-09-30",
      "mulai": "08:00",
      "selesai": "09:30",
      "ruangan": "R8",
      "subjek": [
        {
          "id": "U4",
          "peran": "Pengisi"
        }
      ],
      "siswa": [
        "S16",
        "S23",
        "S45",
        "S64",
        "S78"
      ],
      "status": "terjadwal"
    },
    {
      "id": "e114",
      "mapel": "M2",
      "materi": "T15",
      "kelas": "K1",
      "catatan": "",
      "realisasi": null,
      "nama": "IPA Kelas SD Sore",
      "jenis": "J1",
      "tanggal": "2026-09-30",
      "mulai": "15:00",
      "selesai": "16:30",
      "ruangan": "R1",
      "subjek": [
        {
          "id": "U6",
          "peran": "Pengisi"
        },
        {
          "id": "U11",
          "peran": "Wali"
        }
      ],
      "siswa": [
        "S2",
        "S6",
        "S11",
        "S18",
        "S29",
        "S31",
        "S37",
        "S41",
        "S44",
        "S47",
        "S53",
        "S55",
        "S56",
        "S57",
        "S63",
        "S65",
        "S71"
      ],
      "status": "terjadwal"
    },
    {
      "id": "e115",
      "mapel": "M5",
      "materi": "T37",
      "kelas": "K5",
      "catatan": "",
      "realisasi": null,
      "nama": "IPS Kelas SMP Sore",
      "jenis": "J1",
      "tanggal": "2026-09-30",
      "mulai": "16:00",
      "selesai": "17:30",
      "ruangan": "R6",
      "subjek": [
        {
          "id": "U9",
          "peran": "Pengisi"
        },
        {
          "id": "U10",
          "peran": "Support"
        }
      ],
      "siswa": [
        "S7",
        "S12",
        "S16",
        "S23",
        "S28",
        "S33",
        "S36",
        "S39",
        "S46",
        "S54",
        "S64",
        "S74",
        "S79"
      ],
      "status": "terjadwal"
    },
    {
      "id": "e116",
      "mapel": "M1",
      "materi": "T3",
      "kelas": "K4",
      "catatan": "",
      "realisasi": null,
      "nama": "Matematika Kelas SMP Pagi",
      "jenis": "J1",
      "tanggal": "2026-10-01",
      "mulai": "08:00",
      "selesai": "09:30",
      "ruangan": "R4",
      "subjek": [
        {
          "id": "U6",
          "peran": "Pengisi"
        },
        {
          "id": "U11",
          "peran": "Wali"
        }
      ],
      "siswa": [
        "S3",
        "S8",
        "S12",
        "S15",
        "S16",
        "S19",
        "S23",
        "S24",
        "S28",
        "S30",
        "S33",
        "S36",
        "S45",
        "S54",
        "S64",
        "S67",
        "S73",
        "S78",
        "S79"
      ],
      "status": "dibatalkan",
      "pembatalan": {
        "alasan": "Libur",
        "keterangan": "Pengajar sakit mendadak.",
        "pada": "2026-09-30 20:44"
      }
    },
    {
      "id": "e117",
      "mapel": "M1",
      "materi": "T4",
      "kelas": "K7",
      "catatan": "",
      "realisasi": null,
      "nama": "Matematika Kelas SMA Intensif",
      "jenis": "J1",
      "tanggal": "2026-10-01",
      "mulai": "13:00",
      "selesai": "15:00",
      "ruangan": "R9",
      "subjek": [
        {
          "id": "U9",
          "peran": "Pengisi"
        },
        {
          "id": "U10",
          "peran": "Support"
        }
      ],
      "siswa": [
        "S5",
        "S9",
        "S10",
        "S17",
        "S21",
        "S22",
        "S27",
        "S42",
        "S51",
        "S61",
        "S66",
        "S76"
      ],
      "status": "terjadwal"
    },
    {
      "id": "e118",
      "mapel": null,
      "materi": null,
      "kelas": null,
      "catatan": "",
      "realisasi": null,
      "nama": "Olahraga Pagi Bersama",
      "jenis": "J3",
      "tanggal": "2026-10-03",
      "mulai": "07:00",
      "selesai": "09:00",
      "ruangan": "R5",
      "subjek": [
        {
          "id": "U10",
          "peran": "Pengisi"
        }
      ],
      "siswa": [
        "S78",
        "S25",
        "S47",
        "S35",
        "S40",
        "S45",
        "S68",
        "S3",
        "S12",
        "S1",
        "S26",
        "S7",
        "S32",
        "S53",
        "S71",
        "S50",
        "S19",
        "S20",
        "S52",
        "S11",
        "S51",
        "S59"
      ],
      "status": "dijadwal-ulang",
      "jadwalUlangKe": "e125",
      "penjadwalanUlang": {
        "alasan": "Ruangan dipakai",
        "keterangan": "Dua pengisi ada urusan keluarga.",
        "pada": "2026-10-01 16:46"
      }
    },
    {
      "id": "e125",
      "mapel": null,
      "materi": null,
      "kelas": null,
      "catatan": "Pindahan dari 2026-10-03.",
      "realisasi": null,
      "nama": "Olahraga Pagi Bersama",
      "jenis": "J3",
      "tanggal": "2026-10-05",
      "mulai": "07:00",
      "selesai": "09:00",
      "ruangan": "R5",
      "subjek": [
        {
          "id": "U10",
          "peran": "Pengisi"
        }
      ],
      "siswa": [
        "S78",
        "S25",
        "S47",
        "S35",
        "S40",
        "S45",
        "S68",
        "S3",
        "S12",
        "S1",
        "S26",
        "S7",
        "S32",
        "S53",
        "S71",
        "S50",
        "S19",
        "S20",
        "S52",
        "S11",
        "S51",
        "S59"
      ],
      "status": "dijadwal-ulang",
      "jadwalUlangDari": "e118",
      "jadwalUlangKe": "e126",
      "penjadwalanUlang": {
        "alasan": "Permintaan wali",
        "keterangan": "",
        "pada": "2026-10-03 16:48"
      }
    },
    {
      "id": "e119",
      "mapel": "M5",
      "materi": "T40",
      "kelas": "K2",
      "catatan": "",
      "realisasi": null,
      "nama": "IPS Kelas SD Pagi",
      "jenis": "J1",
      "tanggal": "2026-10-06",
      "mulai": "08:00",
      "selesai": "09:30",
      "ruangan": "R2",
      "subjek": [
        {
          "id": "U9",
          "peran": "Pengisi"
        }
      ],
      "siswa": [
        "S1",
        "S11",
        "S20",
        "S29",
        "S43",
        "S49",
        "S53",
        "S55",
        "S57",
        "S59",
        "S68"
      ],
      "status": "terjadwal"
    },
    {
      "id": "e120",
      "mapel": null,
      "materi": null,
      "kelas": null,
      "catatan": "",
      "realisasi": null,
      "nama": "Rapat Pengajar Mingguan",
      "jenis": "J2",
      "tanggal": "2026-10-06",
      "mulai": "11:00",
      "selesai": "12:00",
      "ruangan": "R3",
      "subjek": [
        {
          "id": "U1",
          "peran": "Pengisi"
        },
        {
          "id": "U3",
          "peran": "Support"
        },
        {
          "id": "U5",
          "peran": "Support"
        }
      ],
      "siswa": [],
      "status": "terjadwal"
    },
    {
      "id": "e121",
      "mapel": "M1",
      "materi": "T5",
      "kelas": "K7",
      "catatan": "",
      "realisasi": null,
      "nama": "Matematika Kelas SMA Intensif",
      "jenis": "J1",
      "tanggal": "2026-10-06",
      "mulai": "13:00",
      "selesai": "15:00",
      "ruangan": "R9",
      "subjek": [
        {
          "id": "U4",
          "peran": "Pengisi"
        },
        {
          "id": "U10",
          "peran": "Support"
        }
      ],
      "siswa": [
        "S5",
        "S9",
        "S17",
        "S21",
        "S22",
        "S25",
        "S27",
        "S42",
        "S51",
        "S61",
        "S66",
        "S76"
      ],
      "status": "terjadwal"
    },
    {
      "id": "e122",
      "mapel": "M6",
      "materi": "T44",
      "kelas": "K3",
      "catatan": "",
      "realisasi": null,
      "nama": "Seni Budaya Kelas SD Kecil",
      "jenis": "J1",
      "tanggal": "2026-10-07",
      "mulai": "08:00",
      "selesai": "09:00",
      "ruangan": "R7",
      "subjek": [
        {
          "id": "U8",
          "peran": "Pengisi"
        }
      ],
      "siswa": [
        "S20",
        "S40",
        "S52"
      ],
      "status": "terjadwal"
    },
    {
      "id": "e123",
      "mapel": "M1",
      "materi": "T8",
      "kelas": "K1",
      "catatan": "",
      "realisasi": null,
      "nama": "Matematika Kelas SD Sore",
      "jenis": "J1",
      "tanggal": "2026-10-07",
      "mulai": "15:00",
      "selesai": "16:30",
      "ruangan": "R1",
      "subjek": [
        {
          "id": "U4",
          "peran": "Pengisi"
        },
        {
          "id": "U11",
          "peran": "Wali"
        }
      ],
      "siswa": [
        "S2",
        "S6",
        "S11",
        "S29",
        "S31",
        "S37",
        "S41",
        "S47",
        "S49",
        "S53",
        "S55",
        "S56",
        "S57",
        "S63",
        "S65",
        "S71"
      ],
      "status": "terjadwal"
    },
    {
      "id": "e124",
      "mapel": "M3",
      "materi": "T22",
      "kelas": "K5",
      "catatan": "",
      "realisasi": null,
      "nama": "B. Indonesia Kelas SMP Sore",
      "jenis": "J1",
      "tanggal": "2026-10-07",
      "mulai": "16:00",
      "selesai": "17:30",
      "ruangan": "R6",
      "subjek": [
        {
          "id": "U2",
          "peran": "Pengisi"
        }
      ],
      "siswa": [
        "S12",
        "S16",
        "S23",
        "S33",
        "S36",
        "S39",
        "S45",
        "S46",
        "S54",
        "S64",
        "S74",
        "S79"
      ],
      "status": "terjadwal"
    },
    {
      "id": "e126",
      "mapel": null,
      "materi": null,
      "kelas": null,
      "catatan": "Pindahan dari 2026-10-05.",
      "realisasi": null,
      "nama": "Olahraga Pagi Bersama",
      "jenis": "J3",
      "tanggal": "2026-10-11",
      "mulai": "07:00",
      "selesai": "09:00",
      "ruangan": "R5",
      "subjek": [
        {
          "id": "U10",
          "peran": "Pengisi"
        }
      ],
      "siswa": [
        "S78",
        "S25",
        "S47",
        "S35",
        "S40",
        "S45",
        "S68",
        "S3",
        "S12",
        "S1",
        "S26",
        "S7",
        "S32",
        "S53",
        "S71",
        "S50",
        "S19",
        "S20",
        "S52",
        "S11",
        "S51",
        "S59"
      ],
      "status": "terjadwal",
      "jadwalUlangDari": "e125"
    }
  ]
};
