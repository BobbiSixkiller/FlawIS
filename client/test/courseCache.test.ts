import assert from "node:assert/strict";
import test from "node:test";

import {
  COURSE_CACHE_REVALIDATE_SECONDS,
  courseAttendeeMutationTags,
  courseCacheConfig,
  courseCacheTags,
  courseCategoryMutationTags,
  courseEntityMutationTags,
} from "../src/lib/courseCache";

const courseId = "69a4226ae154b4e96ac9fa9a";

test("course reads opt into tagged caching", () => {
  assert.deepEqual(
    courseCacheConfig(
      courseCacheTags.allDetails,
      courseCacheTags.detail(courseId),
    ),
    {
      tags: [
        courseCacheTags.allDetails,
        `courses:${courseId}`,
      ],
      revalidate: COURSE_CACHE_REVALIDATE_SECONDS,
    },
  );
});

test("course mutations invalidate every course-owned cache", () => {
  assert.deepEqual(courseEntityMutationTags(courseId), [
    courseCacheTags.collection,
    `courses:${courseId}`,
    `courses:${courseId}:attendance`,
    `courses:${courseId}:reach-config`,
  ]);
});

test("attendee mutations invalidate participant and attendance views", () => {
  assert.deepEqual(courseAttendeeMutationTags(courseId), [
    `courses:${courseId}`,
    `courses:${courseId}:attendance`,
  ]);
});

test("category mutations invalidate category, catalogue, and detail data", () => {
  assert.deepEqual(courseCategoryMutationTags(), [
    courseCacheTags.categories,
    courseCacheTags.collection,
    courseCacheTags.allDetails,
  ]);
});
