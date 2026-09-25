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

---

## Setup Laravel (base Laravel)

> CLI menyuntik Service + Controller; 3 langkah manual di bawah wajib
> karena tidak bisa di-generate otomatis. Tanpa SDK tambahan
> (pakai HTTP client Laravel).

### L1. Isi `.env`

```bash
XENDIT_SECRET_KEY=xnd_development_xxxx   # rahasia! server saja
```

### L2. Tambah ke `config/services.php`

```php
'xendit' => [
    'secret_key' => env('XENDIT_SECRET_KEY'),
    // 'callback_token' => env('XENDIT_CALLBACK_TOKEN'), // isi setelah buat token
],
```

### L3. Daftarkan route (mis. di `routes/api.php`)

```php
use App\Http\Controllers\XenditController;

Route::post('/api/payments/xendit', [XenditController::class, 'create']);
Route::post('/api/payments/xendit/webhook', [XenditController::class, 'webhook']);
```

Lalu `php artisan config:clear`. Webhook ikut aturan langkah 4 Next.js
di atas (callback token + URL publik).
