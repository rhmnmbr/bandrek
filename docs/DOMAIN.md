# Domain & perilaku — Bandrek

Dokumen ini menjawab pertanyaan **perilaku**: aturan bisnis, status, dan apa yang terjadi saat pengguna melakukan sesuatu. Layout ada di prototype (`docs/prototype/`), gaya visual ada di `docs/DESIGN.md`.

Kalau dokumen ini bertentangan dengan prototype soal perilaku, **laporkan, jangan pilih sendiri**. Bagian yang detailnya tidak ditulis di sini ditandai "ikut prototype".

Kode layar (A1–A9, B1–B6) sama dengan penamaan di prototype.

---

## 1. Istilah

| Istilah | Arti |
|---|---|
| Siswa | Peserta belajar |
| Subjek | Orang yang terlibat dalam kegiatan selain siswa (pengajar, wali, pendamping). **Bukan mata pelajaran.** |
| Peran subjek | Pengisi, Wali, Support, Pendamping. Daftar tetap, tidak ada menu master |
| Kegiatan | Jadwal yang tampil di kalender: pembelajaran, rapat, olahraga, dll. |
| Realisasi | Catatan apa yang benar-benar terjadi pada kegiatan, terutama kehadiran |
| Kelas | Kelompok siswa bernama, dipakai untuk mengisi daftar siswa kegiatan dengan cepat. **Bukan ruangan.** |
| Tempat, ruangan | Lokasi fisik. Satu tempat punya banyak ruangan |
| Mata pelajaran (mapel), materi | Satu mapel punya banyak materi berurutan |
| Matriks belajar | Tabel siswa × materi yang menunjukkan materi mana yang sudah diterima siswa |

---

## 2. Entitas

**Siswa** — nama, tanggal lahir, jenis kelamin (Laki-laki/Perempuan), jenjang pendidikan, asal sekolah (opsional), nama wali (opsional), no. WhatsApp (opsional), status Aktif/Nonaktif.

**Jenjang pendidikan** — data seed tetap, tanpa menu master. Isinya ikut seed prototype.

**Subjek** — nama lengkap, jenis kelamin.

**Kelas** — nama kelas + daftar siswa. Satu siswa bisa ada di beberapa kelas.

**Mata pelajaran → materi** — materi berurutan di dalam mapelnya. Setiap materi **wajib** punya daftar jenjang (minimal satu, bisa lebih dari satu). Matriks bergantung pada field ini.

**Tempat → ruangan** — minimal berisi nama.

**Jenis kegiatan** — nama + warna penanda kalender dari palet jenis kegiatan di DESIGN.md. Seed: Pembelajaran, Rapat, Olahraga. Bisa ditambah dan diubah.

**Kegiatan** — nama, jenis, mapel, materi, tanggal, jam mulai, jam selesai, ruangan (tempat turunan dari ruangan), catatan rencana, status, daftar subjek beserta perannya, daftar siswa, tautan jadwal ulang, alasan pembatalan. Field mana yang wajib bisa bergantung pada jenis kegiatan — ikut prototype.

**Realisasi (per kegiatan)**
- Kehadiran siswa: status `hadir` / `sakit` / `izin` / `alpa` + keterangan per siswa
- Kehadiran subjek: status + catatan per subjek, disimpan terpisah dari kehadiran siswa dengan bentuk yang sama. Peran subjek **tidak** disalin ke realisasi — sumbernya tetap daftar subjek di kegiatan
- Materi yang benar-benar diajarkan (`realisasi.materi`); kalau kosong, dianggap sama dengan materi rencana
- Ketuntasan: satu nilai per kegiatan, bukan per siswa. Nilai dan default ikut prototype A8
- Catatan realisasi
- Diisi oleh, diisi pada

**Ceklis manual matriks** — siswa, materi, tanggal (opsional), catatan (opsional), sumber = `manual`. Dipakai untuk materi yang sudah dipelajari di masa lalu tapi tidak tercatat sebagai kegiatan.

---

## 3. Status kegiatan

