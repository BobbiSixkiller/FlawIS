import "reflect-metadata";

import assert from "node:assert/strict";
import test from "node:test";
import { getModelForClass } from "@typegoose/typegoose";
import { graphql } from "graphql";
import mongoose from "mongoose";
import { ObjectId } from "mongodb";
import { buildSchema } from "type-graphql";

import { Attendee } from "../src/entitites/Attendee";
import { Conference } from "../src/entitites/Conference";
import { CourseAttendee } from "../src/entitites/Course";
import { ConferenceService } from "../src/services/conferences/conference.service";
import { ConferenceAttendeeService } from "../src/services/conferences/conferenceAttendee.service";
import { AttendeeResolver } from "../src/resolvers/conferences/attendee.resolver";
import { ConferenceResolver } from "../src/resolvers/conferences/conference.resolver";
import { SectionResolver } from "../src/resolvers/conferences/section.resolver";
import { ObjectIdScalar } from "../src/util/scalars";

async function withMockSession(operation: () => Promise<void>) {
  const originalStartSession = mongoose.startSession;
  const session = {
    async withTransaction(callback: () => Promise<void>) {
      await callback();
    },
    endSession() {},
  } as any;
  mongoose.startSession = async () => session;

  try {
    await operation();
  } finally {
    mongoose.startSession = originalStartSession;
  }
}

function i18n() {
  return {
    language: () => "sk",
    translate: (key: string) => key,
  } as any;
}

function conferenceInput() {
  return {
    slug: "conference",
    billing: { name: "Issuer", variableSymbol: "123" },
    dates: { start: new Date(), end: new Date() },
    translations: {
      sk: { name: "Konferencia", logoUrl: "sk-logo" },
      en: { name: "Conference", logoUrl: "en-logo" },
    },
  } as any;
}

test("conference attendee count is read from attendee documents", async () => {
  const conferenceId = new ObjectId();
  let receivedFilter: unknown;
  const service = new ConferenceService(
    {} as any,
    {
      countDocuments: async (filter: unknown) => {
        receivedFilter = filter;
        return 193;
      },
    } as any,
    {} as any,
    i18n(),
  );

  assert.equal(await service.getAttendeesCount(conferenceId), 193);
  assert.deepEqual(receivedFilter, { "conference._id": conferenceId });
});

test("public conference attendance lookup returns null without a user", async () => {
  let lookupCalls = 0;
  const resolver = new ConferenceResolver(
    {} as any,
    {
      getAttending: async () => {
        lookupCalls += 1;
        return {};
      },
    } as any,
    i18n(),
  );

  const attending = await resolver.attending(
    { user: null } as any,
    { id: new ObjectId() } as Conference,
  );

  assert.equal(attending, null);
  assert.equal(lookupCalls, 0);
});

test("conference details resolve for an unauthenticated visitor", async () => {
  const conferenceId = new ObjectId();
  const conference = { id: conferenceId, slug: "BPF2026" } as Conference;
  const conferenceResolver = new ConferenceResolver(
    {
      getConference: async () => conference,
      getSections: async () => [
        { id: new ObjectId(), conference: { _id: conferenceId } },
      ],
    } as any,
    {
      getAttending: async () => {
        throw new Error("anonymous attendance lookup should be skipped");
      },
    } as any,
    i18n(),
  );
  const sectionResolver = new SectionResolver(
    { getConference: async () => conference } as any,
    i18n(),
  );
  const schema = await buildSchema({
    authChecker: () => false,
    container: {
      get: (resolverClass) => {
        if (resolverClass === ConferenceResolver) return conferenceResolver;
        if (resolverClass === SectionResolver) return sectionResolver;
        throw new Error(`Unexpected resolver: ${String(resolverClass)}`);
      },
    },
    resolvers: [ConferenceResolver, SectionResolver],
    scalarsMap: [{ type: ObjectId, scalar: ObjectIdScalar }],
  });

  const result = await graphql({
    schema,
    source: `{
      conference(slug: "BPF2026") {
        slug
        sections { conference { slug } }
        attending { id }
      }
    }`,
    contextValue: { user: null },
  });

  assert.equal(result.errors, undefined);
  assert.deepEqual(JSON.parse(JSON.stringify(result.data)), {
    conference: {
      slug: "BPF2026",
      sections: [{ conference: { slug: "BPF2026" } }],
      attending: null,
    },
  });
});

