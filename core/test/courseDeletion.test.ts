import "reflect-metadata";

import assert from "node:assert/strict";
import test from "node:test";
import { ObjectId } from "mongodb";
import mongoose from "mongoose";

import { CourseService } from "../src/services/courses/course.service";

async function withMockSession(operation: () => Promise<void>) {
  const originalStartSession = mongoose.startSession;
  const session = {
    async withTransaction(callback: () => Promise<void>) {
      await callback();
    },
    endSession() {},
  } as any;
  mongoose.startSession = async () => session;

  try {
    await operation();
  } finally {
    mongoose.startSession = originalStartSession;
  }
}

function courseDocument(courseId: ObjectId) {
  return {
    _id: courseId,
    toJSON: ({ transform }: any) =>
      transform(null, { _id: courseId, name: "Course" }),
  };
}

test("deleting a course cascades attendees and course-owned records", async () => {
  await withMockSession(async () => {
    const courseId = new ObjectId();
    const attendeeIds = [new ObjectId(), new ObjectId()];
    const courseSessionIds = [new ObjectId(), new ObjectId()];
    const calls: Record<string, any> = {};
    const storedCourse = courseDocument(courseId);

    const courseRepository = {
      findOne: async () => storedCourse,
      findOneAndDelete: async (filter: unknown, options: unknown) => {
        calls.course = { filter, options };
        return storedCourse;
      },
    };
    const courseSessionRepository = {
      findAll: async () =>
        courseSessionIds.map((_id) => ({ _id })),
      deleteMany: async (filter: unknown, options: unknown) => {
        calls.sessions = { filter, options };
      },
    };
    const courseAttendeeRepository = {
      findAll: async () => attendeeIds.map((_id) => ({ _id })),
      deleteMany: async (filter: unknown, options: unknown) => {
        calls.attendees = { filter, options };
      },
    };
    const attendanceRecordRepository = {
      deleteMany: async (filter: unknown, options: unknown) => {
        calls.attendance = { filter, options };
      },
    };
    const formService = {
      deleteCourseForms: async (id: ObjectId, session: unknown) => {
        calls.forms = { id, session };
      },
    };

    const service = new CourseService(
      courseRepository as any,
      courseSessionRepository as any,
      courseAttendeeRepository as any,
      attendanceRecordRepository as any,
      formService as any,
      { translate: () => "Course not found" } as any,
      {} as any,
    );

    const deleted = await service.deleteCourse(courseId);

    assert.equal(deleted.id, courseId);
    assert.deepEqual(calls.attendees.filter, { course: courseId });
    assert.deepEqual(calls.sessions.filter, { course: courseId });
    assert.equal(calls.forms.id, courseId);
    assert.deepEqual(
      calls.attendance.filter.$or[0].attendee.$in,
      attendeeIds,
    );
    assert.deepEqual(
      calls.attendance.filter.$or[1].session.$in,
      courseSessionIds,
    );
    assert.deepEqual(calls.course.filter, { _id: courseId });
  });
});

test("deleting a missing course does not delete related records", async () => {
  await withMockSession(async () => {
    let deleteCalls = 0;
    const deletingRepository = {
      deleteMany: async () => {
        deleteCalls += 1;
      },
    };
    const service = new CourseService(
      { findOne: async () => null } as any,
      deletingRepository as any,
      deletingRepository as any,
      deletingRepository as any,
      { deleteCourseForms: async () => (deleteCalls += 1) } as any,
      { translate: () => "Course not found" } as any,
      {} as any,
    );

    await assert.rejects(service.deleteCourse(new ObjectId()), /not found/i);
    assert.equal(deleteCalls, 0);
  });
});
