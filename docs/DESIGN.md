# Bandrek — Design System & Acuan Implementasi

Aplikasi desktop pencatatan kegiatan bimbel. Offline, Tauri + WebView2 (Windows), target 1366×768 @ 100–125%.

Dokumen ini adalah acuan implementasi. Rujukan visualnya:

| Dokumen | Isi |
| --- | --- |
| `Bandrek DS Spesifikasi.dc.html` | token, komponen, pattern, aturan copy (tampilan) |
| `Bandrek Hi-Fi Batch A.dc.html` | A1–A9: kerangka, kalender, kegiatan, realisasi, matriks |
| `Bandrek Hi-Fi Batch B.dc.html` | B1–B6: data master, profil, keadaan khusus |
| `Bandrek Wireframe Batch A.dc.html` | struktur & alur (referensi historis) |

---

## 1. Prinsip

1. **Nyaman berjam-jam, bukan dekoratif.** Latar netral, satu warna aksen, warna lain hanya untuk arti.
2. **Warna tidak pernah satu-satunya penanda.** Setiap status punya ikon atau teks (WCAG AA, aman untuk cetak hitam-putih dan buta warna).
3. **Tidak ada penghapusan data kegiatan.** Yang ada: nonaktifkan, batalkan, jadwalkan ulang — semuanya menyisakan jejak.
4. **Peringatan tidak memblokir; error memblokir.** Bentrok ruangan, beban berlebih, jam di luar ketersediaan = peringatan. Isian tidak valid = error.
5. **Angka sebelum keputusan.** Setiap aksi berdampak menyebutkan jumlahnya ("18 kegiatan tetap tersimpan", "4 siswa").

---

## 2. Token

### 2.1 CSS variables

