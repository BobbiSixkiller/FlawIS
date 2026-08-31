import "reflect-metadata";

import assert from "node:assert/strict";
import test from "node:test";
import { GraphQLError } from "graphql";
import { ObjectId } from "mongodb";

import { Access } from "../src/entitites/User";
import { SubmissionService } from "../src/services/submission.service";

function i18n() {
  return {
    language: () => "en",
    translate: (key: string) => key,
  } as any;
}

function user(access: Access[] = []) {
  return {
    id: new ObjectId(),
    name: "Author",
    email: "author@example.com",
    access,
  };
}

function submissionInput(conference: ObjectId, section: ObjectId) {
  return {
    conference,
    section,
    authors: [],
    fileUrl: undefined,
    presentationLng: "EN",
    translations: {
      sk: { name: "Názov", abstract: "Abstrakt", keywords: ["právo"] },
      en: { name: "Name", abstract: "Abstract", keywords: ["law"] },
    },
  } as any;
}

function document(data: Record<string, any>) {
  const value = {
    _id: data._id ?? new ObjectId(),
    ...data,
  };
  return {
    ...value,
    id: value._id,
    toJSON(options: { transform?: (doc: unknown, ret: any) => void }) {
      const result = { ...value };
      options.transform?.(this, result);
      return result;
    },
  } as any;
}

function service({
  attendeeRepository = {},
  conferenceRepository = {},
  sectionRepository = {},
  submissionRepository = {},
  tokenService = {},
}: {
  attendeeRepository?: object;
  conferenceRepository?: object;
  sectionRepository?: object;
  submissionRepository?: object;
  tokenService?: object;
}) {
  return new SubmissionService(
    submissionRepository as any,
    conferenceRepository as any,
    attendeeRepository as any,
    sectionRepository as any,
    tokenService as any,
    {} as any,
    i18n(),
  );
}

test("submission creation requires a registered submission ticket", async () => {
  const conferenceId = new ObjectId();
  const sectionId = new ObjectId();
  let createCalls = 0;
  const instance = service({
    conferenceRepository: {
      findOne: async () => ({ id: conferenceId, dates: {} }),
    },
    sectionRepository: {
      findOne: async () => ({ id: sectionId, conference: conferenceId }),
    },
    attendeeRepository: { findOne: async () => null },
    submissionRepository: {
      create: async () => {
        createCalls += 1;
      },
    },
  });

  await assert.rejects(
    instance.createSubmission(
      "conferences.example.com",
      user(),
      submissionInput(conferenceId, sectionId),
    ),
    /submissionTicketRequired/,
  );
  assert.equal(createCalls, 0);
});

test("submission section must belong to its conference", async () => {
  const conferenceId = new ObjectId();
  const instance = service({
    conferenceRepository: {
      findOne: async () => ({ id: conferenceId, dates: {} }),
    },
    sectionRepository: {
      findOne: async () => ({ conference: new ObjectId() }),
    },
  });

  await assert.rejects(
    instance.createSubmission(
      "conferences.example.com",
      user([Access.Admin]),
      submissionInput(conferenceId, new ObjectId()),
    ),
    /sectionMismatch/,
  );
});

test("non-authors are rejected before a submission update", async () => {
  const submissionId = new ObjectId();
  let updateCalls = 0;
  const instance = service({
    submissionRepository: {
      findOne: async () =>
        document({ _id: submissionId, authors: [new ObjectId()] }),
      findOneAndUpdate: async () => {
        updateCalls += 1;
      },
    },
  });

  await assert.rejects(
    instance.updateSubmission(
      submissionId,
      "conferences.example.com",
      user(),
      submissionInput(new ObjectId(), new ObjectId()),
    ),
    /notAllowed/,
  );
  assert.equal(updateCalls, 0);
});

test("ordinary submission lookup is limited to authors and administrators", async () => {
  const authorId = new ObjectId();
  const stored = document({ authors: [authorId] });
  const instance = service({
    submissionRepository: { findOne: async () => stored },
  });

  await assert.rejects(
    instance.getAuthorizedSubmission(stored.id, user()),
    /notAllowed/,
  );
  const adminResult = await instance.getAuthorizedSubmission(
    stored.id,
    user([Access.Admin]),
  );
  assert.equal(adminResult.id.toString(), stored.id.toString());
});

