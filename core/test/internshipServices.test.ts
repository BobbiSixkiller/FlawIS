import "reflect-metadata";

import assert from "node:assert/strict";
import test from "node:test";
import { graphql } from "graphql";
import mongoose from "mongoose";
import { ObjectId } from "mongodb";
import { buildSchema } from "type-graphql";

import { Internship, Semester, Status } from "../src/entitites/Internship";
import { Access } from "../src/entitites/User";
import { InternshipRepository } from "../src/repositories/internship.repository";
import { InternResolver } from "../src/resolvers/internships/intern.resolver";
import { InternshipResolver } from "../src/resolvers/internships/internship.resolver";
import { InternService } from "../src/services/internships/intern.service";
import { InternshipService } from "../src/services/internships/internship.service";
import { createContext } from "../src/util/auth";
import { ObjectIdScalar } from "../src/util/scalars";
import { sanitizeRichText } from "../src/util/sanitizeRichText";

function i18n() {
  return {
    language: () => "en",
    translate: (key: string) => key,
  } as any;
}

function viewer(id: ObjectId, access: Access[]) {
  return { id, access, name: "Viewer", email: "viewer@example.com" };
}

function document(data: Record<string, any>) {
  const value = { _id: data._id ?? new ObjectId(), ...data };
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

async function withMockSession(operation: () => Promise<void>) {
  const originalStartSession = mongoose.startSession;
  const session = {
    startTransaction() {},
    async commitTransaction() {},
    async abortTransaction() {},
    endSession() {},
  } as any;
  mongoose.startSession = async () => session;

  try {
    await operation();
  } finally {
    mongoose.startSession = originalStartSession;
  }
}

test("internship rich text retains editor markup and removes executable HTML", () => {
  const sanitized = sanitizeRichText(`
    <h2 style="color:red">Heading</h2>
    <p onclick="alert(1)"><strong>Bold</strong> and <em>emphasis</em></p>
    <ul><li><code>Rule</code></li></ul><blockquote>Quote</blockquote><hr><br>
    <a href="https://example.com" target="_blank" onmouseover="alert(1)">safe</a>
    <a href="mailto:test@example.com">mail</a>
    <a href="javascript:alert(1)">unsafe</a>
    <script>alert(1)</script><img src=x onerror="alert(1)"><section>text</section>
  `);

  assert.match(sanitized, /<h2>Heading<\/h2>/);
  assert.match(sanitized, /<strong>Bold<\/strong>/);
  assert.match(sanitized, /<ul><li><code>Rule<\/code><\/li><\/ul>/);
  assert.match(sanitized, /href="https:\/\/example.com"/);
  assert.match(sanitized, /href="mailto:test@example.com"/);
  assert.doesNotMatch(sanitized, /script|onclick|onerror|onmouseover|style=|javascript:|<img|<section/i);
});

test("internship writes and legacy reads are sanitized", async () => {
  const ownerId = new ObjectId();
  let createdDescription = "";
  const legacy = document({
    organization: "Court",
    user: ownerId,
    description: '<p onclick="x()">Legacy</p><script>x()</script>',
  });
  const service = new InternshipService(
    {
      create: async (data: Record<string, any>) => {
        createdDescription = data.description;
        return document(data);
      },
      findOne: async () => legacy,
    } as any,
    i18n(),
    {
      getUser: async () => ({ id: ownerId, organization: "Court" }),
    } as any,
  );

  await service.createInternship(
    { description: '<p onload="x()">New</p><script>x()</script>' },
    viewer(ownerId, [Access.Organization]),
  );
  const outbound = await service.getInternship(new ObjectId());

  assert.equal(createdDescription, "<p>New</p>");
  assert.equal(outbound.description, "<p>Legacy</p>");
});

test("anonymous internship catalogue and detail GraphQL queries expose counts but not applications", async () => {
  const internshipId = new ObjectId();
  const ownerId = new ObjectId();
  const listing = {
    id: internshipId,
    organization: "Court",
    academicYear: "2026/2027",
    description: "<p>Public role</p>",
    user: ownerId,
  } as Internship;
  let applicationLookups = 0;
  const internshipResolver = new InternshipResolver(
    {
      getInternship: async () => listing,
      getInternships: async () => ({
        edges: [{ cursor: "cursor", node: listing }],
        pageInfo: { hasNextPage: false },
        totalCount: 1,
        academicYears: [{ academicYear: "2026/2027", count: 1 }],
        organizations: [{ organization: "Court", count: 1 }],
      }),
    } as any,
    {
      countApplications: async () => 4,
      getByUserInternship: async () => {
        applicationLookups += 1;
        return {};
      },
    } as any,
    i18n(),
  );
  const internResolver = new InternResolver({} as any, {} as any, i18n());
  const schema = await buildSchema({
    authChecker: () => false,
    container: {
      get: (resolverClass) => {
        if (resolverClass === InternshipResolver) return internshipResolver;
        if (resolverClass === InternResolver) return internResolver;
        throw new Error(`Unexpected resolver: ${String(resolverClass)}`);
      },
    },
    resolvers: [InternshipResolver, InternResolver],
    scalarsMap: [{ type: ObjectId, scalar: ObjectIdScalar }],
  });

  const publicResult = await graphql({
    schema,
    source: `query PublicInternships($id: ObjectId!) {
      internships(sort: []) {
        edges { node { id organization applicationsCount myApplication { id } } }
      }
      internship(id: $id) {
        id organization description applicationsCount myApplication { id }
      }
    }`,
    variableValues: { id: internshipId.toHexString() },
    contextValue: { user: null },
  });

  assert.equal(publicResult.errors, undefined);
  assert.deepEqual(JSON.parse(JSON.stringify(publicResult.data)), {
    internships: {
      edges: [
        {
          node: {
            id: internshipId.toHexString(),
            organization: "Court",
            applicationsCount: 4,
            myApplication: null,
          },
        },
      ],
    },
    internship: {
      id: internshipId.toHexString(),
      organization: "Court",
      description: "<p>Public role</p>",
      applicationsCount: 4,
      myApplication: null,
    },
  });
  assert.equal(applicationLookups, 0);

  const privateResult = await graphql({
    schema,
    source: `{ interns(sort: []) { totalCount } }`,
    contextValue: { user: null },
  });
  assert.match(
    privateResult.errors?.[0].message ?? "",
    /access denied|not authorized/i,
  );
});

test("organization catalogue scope is forced in the repository", async () => {
  const ownerId = new ObjectId();
  const requestedId = new ObjectId();
  const repository = new InternshipRepository();
  const matches: Record<string, unknown>[] = [];
  (repository as any).aggregate = async (pipeline: any[]) => {
    matches.push(pipeline[0].$match);
    return [
      {
        edges: [],
        totalCount: 0,
        academicYears: [],
        organizations: [],
        pageInfo: { hasNextPage: false },
      },
    ];
  };
  const args = {
    first: 20,
    sort: [],
    filter: { user: requestedId },
  } as any;

  await repository.paginatedInternships(
    args,
    viewer(ownerId, [Access.Organization]),
  );
  await repository.paginatedInternships(args, null);
  await repository.paginatedInternships(
    args,
    viewer(ownerId, [Access.Admin]),
  );

  assert.deepEqual(matches[0], { user: ownerId });
  assert.deepEqual(matches[1], {});
  assert.deepEqual(matches[2], { user: requestedId });
});

test("only the owning organization receives reviewed applicant counts", async () => {
  const internshipId = new ObjectId();
  const ownerId = new ObjectId();
  const receivedStatuses: Array<Status[] | undefined> = [];
  const resolver = new InternshipResolver(
    {} as any,
    {
      countApplications: async (_id: ObjectId, statuses?: Status[]) => {
        receivedStatuses.push(statuses);
        return statuses ? 2 : 5;
      },
    } as any,
    i18n(),
  );
  const listing = { id: internshipId, user: ownerId } as Internship;

  assert.equal(
    await resolver.applicationsCount(
      { user: viewer(ownerId, [Access.Organization]) } as any,
      listing,
    ),
    2,
  );
  assert.deepEqual(receivedStatuses[0], [
    Status.Eligible,
    Status.Accepted,
    Status.Rejected,
  ]);

  assert.equal(
    await resolver.applicationsCount(
      { user: viewer(ownerId, [Access.Admin, Access.Organization]) } as any,
      listing,
    ),
    5,
  );
  assert.equal(receivedStatuses[1], undefined);
});

test("only an owning organization or admin can manage an internship", async () => {
  const ownerId = new ObjectId();
  const stored = document({
    user: ownerId,
    organization: "Court",
    description: "<p>Role</p>",
  });
  const service = new InternshipService(
    { findOne: async () => stored } as any,
    i18n(),
    {} as any,
  );

  await service.assertCanManageInternship(
    stored.id,
    viewer(ownerId, [Access.Organization]),
  );
  await service.assertCanManageInternship(
    stored.id,
    viewer(new ObjectId(), [Access.Admin]),
  );
  await assert.rejects(
    service.assertCanManageInternship(
      stored.id,
      viewer(new ObjectId(), [Access.Organization]),
    ),
    /Not allowed/,
  );
  await assert.rejects(
    service.getInternship(
      stored.id,
      viewer(new ObjectId(), [Access.Organization]),
    ),
    /notFound/,
  );
});

test("student self-service and applicant mutations authorize before writing", async () => {
  await withMockSession(async () => {
    const studentId = new ObjectId();
    const internshipId = new ObjectId();
    const storedIntern = document({
      internship: internshipId,
      user: { id: studentId, name: "Student" },
      fileUrls: [],
    });
    let updateCalls = 0;
    let deleteCalls = 0;
    let fileDeleteCalls = 0;
    const repository = {
      findOne: async () => storedIntern,
      findOneAndUpdate: async () => {
        updateCalls += 1;
        return storedIntern;
      },
      findOneAndDelete: async () => {
        deleteCalls += 1;
        return storedIntern;
      },
    };
    const service = new InternService(
      repository as any,
      {
        assertCanManageInternship: async () => {
          throw new Error("Not allowed!");
        },
      } as any,
      {} as any,
      {} as any,
      i18n(),
      {} as any,
      { deleteFiles: async () => (fileDeleteCalls += 1) } as any,
    );

    await service.updateInternData(
      ["cv.pdf"],
      storedIntern.id,
      viewer(studentId, [Access.Student]),
      Semester.Winter,
    );
    assert.equal(updateCalls, 1);

    await assert.rejects(
      service.deleteIntern(
        storedIntern.id,
        viewer(new ObjectId(), [Access.Student]),
      ),
      /Not allowed/,
    );
    assert.equal(deleteCalls, 0);
    assert.equal(fileDeleteCalls, 0);

    await assert.rejects(
      service.changeStatus(
        Status.Accepted,
        storedIntern.id,
        viewer(new ObjectId(), [Access.Organization]),
        "internships.example.com",
      ),
      /Not allowed/,
    );
    assert.equal(updateCalls, 1);
  });
});

test("malformed access-token cookies are treated as anonymous", () => {
  const context = createContext({
    req: { cookies: { accessToken: "invalid" } },
    res: {},
  } as any);

  assert.equal(context.user, null);
});