```css
:root {
  /* Font */
  --font-sans: "Segoe UI Variable Text", "Segoe UI", system-ui, sans-serif;
  --font-mono: "Cascadia Mono", Consolas, monospace;

  /* Brand & permukaan */
  --color-brand:          #0F6CBD;
  --color-brand-pressed:  #115EA3;
  --color-brand-subtle:   #EBF3FC;
  --color-brand-ink:      #0C548F;
  --color-surface:        #FFFFFF;
  --color-surface-alt:    #FAFAFA;
  --color-surface-sunken: #EDEBE9;
  --color-canvas:         #F5F5F5;

  /* Teks & garis */
  --color-text:           #242424;
  --color-text-secondary: #424242;
  --color-text-muted:     #5C5A58;
  --color-icon-faint:     #8A8886;
  --color-border:         #E1DFDD;
  --color-border-strong:  #C8C6C4;
  --color-border-subtle:  #EDEBE9;
  --color-focus-ring:     #242424;

  /* Semantik (sukses & peringatan mengikuti PrimeNG Ultima) */
  --color-success:        #4CAF50;
  --color-success-bg:     #E8F5E9;
  --color-success-ink:    #2E7D32;
  --color-warning:        #F0A82E;
  --color-warning-bg:     #FFF3E0;
  --color-warning-ink:    #8A5200;
  --color-danger:         #C50F1F;
  --color-danger-bg:      #FDE7E9;
  --color-danger-ink:     #9B0C18;
  --color-info:           #0F6CBD;
  --color-info-bg:        #EBF3FC;
  --color-info-ink:       #0C548F;

  /* Status kehadiran */
  --color-status-hadir:      #4CAF50;  --color-status-hadir-bg: #E8F5E9;  --color-status-hadir-ink: #2E7D32;
  --color-status-sakit:      #F0A82E;  --color-status-sakit-bg: #FFF3E0;  --color-status-sakit-ink: #8A5200;
  --color-status-izin:       #0F6CBD;  --color-status-izin-bg:  #EBF3FC;  --color-status-izin-ink:  #0C548F;
  --color-status-alpa:       #C50F1F;  --color-status-alpa-bg:  #FDE7E9;  --color-status-alpa-ink:  #9B0C18;

  /* Status kegiatan */
  --color-event-terjadwal:      #0F6CBD;
  --color-event-belum:          #F0A82E;
  --color-event-terealisasi:    #4CAF50;
  --color-event-dibatalkan:     #C8C6C4;
  --color-event-dijadwal-ulang: #8764B8;

  /* Jenis kegiatan — 8 penanda kalender (garis kiri / latar / teks) */
  --color-jenis-pembelajaran: #0F6CBD; --color-jenis-pembelajaran-bg: #EBF3FC; --color-jenis-pembelajaran-ink: #0C548F;
  --color-jenis-rapat:        #8764B8; --color-jenis-rapat-bg:        #F3EFFA; --color-jenis-rapat-ink:        #5B4394;
  --color-jenis-olahraga:     #4CAF50; --color-jenis-olahraga-bg:     #E8F5E9; --color-jenis-olahraga-ink:     #2E7D32;
  --color-jenis-ujian:        #C50F1F; --color-jenis-ujian-bg:        #FDE7E9; --color-jenis-ujian-ink:        #9B0C18;
  --color-jenis-kunjungan:    #F0A82E; --color-jenis-kunjungan-bg:    #FFF3E0; --color-jenis-kunjungan-ink:    #8A5200;
  --color-jenis-konsultasi:   #038387; --color-jenis-konsultasi-bg:   #E0F4F4; --color-jenis-konsultasi-ink:   #02686B;
  --color-jenis-pelatihan:    #4F6BED; --color-jenis-pelatihan-bg:    #EDEFFC; --color-jenis-pelatihan-ink:    #3B52B8;
  --color-jenis-lainnya:      #605E5C; --color-jenis-lainnya-bg:      #EDEBE9; --color-jenis-lainnya-ink:      #424242;

  /* Spacing */
  --space-0: 2px;  --space-1: 4px;  --space-2: 8px;
  --space-3: 12px; --space-4: 16px; --space-5: 24px; --space-6: 32px;

  /* Radius */
  --radius-sm: 2px;   /* blok kalender, sel matriks */
  --radius-md: 4px;   /* tombol, isian, chip kotak */
  --radius-lg: 6px;   /* kotak pesan, kartu kecil */
  --radius-xl: 8px;   /* panel, dialog, kartu besar */
  --radius-pill: 999px;

  /* Border */
  --border-hairline: 1px solid var(--color-border-subtle); /* garis antar baris */
  --border-default:  1px solid var(--color-border);        /* pemisah area */
  --border-control:  1px solid var(--color-border-strong); /* isian & tombol */

  /* Elevation */
  --shadow-raised:  0 1px 2px rgba(0,0,0,.08);                       /* blok kalender */
  --shadow-toast:   0 4px 8px rgba(0,0,0,.12);
  --shadow-overlay: 0 8px 16px rgba(0,0,0,.14), 0 0 2px rgba(0,0,0,.12); /* dialog, panel, popover */
  --scrim:          rgba(36,36,36,.32);

  /* Motion */
  --dur-instant: 0ms;    /* ganti status, centang */
  --dur-fast:    120ms;  /* hover, fokus, chip */
  --dur-normal:  180ms;  /* popover, dropdown, toast */
  --dur-slow:    240ms;  /* panel samping, dialog */
  --ease-out:    cubic-bezier(.16,1,.3,1);
  --ease-in-out: cubic-bezier(.4,0,.2,1);
}
```

`prefers-reduced-motion: reduce` → semua durasi 0, transisi hanya opacity.

### 2.2 Tipografi

| Token | Ukuran/Weight/Line-height | Pemakaian |
| --- | --- | --- |
| `--text-title` | 22 / 600 / 1.25 | judul halaman |
| `--text-section` | 18 / 600 / 1.3 | judul bagian, header layar |
| `--text-card` | 15 / 600 / 1.4 | judul kartu & dialog |
| `--text-body` | 13.5 / 400 / 1.5 | teks isi, isian form |
| `--text-table` | 12.5 / 400 / 1.4 | baris tabel |
| `--text-dense` | 12 / 400 / 1.35 | blok kalender |
| `--text-label` | 11 / 600 / 1.3, `letter-spacing:.09em`, uppercase | label kolom |
| `--text-mono` | Cascadia Mono | jam, tanggal, angka matriks, pintasan |

- Segoe UI dari sistem (tanpa bundel, tanpa CDN). Cascadia Mono dibundel lokal (±90 KB, OFL).
- **Seluruh aplikasi**: `font-variant-numeric: tabular-nums`.
- Ukuran terkecil 11px hanya untuk label uppercase; teks yang harus dibaca minimal 12px.

### 2.3 Ikon

