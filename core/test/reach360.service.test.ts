import "reflect-metadata";
import test from "node:test";
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { ObjectId } from "mongodb";
import Express from "express";
import Container from "typedi";
import {
  ElearningProvisioningStatus,
} from "../src/entitites/Course";
import { Status } from "../src/entitites/Internship";
import {
  Reach360ApiError,
  Reach360Client,
  Reach360Service,
} from "../src/services/reach360.service";
import {
  registerReach360Webhook,
  verifyReach360WebhookSignature,
} from "../src/routes/reach360Webhook";

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

test("Reach client sends server credentials and API version", async () => {
  const requests: Array<{ input: string; init?: RequestInit }> = [];
  const client = new Reach360Client(
    "https://api.reach360.eu/",
    "secret-key",
    async (input, init) => {
      requests.push({ input, init });
      return jsonResponse({ users: [] });
    },
  );

  await client.findUser("learner+test@example.com");

  assert.equal(
    requests[0].input,
    "https://api.reach360.eu/users?email=learner%2Btest%40example.com&limit=1",
  );
  assert.equal(
    (requests[0].init?.headers as Record<string, string>).Authorization,
    "Bearer secret-key",
  );
  assert.equal(
    (requests[0].init?.headers as Record<string, string>)["API-Version"],
    "2023-05-04",
  );
});

test("Reach client preserves provider error codes", async () => {
  const client = new Reach360Client(
    "https://api.reach360.eu",
    "secret-key",
    async () =>
      jsonResponse(
        {
          errors: [
            {
              code: "max_invites_reached",
              message: "Trial invitation limit reached",
            },
          ],
        },
        400,
      ),
  );

  await assert.rejects(
    () => client.createInvitation("learner@example.com"),
    (error: unknown) =>
      error instanceof Reach360ApiError &&
      error.code === "max_invites_reached",
  );
});

function createProvisioningFixture(options?: {
  reachUserId?: string;
  pendingInvitation?: boolean;
  createInvitationError?: Reach360ApiError;
}) {
  const attendeeId = new ObjectId();
  const courseId = new ObjectId();
  const userId = new ObjectId();
  const attendee: any = {
    _id: attendeeId,
    id: attendeeId,
    course: courseId,
    status: Status.Accepted,
    user: {
      id: userId,
      email: "learner@example.com",
    },
  };
  const user: any = {
    _id: userId,
    id: userId,
    email: "learner@example.com",
    reachUserId: options?.reachUserId,
  };
  const calls = {
    invitations: 0,
    enrollments: 0,
    unenrollments: 0,
  };

  const courseRepository: any = {
    findOne: async () => ({
      _id: courseId,
      reachCourse: {
        courseId: "reach-course",
        launchUrl: "https://training.example.com/course",
      },
    }),
  };
  const attendeeRepository: any = {
    findOne: async () => attendee,
    findAll: async () => [attendee],
    findOneAndUpdate: async (_filter: unknown, update: any) => {
      attendee.reachEnrollment = update.$set.reachEnrollment;
      return attendee;
    },
  };
  const userRepository: any = {
    findOne: async () => user,
    findOneAndUpdate: async (_filter: unknown, update: any) => {
      user.reachUserId = update.$set.reachUserId;
      return user;
    },
  };
  const client: any = {
    findUser: async () =>
      options?.reachUserId
        ? { id: options.reachUserId, email: user.email }
        : null,
    findInvitation: async () =>
      options?.pendingInvitation
        ? { id: "pending-invite", email: user.email }
        : null,
    createInvitation: async () => {
      calls.invitations += 1;
      if (options?.createInvitationError) {
        throw options.createInvitationError;
      }
      return { id: "new-invite", email: user.email };
    },
    enrollUser: async () => {
      calls.enrollments += 1;
    },
    unenrollUser: async () => {
      calls.unenrollments += 1;
    },
  };

  const service = new Reach360Service(
    courseRepository,
    attendeeRepository,
    userRepository,
  );
  (service as any).client = client;

  return { service, attendee, attendeeId, calls };
}

test("existing Reach users are enrolled immediately", async () => {
  const fixture = createProvisioningFixture({ reachUserId: "reach-user" });
  const result = await fixture.service.syncAttendee(fixture.attendeeId);

  assert.equal(fixture.calls.enrollments, 1);
  assert.equal(
    result.reachEnrollment?.status,
    ElearningProvisioningStatus.Enrolled,
  );
});

