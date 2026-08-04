import "reflect-metadata";

import assert from "node:assert/strict";
import test from "node:test";
import { getModelForClass } from "@typegoose/typegoose";
import { ObjectId } from "mongodb";

import { Invoice, InvoiceCounter } from "../src/entitites/Invoice";
import { Access } from "../src/entitites/User";
import { InvoiceOwnerType } from "../src/resolvers/types/attendee.types";
import { InvoiceService } from "../src/services/invoice.service";

const issuer = {
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
  variableSymbol: "2026",
  IBAN: "SK0000000000000000000000",
  SWIFT: "TESTSKBX",
};

const payer = {
  name: "Payer",
  address: {
    street: "Street 2",
    city: "Bratislava",
    postal: "811 02",
    country: "Slovakia",
  },
};

function attendeeWithSymbol(variableSymbol: string) {
  return {
    invoice: { issuer: { variableSymbol } },
  };
}

function fixture({
  conferenceSymbols = [],
  courseSymbols = [],
  reservedSequences = {},
}: {
  conferenceSymbols?: string[];
  courseSymbols?: string[];
  reservedSequences?: Record<string, number>;
} = {}) {
  const stored = new Map<string, Record<string, any>>();
  const conferenceInvoices = new Set(conferenceSymbols);
  const courseInvoices = new Set(courseSymbols);
  const counters = new Map(Object.entries(reservedSequences));

  const invoiceRepository = {
    reserveNextSequence: async (prefix: string, minimum: number) => {
      const sequence = Math.max(counters.get(prefix) ?? 0, minimum) + 1;
      counters.set(prefix, sequence);
      return sequence;
    },
    create: async (data: Record<string, any>) => {
      await Promise.resolve();
      const variableSymbol = data.issuer.variableSymbol;
      if (stored.has(variableSymbol)) {
        throw {
          code: 11000,
          keyPattern: { "issuer.variableSymbol": 1 },
        };
      }
      const record = { _id: new ObjectId(), ...data };
      stored.set(variableSymbol, record);
      return record;
    },
    findByOwner: async (ownerType: InvoiceOwnerType, attendeeId: ObjectId) =>
      [...stored.values()].find(
        (record) =>
          record.ownerType === ownerType &&
          record.attendeeId.toString() === attendeeId.toString(),
      ) ?? null,
    findVariableSymbols: async (prefix: string) =>
      [...stored.keys()].filter((symbol) => symbol.startsWith(prefix)),
    updateByOwner: async (
      ownerType: InvoiceOwnerType,
      attendeeId: ObjectId,
      invoice: Record<string, any>,
    ) => {
      const record = [...stored.values()].find(
        (candidate) =>
          candidate.ownerType === ownerType &&
          candidate.attendeeId.toString() === attendeeId.toString(),
      );
      if (!record) return null;
      Object.assign(record, invoice);
      return record;
    },
  };
  const attendeeRepository = {
    exists: async ({ "invoice.issuer.variableSymbol": symbol }: any) =>
      conferenceInvoices.has(symbol),
    findAll: async () =>
      conferenceSymbols.map((symbol) => attendeeWithSymbol(symbol)),
    findOne: async () => null,
  };
  const courseAttendeeRepository = {
    exists: async ({ "invoice.issuer.variableSymbol": symbol }: any) =>
      courseInvoices.has(symbol),
    findAll: async () =>
      courseSymbols.map((symbol) => attendeeWithSymbol(symbol)),
    findOne: async () => null,
  };
  const service = new InvoiceService(
    invoiceRepository as any,
    attendeeRepository as any,
    courseAttendeeRepository as any,
  );

  return {
    stored,
    service,
  };
}

function createInvoice(service: InvoiceService, overrides: Record<string, any> = {}) {
  return service.createInvoice({
    attendeeId: new ObjectId(),
    body: "Registration fee",
    comment: "Pay by the due date",
    grossPriceCents: 9900,
    issuedAt: new Date("2026-08-03T00:00:00.000Z"),
    issuer,
    ownerType: InvoiceOwnerType.COURSE_ATTENDEE,
    payer,
    payerEmail: "payer@example.com",
    type: "Invoice",
    userId: new ObjectId(),
    ...overrides,
  });
}