| Status | Kapan | Sifat |
|---|---|---|
| Terjadwal | Kegiatan baru | Bisa diedit |
| Belum direalisasi | Tanggal sudah lewat, realisasi belum diisi | **Status turunan**, tidak disimpan. Tampil sebagai pengingat |
| Terealisasi | Realisasi sudah diisi | Realisasi tetap bisa diubah; rencana tidak |
| Dibatalkan | Dibatalkan dengan alasan | Read-only. Tersembunyi di kalender secara default |
| Dijadwal ulang | Diganti kegiatan baru hasil jadwal ulang | Read-only. Isinya tidak pernah berubah |

**Aksi per status** — satu aturan, dipakai sama persis di popover, detail kegiatan, dan daftar kegiatan:

| Status | Aksi |
|---|---|
| Terjadwal, Belum direalisasi | Lihat detail, Edit, Isi realisasi, Jadwal ulang, Batalkan |
| Terealisasi | Lihat detail, Ubah realisasi |
| Dibatalkan, Dijadwal ulang | Lihat detail |

Aksi yang tidak berlaku **disembunyikan**, bukan dinonaktifkan.

**Tidak ada hapus kegiatan.** Salah input ditangani dengan Edit (selama belum direalisasi) atau Batalkan.

---

## 4. Kalender (A1, A2)

- Kalender adalah layar awal. Tampilan Hari, Minggu (default), Bulan — ikut prototype.
- Navigasi: Hari ini, maju/mundur, mini-kalender.
- Filter: jenis kegiatan, subjek, kelas, ruangan, dan status. Kegiatan Dibatalkan tersembunyi secara default.
- Blok kegiatan menampilkan jam, nama, ruangan, pengisi, jumlah siswa, dan penanda status (ikon + gaya, bukan warna saja).
- Hari padat: blok punya tinggi minimum yang masih memuat judul dan jam. Kalau tidak muat, kegiatan dikelompokkan menjadi "+N lainnya" yang bisa diklik.
- Klik atau drag slot kosong membuka form kegiatan dengan tanggal dan jam terisi.
- Klik blok membuka popover: jenis, mapel/materi, tanggal & jam, tempat dan ruangan, subjek beserta perannya, daftar siswa (ringkas, bisa diperluas, tinggi dibatasi), status, dan aksi sesuai status.

---

## 5. Form kegiatan (A4)

Panel samping di atas kalender, supaya kalender di belakangnya tetap terlihat.

**Jalan masuk:** tombol "Kegiatan baru" atau Ctrl+N (form kosong), klik/drag slot (tanggal dan jam terisi), Edit dari popover atau detail (form terisi penuh; judul menjadi "Ubah kegiatan").

**Header** menampilkan pill konteks slot, misalnya "Rab, 16 Sep · 08:00". **Footer** kiri menampilkan waktu draf terakhir disimpan.

**Isian:**
- Mapel → materi: materi nonaktif sampai mapel dipilih, lalu hanya menampilkan materi dari mapel itu. Mengganti mapel mereset materi.
- Ruangan: **satu dropdown** yang dikelompokkan per tempat (optgroup). Tidak ada field Tempat terpisah di form, jadi tempat **wajib** tampil di popover, detail, ringkasan realisasi, dan daftar kegiatan. Ruangan dengan nama sama di dua tempat tetap dibedakan dengan benar.
- Subjek: chip "Nama · Peran" dengan tombol "+ tambah". Klik chip membuka menu berisi keempat peran — bukan toggle. Satu subjek hanya boleh muncul sekali per kegiatan.
- Siswa: daftar centang inline dengan kolom pencarian, dikelompokkan per kelas atau jenjang, tinggi dibatasi. Baris "N dipilih / Kosongkan". Siswa nonaktif tidak muncul.
- "+ Dari kelas": pilih satu atau lebih kelas, lalu anggota aktifnya dicentang. Siswa yang sudah terpilih dilewati tanpa error, dan jumlah yang dilewati diberitahukan. Chip asal "Kelas X · N siswa disalin ×" ditampilkan. Impor bersifat **salinan**: perubahan anggota kelas setelahnya tidak mengubah kegiatan ini.
- Daftar siswa boleh kosong, misalnya untuk rapat.

