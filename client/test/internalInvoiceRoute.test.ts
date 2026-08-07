import assert from "node:assert/strict";
import test from "node:test";

import { POST } from "../src/app/api/internal/invoices/render/route";

const secret = "invoice-route-test-secret";

function request(body: string, suppliedSecret = secret) {
  return new Request("http://localhost/api/internal/invoices/render", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-invoice-render-secret": suppliedSecret,
    },
    body,
  });
}

const invoice = {
  body: {
    body: "Course registration fee",
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
    variableSymbol: "20260001",
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
  },
};

test.before(() => {
  process.env.INVOICE_RENDER_SECRET = secret;
});

test.after(() => {
  delete process.env.INVOICE_RENDER_SECRET;
});

test("rejects an invalid internal render secret", async () => {
  const response = await POST(request(JSON.stringify({}), "wrong-secret"));
  assert.equal(response.status, 401);
});

test("rejects malformed internal render requests", async () => {
  const invalidJson = await POST(request("{"));
  assert.equal(invalidJson.status, 400);

  const invalidPayload = await POST(
    request(JSON.stringify({ locale: "sk", invoice: {} })),
  );
  assert.equal(invalidPayload.status, 400);

  const invalidLogo = await POST(
    request(JSON.stringify({ locale: "sk", invoice, logo: "../secret.png" })),
  );
  assert.equal(invalidLogo.status, 400);
});

test("returns a PDF with the invoice filename", async () => {
  const response = await POST(
    request(JSON.stringify({ locale: "en", invoice })),
  );
  const pdf = Buffer.from(await response.arrayBuffer());

  assert.equal(response.status, 200);
  assert.equal(response.headers.get("content-type"), "application/pdf");
  assert.match(
    response.headers.get("content-disposition") ?? "",
    /invoice-20260001\.pdf/,
  );
  assert.equal(pdf.subarray(0, 4).toString(), "%PDF");
});

test("accepts omitted optional issuer fields", async () => {
  const response = await POST(
    request(
      JSON.stringify({
        locale: "en",
        invoice: {
          ...invoice,
          issuer: {
            name: invoice.issuer.name,
            address: invoice.issuer.address,
            variableSymbol: invoice.issuer.variableSymbol,
          },
        },
      }),
    ),
  );

  assert.equal(response.status, 200);
});