test("submission deadline is enforced before writing", async () => {
  const conferenceId = new ObjectId();
  const sectionId = new ObjectId();
  const submissionId = new ObjectId();
  const author = user();
  let updateCalls = 0;
  const instance = service({
    submissionRepository: {
      findOne: async () =>
        document({
          _id: submissionId,
          authors: [author.id],
          conference: conferenceId,
        }),
      findOneAndUpdate: async () => {
        updateCalls += 1;
      },
    },
    conferenceRepository: {
      findOne: async () => ({
        id: conferenceId,
        dates: { submissionDeadline: new Date(Date.now() - 1_000) },
      }),
    },
    sectionRepository: {
      findOne: async () => ({ conference: conferenceId }),
    },
    attendeeRepository: {
      findOne: async () => ({ ticket: { withSubmission: true } }),
    },
  });

  await assert.rejects(
    instance.updateSubmission(
      submissionId,
      "conferences.example.com",
      author,
      submissionInput(conferenceId, sectionId),
    ),
    /deadlinePassed/,
  );
  assert.equal(updateCalls, 0);
});

test("administrators can update after the deadline without an author filter", async () => {
  const conferenceId = new ObjectId();
  const sectionId = new ObjectId();
  const submissionId = new ObjectId();
  const stored = document({
    _id: submissionId,
    authors: [new ObjectId()],
    conference: conferenceId,
  });
  let receivedFilter: any;
  const instance = service({
    submissionRepository: {
      findOne: async (filter: Record<string, any>) =>
        filter._id === submissionId && !filter._id?.$ne ? stored : null,
      findOneAndUpdate: async (filter: unknown) => {
        receivedFilter = filter;
        return stored;
      },
    },
    conferenceRepository: {
      findOne: async () => ({
        id: conferenceId,
        dates: { submissionDeadline: new Date(Date.now() - 1_000) },
        translations: {
          sk: { name: "Konferencia" },
          en: { name: "Conference" },
        },
      }),
    },
    sectionRepository: {
      findOne: async () => ({ conference: conferenceId }),
    },
  });

  await instance.updateSubmission(
    submissionId,
    "conferences.example.com",
    user([Access.Admin]),
    submissionInput(conferenceId, sectionId),
  );
  assert.deepEqual(receivedFilter, { _id: submissionId });
});

test("invitation preview validates without consuming the token", async () => {
  const submissionId = new ObjectId();
  const invited = user();
  let consumeCalls = 0;
  const stored = document({ _id: submissionId, authors: [] });
  const instance = service({
    submissionRepository: { findOne: async () => stored },
    tokenService: {
      inspectOneTimeToken: async () => ({
        payload: {
          email: invited.email,
          submissionId: submissionId.toHexString(),
        },
      }),
      verifyOneTimeToken: async () => {
        consumeCalls += 1;
      },
    },
  });

  const result = await instance.getSubmissionInvite("token", invited);
  assert.equal(result.id.toString(), submissionId.toString());
  assert.equal(consumeCalls, 0);
});

test("invitation preview identifies a different signed-in account", async () => {
  const submissionId = new ObjectId();
  const instance = service({
    submissionRepository: {
      findOne: async () => document({ _id: submissionId, authors: [] }),
    },
    tokenService: {
      inspectOneTimeToken: async () => ({
        payload: {
          email: "invited@example.com",
          submissionId: submissionId.toHexString(),
        },
      }),
    },
  });

  await assert.rejects(instance.getSubmissionInvite("token", user()), (error) => {
    assert.equal((error as Error).message, "inviteEmailMismatch");
    assert.equal(
      (error as GraphQLError).extensions.code,
      "INVITATION_EMAIL_MISMATCH",
    );
    return true;
  });
});

test("co-author acceptance does not consume a token for a different account", async () => {
  let consumeCalls = 0;
  const instance = service({
    tokenService: {
      inspectOneTimeToken: async () => ({
        payload: {
          email: "invited@example.com",
          submissionId: new ObjectId().toHexString(),
        },
      }),
      verifyOneTimeToken: async () => {
        consumeCalls += 1;
      },
    },
  });

  await assert.rejects(instance.addCoAuthor("token", user()), (error) => {
    assert.equal((error as Error).message, "inviteEmailMismatch");
    assert.equal(
      (error as GraphQLError).extensions.code,
      "INVITATION_EMAIL_MISMATCH",
    );
    return true;
  });
  assert.equal(consumeCalls, 0);
});
