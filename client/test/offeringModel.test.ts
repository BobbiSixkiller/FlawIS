import assert from "node:assert/strict";
import test from "node:test";

import {
  conferenceOfferingModel,
  courseOfferingModel,
  offeringHref,
} from "../src/components/offering-model";

test("offering URLs use explicit attendee and admin bases", () => {
  assert.equal(offeringHref("", "event"), "/event");
  assert.equal(offeringHref("/conferences", "event"), "/conferences/event");
  assert.equal(offeringHref("/courses", "123"), "/courses/123");
});

test("course offerings preserve course metadata and cover images", () => {
  const model = courseOfferingModel(
    {
      id: "course-id",
      name: "Civil law",
      start: "2026-09-01T08:00:00.000Z",
      end: "2026-09-02T16:00:00.000Z",
      registrationEnd: "2026-08-20T21:59:59.000Z",
      thumbnail: "/course.jpg",
      hasElearning: true,
      categories: [
        { id: "category-id", name: "Private law", slug: "private-law" },
      ],
    },
    "",
  );

  assert.equal(model.href, "/course-id");
  assert.equal(model.imageFit, "cover");
  assert.deepEqual(model.badges, ["E-learning", "Private law"]);
  assert.equal(model.registrationEnd?.toISOString(), "2026-08-20T21:59:59.000Z");
});

test("conference offerings use localized names, logos, and contain images", () => {
  const conference = {
    id: "conference-id",
    slug: "milniky-prava",
    translations: {
      sk: { name: "Míľniky práva", logoUrl: "/milniky-sk.png" },
      en: { name: "Milestones of Law", logoUrl: "/milniky-en.png" },
    },
    dates: {
      start: "2026-10-01T08:00:00.000Z",
      end: "2026-10-02T16:00:00.000Z",
      regEnd: null,
      submissionDeadline: null,
    },
  };

  const attendee = conferenceOfferingModel(conference, "", "sk");
  const admin = conferenceOfferingModel(
    conference,
    "/conferences",
    "en",
  );

  assert.equal(attendee.title, "Míľniky práva");
  assert.equal(attendee.imageSrc, "/milniky-sk.png");
  assert.equal(attendee.imageFit, "contain");
  assert.equal(attendee.registrationEnd, undefined);
  assert.equal(admin.title, "Milestones of Law");
  assert.equal(admin.href, "/conferences/milniky-prava");
});
