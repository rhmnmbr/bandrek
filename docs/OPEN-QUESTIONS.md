# Pertanyaan terbuka

Keputusan yang belum diambil. Selama belum diputuskan, yang berlaku adalah kolom "Sekarang". Agen **tidak** boleh memutuskan salah satu dari ini sendiri. Kalau pekerjaan menyentuh salah satunya, tanyakan dulu.

Kalau sudah diputuskan, pindahkan hasilnya ke `ARCHITECTURE.md` atau `DOMAIN.md`, lalu tandai di sini sebagai **Diputuskan** beserta tanggalnya.

| # | Pertanyaan | Sekarang | Dampak kalau berubah |
|---|---|---|---|
| Q1 | Perlukah kegiatan berulang (jadwal mingguan)? | Tidak ada. Setiap kegiatan dibuat satu per satu | Skema kegiatan (aturan pengulangan vs. salinan per pertemuan), form, jadwal ulang dan pembatalan per pertemuan atau seluruh seri |
| Q2 | Ketuntasan per kegiatan atau per siswa? | Per kegiatan, hanya sebagai label | Kolom tambahan di tabel kehadiran; kalau ikut menentukan isi sel matriks, muncul keadaan sel baru dan legenda berubah |
| Q3 | Apa tindak lanjut catatan di materi luar jenjang? | Hanya pemberitahuan dan panel daftar di matriks | Mungkin perlu alur koreksi: memindahkan catatan ke materi lain, atau menandainya sebagai sah |
| Q4 | Apa beda hak admin dan operator? | Admin bisa menambah akun operator. Hak lain belum dibedakan | Otorisasi di server per endpoint, aksi disembunyikan di klien, mungkin juga pembatasan data master |
| Q5 | Perlukah riwayat perubahan (audit)? | Hanya "diisi oleh / diisi pada" yang tertimpa setiap diubah | Tabel riwayat terpisah, layar riwayat di detail kegiatan |
| Q6 | Kepatuhan pelindungan data pribadi: data anak dan lokasi VPS | Belum dicek | Pilihan region VPS, persetujuan wali, kebijakan retensi dan penghapusan data |
| Q7 | Kebijakan backup: frekuensi, retensi, lokasi | Backup di luar VPS dan restore harus pernah dites; detail belum ditentukan | Skrip di `deploy/`, biaya penyimpanan |
| Q8 | Distribusi installer: code signing Windows, tempat hosting file update | Belum ditentukan | Proses rilis desktop, peringatan SmartScreen saat instalasi |
| Q9 | Berapa lama data cache offline boleh ditampilkan? | Selalu tampil, dengan penanda waktu | Aturan kedaluwarsa cache, pesan ke pengguna |
| Q10 | Apakah field Tempat yang tergabung di dropdown ruangan (optgroup) tetap cukup? | Cukup untuk 2–3 tempat | Kalau tempat bertambah banyak, perlu filter tempat di atas dropdown ruangan |