**Validasi:**
- Kotak ringkasan error merah di atas form, plus pesan inline di bawah field yang bermasalah.
- Soft validation: tombol Simpan tetap aktif sampai percobaan simpan pertama. Setelah itu, Simpan nonaktif selama masih ada error.
- Error merah memblokir simpan.

**Peringatan bentrok** (kuning, tidak memblokir):
- Dicek terhadap ruangan, subjek, dan siswa yang sudah punya kegiatan lain di rentang jam yang tumpang tindih.
- Menyebutkan apa yang bentrok dan dengan kegiatan mana.
- Aksi: "Sorot di kalender" (menyorot kegiatan penyebab di kalender belakang panel), "Pilih ruangan lain", "Simpan tetap".
- Error merah dan peringatan kuning bisa tampil bersamaan dan tidak boleh tertukar gayanya.
- Bentrok dihitung server, karena harus memakai data terbaru dari operator lain.

**Simpan:**
- "Simpan" dan "Simpan & buat lagi". Yang kedua mempertahankan jenis, ruangan, subjek, mapel, dan tanggal; mereset nama, materi, siswa, dan catatan.
- Setelah simpan, kegiatan muncul di slot yang benar. Kalau tanggalnya di luar minggu yang tampil, kalender pindah ke minggu itu. Edit mengubah blok yang ada, tidak menambah blok baru.
- Esc menutup form; kalau ada perubahan belum disimpan, minta konfirmasi dulu.

---

## 6. Detail kegiatan (A5)

Read-only. Menampilkan seluruh rencana (termasuk tempat), daftar peserta dengan tinggi dibatasi, dan **riwayat**: "Dijadwal ulang dari …" / "Dijadwal ulang menjadi …" (bisa diklik), alasan pembatalan, serta waktu dibuat dan diubah. Kalau sudah direalisasi, ketuntasan juga ditampilkan. Aksi sesuai tabel di bagian 3.

---

## 7. Batalkan (A6)

- Dialog konfirmasi berisi ringkasan kegiatan dan **alasan wajib**. Tombol konfirmasi nonaktif sampai alasan diisi.
- Checkbox "Sekalian jadwalkan ulang": setelah batal, langsung membuka dialog jadwal ulang.
- Kotak dampak menyebut matriks sebagai teks dengan tautan "Lihat matriks".
- Setelah batal: status Dibatalkan, kegiatan read-only, tersembunyi di kalender kecuali filter status diaktifkan. Alasan tampil di popover dan detail.
- Tidak ada cara membatalkan pembatalan.

---

## 8. Jadwal ulang (A7)

- Dialog (lebar dan susunan dua kolom ikut prototype), terisi penuh dari kegiatan asal, termasuk subjek beserta peran dan siswa beserta penanda asalnya.
- Banner menunjukkan kegiatan asal (nama, tanggal, jam) dan bisa diklik.
- **Alasan wajib.**
- Setelah simpan: kegiatan baru berstatus Terjadwal; kegiatan asal berstatus Dijadwal ulang dan isinya tidak berubah sama sekali.
- Tautan dua arah bisa diklik: membawa kalender ke minggu kegiatan tujuan dan membuka popover-nya.
- Kegiatan hasil jadwal ulang boleh dijadwal ulang lagi; rantainya harus tetap runut.

---

## 9. Realisasi (A8)

- Dibuka lewat "Isi realisasi" atau "Ubah realisasi".
- Bagian atas: ringkasan rencana read-only — nama, jenis, mapel/materi, tanggal, jam, tempat dan ruangan.
- Kehadiran siswa: nama | status | keterangan. Status **default kosong, bukan Hadir**. Aksi massal "Tandai semua hadir". Ringkasan jumlah per status terupdate langsung dan tetap terlihat saat tabel digulir.
- Kehadiran subjek: nama | peran | status | catatan. Bagian ini harus selalu terlihat — tabel siswa diberi tinggi maksimum dengan gulir, supaya bagian subjek tidak tenggelam di bawah daftar panjang.
- Materi yang benar-benar diajarkan dan ketuntasan — ikut prototype A8.
- Catatan realisasi.
- Validasi: semua siswa dan subjek wajib punya status. Pola error sama dengan form kegiatan. Kalau error berada di bagian yang tidak terlihat, layar menggulir ke sana.
- Kegiatan tanpa siswa (rapat) tetap bisa direalisasi dengan kehadiran subjek saja.
- Setelah simpan: status Terealisasi, blok kalender berubah tampilan, dan matriks ikut terbarui.
- Kegiatan lama yang belum punya kehadiran subjek: saat dibuka, tampil kosong dan harus diisi sebelum bisa disimpan. **Jangan pernah mengisi Hadir secara otomatis.**