**Fluent System Icons** (MIT, Microsoft) — sejalan dengan Segoe UI dan tersedia sebagai SVG untuk dibundel.
Ukuran 16px di rail & tombol, 20px di empty state. Untuk penanda status, gunakan glyph teks monokrom yang sama di seluruh aplikasi: `✓` hadir/terealisasi, `◐` sakit, `✉` izin, `✕` alpa/dibatalkan, `⚠` peringatan, `↻` dijadwal ulang, `●` terjadwal, `◇` terkunci. **Jangan pakai emoji berwarna.**

### 2.4 Density

| | Comfortable | Compact (default) |
| --- | --- | --- |
| Baris tabel | 40px | 32px |
| Sel matriks | 34px | 28px |
| Tinggi kontrol | 32px | 26px |
| Padding sel | 8px 12px | 4px 11px |

Pengecualian: baris kehadiran di **Isi realisasi** tetap **34px** walau mode compact — layar dengan klik berulang terbanyak.

### 2.5 Mode gelap (cuplikan)

Hanya pembalikan permukaan; hue brand & semantik tetap.

```css
[data-theme="dark"] {
  --color-canvas: #1B1A19;  --color-surface: #252423;
  --color-surface-alt: #2D2C2B; --color-surface-sunken: #1B1A19;
  --color-text: #F3F2F1; --color-text-secondary: #D6D4D2; --color-text-muted: #A19F9D;
  --color-border: #3B3A39; --color-border-strong: #484644; --color-border-subtle: #323130;
  --color-brand: #479EF5; --color-brand-subtle: #0C3A61; --color-brand-ink: #A9D3F2;
  --color-focus-ring: #FFFFFF;
  --color-success-bg: #0F3D18; --color-warning-bg: #402B00; --color-danger-bg: #4A1116;
}
```

---

## 3. Komponen

Setiap komponen: tinggi 26px (compact) / 32px (comfortable), radius `--radius-md`, transisi `--dur-fast`.

### 3.1 Tombol

| Varian | Default | Hover | Active | Disabled |
| --- | --- | --- | --- | --- |
| Primary | bg brand, teks putih | `--color-brand-pressed` | pressed + `translateY(1px)` | bg `#EDEBE9`, teks `#8A8886` |
| Secondary | bg surface, border control | bg `--color-surface-alt` | bg `--color-surface-sunken` | teks `#8A8886`, border subtle |
| Ghost | transparan, teks brand | bg `--color-brand-subtle` | bg `#DCE9F9` | teks `#8A8886` |
| Danger | bg surface, border+teks danger | bg `--color-danger-bg` | bg `#FAD3D7` | teks `#8A8886` |

- **Focus**: `outline: 2px solid var(--color-focus-ring); outline-offset: 2px` — sama untuk semua komponen, selalu terlihat (bukan `:focus-visible` saja untuk kontrol form).
- Danger **tidak** dipakai untuk aksi yang bisa dibalik (nonaktifkan → primary).
- Keyboard: `Enter`/`Space` mengaktifkan. Di dialog, `Enter` **tidak** memicu tombol danger.

### 3.2 Isian (text, select, time, date)

- Default: border control, bg surface.
- Hover: border `#8A8886`.
- Focus: border brand + `border-bottom: 2px solid var(--color-brand)`.
- Error: border danger + `border-bottom: 2px solid var(--color-danger)` + pesan di bawah (`⚠` + teks 11px `--color-danger-ink`), label ikut merah.
- Disabled: bg `--color-surface-sunken`, teks muted, tanpa border bawah.
- Wajib ditandai `*` warna danger pada label.
- Keyboard: `Tab` masuk/keluar, `↑↓` di select, `Esc` menutup dropdown tanpa mengubah nilai.

### 3.3 Segmented control (kehadiran, ketuntasan)

- Satu grup = satu stop `Tab`; `←→` memindah pilihan; huruf pertama sebagai pintasan (`H` `I` `S` `A`).
- Terpilih: bg brand, teks putih. Fokus grup: outline di seluruh grup.
- `↓` memindah ke baris siswa berikutnya pada posisi kolom yang sama.

### 3.4 Blok kalender

- Latar `--color-jenis-*-bg`, garis kiri 4px `--color-jenis-*`, teks `--color-jenis-*-ink`, `--shadow-raised`.
- Status **ditumpangkan**, bukan mengganti warna jenis:
  - terjadwal — apa adanya
  - terealisasi — `✓` di kanan atas
  - belum direalisasi — bingkai penuh 1px `--color-warning` + `⚠`
  - dijadwal ulang — bingkai `1px dashed --color-event-dijadwal-ulang` + `↻`
  - dibatalkan — bg `--color-canvas`, teks muted, judul `line-through`