test("attendee schemas enforce registration uniqueness without invoice indexes", () => {
  const indexes = getModelForClass(Attendee).schema.indexes();
  const ownerIndex = indexes.find(
    ([fields]) =>
      fields["conference._id"] === 1 && fields["user._id"] === 1,
  );

  assert.ok(ownerIndex);
  assert.equal(ownerIndex[1].unique, true);
  assert.equal(
    indexes.some(
      ([fields]) =>
        fields["invoice.ownerType"] === 1 ||
        fields["invoice.attendeeId"] === 1,
    ),
    false,
  );
  assert.equal(
    getModelForClass(CourseAttendee)
      .schema.indexes()
      .some(
        ([fields]) =>
          fields["invoice.ownerType"] === 1 ||
          fields["invoice.attendeeId"] === 1,
      ),
    false,
  );
  assert.equal(
    getModelForClass(Conference).schema.path("attendeesCount"),
    undefined,
  );
  const conferenceIndexes = getModelForClass(Conference).schema.indexes();
  assert.equal(
    conferenceIndexes.find(
      ([fields]) => fields["translations.sk.name"] === 1,
    )?.[1].unique,
    true,
  );
  assert.equal(
    conferenceIndexes.find(
      ([fields]) => fields["translations.en.name"] === 1,
    )?.[1].unique,
    true,
  );
});

test("conference attendees derive invoice availability from stored history", () => {
  const resolver = new AttendeeResolver({} as any, i18n());
  assert.equal(resolver.hasInvoice({ invoiceId: new ObjectId() } as any), true);
  assert.equal(resolver.hasInvoice({ invoice: { body: {} } } as any), true);
  assert.equal(resolver.hasInvoice({} as any), false);
});

test("conference service owns translated uniqueness validation", async () => {
  let createCalls = 0;
  const service = new ConferenceService(
    {
      findOne: async (filter: Record<string, unknown>) =>
        filter["translations.sk.name"] ? { _id: new ObjectId() } : null,
      create: async () => {
        createCalls += 1;
      },
    } as any,
    {} as any,
    {} as any,
    i18n(),
  );

  let validationError: any;
  try {
    await service.createConference(conferenceInput());
  } catch (error) {
    validationError = error;
  }

  assert.equal(
    validationError.extensions.validationErrors[0].property,
    "translations.sk.name",
  );
  assert.equal(
    validationError.extensions.validationErrors[0].constraints.name,
    "nameExists",
  );
  assert.equal(createCalls, 0);
});

test("conference service translates duplicate-key races", async () => {
  const service = new ConferenceService(
    {
      findOne: async () => null,
      create: async () => {
        throw {
          code: 11000,
          keyPattern: { slug: 1 },
          keyValue: { slug: "conference" },
        };
      },
    } as any,
    {} as any,
    {} as any,
    i18n(),
  );

  let validationError: any;
  try {
    await service.createConference(conferenceInput());
  } catch (error) {
    validationError = error;
  }

  assert.equal(validationError.extensions.validationErrors[0].property, "slug");
  assert.equal(
    validationError.extensions.validationErrors[0].constraints.slug,
    "slugExists",
  );
});

