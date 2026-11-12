import "dotenv/config";
import { writeFile } from "node:fs/promises";
import {
  BSON,
  MongoClient,
  ObjectId,
  type ClientSession,
  type Db,
} from "mongodb";

type Options = {
  course: ObjectId;
  actor: ObjectId;
  apply?: boolean;
  backup?: string;
};

async function inspect(db: Db, options: Options, session?: ClientSession) {
  const course = await db
    .collection("courses")
    .findOne({ _id: options.course }, { session });
  if (!course) throw new Error("Course not found.");
  const actor = await db
    .collection("users")
    .findOne(
      { _id: options.actor, access: "ADMIN", verified: true },
      { session, projection: { _id: 1 } },
    );
  if (!actor)
    throw new Error(
      "The migration actor must be an existing verified administrator.",
    );
  const attendeeCount = await db
    .collection("courseattendees")
    .countDocuments({ course: options.course }, { session });
  if (attendeeCount)
    throw new Error(
      "This repair only supports courses without attendees; migrate application answers separately.",
    );
  const forms = await db
    .collection("forms")
    .find({ course: options.course }, { session })
    .sort({ version: 1 })
    .toArray();
  if (!forms.length) throw new Error("No legacy course forms found.");
  if (
    forms.some(
      (f) =>
        !Number.isInteger(f.version) ||
        f.version < 1 ||
        !Array.isArray(f.fields),
    ) ||
    new Set(forms.map((f) => f.version)).size !== forms.length
  )
    throw new Error("Invalid or duplicate legacy form versions.");
  const bindings = await db
    .collection("formbindings")
    .find({ context: "COURSE", owner: options.course }, { session })
    .toArray();
  if (bindings.length > 1)
    throw new Error("Multiple course bindings need manual review.");
  const binding = bindings[0];
  const bound = binding
    ? await db.collection("forms").findOne({ _id: binding.form }, { session })
    : null;
  const definition = bound?.definition
    ? await db
        .collection("formdefinitions")
        .findOne({ _id: bound.definition }, { session })
    : null;
  if (binding) {
    if (
      !bound ||
      !definition ||
      definition.archived ||
      forms.some((f) => String(f.definition) !== String(definition._id)) ||
      definition.latestVersion <
        Math.max(bound.version, forms[forms.length - 1].version)
    )
      throw new Error(
        "The existing shared form configuration is inconsistent; refusing to overwrite it.",
      );
  } else if (forms.some((f) => f.definition !== undefined)) {
    throw new Error("Partially migrated forms need manual review.");
  }
  return { course, forms, binding: binding ?? null, bound, definition };
}

/**
 * Adds shared-form metadata for one legacy course without attendees.
 * Preserves legacy fields, IDs, versions and indexes for the older reader.
 * Dry-run by default; apply requires an exclusive backup file and a transaction.
 * Refuses partial migrations and concurrent changes; compatible reruns are no-ops.
 */
export async function migrateCourseForms(
  client: MongoClient,
  db: Db,
  options: Options,
) {
  const before = await inspect(db, options);
  const latest = before.forms[before.forms.length - 1];
  const summary = {
    course: String(options.course),
    versions: before.forms.length,
    latestVersion: latest.version,
  };
  if (before.binding) return { ...summary, status: "already-compatible" };
  if (!options.apply)
    return {
      ...summary,
      status: "dry-run",
      formsToUpdate: before.forms.length,
      definitionsToCreate: 1,
      bindingsToCreate: 1,
    };
  if (!options.backup)
    throw new Error("--backup=PATH is required when applying the repair.");

  const now = new Date();
  const definition = {
    _id: new ObjectId(),
    name: `Course registration: ${before.course.name}`.slice(0, 200),
    description: "Registration form preserved from the legacy course model.",
    archived: false,
    latestVersion: latest.version,
    createdBy: options.actor,
    createdAt: now,
    updatedAt: now,
  };
  const binding = {
    _id: new ObjectId(),
    context: "COURSE",
    owner: options.course,
    form: latest._id,
    createdAt: now,
    updatedAt: now,
  };
  const serialize = (value: unknown) =>
    BSON.EJSON.stringify(value, { relaxed: false });
  await writeFile(
    options.backup,
    serialize({
      migration: "legacy-course-shared-forms-v1",
      database: db.databaseName,
      actor: options.actor,
      before,
      added: { definition, binding },
    }),
    { flag: "wx", mode: 0o600 },
  );
  const session = client.startSession();
  try {
    await session.withTransaction(
      async () => {
        const current = await inspect(db, options, session);
        if (serialize(current) !== serialize(before))
          throw new Error(
            "Course or forms changed after backup; rerun with a new backup path.",
          );
        await db
          .collection("formdefinitions")
          .insertOne(definition, { session });
        const result = await db.collection("forms").updateMany(
          {
            _id: { $in: before.forms.map((f) => f._id) },
            definition: { $exists: false },
          },
          { $set: { definition: definition._id } },
          { session },
        );
        if (result.modifiedCount !== before.forms.length)
          throw new Error("Legacy forms changed during migration.");
        await db.collection("formbindings").insertOne(binding, { session });
      },
      { readConcern: { level: "snapshot" }, writeConcern: { w: "majority" } },
    );
  } finally {
    await session.endSession();
  }
  await inspect(db, options);
  return {
    ...summary,
    status: "migrated",
    definition: String(definition._id),
    backup: options.backup,
  };
}

async function main() {
  const value = (name: string) =>
    process.argv
      .find((arg) => arg.startsWith(`--${name}=`))
      ?.slice(name.length + 3);
  const environment = value("environment"),
    database = value("database"),
    course = value("course"),
    actor = value("actor");
  if (
    !process.env.MONGODB_URI ||
    !["staging", "production"].includes(environment || "") ||
    !database ||
    !course ||
    !actor ||
    !ObjectId.isValid(course) ||
    !ObjectId.isValid(actor)
  )
    throw new Error(
      "Set MONGODB_URI and --environment=staging|production --database=NAME --course=ID --actor=ADMIN_ID. Default is dry-run; --apply requires --backup=PATH.",
    );
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  try {
    console.log(
      JSON.stringify({
        environment,
        database,
        ...(await migrateCourseForms(client, client.db(database), {
          course: new ObjectId(course),
          actor: new ObjectId(actor),
          apply: process.argv.includes("--apply"),
          backup: value("backup"),
        })),
      }),
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
