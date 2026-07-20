# TransHub Jabodetabek

TransHub adalah aplikasi publik untuk membantu merencanakan perjalanan transportasi umum di Jabodetabek. Aplikasi ini menyatukan KRL, MRT, LRT, TransJakarta, dan angkot agar pengguna dapat melihat:

- moda yang perlu digunakan;
- lokasi perpindahan;
- estimasi waktu perjalanan; dan
- rincian tarif beserta tingkat kepercayaan datanya.

Peta menjadi pusat pengalaman, sementara itinerary tertulis tetap menjadi panduan utama perjalanan.

## Status

Proyek ini sedang berada pada tahap boilerplate frontend. Integrasi Transit Engine dan pencarian rute akan dikembangkan secara bertahap.

## Menjalankan secara lokal

```bash
npm install
cp .env.example .env.local
npm run dev
```

Buka [http://localhost:5173](http://localhost:5173).

Perintah yang tersedia:

```bash
npm run dev       # development server
npm run lint      # pemeriksaan TypeScript
npm run build     # production build
npm run preview   # preview hasil build
```

## Teknologi

Vite, React, TypeScript, TanStack Query, Zustand, MapLibre GL JS, dan Vercel.

## Kontribusi

Pengembangan aktif dilakukan pada branch `dev`. Branch `main` menyimpan versi yang siap dipublikasikan dan dideploy berkala ke Vercel.

## Lisensi

MIT.