- Slot jam 36px. Isi: jam (mono 10px) → judul (600) → tempat · subjek · jumlah siswa, semua `ellipsis`.
- Keyboard: `Tab` menyusuri blok urut waktu, `Enter` membuka popover.

### 3.5 Sel matriks

| Keadaan | Tampilan |
| --- | --- |
| Tersampaikan | bg success-bg, `✓` success-ink |
| Sakit | bg warning-bg, `◐`, garis dalam 1px warning |
| Izin | bg info-bg, `✉`, garis dalam 1px info |
| Alpa | bg danger-bg, `✕`, garis dalam 1px danger |
| Kegiatan dibatalkan | bg canvas, `✕` muted + `line-through` |
| Belum dijadwalkan | kosong, `·` icon-faint |

Garis dalam 1px pada sel non-hijau supaya tetap terbaca saat dicetak. Fokus: `outline: 2px solid var(--color-focus-ring); outline-offset: -2px` (di dalam sel). Kolom nama & header baris `position: sticky`.

### 3.6 Tabel

Garis pemisah (`--border-hairline`), **tanpa zebra** — agar baris terpilih dan baris berperingatan tetap terbaca.

- Hover: bg `--color-surface-alt`.
- Terpilih: bg `--color-brand-subtle` + `box-shadow: inset 3px 0 0 var(--color-brand)`, teks brand-ink.
- Baris perlu tindakan: bg `--color-warning-bg` penuh baris + `⚠` di kolom pertama.
- Header: bg surface-alt, `--text-label`, sticky.
- Angka rata kanan + mono; teks panjang `ellipsis` + tooltip.
- Keyboard: `↑↓` memindah baris, `Enter` membuka, `Space` memilih.

### 3.7 Badge status

Pill, border 1px warna status, latar `-bg` (atau surface untuk varian ringan), teks `-ink`, **selalu** dengan glyph. Tinggi 18px, font 10.5px.

### 3.8 Toast

Kanan bawah, lebar 290–330px, `--shadow-toast`, radius `--radius-lg`, muncul `--dur-normal`.
Durasi: 4s (informasi), **8s bila ada Urungkan**. Maksimal 3 bertumpuk. Tidak menutupi tombol utama.

### 3.9 Dialog konfirmasi

Scrim `--scrim`, kartu 488–744px, `--shadow-overlay`, radius `--radius-xl`.
Struktur tetap: judul berupa **pertanyaan** → penjelasan konsekuensi → kartu ringkasan objek → dampak dalam angka → (alasan wajib bila relevan) → aksi.
Fokus awal di tombol **aman**; `Esc` menutup; `Tab` terkurung di dalam dialog.

### 3.10 Panel samping

Kanan, lebar 498px, `--shadow-overlay`, geser masuk `--dur-slow` `--ease-out`. Konteks di belakang tetap terlihat — dipakai untuk form kegiatan, karena peringatan bentrok perlu merujuk kalender.

### 3.11 Empty state

Selalu: glyph → judul → satu kalimat penjelas (menyebut **sebab**) → **dua** tombol (satu maju, satu keluar dari keadaan). Tidak ada empty state yang hanya berisi kalimat.

---

## 4. Pattern

### P1 — CRUD data master

Daftar (kiri) + panel sunting (kanan), satu halaman, tanpa dialog. Dipakai untuk Siswa, Subjek, Mata pelajaran & materi, Kelas, Tempat & ruangan, Jenis kegiatan.

- Kolom **"dipakai"** (jumlah kegiatan) wajib ada: `0` → boleh dihapus permanen; `> 0` → hanya boleh dinonaktifkan.
- Data nonaktif tetap tampil (tercoret / badge "Nonaktif"), tidak hilang dari riwayat.
- Data bertingkat (mapel → materi, tempat → ruangan) disunting **di tempat** di tabel anak, urutan diatur lewat pegangan seret.
- Menonaktifkan → dialog konfirmasi dengan dampak berangka, tombol **primary** (bukan danger), toast + Urungkan.

### P2 — Form & validasi

