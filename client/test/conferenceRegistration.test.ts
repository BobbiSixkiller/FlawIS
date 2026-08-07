import assert from "node:assert/strict";
import test from "node:test";

import { invitedTicketId } from "../src/lib/conferenceRegistration";

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
