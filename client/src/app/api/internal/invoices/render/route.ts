import { timingSafeEqual } from "crypto";

import { InvoiceFragment } from "@/lib/graphql/generated/graphql";
import { invoicePdfHeaders, renderInvoiceToBuffer } from "@/lib/invoice/render";

export const runtime = "nodejs";

function matchesSecret(value: string | null, expected: string | undefined) {
  if (!value || !expected) return false;

  const actualBuffer = Buffer.from(value);
  const expectedBuffer = Buffer.from(expected);
  return (
    actualBuffer.length === expectedBuffer.length &&
    timingSafeEqual(actualBuffer, expectedBuffer)
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object");
}

function isString(value: unknown): value is string {
  return typeof value === "string";
}

function isAddress(value: unknown) {
  return (
    isRecord(value) &&
    isString(value.street) &&
    isString(value.city) &&
    isString(value.postal) &&
    isString(value.country)
  );
}

function isOptionalString(value: unknown) {
  return value === undefined || value === null || isString(value);
}

function isInvoice(value: unknown): value is InvoiceFragment {
  if (!isRecord(value)) return false;
  const { body, issuer, payer } = value;

  return (
    isRecord(body) &&
    isString(body.body) &&
    isString(body.comment) &&
    isString(body.type) &&
    isString(body.issueDate) &&
    !Number.isNaN(Date.parse(body.issueDate)) &&
    isString(body.vatDate) &&
    !Number.isNaN(Date.parse(body.vatDate)) &&
    isString(body.dueDate) &&
    !Number.isNaN(Date.parse(body.dueDate)) &&
    typeof body.price === "number" &&
    Number.isFinite(body.price) &&
    typeof body.vat === "number" &&
    Number.isFinite(body.vat) &&
    isRecord(issuer) &&
    isString(issuer.name) &&
    isAddress(issuer.address) &&
    isOptionalString(issuer.ICO) &&
    isOptionalString(issuer.DIC) &&
    isOptionalString(issuer.ICDPH) &&
    isString(issuer.variableSymbol) &&
    issuer.variableSymbol.length > 0 &&
    isOptionalString(issuer.IBAN) &&
    isOptionalString(issuer.SWIFT) &&
    isRecord(payer) &&
    isString(payer.name) &&
    isAddress(payer.address) &&
    isOptionalString(payer.ICO) &&
    isOptionalString(payer.DIC) &&
    isOptionalString(payer.ICDPH)
  );
}

export async function POST(request: Request) {
  if (
    !matchesSecret(
      request.headers.get("x-invoice-render-secret"),
      process.env.INVOICE_RENDER_SECRET || process.env.SECRET,
    )
  ) {
    return Response.json({ message: "Unauthorized." }, { status: 401 });
  }

  let payload: { invoice?: unknown; locale?: unknown };
  try {
    payload = await request.json();
  } catch {
    return Response.json({ message: "Invalid JSON body." }, { status: 400 });
  }

  if (
    !isInvoice(payload.invoice) ||
    (payload.locale !== "sk" && payload.locale !== "en")
  ) {
    return Response.json({ message: "Invalid invoice data." }, { status: 400 });
  }

  const pdf = await renderInvoiceToBuffer(payload.invoice, payload.locale);

  return new Response(pdf, {
    headers: invoicePdfHeaders(payload.invoice),
  });
}