- Label di atas isian; satu kolom untuk isian panjang, berdampingan untuk jam/tanggal.
- Validasi saat `blur`, bukan saat menaip. Ringkasan error di atas form **dan** pesan di bawah setiap isian.
- Tombol Simpan **nonaktif tapi tetap terlihat** selama ada error; alasannya tertulis di ringkasan.
- Draf disimpan otomatis; waktu simpan terakhir ditampilkan di footer.
- "Simpan & buat lagi" mempertahankan jenis, tempat, subjek, dan mata pelajaran.

### P3 — Peringatan bentrok

Kotak warning **di dalam** form, tidak memblokir:
1. Judul menyebut sumber bentrok ("R. Melati sudah dipakai pada jam ini").
2. Satu baris bukti: kegiatan apa, jam berapa, tanggal berapa.
3. Tiga jalan keluar: **Sorot di kalender** · **Pilih ruangan lain** · **Simpan tetap**.

Berlaku sama untuk bentrok ruangan, bentrok subjek, dan jam di luar ketersediaan rutin subjek.

### P4 — Tabel & filter

Filter di atas tabel; chip **filter cepat** untuk kebutuhan harian ("Perlu realisasi", "Hari ini", "Minggu ini"). Chip aktif memakai warna yang sesuai artinya dan bisa dilepas lewat `✕`. Jumlah hasil selalu ditampilkan ("Menampilkan 3 dari 24"). Aksi per baris **mengikuti status** baris itu.

### P5 — Dialog konfirmasi

Wajib untuk: batalkan kegiatan, jadwalkan ulang, nonaktifkan data master, keluar dari form yang belum disimpan.
Batalkan & jadwalkan ulang **mewajibkan alasan** (dropdown + keterangan opsional) — ini bahan laporan "kenapa jadwal meleset".

### P6 — Toast

Satu aksi = satu toast. Aksi yang bisa dibalik → **Urungkan** (8s). Aksi yang menghasilkan objek baru → tautan ke hasilnya ("Lihat jadwal baru"). Tidak ada toast untuk aksi yang hasilnya sudah terlihat di layar.

### P7 — Empty state

Tiga jenis, beda penanganan:
1. **Pemakaian pertama** — arahkan ke aksi utama + jalan ke data master; sebutkan data yang sudah ada.
2. **Filter terlalu sempit** — sebutkan **jumlah filter aktif** dan tawarkan pelonggaran paling mungkin, bukan cuma "Reset".
3. **Prasyarat belum lengkap** — sebutkan prasyarat yang kurang dan akibatnya ("Seni Budaya belum punya materi, jadi belum ada kolom untuk dibandingkan").

---

## 5. Aturan copy UI

### 5.1 Kamus aksi

Nama tombol dan pesan hasilnya memakai **kata dasar yang sama**.

| Tombol | Toast | Riwayat |
| --- | --- | --- |
| Simpan | Perubahan disimpan | Data diubah |
| Simpan realisasi | Realisasi disimpan | Realisasi diisi |
| Batalkan kegiatan | Kegiatan dibatalkan | Kegiatan dibatalkan |
| Jadwalkan ulang | Kegiatan dijadwalkan ulang | Kegiatan dijadwalkan ulang |
| Nonaktifkan siswa | Siswa dinonaktifkan | Siswa dinonaktifkan |
| Aktifkan kembali | Siswa diaktifkan kembali | Siswa diaktifkan |
| Tambah materi | Materi ditambahkan | Materi dibuat |

### 5.2 Gaya

- **Sentence case** untuk judul, tombol, dan label. Uppercase hanya untuk label kolom.
- Label kolom: kata benda tanpa artikel ("Nama kegiatan", bukan "Nama dari kegiatan").
- **"Batal"** = menutup form tanpa menyimpan. **"Batalkan kegiatan"** = mengubah status kegiatan. Jangan pernah menukar keduanya.
- Hindari "sistem", "data tidak valid", "terjadi kesalahan".

### 5.3 Pesan error

Pola: **apa yang salah → cara memperbaikinya.**

| Buruk | Baik |
| --- | --- |
| Jam tidak valid | Jam selesai harus setelah jam mulai. Ubah jam selesai menjadi setelah 08:00. |
| Siswa wajib diisi | Pilih minimal satu siswa. Gunakan "+ Dari kelas" untuk menambahkan sekelas sekaligus. |
| Gagal menyimpan | Kegiatan belum tersimpan. Basis data sedang terpakai proses lain. Coba simpan lagi; isian Anda masih utuh. |
| Tidak ada data | Tidak ada kegiatan yang cocok. Tiga filter aktif sekaligus — lepas salah satunya. |

