# scaff-modul-xendit

Modul pembayaran **Xendit Invoice** (VA bank, e-wallet, QRIS, retail — satu API)
untuk [Scaffdev](https://scaffdev.vercel.app) Builder.
Disuntik via `scaff ... --with=xendit` (CLI 0.2.0+).

| Framework | Status | Isi |
|---|---|---|
| Next.js | ✅ v1.0.0 | Invoice client + route buat invoice + route webhook terverifikasi |
| Laravel | 🟡 STAGED (v1.1.0) | Service + Controller sudah ditulis, belum disuntik CLI |

## Struktur

```
scaff-modul-xendit/
├── scaff.integration.json   ← manifest (satu-satunya yang dibaca CLI)
├── SETUP-FRAGMENT.md        ← digabung ke SETUP.md hasil racikan
├── REMOVE.md                ← panduan copot (skenario double payment)
├── nextjs/
│   ├── lib/payments/xendit.ts
│   └── app/api/payments/xendit/{route.ts,webhook/route.ts}
└── laravel/                 ← STAGED untuk v1.1.0
    ├── app/Services/XenditService.php
    └── app/Http/Controllers/XenditController.php
```

## Env (harus terdaftar di admin Scaffdev → tabel `integrasi`)

| Key | Keterangan |
|---|---|
| `XENDIT_SECRET_KEY` | Secret Key (rahasia, server saja) |

NOTED: `XENDIT_CALLBACK_TOKEN` sengaja belum masuk manifest (belum ada di
database). Isi manual + daftarkan ke admin agar ikut ter-generate —
lihat SETUP-FRAGMENT.md langkah 4.

## Validasi lokal (sebelum push)

```bash
scaffdev validate-module .
```

## Docs resmi yang dirujuk kode

- Auth + quick setup: https://docs.xendit.co/quick-setup
- Invoice API: https://developers.xendit.co/api-reference/#create-invoice
