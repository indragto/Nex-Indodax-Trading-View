# Indodax Trading View

Indodax Trading View adalah aplikasi web yang dibangun menggunakan Next.js dan TailwindCSS untuk mengimplementasikan API dari Indodax exchange. Aplikasi ini memungkinkan pengguna untuk:

- Melihat daftar cryptocurrency yang tersedia di Indodax.
- Melakukan analisis detail pada cryptocurrency tertentu, seperti grafik harga, volume perdagangan, dan indikator lainnya.

## Fitur

- **Daftar Cryptocurrency**: Menampilkan daftar semua cryptocurrency yang tersedia di Indodax.
- **Detail Cryptocurrency**: Informasi mendalam tentang harga, volume, dan analisis teknikal.
- **Grafik Analisis**: Visualisasi data dengan grafik interaktif.
- **Desain Responsif**: Dibangun dengan TailwindCSS untuk memastikan pengalaman pengguna yang optimal di perangkat apa pun.
- **Kalkulator Profit**: Hitung potensi profit berdasarkan harga beli, harga jual, dan jumlah aset.
- **Fitur Trade (TODO)**: Fitur untuk melakukan pembelian dan penjualan cryptocurrency langsung dari aplikasi (masih dalam pengembangan).

## Teknologi yang Digunakan

- [Next.js](https://nextjs.org/): Framework React untuk rendering sisi server dan aplikasi web yang cepat.
- [TailwindCSS](https://tailwindcss.com/): Framework CSS untuk desain responsif.
- [Indodax API](https://github.com/btcid/indodax-official-api-docs): API resmi untuk data pasar Indodax.

## Prasyarat

Pastikan Anda telah menginstal:

- [Node.js](https://nodejs.org/) versi 18 atau lebih baru
- [npm](https://www.npmjs.com/) atau [yarn](https://yarnpkg.com/)

## Cara Instalasi

1. **Clone repository ini:**

   ```bash
   git clone https://github.com/username/indodax-trading-view.git
   cd indodax-trading-view
   ```

2. **Instal dependensi:**

   Menggunakan npm:

   ```bash
   npm install
   ```

   Atau menggunakan yarn:

   ```bash
   yarn install
   ```

3. **Konfigurasi API Key:**

   Buat file `.env.local` di root proyek dan tambahkan konfigurasi API key Indodax (jika diperlukan):

   ```env
   NEXT_PUBLIC_INDODAX_API_KEY=your_api_key_here
   ```

4. **Jalankan aplikasi:**

   ```bash
   npm run dev
   ```

   Atau:

   ```bash
   yarn dev
   ```

5. **Buka aplikasi di browser:**

   Navigasikan ke [http://localhost:3000](http://localhost:3000).

## Skrip yang Tersedia

- **`npm run dev`**: Menjalankan aplikasi dalam mode pengembangan.
- **`npm run build`**: Membuat aplikasi untuk produksi.
- **`npm start`**: Menjalankan aplikasi dalam mode produksi setelah build.

## Screenshot

### Halaman Utama

![Halaman Utama](https://raw.githubusercontent.com/indragto/Nex-Indodax-Trading-View/refs/heads/main/ss/Screenshot%202024-12-11%20at%2015.31.03.png)

![Halaman Utama 2](https://raw.githubusercontent.com/indragto/Nex-Indodax-Trading-View/refs/heads/main/ss/Screenshot%202024-12-11%20at%2015.31.35.png)

### Detail Cryptocurrency

![Detail Cryptocurrency](https://raw.githubusercontent.com/indragto/Nex-Indodax-Trading-View/refs/heads/main/ss/screencapture-localhost-3000-coin-btcidr-2024-12-11-15_35_29.png)

### Kalkulator Profit

![Kalkulator Profit](https://raw.githubusercontent.com/indragto/Nex-Indodax-Trading-View/refs/heads/main/ss/screencapture-localhost-3000-calculator-2024-12-11-15_38_56.png)

## Kontribusi

Kontribusi sangat dihargai! Silakan fork repositori ini dan buat pull request dengan perubahan Anda.

1. Fork repositori
2. Buat branch fitur baru: `git checkout -b fitur-anda`
3. Commit perubahan Anda: `git commit -m 'Tambah fitur keren'`
4. Push ke branch: `git push origin fitur-anda`
5. Buat Pull Request

## Lisensi

Proyek ini dilisensikan di bawah [MIT License](LICENSE).

## Kontak

Jika Anda memiliki pertanyaan atau saran, jangan ragu untuk menghubungi kami di [email@example.com](mailto:email@example.com).

