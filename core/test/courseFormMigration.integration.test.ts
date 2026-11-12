import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { BSON, MongoClient, ObjectId } from "mongodb";
import { migrateCourseForms } from "../scripts/migrate-course-forms";

const uri = process.env.COURSE_FORM_MIGRATION_TEST_URI;
test(
  "legacy course repair preserves data, is repeatable and refuses unsafe inputs",
  { skip: !uri, timeout: 30000 },
  async () => {
    assert.equal(process.env.REVIEW_TEST_ENVIRONMENT, "staging");
    const endpoint = new URL(uri!);
    assert.equal(endpoint.protocol, "mongodb:");
    assert.equal(endpoint.hostname, "127.0.0.1");
    assert.equal(endpoint.port, "27018");
    const client = await MongoClient.connect(uri!);
    const db = client.db("flawis_reviews_test");
    const directory = await mkdtemp(
      path.join(tmpdir(), "course-form-migration-"),
    );
    try {
      await db.dropDatabase();
      const course = new ObjectId(),
        actor = new ObjectId();
      const courseDocument = {
        _id: course,
        name: "Legacy course",
        registrationEnd: new Date("2020-01-01"),
        attendeesCount: 0,
      };
      const forms = [1, 2, 3].map((version) => ({
        _id: new ObjectId(),
        course,
        version,
        fields: [
          {
            _id: new ObjectId(),
            type: "TEXT",
            label: `Question ${version}`,
            required: false,
          },
        ],
        createdAt: new Date("2020-01-01"),
        updatedAt: new Date("2020-01-02"),
      }));
      await db
        .collection("users")
        .insertOne({ _id: actor, access: ["ADMIN"], verified: true });
      await db.collection("courses").insertOne(courseDocument);
      await db.collection("forms").insertMany(forms);
      await db
        .collection("forms")
        .createIndex({ course: 1, version: 1 }, { unique: true });
      await db
        .collection("forms")
        .createIndex({ definition: 1, version: 1 }, { unique: true });
      await db
        .collection("formbindings")
        .createIndex({ context: 1, owner: 1 }, { unique: true });
      const indexes = await db.collection("forms").listIndexes().toArray();
      const backup = path.join(directory, "before.ejson");
      const options = { course, actor, backup, apply: true };

      assert.equal(
        (await migrateCourseForms(client, db, { course, actor })).status,
        "dry-run",
      );
      assert.equal(await db.collection("formdefinitions").countDocuments(), 0);
      await assert.rejects(
        migrateCourseForms(client, db, { ...options, actor: new ObjectId() }),
        /verified administrator/,
      );
      await assert.rejects(
        migrateCourseForms(client, db, { course, actor, apply: true }),
        /backup/,
      );
      const attendee = await db
        .collection("courseattendees")
        .insertOne({ course });
      await assert.rejects(
        migrateCourseForms(client, db, options),
        /without attendees/,
      );
      await db
        .collection("courseattendees")
        .deleteOne({ _id: attendee.insertedId });

      // A conflicting insert must roll back the definition and all form updates.
      await db
        .collection("formbindings")
        .insertOne({ context: "REVIEW", owner: course });
      await db
        .collection("formbindings")
        .createIndex({ owner: 1 }, { unique: true });
      await assert.rejects(
        migrateCourseForms(client, db, options),
        /duplicate key/,
      );
      assert.equal(await db.collection("formdefinitions").countDocuments(), 0);
      assert.equal(
        await db
          .collection("forms")
          .countDocuments({ definition: { $exists: true } }),
        0,
      );
      await db.collection("formbindings").dropIndex("owner_1");
      await assert.rejects(migrateCourseForms(client, db, options), /EEXIST/);

      const result = await migrateCourseForms(client, db, {
        ...options,
        backup: path.join(directory, "apply.ejson"),
      });
      assert.equal(result.status, "migrated");
      const definition = await db.collection("formdefinitions").findOne({});
      assert.equal(definition!.latestVersion, 3);
      assert.equal(String(definition!.createdBy), String(actor));
      for (const form of forms) {
        assert.deepEqual(
          await db.collection("forms").findOne({ _id: form._id }),
          { ...form, definition: definition!._id },
        );
      }
      assert.deepEqual(
        await db.collection("courses").findOne({ _id: course }),
        courseDocument,
      );
      assert.deepEqual(
        await db.collection("forms").listIndexes().toArray(),
        indexes,
      );
      const binding = await db
        .collection("formbindings")
        .findOne({ context: "COURSE", owner: course });
      assert.equal(String(binding!.form), String(forms[2]._id));
      const saved = BSON.EJSON.parse(
        await readFile(path.join(directory, "apply.ejson"), "utf8"),
      );
      assert.deepEqual(saved.before.forms, forms);
      assert.equal(
        (await stat(path.join(directory, "apply.ejson"))).mode & 0o777,
        0o600,
      );
      assert.equal(
        (await migrateCourseForms(client, db, options)).status,
        "already-compatible",
      );
      assert.equal(await db.collection("formdefinitions").countDocuments(), 1);
      assert.equal(await db.collection("notifications").countDocuments(), 0);

      // A rerun must preserve a later shared-form selection.
      const later = {
        _id: new ObjectId(),
        definition: definition!._id,
        version: 4,
        fields: [],
      };
      await db.collection("forms").insertOne(later);
      await db
        .collection("formdefinitions")
        .updateOne({ _id: definition!._id }, { $set: { latestVersion: 4 } });
      await db
        .collection("formbindings")
        .updateOne({ _id: binding!._id }, { $set: { form: later._id } });
      assert.equal(
        (await migrateCourseForms(client, db, options)).status,
        "already-compatible",
      );
      assert.equal(
        String(
          (await db.collection("formbindings").findOne({ _id: binding!._id }))!
            .form,
        ),
        String(later._id),
      );
      await db.collection("formbindings").deleteOne({ _id: binding!._id });
      await assert.rejects(
        migrateCourseForms(client, db, options),
        /Partially migrated/,
      );
    } finally {
      await db.dropDatabase();
      await client.close();
      await rm(directory, { recursive: true, force: true });
    }
  },
);
