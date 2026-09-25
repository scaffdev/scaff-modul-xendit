<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

/**
 * Service Xendit Invoice — disuntik Scaffdev Builder ke template Laravel.
 *
 * NOTED:
 * - File ini 100% milik modul "xendit" (lihat scaff.integration.json).
 * - Sengaja memakai HTTP client Laravel (bukan xendit-php SDK) agar kontrak
 *   REST-nya 1:1 dengan implementasi Next.js dan kebal perubahan versi SDK:
 *   POST https://api.xendit.co/v2/invoices, Basic Auth "<secret>:".
 *   Ref: https://developers.xendit.co/api-reference/#create-invoice
 * - Secret Key HANYA dari config/services.php (env), jangan hardcode.
 */
class XenditService
{
    protected string $base = 'https://api.xendit.co/v2';

    protected function client(): \Illuminate\Http\Client\PendingRequest
    {
        // NOTED: withBasicAuth($user, '') menghasilkan base64("<secret>:"),
        // persis format auth resmi Xendit.
        return Http::withBasicAuth(config('services.xendit.secret_key'), '')
            ->acceptJson()
            ->asJson();
    }

    /** Buat invoice. Return: ['id', 'externalId', 'invoiceUrl', 'expiryDate', 'status']. */
    public function createInvoice(string $externalId, int $amount, ?string $email = null, ?string $description = null): array
    {
        abort_if(trim($externalId) === '' || $amount <= 0, 422, 'externalId & amount tidak valid');

        $payload = array_filter([
            'external_id' => $externalId,
            'amount' => $amount,
            'payer_email' => $email,
            'description' => $description,
        ]);

        $res = $this->client()->post("{$this->base}/invoices", $payload);
        // NOTED: throw() agar gagal dengan pesan + status jelas bila Xendit menolak.
        $data = $res->throw()->json();

        return [
            'id' => $data['id'],
            'externalId' => $data['external_id'],
            'invoiceUrl' => $data['invoice_url'],
            'expiryDate' => $data['expiry_date'],
            'status' => $data['status'],
        ];
    }

    /** Verifikasi header x-callback-token dari Xendit. */
    public function verifyToken(?string $token): bool
    {
        $expected = config('services.xendit.callback_token');
        abort_if(empty($expected), 500, 'Isi XENDIT_CALLBACK_TOKEN agar webhook aman');

        return hash_equals((string) $expected, (string) $token);
    }

    public function isPaid(string $status): bool
    {
        return $status === 'PAID';
    }
}