test("defines unique indexes for invoice numbers, owners, and counters", () => {
  const invoiceModel = getModelForClass(Invoice);
  const invoiceIndexes = invoiceModel.schema.indexes();
  const counterIndexes = getModelForClass(InvoiceCounter).schema.indexes();

  assert.equal(invoiceModel.collection.collectionName, "invoices");
  assert.ok(
    invoiceIndexes.some(
      ([fields, options]) =>
        fields["issuer.variableSymbol"] === 1 && options.unique === true,
    ),
  );
  assert.ok(
    invoiceIndexes.some(
      ([fields, options]) =>
        fields.ownerType === 1 &&
        fields.attendeeId === 1 &&
        options.unique === true,
    ),
  );
  assert.ok(
    counterIndexes.some(
      ([fields, options]) => fields.prefix === 1 && options.unique === true,
    ),
  );
});

test("creates a complete invoice with exact cent totals and dates", async () => {
  const { service } = fixture();
  const invoice = await createInvoice(service);

  assert.equal(invoice.issuer.variableSymbol, "20260001");
  assert.equal(invoice.body.price, 80.49);
  assert.equal(invoice.body.vat, 18.51);
  assert.equal(invoice.body.issueDate.toISOString(), "2026-08-03T00:00:00.000Z");
  assert.equal(invoice.body.vatDate.toISOString(), "2026-08-03T00:00:00.000Z");
  assert.equal(invoice.body.dueDate.toISOString(), "2026-08-18T00:00:00.000Z");
});

test("starts after historical course and conference invoice numbers", async () => {
  const { service } = fixture({
    conferenceSymbols: ["20260003"],
    courseSymbols: ["20260007"],
  });

  const invoice = await createInvoice(service);
  assert.equal(invoice.issuer.variableSymbol, "20260008");
});

test("concurrent allocations reserve distinct variable symbols", async () => {
  const { stored, service } = fixture();
  const invoices = await Promise.all([
    createInvoice(service),
    createInvoice(service),
    createInvoice(service),
  ]);
  const variableSymbols = invoices.map(
    (invoice) => invoice.issuer.variableSymbol,
  );

  assert.equal(new Set(variableSymbols).size, 3);
  assert.equal(stored.size, 3);
});

test("overlapping prefixes cannot create the same variable symbol", async () => {
  const { service } = fixture({ reservedSequences: { "2": 10000 } });
  const invoices = await Promise.all([
    createInvoice(service, {
      issuer: { ...issuer, variableSymbol: "2" },
    }),
    createInvoice(service, {
      issuer: { ...issuer, variableSymbol: "21" },
    }),
  ]);

  assert.equal(
    new Set(invoices.map((invoice) => invoice.issuer.variableSymbol)).size,
    2,
  );
});

test("uses zero VAT for FLAW email addresses", async () => {
  const { service } = fixture();
  const invoice = await createInvoice(service, {
    payerEmail: "member@flaw.uniba.sk",
  });

  assert.equal(invoice.body.price, 80.49);
  assert.equal(invoice.body.vat, 0);
});

test("rejects invalid prefixes and changes to issued invoice numbers", async () => {
  const { service } = fixture();
  await assert.rejects(
    createInvoice(service, {
      issuer: { ...issuer, variableSymbol: undefined },
    }),
    /requires a variable symbol/i,
  );
  await assert.rejects(
    createInvoice(service, {
      issuer: { ...issuer, variableSymbol: "invoice-2026" },
    }),
    /prefix must be numeric/i,
  );

  const invoice = await createInvoice(service);
  assert.throws(
    () =>
      service.validateInvoiceUpdate(invoice, {
        ...invoice,
        issuer: { ...invoice.issuer, variableSymbol: "20260099" },
      }),
    /cannot be changed/i,
  );
});

test("authorizes an invoice owner and rejects another participant", async () => {
  const attendeeUserId = new ObjectId();
  const { service } = fixture();
  const attendeeId = new ObjectId();
  const invoice = await createInvoice(service, {
    attendeeId,
    userId: attendeeUserId,
  });
  const owner = {
    id: attendeeUserId,
    access: [Access.CourseAttendee],
    email: "payer@example.com",
    name: "Payer",
  };

  assert.deepEqual(
    await service.getAuthorizedInvoice(
      InvoiceOwnerType.COURSE_ATTENDEE,
      attendeeId,
      owner,
    ),
    service.toInvoice(invoice),
  );
  await assert.rejects(
    service.getAuthorizedInvoice(
      InvoiceOwnerType.COURSE_ATTENDEE,
      attendeeId,
      { ...owner, id: new ObjectId() },
    ),
    /not authorized/i,
  );
});