---

## 10. Matriks belajar (A9)

**Cakupan: satu mata pelajaran × satu jenjang per tampilan.**
- Mapel dan jenjang adalah pemilih tunggal yang wajib terisi, di paling kiri toolbar. Default: mapel pertama; jenjang dengan siswa aktif terbanyak. Tidak ada mode "semua mapel".
- Pilihan mapel dan jenjang diingat selama sesi, termasuk saat kembali dari layar lain.
- Filter tambahan: kelas, cari siswa, tampilkan siswa nonaktif (default tersembunyi).

**Struktur:**
- Judul tabel, misalnya "Matematika · SD · 8 materi · 30 siswa". Header kolom satu tingkat.
- Kolom = materi dari mapel itu yang jenjangnya cocok, sesuai urutan materi.
- Baris = siswa. Kolom nama menempel di kiri dan cukup lebar untuk nama terpanjang. Header menempel di atas. Baris ringkasan "Menerima" menempel di bawah.
- Tidak perlu gulir horizontal untuk kombinasi apa pun.

**Sumber isi sel:**
- Materi dibaca dari `realisasi.materi`, dengan fallback ke materi rencana.
- Kegiatan Dibatalkan dan Dijadwal ulang **tidak** mengisi sel.
- Kegiatan yang punya mapel tanpa materi tidak mengisi sel.
- Ketuntasan **tidak** menentukan isi sel. Ketuntasan hanya ditampilkan di popover sel.

**Keadaan sel (legenda 7 baris):**

| Keadaan | Kapan |
|---|---|
| Kosong / belum dijadwalkan | Belum ada kegiatan maupun ceklis — satu keadaan, bukan dua |
| Terjadwal | Ada kegiatan mendatang dengan materi ini |
| Tersampaikan | Siswa tercatat `hadir` di realisasi kegiatan dengan materi ini |
| Selesai manual | Ada ceklis manual. Hijau lebih muda dengan ✓ miring — harus terlihat berbeda dari tersampaikan |
| Sakit, Izin, Alpa | Ada kegiatan dengan materi ini tapi siswa berstatus tersebut |

**Prioritas kalau bertumpuk:** tersampaikan / selesai manual > terjadwal > alpa > izin > sakit > kosong.

**Tidak berlaku:** kombinasi siswa × materi yang jenjangnya tidak cocok tidak dihitung di penyebut cakupan. Karena kolom sudah disaring per jenjang, keadaan ini tidak tampil di grid.

**Catatan di luar jenjang:** kalau ada siswa yang tampil punya kehadiran atau ceklis di materi yang jenjangnya tidak cocok, tampilkan baris pemberitahuan kecil di atas tabel beserta tautan ke panel daftarnya. **Jangan** tambahkan kolom.

**Ringkasan:**
- Cakupan dan "siswa tertinggal" dihitung dalam lingkup mapel + jenjang yang tampil.
- Siswa tertinggal = belum menerima ≥ 40% kolom yang tampil (dibulatkan ke atas, minimal 2). Label kartu menyebut ambangnya, misalnya "≥ 4 dari 8 materi belum diterima".
- Kartu "materi paling tertinggal", dengan pemutus seri: paling banyak yang belum → paling lama tidak dijadwalkan → urutan materi. Kalau semua seri, tampilkan "Semua materi merata".

**Interaksi:**
- Klik sel membuka popover berisi kegiatan terkait (tanggal, nama, status kehadiran, ketuntasan). Setiap kegiatan bisa diklik untuk dibuka di kalender.
- Popover juga berisi centang "Tandai sudah dipelajari" dengan tanggal dan catatan opsional. Untuk sel manual, tanggal dan catatannya ditampilkan.
- Sel yang sudah tersampaikan tidak perlu ceklis manual, dan popover menjelaskan alasannya.
- Mode ceklis massal: pilih beberapa sel, satu baris, atau satu kolom sekaligus.