test("duplicate registration is rejected before invoice creation", async () => {
  const conferenceId = new ObjectId();
  const ticketId = new ObjectId();
  const userId = new ObjectId();
  let invoiceCalls = 0;
  const service = new ConferenceAttendeeService(
    {
      findOne: async () => ({ _id: new ObjectId() }),
    } as any,
    {
      findOne: async () => ({
        id: conferenceId,
        slug: "conference",
        dates: {},
        tickets: [{ id: ticketId, price: 100 }],
        translations: {
          sk: { name: "Konferencia", logoUrl: "logo" },
          en: { name: "Conference", logoUrl: "logo" },
        },
      }),
    } as any,
    {} as any,
    {} as any,
    i18n(),
    {
      createInvoice: async () => {
        invoiceCalls += 1;
      },
    } as any,
    {} as any,
    {} as any,
  );

  await assert.rejects(
    service.registerAttendee(
      {
        conferenceId,
        ticketId,
        billing: { name: "Payer" } as any,
      },
      {
        id: userId,
        name: "Learner",
        email: "learner@example.com",
        access: [],
      },
      "sk",
      "conferences.example.com",
    ),
    /alreadyRegistered/,
  );
  assert.equal(invoiceCalls, 0);
});

test("conference registration is rejected after its configured deadline", async () => {
  const conferenceId = new ObjectId();
  const ticketId = new ObjectId();
  let invoiceCalls = 0;
  const service = new ConferenceAttendeeService(
    { findOne: async () => null } as any,
    {
      findOne: async () => ({
        id: conferenceId,
        dates: { regEnd: new Date(Date.now() - 1_000) },
        tickets: [{ id: ticketId, price: 100 }],
      }),
    } as any,
    {} as any,
    {} as any,
    i18n(),
    {
      createInvoice: async () => {
        invoiceCalls += 1;
      },
    } as any,
    {} as any,
    {} as any,
  );

  await assert.rejects(
    service.registerAttendee(
      {
        conferenceId,
        ticketId,
        billing: { name: "Payer" } as any,
      },
      {
        id: new ObjectId(),
        name: "Learner",
        email: "learner@example.com",
        access: [],
      },
      "en",
      "conferences.example.com",
    ),
    /registrationClosed/,
  );
  assert.equal(invoiceCalls, 0);
});

test("conference registration creates invoice and attendee in one transaction", async () => {
  await withMockSession(async () => {
    const conferenceId = new ObjectId();
    const ticketId = new ObjectId();
    const userId = new ObjectId();
    const invoiceId = new ObjectId();
    let attendeeCreate: any;
    let billingUpdate: any;
    let mail: any;
    const conference = {
      id: conferenceId,
      slug: "conference",
      dates: {},
      billing: { name: "Issuer", variableSymbol: "123" },
      tickets: [{ id: ticketId, price: 12_000 }],
      translations: {
        sk: { name: "Konferencia", logoUrl: "sk-logo" },
        en: { name: "Conference", logoUrl: "en-logo" },
      },
    };
    const service = new ConferenceAttendeeService(
      {
        findOne: async () => null,
        create: async (data: unknown, options: unknown) => {
          attendeeCreate = { data, options };
          return data;
        },
      } as any,
      { findOne: async () => conference } as any,
      {
        updateMany: async (
          filter: unknown,
          update: unknown,
          options: unknown,
        ) => {
          billingUpdate = { filter, update, options };
        },
      } as any,
      {} as any,
      i18n(),
      {
        createInvoice: async (data: any) => ({
          _id: invoiceId,
          payer: data.payer,
          issuer: data.issuer,
          body: {},
        }),
        toInvoice: () => ({ body: "invoice" }),
      } as any,
      {
        produceMessage: (body: string, routingKey: string) => {
          mail = { body: JSON.parse(body), routingKey };
        },
      } as any,
      {} as any,
    );

    const result = await service.registerAttendee(
      {
        conferenceId,
        ticketId,
        billing: { name: "Payer" } as any,
      },
      {
        id: userId,
        name: "Learner",
        email: "learner@example.com",
        access: [],
      },
      "en",
      "conferences.example.com",
    );

    assert.equal(result, conference);
    assert.equal(attendeeCreate.data.invoiceId, invoiceId);
    assert.equal(attendeeCreate.data.conference._id, conferenceId);
    assert.equal(attendeeCreate.data.user._id, userId);
    assert.ok(attendeeCreate.options.session);
    assert.deepEqual(billingUpdate.filter, { _id: userId });
    assert.ok(billingUpdate.options.session);
    assert.equal(mail.routingKey, "mail.conference.invoice");
    assert.equal(mail.body.conferenceName, "Conference");
    assert.equal(mail.body.conferenceLogo, "en-logo");
  });
});

