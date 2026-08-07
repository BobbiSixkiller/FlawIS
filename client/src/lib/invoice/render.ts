import { renderToBuffer } from "@react-pdf/renderer";

import { InvoiceFragment } from "@/lib/graphql/generated/graphql";
import InvoiceDoc from "./InvoiceDoc";

export function invoiceFilename(invoice: InvoiceFragment) {
  const variableSymbol = invoice.issuer.variableSymbol?.trim();
  if (!variableSymbol) {
    throw new Error("Invoice issuer is missing a variable symbol.");
  }
  const safeNumber = variableSymbol.replace(/[^a-zA-Z0-9_-]/g, "-");
  return `invoice-${safeNumber}.pdf`;
}

export async function renderInvoiceToBuffer(
  invoice: InvoiceFragment,
  locale: string,
  logo?: string | null,
) {
  const document = await InvoiceDoc({ invoice, lng: locale, logo });
  return renderToBuffer(document);
}

export function invoicePdfHeaders(invoice: InvoiceFragment) {
  return {
    "Cache-Control": "private, no-store",
    "Content-Disposition": `attachment; filename="${invoiceFilename(invoice)}"`,
    "Content-Type": "application/pdf",
  };
}
