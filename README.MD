# Proyek Tampilan Google Sheets

Proyek ini adalah aplikasi web sederhana yang mengambil data dari Google Sheet dan menampilkannya dalam bentuk tabel di halaman web. Pengguna dapat memfilter data berdasarkan rentang tanggal dan menyalin tabel yang dihasilkan ke clipboard.

## Cara Menggunakan

1.  **Dapatkan Kunci API Google Sheets:**
    *   Buka [Google Cloud Console](https://console.cloud.google.com/).
    *   Buat proyek baru.
    *   Buka "APIs & Services" > "Library".
    *   Cari dan aktifkan "Google Sheets API".
    *   Buka "APIs & Services" > "Credentials".
    *   Klik "Create Credentials" > "API key".

2.  **Konfigurasi Proyek:**
    *   Buka file `script.js`.
    *   Ganti `'YOUR_API_KEY'` dengan Kunci API yang Anda dapatkan di langkah sebelumnya.
    *   Ganti `'YOUR_SHEET_ID'` dengan ID Google Sheet Anda. Anda bisa mendapatkan ID ini dari URL sheet Anda (misalnya, `https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/edit`).

3.  **Jalankan Proyek:**
    *   Buka terminal dan jalankan perintah `npm install http-server -g` untuk menginstal server HTTP.
    *   Jalankan `npm start` atau `http-server` untuk memulai server web.
    *   Buka browser Anda dan navigasikan ke alamat yang ditampilkan di terminal (biasanya `http://127.0.0.1:8080`).

## Lisensi

Proyek ini dilisensikan di bawah Lisensi MIT. Lihat file `LICENSE` untuk detailnya.
