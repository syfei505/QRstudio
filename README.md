# QR Studio

Website pembuat QR code: batch Virtual Account (impor Excel/CSV), URL & teks, WiFi, WhatsApp, Email, dan Kontak (vCard). Bisa dikustomisasi (warna, gradasi, bentuk titik/mata, logo, bingkai) dan diunduh sebagai PNG, SVG, atau ZIP.

Situs statis murni (HTML + CSS + JavaScript biasa). Tidak ada build step, framework, atau server.

## Struktur proyek

```
qr-studio/
├── index.html              Kerangka halaman & pemanggilan file CSS/JS
├── assets/
│   └── favicon.svg
├── css/
│   ├── variables.css       Warna, font, bayangan, tema gelap  <- ubah tampilan di sini
│   ├── base.css            Reset & gaya dasar
│   ├── layout.css          Header, hero, grid halaman
│   ├── components.css      Form, tombol, tab, baris batch, panel tampilan
│   ├── preview.css         Panel pratinjau & kartu hasil
│   └── overlays.css        Dialog, toast, reduced-motion
└── js/
    ├── utils.js            Helper ($, esc) dan toast
    ├── config.js           State, daftar jenis QR (MODES), tema (PRESETS), localStorage
    ├── qr-engine.js        Mesin gambar QR -> SVG (bentuk titik, mata, gradasi, logo, bingkai)
    ├── export.js           PNG/SVG dan fungsi unduh
    ├── content.js          Format isi per jenis QR + parser impor Excel/CSV
    ├── ui-preview.js       Pratinjau langsung & cek kontras
    ├── ui-input.js         Tab jenis QR, form, baris batch
    ├── ui-results.js       Daftar hasil & unduh ZIP
    ├── ui-style.js         Panel Tampilan
    └── main.js             Event listener & inisialisasi
```

Urutan `<script>` di `index.html` penting: file di bawah memakai fungsi dari file di atasnya.

## Cara menjalankan

- **Lokal**: buka `index.html` di browser, atau jalankan `python3 -m http.server` lalu buka http://localhost:8000
- **Hosting**: upload seluruh folder ke Vercel, Netlify, GitHub Pages, atau `public_html` di hosting biasa.

## Panduan edit cepat

| Ingin mengubah...                     | Buka                                                   |
|---------------------------------------|--------------------------------------------------------|
| Warna, font, tema gelap               | `css/variables.css`                                    |
| Teks judul / label / struktur halaman | `index.html`                                           |
| Tema warna siap pakai                 | `PRESETS` di `js/config.js`                            |
| Pengaturan awal (warna, bentuk, dll)  | `DEFAULT_STYLE` di `js/config.js`                      |
| Menambah jenis QR baru                | `MODES` di `js/config.js` + `contentFor()` di `js/content.js` |
| Bentuk titik / mata QR baru           | `buildSVG()` dan `eyePath()` di `js/qr-engine.js`      |
| Batas jumlah baris batch              | `MAX_ROWS` di `js/utils.js`                            |
| Perilaku impor Excel                  | `fromMatrix()` di `js/content.js`                      |
| Nama file hasil unduhan               | `exportOne()` dan `zipAll()` di `js/export.js`, `js/ui-results.js` |

### Contoh: menambah jenis QR "SMS"
1. Di `js/config.js`, tambahkan entri di `MODES`:
   ```js
   sms:{label:'SMS',hint:'Kirim SMS otomatis',fields:[
     {k:'num',l:'Nomor tujuan',p:'0812...'},
     {k:'msg',l:'Isi pesan',t:'textarea'}]}
   ```
   Tambahkan juga `sms:{num:'',msg:''}` di `state.single`.
2. Di `js/content.js`, pada `contentFor()` tambahkan:
   ```js
   case 'sms': return d.num.trim()?`SMSTO:${d.num.trim()}:${d.msg}`:'';
   ```

## Ketergantungan (CDN)

Dimuat dari internet saat halaman dibuka:
- [qrcode-generator](https://github.com/kazuhikoarase/qrcode-generator) 1.4.4: menghitung matriks QR
- [JSZip](https://stuk.github.io/jszip/) 3.10.1: unduh ZIP
- [SheetJS](https://sheetjs.com/) 0.18.5: impor Excel
- Google Fonts: Bricolage Grotesque, Figtree, JetBrains Mono

Untuk versi offline penuh, unduh library di atas ke folder `vendor/` lalu ganti URL pada tag `<script>` di `index.html` (font akan otomatis memakai font cadangan sistem).

## Catatan

- Semua QR dibuat di browser pengguna; tidak ada data yang dikirim ke server.
- Pengaturan tampilan tersimpan di `localStorage` browser (data baris tidak disimpan).
- Impor Excel: format kolom nomor VA sebagai **Teks** agar angka panjang tidak berubah menjadi notasi ilmiah.
