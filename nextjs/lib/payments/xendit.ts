/**
 * Client Xendit Invoice — disuntik Scaffdev Builder ke template Next.js.
 *
 * NOTED:
 * - File ini 100% milik modul "xendit". Jangan import dari kode inti template.
 * - Secret Key HANYA di server. JANGAN PERNAH kirim ke browser.
 * - Invoice Xendit cocok untuk VA bank, e-wallet, QRIS, retail — satu API.
 *
 * Referensi resmi:
 * - Auth (Basic, secret + ":"): https://docs.xendit.co/quick-setup
 * - Invoice API v2            : https://developers.xendit.co/api-reference/#create-invoice
 */
const INVOICE_BASE = "https://api.xendit.co/v2/invoices";

function authHeader(): string {
  // NOTED: Basic Auth Xendit = base64("<SecretKey>:") — titik dua wajib ada.
  const key = process.env.XENDIT_SECRET_KEY;
  if (!key) throw new Error("MISSING_ENV: isi XENDIT_SECRET_KEY di .env.local");
  return `Basic ${Buffer.from(`${key}:`).toString("base64")}`;
}

export interface InvoiceParams {
  /** external_id unik dari tokomu (dipakai mencocokkan webhook). */
  externalId: string;
  /** Nominal Rupiah, bilangan bulat. NOTED: Xendit menolak amount < 1000 untuk kebanyakan metode. */
  amount: number;
  customerEmail?: string;
  description?: string;
  /** Detik invoice kedaluwarsa. NOTED: default Xendit 24 jam bila tidak diisi. */
  durationSeconds?: number;
}

export interface InvoiceResult {
  id: string;
  externalId: string;
  invoiceUrl: string;
  expiryDate: string;
  status: string;
}

/** Buat invoice. Frontend tinggal redirect customer ke invoiceUrl. */
export async function createInvoice(params: InvoiceParams): Promise<InvoiceResult> {
  if (!params.externalId?.trim()) throw new Error("externalId wajib diisi");
  if (!Number.isInteger(params.amount) || params.amount <= 0) {
    throw new Error("amount harus bilangan bulat Rupiah > 0");
  }

  const res = await fetch(INVOICE_BASE, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: authHeader(),
    },
    body: JSON.stringify({
      external_id: params.externalId,
      amount: params.amount,
      // NOTED: field opsional dikirim hanya bila ada — payload minimal.
      ...(params.customerEmail ? { payer_email: params.customerEmail } : {}),
      ...(params.description ? { description: params.description } : {}),
      ...(params.durationSeconds ? { invoice_duration: params.durationSeconds } : {}),
    }),
  });

  if (!res.ok) {
    throw new Error(`Xendit error ${res.status}: ${await res.text()}`);
  }
  const data = (await res.json()) as {
    id: string;
    external_id: string;
    invoice_url: string;
    expiry_date: string;
    status: string;
  };
  return {
    id: data.id,
    externalId: data.external_id,
    invoiceUrl: data.invoice_url,
    expiryDate: data.expiry_date,
    status: data.status,
  };
}

export interface XenditWebhook {
  id: string;
  external_id: string;
  status: string;
  amount: number;
}

/**
 * Verifikasi webhook via header x-callback-token.
 * NOTED: token ini BUKAN secret key — dibuat di Dashboard → Settings →
 * Developers → Callback verification token. Tanpa ini, siapa pun bisa
 * memalsukan status lunas. Route menolak (500) bila env belum diisi —
 * secure by default, lihat SETUP-FRAGMENT.md langkah 4.
 */
export function verifyWebhookToken(headers: Headers): boolean {
  const expected = process.env.XENDIT_CALLBACK_TOKEN;
  if (!expected) {
    throw new Error(
      "MISSING_ENV: isi XENDIT_CALLBACK_TOKEN (Dashboard → Settings → Developers) agar webhook aman"
    );
  }
  return headers.get("x-callback-token") === expected;
}

/** Status yang berarti uang SUDAH masuk. */
export function isPaidStatus(status: string): boolean {
  // NOTED: Xendit mengirim "PAID" (huruf besar) — samakan persis, jangan lowercase-kan.
  return status === "PAID";
}
