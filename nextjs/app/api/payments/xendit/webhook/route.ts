import { NextResponse } from "next/server";
import {
  verifyWebhookToken,
  isPaidStatus,
  type XenditWebhook,
} from "../../../../../../lib/payments/xendit";

/**
 * POST /api/payments/xendit/webhook — terima callback invoice dari Xendit.
 *
 * NOTED:
 * 1. Daftarkan URL publik route ini di Dashboard → Settings → Developers →
 *    Invoice callback URL. Xendit tidak bisa memanggil localhost.
 * 2. Verifikasi header x-callback-token dulu (403 bila palsu).
 * 3. Balas 200 secepatnya; kerja berat via antrean.
 *
 * Ref: https://developers.xendit.co/api-reference/#invoice-callbacks
 */
export async function POST(req: Request) {
  // NOTED: verifikasi token DULU sebelum membaca/mengolah body.
  try {
    if (!verifyWebhookToken(req.headers)) {
      return NextResponse.json({ error: "Callback token tidak valid" }, { status: 403 });
    }
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Konfigurasi server bermasalah" },
      { status: 500 }
    );
  }

  let payload: XenditWebhook;
  try {
    payload = (await req.json()) as XenditWebhook;
  } catch {
    return NextResponse.json({ error: "Body harus JSON valid" }, { status: 400 });
  }

  if (!payload?.external_id || !payload?.status) {
    return NextResponse.json({ error: "Payload callback tidak lengkap" }, { status: 400 });
  }

  // NOTED: titik integrasi ke database-mu. Contoh:
  //   if (isPaidStatus(payload.status)) await db.order.markPaid(payload.external_id);
  // TODO pemilik project: ganti dengan query aslimu.
  const paid = isPaidStatus(payload.status);

  return NextResponse.json({ ok: true, externalId: payload.external_id, paid });
}
