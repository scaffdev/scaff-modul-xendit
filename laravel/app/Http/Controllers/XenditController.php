<?php

namespace App\Http\Controllers;

use App\Services\XenditService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Controller Xendit — disuntik Scaffdev Builder ke template Laravel.
 *
 * NOTED — daftarkan route manual (mis. di routes/api.php):
 *   Route::post('/api/payments/xendit', [XenditController::class, 'create']);
 *   Route::post('/api/payments/xendit/webhook', [XenditController::class, 'webhook']);
 */
class XenditController extends Controller
{
    public function __construct(protected XenditService $xendit) {}

    /** POST /api/payments/xendit — buat invoice. */
    public function create(Request $request): JsonResponse
    {
        $data = $request->validate([
            'externalId' => 'required|string|max:100',
            'amount' => 'required|integer|min:1',
            'customerEmail' => 'nullable|email|max:255',
            'description' => 'nullable|string|max:255',
        ]);

        return response()->json($this->xendit->createInvoice(
            $data['externalId'],
            $data['amount'],
            $data['customerEmail'] ?? null,
            $data['description'] ?? null
        ));
    }

    /** POST /api/payments/xendit/webhook — terima callback invoice. */
    public function webhook(Request $request): JsonResponse
    {
        // NOTED: verifikasi token DULU sebelum mengolah body.
        if (! $this->xendit->verifyToken($request->header('x-callback-token'))) {
            return response()->json(['error' => 'Callback token tidak valid'], 403);
        }

        $data = $request->validate([
            'external_id' => 'required|string',
            'status' => 'required|string',
        ]);

        // NOTED: titik integrasi ke database-mu.
        // TODO pemilik project: ganti dengan query aslimu.
        $paid = $this->xendit->isPaid($data['status']);

        return response()->json(['ok' => true, 'externalId' => $data['external_id'], 'paid' => $paid]);
    }
}
