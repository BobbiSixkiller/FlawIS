import assert from "node:assert/strict";
import test from "node:test";

import { Access } from "../src/lib/graphql/generated/graphql";
import {
  getInternshipAccess,
  internshipListHref,
  normalizeQueryValues,
  replaceQueryParameter,
} from "../src/lib/internshipAccess";

const ownerId = "66c5f7f19b97b42f7450369a";

test("internship controls follow anonymous, student, organization, and admin policy", () => {
  assert.deepEqual(getInternshipAccess(null, ownerId), {
    canApply: false,
    canCreate: false,
    canManage: false,
    isAdmin: false,
    isOrganization: false,
    isStudent: false,
  });

  assert.equal(
    getInternshipAccess(
      { id: "student", access: [Access.Student] },
      ownerId,
    ).canApply,
    true,
  );
  assert.equal(
    getInternshipAccess(
      { id: ownerId, access: [Access.Organization] },
      ownerId,
    ).canManage,
    true,
  );
  assert.equal(
    getInternshipAccess(
      { id: "another-org", access: [Access.Organization] },
      ownerId,
    ).canManage,
    false,
  );

  const admin = getInternshipAccess(
    {
      id: ownerId,
      access: [Access.Admin, Access.Organization, Access.Student],
    },
    ownerId,
  );
  assert.equal(admin.isAdmin, true);
  assert.equal(admin.canApply, false);
  assert.equal(admin.canCreate, false);
  assert.equal(admin.canManage, false);
});

test("organization query values normalize and survive academic-year changes", () => {
  assert.equal(normalizeQueryValues(undefined), undefined);
  assert.deepEqual(normalizeQueryValues("Ministry"), ["Ministry"]);
  assert.deepEqual(normalizeQueryValues(["Ministry", "Court"]), [
    "Ministry",
    "Court",
  ]);

  const next = new URLSearchParams(
    replaceQueryParameter(
      "organization=Ministry&organization=Court&academicYear=2025%2F2026",
      "academicYear",
      "2026/2027",
    ),
  );
  assert.deepEqual(next.getAll("organization"), ["Ministry", "Court"]);
  assert.equal(next.get("academicYear"), "2026/2027");
});

test("internship links use an explicit tenant base", () => {
  assert.equal(internshipListHref("", ownerId), `/${ownerId}`);
  assert.equal(
    internshipListHref("/internships", ownerId),
    `/internships/${ownerId}`,
  );
});
