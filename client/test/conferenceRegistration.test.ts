import assert from "node:assert/strict";
import test from "node:test";

import {
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
