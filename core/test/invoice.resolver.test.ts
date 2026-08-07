import "reflect-metadata";

import assert from "node:assert/strict";
import test from "node:test";
import { ObjectId } from "mongodb";

import { Access } from "../src/entitites/User";
import { CourseAttendeeResolver } from "../src/resolvers/courses/courseAttendee.resolver";
import { InvoiceResolver } from "../src/resolvers/invoice.resolver";
import { InvoiceOwnerType } from "../src/resolvers/types/attendee.types";
import { InvoiceService } from "../src/services/invoice.service";

const invoice = {
  body: {
    body: "Course registration fee",
    comment: "Pay by the due date",
    dueDate: new Date("2026-08-18T00:00:00.000Z"),
    issueDate: new Date("2026-08-03T00:00:00.000Z"),
    price: 80,
    type: "Invoice",
    vat: 19,
    vatDate: new Date("2026-08-03T00:00:00.000Z"),
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

function fixture({
  access = [Access.CourseAttendee],
  attendeeUserId = new ObjectId(),
}: {
  access?: Access[];
  attendeeUserId?: ObjectId;
} = {}) {
  const courseAttendeeRepository = {
    findOne: async () => ({ user: { id: attendeeUserId }, invoice }),
  };
  const conferenceAttendeeRepository = {
    findOne: async () => ({ user: { id: attendeeUserId }, invoice }),
  };
  const invoiceService = new InvoiceService(
    { findByOwner: async () => null } as any,
    conferenceAttendeeRepository as any,
    courseAttendeeRepository as any,
  );
  const resolver = new InvoiceResolver(invoiceService);

  return {
    attendeeUserId,
    context: {
      user: {
        id: attendeeUserId,
        access,
        email: "payer@example.com",
        name: "Payer",
      },
    } as any,
    resolver,
  };
}

test("returns a course invoice to its owner", async () => {
  const { resolver, context } = fixture();
  const result = await resolver.invoice(
    InvoiceOwnerType.COURSE_ATTENDEE,
    new ObjectId(),
    context,
  );

  assert.equal(result, invoice);
});

test("returns a conference invoice to an administrator", async () => {
  const { resolver, context } = fixture({ access: [Access.Admin] });
  const result = await resolver.invoice(
    InvoiceOwnerType.CONFERENCE_ATTENDEE,
    new ObjectId(),
    context,
  );

  assert.equal(result, invoice);
});

test("rejects an invoice request from another participant", async () => {
  const { resolver, context } = fixture();
  context.user.id = new ObjectId();

  await assert.rejects(
    resolver.invoice(
      InvoiceOwnerType.COURSE_ATTENDEE,
      new ObjectId(),
      context,
    ),
    /not authorized/i,
  );
});

test("returns null when the attendee does not exist", async () => {
  const { attendeeUserId, context } = fixture();
  const invoiceService = new InvoiceService(
    { findByOwner: async () => null } as any,
    { findOne: async () => null } as any,
    { findOne: async () => null } as any,
  );
  const resolver = new InvoiceResolver(invoiceService);

  context.user.id = attendeeUserId;
  const result = await resolver.invoice(
    InvoiceOwnerType.COURSE_ATTENDEE,
    new ObjectId(),
    context,
  );

  assert.equal(result, null);
});

test("derives hasInvoice from stored and referenced invoices", () => {
  const resolver = new CourseAttendeeResolver(
    {} as any,
    {} as any,
    {} as any,
  );

  assert.equal(resolver.hasInvoice({ invoice } as any), true);
  assert.equal(resolver.hasInvoice({ invoiceId: new ObjectId() } as any), true);
  assert.equal(resolver.hasInvoice({ invoice: undefined } as any), false);
});