test("new Reach users receive one invitation", async () => {
  const fixture = createProvisioningFixture();
  const result = await fixture.service.syncAttendee(fixture.attendeeId);

  assert.equal(fixture.calls.invitations, 1);
  assert.equal(
    result.reachEnrollment?.status,
    ElearningProvisioningStatus.PendingInvitation,
  );
});

test("pending Reach invitations are reused", async () => {
  const fixture = createProvisioningFixture({ pendingInvitation: true });
  const result = await fixture.service.syncAttendee(fixture.attendeeId);

  assert.equal(fixture.calls.invitations, 0);
  assert.equal(
    result.reachEnrollment?.status,
    ElearningProvisioningStatus.PendingInvitation,
  );
});

test("trial invitation exhaustion is recorded without throwing", async () => {
  const fixture = createProvisioningFixture({
    createInvitationError: new Reach360ApiError(
      "max_invites_reached",
      400,
    ),
  });
  const result = await fixture.service.syncAttendee(fixture.attendeeId);

  assert.equal(
    result.reachEnrollment?.status,
    ElearningProvisioningStatus.SyncFailed,
  );
  assert.equal(
    result.reachEnrollment?.lastErrorCode,
    "max_invites_reached",
  );
});

test("revocation removes only the course enrollment", async () => {
  const fixture = createProvisioningFixture({ reachUserId: "reach-user" });
  const result = await fixture.service.syncAttendee(
    fixture.attendeeId,
    false,
  );

  assert.equal(fixture.calls.unenrollments, 1);
  assert.equal(
    result.reachEnrollment?.status,
    ElearningProvisioningStatus.Revoked,
  );
});

test("webhook signatures use the Reach HMAC-SHA1 format", () => {
  const body = Buffer.from(
    JSON.stringify({
      type: "user.created",
      data: { user: { id: "user", email: "learner@example.com" } },
    }),
  );
  const signature = createHmac("sha1", "webhook-secret")
    .update(body)
    .digest("hex");

  assert.equal(
    verifyReach360WebhookSignature(body, signature, "webhook-secret"),
    true,
  );
  assert.equal(
    verifyReach360WebhookSignature(body, "0".repeat(40), "webhook-secret"),
    false,
  );
});

test("webhook route rejects invalid signatures and accepts idempotent events", async () => {
  const previousSecret = process.env.REACH_WEBHOOK_SECRET;
  process.env.REACH_WEBHOOK_SECRET = "webhook-secret";

  const receivedUsers: Array<{ id: string; email: string }> = [];
  Container.set(Reach360Service, {
    handleUserCreated: async (user: { id: string; email: string }) => {
      receivedUsers.push(user);
      return [];
    },
  } as any);

  const app = Express();
  registerReach360Webhook(app);
  const server = app.listen(0);
  await new Promise<void>((resolve) => server.once("listening", resolve));

  try {
    const address = server.address();
    assert.ok(address && typeof address !== "string");
    const target = `http://127.0.0.1:${address.port}/integrations/reach/webhooks`;
    const body = JSON.stringify({
      type: "user.created",
      data: {
        user: { id: "reach-user", email: "learner@example.com" },
      },
    });
    const signature = createHmac("sha1", "webhook-secret")
      .update(Buffer.from(body))
      .digest("hex");

    const invalid = await fetch(target, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Hook-Signature": "0".repeat(40),
      },
      body,
    });
    assert.equal(invalid.status, 401);

    for (let attempt = 0; attempt < 2; attempt += 1) {
      const valid = await fetch(target, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Hook-Signature": signature,
        },
        body,
      });
      assert.equal(valid.status, 200);
    }

    const unrelatedBody = JSON.stringify({ type: "course.completed" });
    const unrelatedSignature = createHmac("sha1", "webhook-secret")
      .update(Buffer.from(unrelatedBody))
      .digest("hex");
    const unrelated = await fetch(target, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Hook-Signature": unrelatedSignature,
      },
      body: unrelatedBody,
    });
    assert.equal(unrelated.status, 200);
    assert.equal(receivedUsers.length, 2);
  } finally {
    await new Promise<void>((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve())),
    );
    Container.remove(Reach360Service);
    if (previousSecret === undefined) {
      delete process.env.REACH_WEBHOOK_SECRET;
    } else {
      process.env.REACH_WEBHOOK_SECRET = previousSecret;
    }
  }
});