Kode teknis (mis. `SQLITE_BUSY`) disembunyikan di baris terpisah di bawah, untuk pelaporan.

---

## 6. Peta layar

### Batch A — alur inti

| ID | Layar | Catatan implementasi |
| --- | --- | --- |
| A1 | Kerangka aplikasi | rail 48px (melebar 208px, `Ctrl+B`), pencarian cepat `Ctrl+K`, lencana realisasi tertunda di dasar rail |
| A2 | Kalender minggu | slot 36px, 07:00–18:00, 5 status kegiatan, popover aksi kontekstual |
| A3 | Daftar kegiatan | P4, chip "Perlu realisasi", aksi per baris menurut status |
| A4 | Form kegiatan | panel samping, P2 + P3, error & peringatan bersamaan |
| A5 | Detail kegiatan | rencana vs realisasi, tabel peserta, riwayat perubahan |
| A6 | Batalkan kegiatan | P5, alasan wajib, dampak ke matriks, toast + Urungkan |
| A7 | Jadwalkan ulang | P5, pratinjau ketersediaan slot baru, jadwal lama tetap tercatat |
| A8 | Isi realisasi | baris 34px, segmented kehadiran, status kesiapan simpan |
| A9 | Matriks belajar | 6 keadaan sel, baris tertinggal, empty state prasyarat |

### Batch B — data master & keadaan khusus

| ID | Layar | Catatan implementasi |
| --- | --- | --- |
| B1 | Siswa | P1 lengkap + dialog nonaktifkan |
| B2 | Mata pelajaran & materi | sunting di tempat, urutan seret = urutan kolom matriks |
| B3 | Kelas · Tempat & ruangan · Jenis kegiatan | P1; jenis kegiatan mengatur isian wajib form + warna penanda |
| B4 | Profil siswa | cakupan per mapel, daftar materi terlewat + "jadwalkan susulan" |
| B5 | Profil subjek | beban per minggu vs batas nyaman, realisasi tertunda, ketersediaan rutin |
| B6 | Keadaan khusus | empty state (2), error simpan, status penyimpanan offline, akses terbatas, konflik suntingan |

---

## 7. Aturan turunan untuk implementasi

1. **Kehadiran menentukan matriks.** Materi tercatat tersampaikan **hanya** untuk siswa berstatus `Hadir`. Izin, sakit, dan alpa tetap "belum tersampaikan".
2. **Kelas adalah pintasan, bukan relasi hidup.** Mengubah anggota kelas tidak mengubah kegiatan yang sudah dibuat.
3. **Jenis kegiatan adalah satu-satunya data master yang mengubah perilaku form** (materi/siswa wajib atau tidak) dan satu-satunya tempat warna penanda kalender diatur.
4. **Jenjang materi menyaring pilihan** di form kegiatan: kelas SD hanya menawarkan materi berjenjang SD.
5. **Kapasitas ruangan & ketersediaan subjek = peringatan lunak**, bukan penolakan.
6. **Aplikasi bisa dibuka di dua jendela** (Tauri). Konflik suntingan ditawarkan eksplisit: "Pakai punya saya" / "Pakai versi tersimpan" / "Bandingkan" — tidak ada yang menang otomatis.
7. **Status penyimpanan & cadangan adalah bagian antarmuka**, bukan pengaturan tersembunyi — konsekuensi aplikasi offline.
8. **Menu terkunci tetap terlihat** (diredupkan + `◇`), tidak disembunyikan.

### Pintasan keyboard

| Pintasan | Aksi |
| --- | --- |
| `Ctrl+N` | Kegiatan baru |
| `Ctrl+K` | Pencarian cepat |
| `Ctrl+B` | Lebarkan/ciutkan rail |
| `Ctrl+S` | Simpan |
| `Alt+1…6` | Pindah menu |
| `T` | Hari ini (kalender) |
| `D` `W` `M` `A` | Hari / Minggu / Bulan / Agenda |
| `H` `I` `S` `A` | Hadir / Izin / Sakit / Alpa (baris kehadiran) |
| `Esc` | Tutup panel, dialog, dropdown |
