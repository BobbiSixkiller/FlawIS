import assert from "node:assert/strict";
import test from "node:test";

import {
  conferenceInvitationHref,
  conferenceWorkspaceHref,
  invitedTicketId,
} from "../src/lib/conferenceRegistration";

const tickets = [
  { id: "attendee-only", withSubmission: false },
  { id: "submission-ticket", withSubmission: true },
];

test("a coauthor invitation preselects a submission ticket", () => {
  assert.equal(invitedTicketId(tickets, true), "submission-ticket");
});

test("ordinary registration does not preselect a ticket", () => {
  assert.equal(invitedTicketId(tickets, false), "");
});

test("registered attendees return to the conference workspace", () => {
  assert.equal(conferenceWorkspaceHref("milniky-prava"), "/milniky-prava");
  assert.equal(
    conferenceWorkspaceHref("milniky-prava", true),
    "/milniky-prava#submissions",
  );
});

test("a coauthor invitation URL preserves its submission and token", () => {
  const href = conferenceInvitationHref(
    "sk",
    "BPF2026",
    "submission-id",
    "invite-token",
  );
  const url = new URL(href, "https://conferences.flaw.uniba.sk");

  assert.equal(url.pathname, "/sk/BPF2026/register");
  assert.equal(url.searchParams.get("submission"), "submission-id");
  assert.equal(url.searchParams.get("token"), "invite-token");
});
