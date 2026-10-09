import { NextResponse } from "next/server";
import { createInvoice } from "../../../../lib/payments/xendit";

/**
 * POST /api/payments/xendit — buat invoice.
 *
 * NOTED: import path RELATIF agar jalan di template base mana pun.
 * Route 100% server-side → Secret Key aman.
 *
 * Body: { externalId: string, amount: number, customerEmail?: string, description?: string, durationSeconds?: number }
 * Balikan: { id, externalId, invoiceUrl, expiryDate, status }
 */
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body harus JSON valid" }, { status: 400 });
  }

  const { externalId, amount, customerEmail, description, durationSeconds } = (body ?? {}) as {
    externalId?: unknown;
    amount?: unknown;
    customerEmail?: unknown;
    description?: unknown;
    durationSeconds?: unknown;
  };

  if (typeof externalId !== "string" || !externalId.trim()) {
    return NextResponse.json({ error: "externalId wajib string non-kosong" }, { status: 400 });
  }
  if (typeof amount !== "number" || !Number.isInteger(amount) || amount <= 0) {
    return NextResponse.json({ error: "amount wajib bilangan bulat Rupiah > 0" }, { status: 400 });
  }

  if (durationSeconds !== undefined && (typeof durationSeconds !== "number" || !Number.isInteger(durationSeconds) || durationSeconds <= 0)) {
    return NextResponse.json({ error: "durationSeconds wajib bilangan bulat detik > 0" }, { status: 400 });
  }

  try {
    const result = await createInvoice({
      externalId: externalId.trim(),
      amount,
      customerEmail: typeof customerEmail === "string" ? customerEmail : undefined,
      description: typeof description === "string" ? description : undefined,
      durationSeconds,
    });
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Gagal membuat invoice" },
      { status: 502 }
    );
  }
}
