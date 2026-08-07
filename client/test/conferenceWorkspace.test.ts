import assert from "node:assert/strict";
import test from "node:test";

import { conferenceWorkspaceState } from "../src/lib/conferenceWorkspace";

const dates = {
  start: "2026-10-10T08:00:00.000Z",
  end: "2026-10-11T16:00:00.000Z",
  regEnd: "2026-10-01T21:59:59.000Z",
  submissionDeadline: "2026-10-05T21:59:59.000Z",
};

test("conference workspace derives upcoming and editable registration state", () => {
  const state = conferenceWorkspaceState(
    dates,
    true,
    new Date("2026-09-01T08:00:00.000Z").getTime(),
  );
  assert.deepEqual(state, {
    eventState: "upcoming",
    registrationOpen: true,
    submissionsEditable: true,
  });
});

test("conference workspace closes registration and submissions independently", () => {
  const state = conferenceWorkspaceState(
    dates,
    true,
    new Date("2026-10-06T08:00:00.000Z").getTime(),
  );
  assert.equal(state.eventState, "upcoming");
  assert.equal(state.registrationOpen, false);
  assert.equal(state.submissionsEditable, false);
});

test("missing deadlines mean no configured cutoff", () => {
  const state = conferenceWorkspaceState(
    { ...dates, regEnd: null, submissionDeadline: null },
    true,
    new Date("2026-10-12T08:00:00.000Z").getTime(),
  );
  assert.equal(state.eventState, "ended");
  assert.equal(state.registrationOpen, true);
  assert.equal(state.submissionsEditable, true);
});

test("tickets without submission rights never expose editing", () => {
  const state = conferenceWorkspaceState(dates, false, 0);
  assert.equal(state.submissionsEditable, false);
});
