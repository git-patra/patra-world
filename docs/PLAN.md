# Patra’s After Hours — rencana eksplorasi portfolio

Dokumen arah desain dan demonstrasi, 19 Oktober 2026. Ini bukan daftar klaim bahwa seluruh fitur produksi sudah selesai.

## Tujuan dan batasan

Portfolio berubah menjadi desa kecil yang bisa dijelajahi. Pengunjung menggerakkan karakter, mendekati bangunan, lalu membuka cerita tentang karya Patra. Informasi inti tetap dapat ditemukan tanpa bermain.

- Repo baru: `patra-world`; repo `../patra-portfolio` dibiarkan sebagai pilihan sebelumnya.
- Tahap ini: rencana + prototype interaktif lokal. Preview ditargetkan pada port **4176**, terpisah dari portfolio lama pada **4173**.
- Satu halaman statis, tanpa backend, akun, atau layanan game.
- Konten berbahasa Inggris. Kontak utama menuju LinkedIn; CV memakai versi revisi tanpa Texas Poker.
- Tidak ada pertarungan, taruhan, saldo, pembayaran, hadiah uang, atau ekonomi permainan.
- Tidak membuat remote repository atau melakukan deployment pada tahap ini.

## Arah visual

**Patra’s After Hours**: desa musim gugur dengan perspektif isometrik 2.5D, langit gelap, atap hangat, jendela menyala, labu, daun, dan sedikit dekorasi Halloween. Karakter kecil memberi skala dan rasa perjalanan; bangunan tetap mudah dikenali melalui nama dan bentuknya.

Video referensi memperlihatkan peta taktis berbasis hex, perpindahan karakter, dan panel konteks. Yang diadaptasi adalah cara memilih tujuan dan menemukan informasi lewat ruang. Desain peta, karakter, dan bangunan dibuat untuk portfolio ini.

| Pilihan | Kelebihan | Tradeoff |
| --- | --- | --- |
| 2D tampak atas | Cepat dibuat, navigasi sederhana, ringan | Kedalaman dan karakter visual lebih terbatas |
| **2.5D isometrik — rekomendasi** | Terasa seperti dunia kecil, cukup ringan dengan Canvas 2D | Kedalaman semu, perlu pengurutan gambar dan area klik yang jelas |
| 3D sederhana | Kamera, cahaya, dan eksplorasi lebih bebas | Model, kontrol, performa perangkat, dan pemeliharaan lebih kompleks |

## Peta pengalaman

Karakter mulai di alun-alun dengan papan “Hi, I’m Patra.” Tujuh bangunan menjadi tujuan portfolio:

1. **The Arcade** — interface dan sistem real-time; Rock Paper Scissors lokal.
2. **Signal Station** — messaging; percakapan simulasi.
3. **Card Vault** — VCC, Paper products, BRI/Ayoconnect/CIMB.
4. **Coffee House** — custom invoicing Kopi Kenangan.
5. **Operations Hub** — ERP dan layanan yang menghubungkan proses bisnis.
6. **Oren Market** — Oren POS, gambar produk, tautan produk langsung.
7. **Jajaneun Kitchen** — usaha F&B dan beberapa momen dari Instagram.

Alurnya: pilih tujuan → karakter berjalan → penanda interaksi muncul → buka panel karya. Setiap panel memuat ringkasan, kontribusi/teknologi yang terverifikasi, satu visual atau demonstrasi, dan tautan yang relevan. Tidak perlu menyelesaikan misi untuk mengakses karya.

## Kontrol dan akses langsung

- Desktop: WASD atau panah untuk bergerak; klik tanah/bangunan untuk menuju lokasi; **E** atau tombol tampak untuk membuka lokasi terdekat.
- Mobile: D-pad sentuh dan tap tujuan; panel dapat dibaca tanpa menutup kontrol secara tidak sengaja.
- Daftar proyek HTML menyediakan akses langsung bagi pengunjung yang tidak ingin menjelajah atau tidak dapat memakai canvas.
- Petunjuk kontrol, pengurangan gerak, LinkedIn, dan unduh CV mudah ditemukan.
- Input gerak berhenti saat panel/input teks aktif agar mengetik tidak menggerakkan karakter.
- Panel memiliki judul jelas, tombol tutup, dukungan Escape, dan pengelolaan fokus keyboard.