---

## 11. Daftar kegiatan (A3)

- Tabel: tanggal, jam, nama, jenis, mapel/materi, tempat dan ruangan, pengisi, jumlah siswa, status.
- Filter: rentang tanggal, jenis, status, subjek, kelas, cari nama.
- Default: urut tanggal terbaru, rentang dua minggu terakhir ditambah yang akan datang.
- Filter cepat "Perlu realisasi" (status Belum direalisasi). Lencana di rail navigasi membuka layar ini dengan filter itu sudah aktif.
- Aksi per baris sesuai tabel di bagian 3. Aksi membuka layar yang sama dengan yang dipakai kalender.
- Klik baris membuka detail kegiatan.

---

## 12. Data master (B1–B6)

**Pola CRUD yang sama untuk semua master:** judul, pencarian, filter, tabel dengan header menempel, tombol Tambah, form, dialog konfirmasi, empty state, state pencarian kosong, toast. Validasi memakai pola form kegiatan.

**Aturan hapus:** data yang sudah dipakai kegiatan, kelas, atau ceklis manual tidak bisa dihapus. Tombol hapus tetap terlihat tapi nonaktif, dengan penjelasan di mana dan berapa kali data itu dipakai. Untuk siswa, pengguna diarahkan ke status Nonaktif.

- **B1 Siswa** — tabel: nama, jenjang, tanggal lahir, asal sekolah, wali, WhatsApp, status. Filter status (default Aktif), jenjang, kelas. Siswa nonaktif hilang dari semua pemilih, tapi tetap ada di riwayat kegiatan dan di matriks saat filter nonaktif diaktifkan.
- **B2 Subjek** — tabel: nama lengkap, jenis kelamin, jumlah kegiatan terkait.
- **B3 Kelas** — tabel: nama, jumlah siswa. Pemilih siswa memakai komponen yang **sama persis** dengan form kegiatan.
- **B4 Mata pelajaran & materi** — master-detail. Form materi wajib punya jenjang (daftar). Urutan materi diatur dengan drag.
- **B5 Tempat & ruangan** — master-detail. Isinya menjadi grup di dropdown ruangan pada form kegiatan.
- **B6 Jenis kegiatan** — nama + warna dari palet DESIGN.md.

**Perambatan perubahan:**
- Ganti nama ruangan, tempat, mapel, materi, kelas, subjek, atau siswa langsung terbawa ke semua layar yang menampilkannya.
- Ganti warna jenis kegiatan langsung terbawa ke blok kalender.
- Ubah jenjang materi mengubah kolom matriks dan angka cakupan.
- Mengeluarkan siswa dari kelas **tidak** mengubah kegiatan yang sudah mengimpor kelas itu.

---

## 13. Layar tambahan client-server (belum ada di prototype)

Rancang dari pola DESIGN.md. Usulan rancangannya harus ditunjukkan dan disetujui sebelum dibangun.

- **Pengaturan awal** — isi alamat server, hanya muncul saat aplikasi pertama kali dibuka atau alamat belum diatur.
- **Login.**
- **Manajemen pengguna (minimal)** — admin menambah dan menonaktifkan akun operator.
- **Tidak terhubung** — banner di semua layar, semua aksi tulis nonaktif, dan penanda bahwa data yang tampil berasal dari cache beserta waktunya.
- **Konflik simpan** — pesan bahwa data sudah diubah operator lain, dengan pilihan memuat ulang.
- **Perlu pembaruan** — pesan saat versi aplikasi di bawah versi minimum yang diterima server.

---

## 14. Copy UI

- Nama aksi konsisten di seluruh alur. Contoh: tombol "Batalkan kegiatan" menghasilkan toast "Kegiatan dibatalkan".
- Sentence case. Pesan error menjelaskan cara memperbaikinya, misalnya "Ubah jam selesai menjadi setelah 08:00".
- Toast tidak boleh menutupi tombol aksi.