test("conference registration creates an initial submission in the same transaction", async () => {
  await withMockSession(async () => {
    const conferenceId = new ObjectId();
    const ticketId = new ObjectId();
    const userId = new ObjectId();
    const sectionId = new ObjectId();
    let submissionCreate: any;
    let invitation: any;
    const conference = {
      id: conferenceId,
      slug: "conference",
      dates: {},
      billing: { name: "Issuer", variableSymbol: "123" },
      tickets: [
        { id: ticketId, price: 12_000, withSubmission: true },
      ],
      translations: {
        sk: { name: "Konferencia", logoUrl: "sk-logo" },
        en: { name: "Conference", logoUrl: "en-logo" },
      },
    };
    const submission = {
      id: new ObjectId(),
      translations: {
        sk: { name: "Príspevok", abstract: "Abstrakt", keywords: [] },
        en: { name: "Submission", abstract: "Abstract", keywords: [] },
      },
    };
    const submissionService = {
      createSubmission: async (
        hostname: string,
        user: unknown,
        data: unknown,
        options: unknown,
      ) => {
        submissionCreate = { hostname, user, data, options };
        return submission;
      },
      sendCoAuthorInvites: async (...args: unknown[]) => {
        invitation = args;
      },
    };
    const service = new ConferenceAttendeeService(
      {
        findOne: async () => null,
        create: async (data: unknown) => data,
      } as any,
      { findOne: async () => conference } as any,
      { updateMany: async () => undefined } as any,
      {} as any,
      i18n(),
      {
        createInvoice: async () => ({
          _id: new ObjectId(),
          payer: {},
          issuer: {},
          body: {},
        }),
        toInvoice: () => ({}),
      } as any,
      { produceMessage: () => undefined } as any,
      submissionService as any,
    );
    const initialSubmission = {
      conference: conferenceId,
      section: sectionId,
      authors: ["coauthor@example.com"],
      presentationLng: "EN",
      translations: {
        sk: { name: "Príspevok", abstract: "Abstrakt", keywords: [] },
        en: { name: "Submission", abstract: "Abstract", keywords: [] },
      },
    } as any;

    await service.registerAttendee(
      {
        conferenceId,
        ticketId,
        billing: { name: "Payer" } as any,
        initialSubmission,
      },
      {
        id: userId,
        name: "Learner",
        email: "learner@example.com",
        access: [],
      },
      "en",
      "conferences.example.com",
    );

    assert.equal(submissionCreate.hostname, "conferences.example.com");
    assert.equal(submissionCreate.data, initialSubmission);
    assert.equal(submissionCreate.options.deferNotifications, true);
    assert.ok(submissionCreate.options.session);
    assert.equal(invitation[3], submission);
    assert.deepEqual(invitation[4], ["coauthor@example.com"]);
  });
});

test("attendee deletion scopes submission cleanup to its conference", async () => {
  await withMockSession(async () => {
    const attendeeId = new ObjectId();
    const conferenceId = new ObjectId();
    const userId = new ObjectId();
    const attendee = {
      _id: attendeeId,
      id: attendeeId,
      conference: { id: conferenceId },
      user: { id: userId },
    };
    let submissionUpdate: any;
    const service = new ConferenceAttendeeService(
      {
        findOneAndDelete: async () => attendee,
      } as any,
      {} as any,
      {} as any,
      {
        updateMany: async (
          filter: unknown,
          update: unknown,
          options: unknown,
        ) => {
          submissionUpdate = { filter, update, options };
        },
      } as any,
      i18n(),
      {} as any,
      {} as any,
      {} as any,
    );

    assert.equal(await service.deleteAttendee(attendeeId), attendee);
    assert.deepEqual(submissionUpdate.filter, {
      conference: conferenceId,
      authors: userId,
    });
    assert.deepEqual(submissionUpdate.update, {
      $pull: { authors: userId },
    });
    assert.ok(submissionUpdate.options.session);
  });
});
