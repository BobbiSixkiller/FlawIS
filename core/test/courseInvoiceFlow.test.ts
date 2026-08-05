import "reflect-metadata";

import assert from "node:assert/strict";
import test from "node:test";
import mongoose from "mongoose";
import { ObjectId } from "mongodb";

import { CourseAttendeeService } from "../src/services/courses/courseAttendee.service";
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

function fixture(price: number) {
  const courseId = new ObjectId();
  const userId = new ObjectId();
  const formId = new ObjectId();
  const producedMessages: Record<string, any>[] = [];
  let createdData: Record<string, any> | undefined;
  let storedInvoice: Record<string, any> | undefined;

  const course = {
    id: courseId,
    name: "Contract law",
    price,
    billing: price > 0 ? issuer : undefined,
    attendeesCount: 0,
  };
  const attendeeRepository = {
    exists: async () => false,
    findAll: async () => [],
    findOne: async () => null,
    create: async (data: Record<string, any>) => {
      createdData = data;
      return {
        ...data,
        toJSON: ({ transform }: any) => {
          const result = { _id: new ObjectId(), ...data };
          return transform(null, result);
        },
      };
    },
  };
  const invoiceService = new InvoiceService(
    {
      reserveNextSequence: async (_prefix: string, minimum: number) =>
        minimum + 1,
      create: async (data: Record<string, any>) => {
        storedInvoice = { _id: new ObjectId(), ...data };
        return storedInvoice;
      },
      findVariableSymbols: async () => [],
    } as any,
    { exists: async () => false, findAll: async () => [] } as any,
    attendeeRepository as any,
  );
  const service = new CourseAttendeeService(
    attendeeRepository as any,
    {} as any,
    { getCourse: async () => course } as any,
    { updateMany: async () => undefined } as any,
    {
      getUser: async () => ({
        id: userId,
        email: "payer@example.com",
        name: "Payer",
        organization: "Organization",
        telephone: "123",
      }),
    } as any,
    {
      language: () => "en",
      translate: (key: string) => {
        if (key === "invoice.type") return "Invoice";
        if (key === "invoice.body") return "Course registration fee";
        if (key === "invoice.comment") return "Pay by the due date";
        return key;
      },
    } as any,
    {} as any,
    {
      produceMessage: (message: string) => {
        producedMessages.push(JSON.parse(message));
      },
    } as any,
    { getForm: async () => ({ course: courseId }) } as any,
    {} as any,
    invoiceService,
  );

  return {
    application: { form: formId, formVersion: 1, answers: {} },
    courseId,
    createdData: () => createdData,
    producedMessages,
    service,
    storedInvoice: () => storedInvoice,
    userId,
  };
}

async function withMockSession(operation: () => Promise<void>) {
  const originalStartSession = mongoose.startSession;
  mongoose.startSession = async () =>
    ({
      startTransaction() {},
      async withTransaction(callback: () => Promise<void>) {
        await callback();
      },
      async commitTransaction() {},
      async abortTransaction() {},
      endSession() {},
    }) as any;

  try {
    await operation();
  } finally {
    mongoose.startSession = originalStartSession;
  }
}

test("a free course creates no invoice and publishes no invoice payload", async () => {
  await withMockSession(async () => {
    const fixtureData = fixture(0);
    await fixtureData.service.createCourseAttendee(
      "courses.example.test",
      fixtureData.courseId,
      fixtureData.userId,
      fixtureData.application,
      payer as any,
    );

    assert.equal(fixtureData.createdData()?.invoiceId, undefined);
    assert.equal(fixtureData.storedInvoice(), undefined);
    assert.equal(fixtureData.producedMessages[0].invoice, undefined);
  });
});

test("a paid course creates and publishes a complete invoice snapshot", async () => {
  await withMockSession(async () => {
    const fixtureData = fixture(9900);
    await fixtureData.service.createCourseAttendee(
      "courses.example.test",
      fixtureData.courseId,
      fixtureData.userId,
      fixtureData.application,
      payer as any,
    );

    const invoice = fixtureData.storedInvoice()!;
    assert.equal(invoice.body.type, "Invoice");
    assert.equal(invoice.body.body, "Course registration fee");
    assert.equal(invoice.body.comment, "Pay by the due date");
    assert.ok(invoice.body.issueDate instanceof Date);
    assert.ok(invoice.body.vatDate instanceof Date);
    assert.ok(invoice.body.dueDate instanceof Date);
    assert.equal(invoice.issuer.variableSymbol, "20260001");
    assert.deepEqual(invoice.payer, payer);
    assert.deepEqual(
      fixtureData.producedMessages[0].invoice,
      JSON.parse(
        JSON.stringify({
          body: invoice.body,
          issuer: invoice.issuer,
          payer: invoice.payer,
        }),
      ),
    );
    assert.equal(
      fixtureData.createdData()?.invoiceId,
      invoice._id,
    );
  });
});

test("a paid registration rejects missing payer billing", async () => {
  await withMockSession(async () => {
    const fixtureData = fixture(9900);
    await assert.rejects(
      fixtureData.service.createCourseAttendee(
        "courses.example.test",
        fixtureData.courseId,
        fixtureData.userId,
        fixtureData.application,
      ),
      /billing information/i,
    );
    assert.equal(fixtureData.createdData(), undefined);
  });
});
