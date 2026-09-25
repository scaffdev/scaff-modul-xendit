# Cara mencopot Xendit

> Dibutuhkan bila kamu ganti ke payment lain (mis. via Scaffdev Builder).
> Estimasi: ±10 menit. Ikuti berurutan — jangan loncat.

## 0. Aturan emas (baca dulu!)

- Hapus **HANYA** file di bagian 1. File lain **JANGAN PERNAH** dihapus.
- Kalau ragu satu file, BERHENTI dan tanya pembuat template.

---

## A. Template Next.js

### A.1. Hapus file (aman — tidak dipakai kode lain)

- `lib/payments/xendit.ts` — client & verifikasi token Xendit.
- `app/api/payments/xendit/route.ts` — buat invoice.
- `app/api/payments/xendit/webhook/route.ts` — terima callback invoice.

```bash
rm lib/payments/xendit.ts "app/api/payments/xendit/route.ts" "app/api/payments/xendit/webhook/route.ts"
```

### A.2. Hapus env (dari `.env.local`)

- `XENDIT_SECRET_KEY`
- `XENDIT_CALLBACK_TOKEN` (bila kamu menambahkannya)

Hapus barisnya, jangan dikosongkan saja.

### A.3. Bersihkan dependency

Tidak ada dependency tambahan (modul ini memakai `fetch` bawaan Node).

### A.4. Verifikasi (wajib lolos semua)

```bash
npm run build
```

```bash
grep -ri "xendit" app lib components
```

- Build harus sukses.
- Grep harus menghasilkan **0 baris**. Bila masih ada sisa, hapus
  pemakaiannya, lalu build ulang.

### A.5. Yang JANGAN dihapus

- Komponen/form checkout umum, `package.json`, `.env.local` (cukup hapus
  baris env-nya), layout, config.

---

## B. Template Laravel

### B.1. Hapus file (aman — tidak dipakai kode lain)

- `app/Services/XenditService.php` — client Invoice Xendit.
- `app/Http/Controllers/XenditController.php` — buat invoice + terima callback.

```bash
rm "app/Services/XenditService.php" "app/Http/Controllers/XenditController.php"
```

### B.2. Hapus env (dari `.env`)

- `XENDIT_SECRET_KEY`
- `XENDIT_CALLBACK_TOKEN` (bila kamu menambahkannya)

Hapus barisnya, jangan dikosongkan saja.

### B.3. Bersihkan dependency

Tidak ada dependency tambahan (modul ini memakai HTTP client Laravel).

### B.4. Verifikasi (wajib lolos semua)

```bash
composer install --no-dev
php artisan config:clear
```

```bash
grep -ri "xendit" app routes resources config
```

- Install harus sukses tanpa error.
- Grep harus menghasilkan **0 baris**. Bila masih ada sisa, hapus
  pemakaiannya, lalu verifikasi ulang.
- Hapus juga blok `xendit` di `config/services.php` bila kamu menambahkannya.

### B.5. Yang JANGAN dihapus (Laravel)

- `config/services.php` itu sendiri (cukup hapus blok `xendit`-nya).
- Route/form checkout umum, `composer.json`, `.env` (cukup hapus baris env-nya).
