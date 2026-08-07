import assert from "node:assert/strict";
import test from "node:test";

import { InvoiceFragment } from "../src/lib/graphql/generated/graphql";
import {
  invoiceFilename,
  renderInvoiceToBuffer,
} from "../src/lib/invoice/render";

const invoice = {
  body: {
    body: "Course registration fee: Contract law",
    comment: "Pay by the due date.",
    dueDate: "2026-08-18T00:00:00.000Z",
    issueDate: "2026-08-03T00:00:00.000Z",
    price: 80,
    type: "Invoice",
    vat: 19,
    vatDate: "2026-08-03T00:00:00.000Z",
  },
  issuer: {
    name: "Issuer",
    address: {
      street: "Street 1",
      city: "Bratislava",
      postal: "811 01",
      country: "Slovakia",
    },
    ICO: "123",
    DIC: "456",
    ICDPH: "SK456",
    variableSymbol: "2026/0001",
    IBAN: "SK0000000000000000000000",
    SWIFT: "TESTSKBX",
  },
  payer: {
    name: "Payer",
    address: {
      street: "Street 2",
      city: "Bratislava",
      postal: "811 02",
      country: "Slovakia",
    },
    ICO: null,
    DIC: null,
    ICDPH: null,
  },
} satisfies InvoiceFragment;

test("uses a filesystem-safe variable symbol in the filename", () => {
  assert.equal(invoiceFilename(invoice), "invoice-2026-0001.pdf");
});

test("rejects an invoice without a variable symbol", () => {
  assert.throws(
    () =>
      invoiceFilename({
        ...invoice,
        issuer: { ...invoice.issuer, variableSymbol: null },
      }),
    /missing a variable symbol/i,
  );
});

for (const locale of ["sk", "en"]) {
  test(`renders a valid ${locale} invoice PDF`, async () => {
    const pdf = await renderInvoiceToBuffer(invoice, locale);

    assert.ok(pdf.length > 1_000);
    assert.equal(pdf.subarray(0, 4).toString(), "%PDF");
  });
}

test("wraps long invoice content across numbered A4 pages", async () => {
  const longInvoice: InvoiceFragment = {
    ...invoice,
    body: {
      ...invoice.body,
      body: Array(220).fill("Long invoiced course description.").join(" "),
    },
  };
  const pdf = await renderInvoiceToBuffer(longInvoice, "en");
  const pageCount = pdf
    .toString("latin1")
    .match(/\/Type \/Page\b/g)?.length;

  assert.ok((pageCount ?? 0) > 1);
});

test("renders when optional issuer fields are absent", async () => {
  const pdf = await renderInvoiceToBuffer(
    {
      ...invoice,
      issuer: {
        name: invoice.issuer.name,
        address: invoice.issuer.address,
        variableSymbol: invoice.issuer.variableSymbol,
      },
    },
    "en",
  );

  assert.equal(pdf.subarray(0, 4).toString(), "%PDF");
});

test("embeds the no-text FLAW logo when no logo is supplied", async () => {
  const pdf = await renderInvoiceToBuffer(invoice, "en");

  assert.match(pdf.toString("latin1"), /\/Subtype \/Image\b/);
});

test("embeds the issuer stamp on the final invoice page", async () => {
  const pdf = await renderInvoiceToBuffer(invoice, "en");

  assert.match(pdf.toString("latin1"), /\/DCTDecode\b/);
});
