## Setup Xendit (digabung otomatis ke SETUP.md)

> 3 langkah, ±10 menit. Mode test gratis, tidak memotong saldo.
> Docs resmi: https://docs.xendit.co/quick-setup

### 1. Ambil Secret Key

1. Daftar/login di https://dashboard.xendit.co
2. Buka **Settings → Developers → API Keys**, buat/ambil **Secret Key**.
3. Tetap di mode **test** untuk pengembangan.

### 2. Isi env

```bash
XENDIT_SECRET_KEY=xnd_development_xxxx   # rahasia! server saja, tanpa NEXT_PUBLIC_
```

### 3. Coba buat invoice

`POST /api/payments/xendit` dengan body:

```json
{ "externalId": "order-1", "amount": 25000 }
```

Buka `invoiceUrl` dari respons → bayar dengan metode tes yang tersedia.

### 4. Webhook (status lunas otomatis) — JANGAN DILEWAT

1. Di Dashboard → **Settings → Developers**, buat **Callback verification token**,
   lalu isi ke env (tanpa `NEXT_PUBLIC_`, server saja):
   ```bash
   XENDIT_CALLBACK_TOKEN=token-dari-dashboard
   ```
   NOTED: route menolak webhook (500) selama env ini kosong — secure by default.
   Setelah Go Live + key ini terdaftar di admin Scaffdev, daftarkan juga ke
   `scaff.integration.json` agar ikut ke-generate otomatis.
2. Daftarkan `https://domainmu/api/payments/xendit/webhook` sebagai
   **Invoice callback URL** di halaman Developers yang sama.
3. Test: bayar invoice test → cek log server `{"ok":true,"paid":true}`.
