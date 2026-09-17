# Penyederhanaan CMS Portofolio dan Responsivitas Mobile

## Ringkasan

Merapikan pengelolaan konten agar tidak ada nomor urut ganda, menyederhanakan form proyek, membuat kategori yang dapat dikelola sendiri, memisahkan Skills dan Tools, serta memperbaiki kenyamanan seluruh halaman admin pada layar ponsel.

## Perubahan yang akan dibuat

### 1. Pengurutan tanpa kolom Order
- Hilangkan input **Order** dari Projects, Experience, Skills, Tools, social links, dan slider gambar.
- Gunakan tombol panah atas/bawah pada setiap daftar.
- Setiap perpindahan akan menormalkan ulang seluruh urutan menjadi `1, 2, 3, ...`, sehingga tidak ada nilai ganda walaupun data lama sudah redundant.
- Tombol yang tidak dapat digunakan di posisi pertama/terakhir akan nonaktif.

### 2. Form proyek yang lebih sederhana
- Gabungkan **Thumbnail** dan **Hero image** menjadi satu field **Project image**; nilai yang sama tetap disimpan ke kedua field lama agar kartu dan halaman detail kompatibel.
- Hilangkan dari editor dan tampilan publik: Timeline, Platform, Gallery image URLs, Final design, Additional notes, dan Order.
- Ubah **Year** menjadi input angka saja dengan batas empat digit.
- Pertahankan Title, Slug, Client/Company, Role, Summary, status Featured/Published, serta konten studi kasus utama.

### 3. Konten studi kasus berbentuk bullet points
- Overview, Problem, Goals, Research / Discovery, Design process, dan Outcome / Impact menerima satu poin per baris.
- Halaman proyek menampilkan setiap baris sebagai bullet point yang rapi.
- Paragraf lama tetap terbaca sebagai satu poin, jadi tidak perlu migrasi isi lama.

### 4. Slider gambar studi kasus
- Ganti **Case study sections** menjadi **Case study images**.
- Editor hanya menampilkan daftar gambar: upload/paste URL, preview, hapus, serta panah atas/bawah.
- Halaman detail menampilkan seluruh gambar dalam slider dengan tombol sebelumnya/berikutnya, indikator posisi, swipe/scroll-snap di ponsel, dan dukungan keyboard.
- Data gambar tetap memakai penyimpanan section yang sudah ada; field heading/deskripsi lama tidak lagi ditampilkan.

### 5. Master kategori dan checkbox proyek
- Tambah tabel kategori terkelola dengan nama unik, urutan, dan aturan akses aman.
- Isi awal mencakup kategori yang sudah digunakan, termasuk SaaS, B2B, Sales Canvassing, Web, Mobile, ERP, dan Dashboard.
- Tambah halaman **Categories** di admin untuk menambah, mengganti nama, menghapus, dan mengurutkan kategori.
- Pada form proyek, kategori menjadi dropdown checklist multi-select.
- Pilihan disimpan kompatibel dengan data proyek saat ini: kategori utama pada field category dan semua pilihan pada tags, sehingga filter Work tetap berjalan dan data lama tidak hilang.
- Filter Work membaca master kategori, tetapi tetap memasukkan kategori lama yang masih dipakai proyek.

### 6. Skills dan Tools dalam tab terpisah
- Tetap satu halaman admin, dengan tab **Skills** dan **Tools**.
- Tombol tambah mengikuti tab aktif.
- Masing-masing daftar memiliki panah atas/bawah, tanpa input nomor urut.
- Form baris ditata ulang agar nyaman di layar kecil.

### 7. Penyesuaian ponsel
- Ubah navigasi admin pada ponsel menjadi header ringkas dengan menu yang dapat dibuka/tutup.
- Tata judul dan tombol aksi dengan grid yang tidak saling menimpa.
- Ubah daftar Projects, Experience, Skills/Tools, social links, form proyek, tombol simpan, dan slider menjadi susunan satu kolom yang pas di layar kecil.
- Pertahankan layout desktop dan gaya visual yang sekarang.

## Detail teknis

- Tambah satu migrasi Lovable Cloud untuk tabel kategori, `GRANT`, RLS, kebijakan baca publik/admin, trigger `updated_at`, dan data awal.
- Query kategori memakai pola React Query yang sama seperti konten lain.
- Tidak menghapus kolom lama dari database agar data dan kompatibilitas tetap aman; field hanya dihentikan dari UI dan output publik.
- Semua route konten baru mendapat metadata halaman yang unik.

## Verifikasi

- Uji tambah/edit/hapus/urut kategori dan pilihan checkbox pada proyek.
- Uji panah urutan saat data awal memiliki nomor ganda.
- Uji simpan proyek, bullet points, satu project image, dan slider gambar.
- Uji tab Skills/Tools serta pengurutannya.
- Uji halaman admin utama dan halaman proyek pada desktop serta ponsel, termasuk overflow, tombol, menu, slider, dan error runtime.
