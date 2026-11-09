import "dotenv/config";
import { MongoClient, ObjectId, type Db } from "mongodb";
import { Client as MinioClient } from "minio";

type ResetCheck = {
  _id: string;
  pendingFiles: string[];
  deletedFiles?: number;
  environment?: string;
  database?: string;
  counts?: Record<string, number>;
  databaseResetAt?: Date;
  completedAt?: Date;
};
const RESET_KEY = "legacy-course-reset-v1";
export function resetScope(
  courseIds: ObjectId[],
  attendeeIds: ObjectId[],
  sessionIds: ObjectId[],
  answerIds: ObjectId[] = [],
) {
  return {
    courses: { _id: { $in: courseIds } },
    categories: {},
    coursesessions: { course: { $in: courseIds } },
    courseattendees: { _id: { $in: attendeeIds } },
    attendancerecords: {
      $or: [
        { attendee: { $in: attendeeIds } },
        { session: { $in: sessionIds } },
      ],
    },
    forms: { course: { $exists: true } },
    formbindings: { context: "COURSE", owner: { $in: courseIds } },
    formanswers: { context: "COURSE", subject: { $in: attendeeIds } },
    formanswerrevisions: { answer: { $in: answerIds } },
    invoices: {
      ownerType: "COURSE_ATTENDEE",
      attendeeId: { $in: attendeeIds },
    },
  };
}
export function courseFileUrls(
  value: unknown,
  result = new Set<string>(),
): Set<string> {
  if (typeof value === "string")
    for (const url of value.match(
      /http:\/\/minio:9000\/courses\/[^\s"'<>]+/g,
    ) || [])
      result.add(url);
  else if (Array.isArray(value))
    value.forEach((v) => courseFileUrls(v, result));
  else if (value && typeof value === "object")
    Object.values(value).forEach((v) => courseFileUrls(v, result));
  return result;
}
async function exclusiveFiles(db: Db, filters: ReturnType<typeof resetScope>) {
  const candidates = new Set<string>();
  for (const [name, filter] of Object.entries(filters))
    for await (const doc of db.collection(name).find(filter))
      courseFileUrls(doc, candidates);
  // Preserve any URL referenced by a surviving record, including rich text and shared images.
  for (const collection of await db
    .listCollections({}, { nameOnly: true })
    .toArray()) {
    if (
      ["storedobjects", "maintenancechecks", "notifications"].includes(
        collection.name,
      ) ||
      collection.name.startsWith("system.")
    )
      continue;
    const filter = filters[collection.name as keyof typeof filters];
    for await (const doc of db
      .collection(collection.name)
      .find(filter ? { $nor: [filter] } : {})) {
      const text = JSON.stringify(doc);
      for (const url of candidates)
        if (text.includes(url)) candidates.delete(url);
    }
  }
  return [...candidates];
}
async function cleanupFiles(db: Db) {
  const checks = db.collection<ResetCheck>("maintenancechecks");
  const checkpoint = await checks.findOne({ _id: RESET_KEY });
  const pending: string[] = checkpoint?.pendingFiles || [];
  if (pending.length) {
    if (!process.env.MINIO_ACCESS_KEY || !process.env.MINIO_SECRET_KEY)
      throw new Error(
        "Database reset is checkpointed. Set MinIO credentials and rerun --apply to complete owned-file cleanup.",
      );
    const storage = new MinioClient({
      useSSL: false,
      endPoint: process.env.MINIO_ENDPOINT || "minio",
      port: Number(process.env.MINIO_PORT || 9000),
      accessKey: process.env.MINIO_ACCESS_KEY,
      secretKey: process.env.MINIO_SECRET_KEY,
    });
    for (const url of pending) {
      const object = url.slice("http://minio:9000/courses/".length);
      await storage.removeObject("courses", object);
      await db.collection("storedobjects").deleteMany({ url });
      await checks.updateOne(
        { _id: RESET_KEY },
        { $pull: { pendingFiles: url }, $inc: { deletedFiles: 1 } },
      );
    }
  }
  for (const name of ["course_1_version_1", "course_1_version_-1"]) {
    try {
      await db.collection("forms").dropIndex(name);
    } catch (e: any) {
      if (e.code !== 27 && e.code !== 26) throw e;
    }
  }
  await checks.updateOne(
    { _id: RESET_KEY },
    { $set: { completedAt: new Date() } },
  );
}
async function main() {
  const args = process.argv.slice(2),
    apply = args.includes("--apply");
  const environment = args
    .find((v) => v.startsWith("--environment="))
    ?.slice(14);
  const database = args.find((v) => v.startsWith("--database="))?.slice(11);
  if (
    !process.env.MONGODB_URI ||
    !database ||
    !["development", "staging", "production"].includes(environment || "")
  )
    throw new Error(
      "Set MONGODB_URI and specify --environment=development|staging|production --database=NAME. Default is dry run; --apply executes the one-time reset.",
    );
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  try {
    const db = client.db(database),
      checkpoint = db.collection<ResetCheck>("maintenancechecks");
    const prior = await checkpoint.findOne({ _id: RESET_KEY });
    if (prior) {
      if (apply && !prior.completedAt) {
        await cleanupFiles(db);
        console.log("Reset and owned-file cleanup completed.");
        return;
      }
      console.log(
        prior.completedAt
          ? "Reset already completed; no records changed."
          : "Database reset is checkpointed; owned-file cleanup resumes with --apply.",
      );
      return;
    }
    const [courses, attendees, sessions] = await Promise.all([
      db
        .collection("courses")
        .find({}, { projection: { _id: 1 } })
        .toArray(),
      db
        .collection("courseattendees")
        .find({}, { projection: { _id: 1 } })
        .toArray(),
      db
        .collection("coursesessions")
        .find({}, { projection: { _id: 1 } })
        .toArray(),
    ]);
    const answerIds = (
      await db
        .collection("formanswers")
        .find(
          { context: "COURSE", subject: { $in: attendees.map((v) => v._id) } },
          { projection: { _id: 1 } },
        )
        .toArray()
    ).map((v) => v._id);
    const filters = resetScope(
      courses.map((v) => v._id),
      attendees.map((v) => v._id),
      sessions.map((v) => v._id),
      answerIds,
    );
    const pendingFiles = await exclusiveFiles(db, filters),
      counts: Record<string, number> = {};
    for (const [name, filter] of Object.entries(filters))
      counts[name] = await db.collection(name).countDocuments(filter);
    console.log(
      JSON.stringify(
        {
          environment,
          database,
          mode: apply ? "apply" : "dry-run",
          counts,
          exclusivelyOwnedFiles: pendingFiles.length,
          preserved: [
            "users",
            "conferences",
            "attendees",
            "submissions",
            "shared invoice counters",
            "external Reach resources",
            "shared form definitions and versions",
            "files referenced outside courses",
          ],
        },
        null,
        2,
      ),
    );
    if (!apply) return;
    const session = client.startSession();
    try {
      await session.withTransaction(async () => {
        await checkpoint.insertOne(
          {
            _id: RESET_KEY,
            environment,
            database,
            counts,
            pendingFiles,
            deletedFiles: 0,
            databaseResetAt: new Date(),
          },
          { session },
        );
        for (const [name, filter] of Object.entries(filters))
          await db.collection(name).deleteMany(filter, { session });
        await db.collection("notifications").updateMany(
          {
            resourceId: { $in: courses.map((v) => String(v._id)) },
            state: { $in: ["PENDING", "QUEUED"] },
          },
          { $set: { state: "CANCELLED" } },
          { session },
        );
      });
    } finally {
      await session.endSession();
    }
    await cleanupFiles(db);
    console.log(
      "Legacy course data and exclusively owned course files reset completed.",
    );
  } finally {
    await client.close();
  }
}
if (require.main === module)
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