## Pendekatan teknis

Prototype memakai HTML/CSS/JavaScript tanpa dependensi runtime: **Canvas 2D** untuk dunia dan karakter, **DOM semantik** untuk navigasi, tombol, konten proyek, dan panel. Data proyek dipisahkan dari loop gambar agar koreksi konten tidak memerlukan perubahan logika gerak.

Gerak cukup berbasis koordinat dunia dengan batas area, target perjalanan, dan pemeriksaan jarak interaksi. Tidak diperlukan physics engine atau backend. Animasi harus berhenti atau melambat saat tab tidak terlihat dan menghormati reduced motion. Canvas mengikuti ukuran layar serta membatasi rasio piksel untuk menjaga beban perangkat.

React dan komponen shadcn dapat membungkus panel dan menu pada fase berikutnya, mengikuti preferensi portfolio sebelumnya. Keputusan itu tidak perlu menunda demonstrasi arah navigasi ini. Situs produksi tetap dapat dihasilkan sebagai file statis untuk hosting lewat SSH.

## Tahapan

### 1. Demonstrasi sekarang

- Bangun peta dengan tujuh tujuan, karakter berjalan, navigasi keyboard/klik/sentuh, dan daftar proyek langsung.
- Tampilkan contoh panel dengan konten yang sesuai CV dan visual/mockup yang diberi label jujur.
- Salin CV revisi serta aset yang diperlukan ke repo baru; jangan mengubah berkas sumber portfolio lama.
- Uji interaksi inti, tampilkan preview lokal, dan kumpulkan tanggapan terhadap arah visual.

### 2. Polesan setelah arah dipilih

- Sempurnakan karakter, prop, pencahayaan semu, jalur, ikon, dan identitas setiap bangunan.
- Rapikan copy, gambar proyek, urutan informasi, dan detail demo dalam panel.
- Tentukan seberapa kuat suasana Halloween dan apakah suasananya musiman atau permanen.
- Pertimbangkan komponen React/shadcn untuk UI yang akan dipelihara lebih lama.

### 3. Kesiapan produksi kemudian

- Audit keyboard, screen reader, fokus panel, kontras, reduced motion, serta kontrol sentuh.
- Optimasi ukuran aset, render, pemakaian memori, dan perilaku pada layar/perangkat kecil.
- Lengkapi SEO dan konten HTML yang tetap berguna sebelum canvas siap atau jika JavaScript gagal.
- Verifikasi tautan, CV, atribusi aset, pengujian browser, serta pipeline build statis.
- Siapkan dokumentasi deployment; host/domain/folder baru dipakai ketika user meminta deploy.

## Kriteria penerimaan demo

- Portfolio lama tidak berubah; preview baru memakai port terpisah.
- Karakter dapat berjalan dengan keyboard dan klik/tap; kontrol berhenti setelah tombol dilepas atau fokus hilang.
- Ketujuh tujuan dapat dibuka lewat peta maupun daftar langsung tanpa menyelesaikan permainan.
- Panel dapat dibuka/ditutup, teks tidak terpotong, dan tautan proyek yang tersedia menuju alamat benar.
- Interaksi tidak memuat taruhan, Texas Poker, atau alur transaksi sungguhan.
- CV mengarah ke salinan versi revisi; “Let’s talk” mengarah ke LinkedIn.
- Pada desktop dan layar mobile, dunia, daftar proyek, dan panel tetap dapat digunakan.
- Tidak ada error JavaScript yang menghentikan gerak atau pembukaan panel.

## Risiko dan keputusan visual yang masih terbuka

Canvas sendiri tidak cukup untuk aksesibilitas atau SEO; daftar dan panel DOM menjadi jalur informasi utama yang setara. Peta yang terlalu padat dapat membingungkan pada mobile, sehingga label, lokasi tujuan, dan panel harus diprioritaskan. Instagram dapat membatasi embed; gambar kurasi dengan tautan sumber tetap berguna sebagai fallback.

Pilihan karakter, tingkat detail pixel-art versus ilustrasi bersih, serta banyaknya dekorasi Halloween dapat diputuskan setelah mencoba demo. Suara bersifat opsional dan sebaiknya dimulai dalam keadaan mati. Pilihan tersebut bukan penghalang untuk menguji konsep eksplorasi sekarang.
