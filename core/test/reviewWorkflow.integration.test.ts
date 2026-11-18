import "reflect-metadata";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import assert from "node:assert/strict";
import test from "node:test";
import mongoose from "mongoose";
import { getModelForClass } from "@typegoose/typegoose";
import { ObjectId } from "mongodb";
import PizZip from "pizzip";
import Express from "express";
import cookieParser from "cookie-parser";
import Container from "typedi";
import { registerReviewRoutes } from "../src/routes/reviews";
import { Access, User } from "../src/entitites/User";
import { Conference } from "../src/entitites/Conference";
import { Section } from "../src/entitites/Section";
import { Attendee } from "../src/entitites/Attendee";
import { Submission } from "../src/entitites/Submission";
import {
  Form,
  FormAnswer,
  FormAnswerRevision,
  FormBinding,
  FormDefinition,
} from "../src/entitites/Form";
import * as ReviewModels from "../src/entitites/Review";
import { Notification } from "../src/entitites/Notification";
import { StoredObject } from "../src/entitites/StoredObject";
import { Repository } from "../src/repositories/base.repository";
import {
  AnswerRepository,
  AnswerRevisionRepository,
  FormBindingRepository,
  FormDefinitionRepository,
  FormRepository,
} from "../src/repositories/form.repository";
import { FormService } from "../src/services/form.service";
import { ReviewResolver } from "../src/resolvers/reviews/review.resolver";
import { ManuscriptHistoryService } from "../src/services/reviews/manuscript-history.service";
import { PublicationService } from "../src/services/reviews/publication.service";
import { ReviewService } from "../src/services/reviews/review.service";
import {
  ConferenceTemplateService,
  ConferenceTemplateKind,
} from "../src/services/conferences/conference-template.service";
import { ReviewFileService } from "../src/services/reviews/file.service";
import {
  ReviewExportService,
  defaultReportTemplate,
} from "../src/services/reviews/export.service";
import { ReviewAccessService } from "../src/services/reviews/access.service";
import { ActivityService } from "../src/services/reviews/activity.service";
import { RmqService } from "../src/services/rmq.service";
import { unseal } from "../src/util/secrets";
import { toDTO } from "../src/util/helpers";

const uri = process.env.REVIEW_TEST_MONGODB_URI;

test(
  "MongoDB 8: shared forms and the complete confidential review workflow",
  { skip: !uri, timeout: 240000 },
  async (t) => {
    assert.equal(process.env.REVIEW_TEST_ENVIRONMENT, "staging");
    assert.equal(new URL(uri!).protocol, "mongodb:");
    assert.equal(
      new URL(uri!).hostname,
      "127.0.0.1",
      "Connect to the test target through loopback (on its host or through a tunnel).",
    );
    assert.equal(new URL(uri!).port, "27018");
    process.env.SECRET = "isolated-integration-test-secret";
    await mongoose.connect(uri!, { dbName: "flawis_reviews_test" });
    await mongoose.connection.dropDatabase();

    try {
      const models = [
        User,
        Conference,
        Section,
        Attendee,
        Submission,
        Form,
        FormAnswer,
        FormAnswerRevision,
        FormBinding,
        FormDefinition,
        Notification,
        StoredObject,
        ...Object.values(ReviewModels),
      ] as any[];
      await Promise.all(models.map((model) => getModelForClass(model).init()));

      const users = new Repository(User),
        conferences = new Repository(Conference),
        sections = new Repository(Section),
        submissions = new Repository(Submission);

      const admin = toDTO(
        await users.create({
          name: "Coordinator",
          email: "coordinator@example.test",
          access: [Access.Admin],
          verified: true,
        }),
      );

      const author = toDTO(
        await users.create({
          name: "Paper Author",
          email: "author@example.test",
          access: [Access.ConferenceAttendee],
          verified: true,
        }),
      );

      const coordinator = toDTO(
        await users.create({
          name: "Section coordinator",
          email: "section@example.test",
          access: [],
          verified: true,
        }),
      );

      const conference = await conferences.create({
        slug: "review-test",
        dates: { start: new Date(), end: new Date() },
        translations: {
          sk: { name: "Test", logoUrl: "x" },
          en: { name: "Test", logoUrl: "x" },
        },
      });
      const section = await sections.create({
        conference: conference._id,
        translations: {
          sk: { name: "Test", topic: "Topic" },
          en: { name: "Test", topic: "Topic" },
        },
      });
      const paper = await submissions.create({
        conference: conference._id,
        section: section._id,
        authors: [author.id],
        translations: {
          sk: { name: "Príspevok", abstract: "Abstrakt", keywords: ["test"] },
          en: {
            name: "Review paper",
            abstract: "Abstract",
            keywords: ["test"],
          },
        },
      });
      await new Repository(Attendee).create({
        conference: { _id: conference._id, slug: conference.slug },
        user: { _id: author.id, name: author.name, email: author.email },
        ticket: { _id: new ObjectId(), withSubmission: true },
      });
      const forms = new FormService(
        new FormRepository(),
        new FormDefinitionRepository(),
        new FormBindingRepository(),
        new AnswerRepository(),
        new AnswerRevisionRepository(),
      );

      const access = new ReviewAccessService(),
        activity = new ActivityService(),
        mail = new RmqService();

      const reviews = new ReviewService(access, activity, forms, mail);
      const buffers = new Map<string, Buffer>();
      const storage = {
        upload: async (bucket: string, key: string, bytes: Buffer) => {
          buffers.set(`${bucket}/${key}`, bytes);
        },
        buffer: async (bucket: string, key: string) => {
          const bytes = buffers.get(`${bucket}/${key}`);
          if (!bytes) throw new Error("Missing file");
          return bytes;
        },
        deleteFiles: async () => {},
      } as any;
      const handover = process.env.BPF_HANDOVER_DIRECTORY;
      const sample = (name: string, fallback: Buffer) =>
        handover
          ? readFileSync(join(handover, "02_Vzorovy_pripad", name))
          : fallback;
      const files = new ReviewFileService(storage, reviews, access, activity);
      const exports = new ReviewExportService(
        reviews,
        access,
        files,
        forms,
        activity,
      );
      await access.grant(admin, conference._id, coordinator.id, section._id);
      const templates = new ConferenceTemplateService(access, activity);
      let reportTemplateId: ObjectId;
      await t.test(
        "conference templates publish independently of reviews with scoped permissions and atomic audit",
        async () => {
          const templateBytes = defaultReportTemplate();

          const upload = (kind: string, user = admin, extra = {}) =>
            files.upload({
              user,
              conference: conference._id,
              kind,
              filename: "official.docx",
              buffer: templateBytes,
              ...extra,
            });

          await assert.rejects(
            upload("MANUSCRIPT_TEMPLATE", coordinator),
            /coordinate/,
          );
          await assert.rejects(
            upload("MANUSCRIPT_TEMPLATE", author),
            /coordinate/,
          );
          const lead = { ...coordinator, id: new ObjectId() };
          await access.grant(admin, conference._id, lead.id);
          const manuscript = new ObjectId(
            (await upload("MANUSCRIPT_TEMPLATE", lead)).id,
          );
          await assert.rejects(
            templates.manuscriptTemplate(conference._id),
            /not found/,
          );
          await templates.setTemplate(
            lead,
            conference._id,
            ConferenceTemplateKind.Manuscript,
            manuscript,
          );
          assert.equal(
            String((await templates.manuscriptTemplate(conference._id))._id),
            String(manuscript),
          );
          assert.equal(
            await reviews.settings.findOne({ conference: conference._id }),
            null,
          );
          const app = Express();
          app.use(cookieParser());
          Container.set(ConferenceTemplateService, templates);
          Container.set(ReviewFileService, files);
          registerReviewRoutes(app);
          const server = app.listen(0, "127.0.0.1");
          await new Promise<void>((resolve) =>
            server.once("listening", resolve),
          );

          try {
            const address = server.address() as { port: number };
            const origin = `http://127.0.0.1:${address.port}`;
            const response = await fetch(
              `${origin}/conference-templates/${conference._id}/manuscript`,
            );
            assert.equal(response.status, 200);
            assert.match(
              response.headers.get("content-disposition")!,
              /manuscript-template.docx/,
            );
            assert.equal(
              response.headers.get("cache-control"),
              "private, no-store",
            );
            assert.deepEqual(
              Buffer.from(await response.arrayBuffer()),
              templateBytes,
            );
            const protectedFile = await fetch(
              `${origin}/review-files/${manuscript}`,
            );
            assert.equal(protectedFile.status, 400);
            assert.match(
              ((await protectedFile.json()) as { error: string }).error,
              /Authentication/,
            );
            assert.equal(
              (
                await fetch(
                  `${origin}/conference-templates/${new ObjectId()}/manuscript`,
                )
              ).status,
              400,
            );
          } finally {
            await new Promise<void>((resolve, reject) =>
              server.close((error) => (error ? reject(error) : resolve())),
            );
            Container.remove(ConferenceTemplateService);
            Container.remove(ReviewFileService);
          }

          await assert.rejects(
            files.authorizedFile(manuscript, author),
            /coordinate/,
          );
          await assert.rejects(
            templates.setTemplate(
              coordinator,
              conference._id,
              ConferenceTemplateKind.Manuscript,
              manuscript,
            ),
            /coordinate/,
          );
          await assert.rejects(
            templates.setTemplate(
              admin,
              new ObjectId(),
              ConferenceTemplateKind.Manuscript,
              manuscript,
            ),
            /not found/,
          );
          const original = new PizZip(defaultReportTemplate());
          original.file(
            "word/document.xml",
            original
              .file("word/document.xml")!
              .asText()
              .replace("REVIEW REPORT", "ORIGINAL OFFICIAL REPORT"),
          );
          const bytes = original.generate({ type: "nodebuffer" });
          const legacy = await reviews.files.create({
            conference: conference._id,
            bucket: "conference-reviews",
            objectName: "historical-layout.docx",
            kind: "TEMPLATE",
            filename: "historical.docx",
            contentType:
              "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            size: bytes.length,
            checksum: "historical",
          });
          await storage.upload(
            legacy.bucket,
            legacy.objectName,
            bytes,
            legacy.contentType,
          );
          reportTemplateId = legacy._id;
          await assert.rejects(upload("TEMPLATE"), /Invalid file kind/);
          await assert.rejects(
            templates.setTemplate(
              admin,
              conference._id,
              ConferenceTemplateKind.Manuscript,
              reportTemplateId,
            ),
            /purpose/,
          );
          await assert.rejects(
            templates.setTemplate(
              admin,
              conference._id,
              ConferenceTemplateKind.Review,
              manuscript,
            ),
            /built-in/,
          );
          const other = await conferences.create({
            slug: "other-template-conference",
            dates: { start: new Date(), end: new Date() },
          });
          await assert.rejects(
            templates.setTemplate(
              admin,
              other._id,
              ConferenceTemplateKind.Manuscript,
              manuscript,
            ),
            /purpose/,
          );
          const replacement = new ObjectId(
            (await upload("MANUSCRIPT_TEMPLATE")).id,
          );
          const originalRecord = activity.record;
          activity.record = async () => {
            throw new Error("audit failed");
          };

          try {
            await assert.rejects(
              templates.setTemplate(
                admin,
                conference._id,
                ConferenceTemplateKind.Manuscript,
                replacement,
              ),
              /audit failed/,
            );
            assert.equal(
              String((await templates.manuscriptTemplate(conference._id))._id),
              String(manuscript),
            );
          } finally {
            activity.record = originalRecord;
          }

          await templates.setTemplate(
            admin,
            conference._id,
            ConferenceTemplateKind.Manuscript,
            replacement,
          );
          assert.equal(
            String((await templates.manuscriptTemplate(conference._id))._id),
            String(replacement),
          );
          await assert.rejects(
            files.authorizedFile(manuscript),
            /Authentication/,
          );
          assert.deepEqual(
            await files.bytes(
              await templates.manuscriptTemplate(conference._id),
            ),
            templateBytes,
          );
          await templates.setTemplate(
            admin,
            conference._id,
            ConferenceTemplateKind.Manuscript,
            null,
          );
          await assert.rejects(
            templates.manuscriptTemplate(conference._id),
            /not found/,
          );
          // Simulate a conference configured before report layout uploads were retired.
          await reviews.settings.findOneAndUpdate(
            { conference: conference._id },
            { $set: { templateFile: reportTemplateId, enabled: false } },
            { upsert: true },
          );
        },
      );
      const config = await reviews.configure(admin, conference._id, {
        enabled: true,
      });
      const form = await forms.getForm(config!.form!);
      await t.test(
        "activity records with no change details remain valid GraphQL DTOs",
        async () => {
          await activity.record(
            admin,
            "submission.viewed",
            conference._id,
            paper._id,
          );
          const events = await new ReviewResolver(
            reviews,
            access,
            forms,
            activity,
          ).conferenceActivity(
            { user: admin } as any,
            conference._id,
            paper._id,
          );
          assert.deepEqual(
            events.find((event) => event.action === "submission.viewed")
              ?.changes,
            {},
          );
        },
      );
      await t.test(
        "settings patches preserve other groups and published form bindings",
        async () => {
          const result = await new ReviewResolver(
            reviews,
            access,
            forms,
            activity,
          ).conferenceReviewSettings({ user: admin } as any, conference._id);
          assert.deepEqual(result!.sectionRequirements, {});
          await reviews.configure(admin, conference._id, {
            instructions: "Updated instructions",
            replyTo: "editor@example.test",
          });
          const saved = await reviews.settings.findOne({
            conference: conference._id,
          });
          assert.equal(saved!.enabled, true);
          assert.equal(saved!.requiredReviews, 2);
          assert.equal(String(saved!.form), String(config!.form));
          assert.deepEqual(saved!.authorFields, config!.authorFields);
          await assert.rejects(
            reviews.configure(admin, conference._id, { requiredReviews: 0 }),
            /between/,
          );
          assert.equal(
            (await reviews.settings.findOne({ conference: conference._id }))!
              .instructions,
            "Updated instructions",
          );
        },
      );
      await t.test(
        "queue filters precede pagination and exclude other coordinator scopes",
        async () => {
          const extra = [];

          for (let i = 0; i < 35; i++)
            extra.push(
              await submissions.create({
                conference: conference._id,
                section: section._id,
                authors: [author.id],
                translations: {
                  sk: { name: `Test ${i}`, abstract: "x", keywords: [] },
                  en: { name: `Extra ${i}`, abstract: "x", keywords: [] },
                },
              }),
            );

          const hidden = await submissions.create({
            conference: conference._id,
            section: new ObjectId(),
            authors: [author.id],
            translations: {
              sk: { name: "Skrytá sekcia", abstract: "x", keywords: [] },
              en: { name: "Hidden section", abstract: "x", keywords: [] },
            },
          });
          const inactive = await submissions.create({
            conference: conference._id,
            section: section._id,
            authors: [admin.id],
            translations: {
              sk: { name: "Neaktívny autor", abstract: "x", keywords: [] },
              en: { name: "Inactive author", abstract: "x", keywords: [] },
            },
          });
          const first = await reviews.queue(coordinator, conference._id);
          assert.equal(first.rows.length, 30);
          assert.equal(first.totalCount, 36);
          assert.equal(first.hasNextPage, true);
          assert.equal(
            (
              await reviews.queue(
                coordinator,
                conference._id,
                undefined,
                undefined,
                30,
                { search: "Hidden section" },
              )
            ).totalCount,
            0,
          );
          assert.equal(
            (await reviews.queue(admin, conference._id)).totalCount,
            37,
          );
          const matching = await reviews.queue(
            coordinator,
            conference._id,
            undefined,
            undefined,
            30,
            { search: "Review paper", stage: "MISSING_FILE" },
          );

          assert.deepEqual(
            matching.rows.map((r) => r.submissionId),
            [String(paper._id)],
          );

          assert.equal(matching.totalCount, 1);
          const second = await reviews.queue(
            coordinator,
            conference._id,
            undefined,
            new ObjectId(first.endCursor!),
            30,
          );
          assert.equal(second.rows.length, 6);
          assert.equal(second.totalCount, 36);
          const own = await reviews.queue(
            { ...author, access: [Access.Admin] },
            conference._id,
          );
          assert.ok(
            own.rows.every(
              (r) =>
                r.ownPaper &&
                r.stage === "OWN_PAPER" &&
                !r.assignments.length &&
                r.requiredReviews === 0,
            ),
          );
          for (const item of [...extra, hidden, inactive])
            await submissions.deleteOne({ _id: item._id });
        },
      );
      await t.test(
        "coordinator grants and eligibility roll back when their audit fails",
        async () => {
          const resolver = new ReviewResolver(reviews, access, forms, activity);
          const originalRecord = activity.record.bind(activity);
          const context = { user: admin } as any;
          const reviewer = await reviews.saveReviewer(admin, {
            name: "Audit test",
            email: "audit@example.test",
          });
          activity.record = async () => {
            throw new Error("audit unavailable");
          };

          try {
            await assert.rejects(
              resolver.setReviewCoordinator(
                context,
                conference._id,
                author.email,
              ),
              /audit unavailable/,
            );
            assert.equal(
              await access.grants.countDocuments({ user: author.id }),
              0,
            );
            const existing = await access.grants.findOne({
              user: coordinator.id,
            });
            await assert.rejects(
              resolver.revokeReviewCoordinator(context, existing!._id),
              /audit unavailable/,
            );
            assert.ok(await access.grants.exists({ _id: existing!._id }));
            await assert.rejects(
              resolver.setReviewerEligibility(
                context,
                conference._id,
                reviewer!._id,
                { participatedSections: [String(section._id)] },
              ),
              /audit unavailable/,
            );

            assert.equal(
              await reviews.eligibility.countDocuments({
                reviewer: reviewer!._id,
              }),
              0,
            );
          } finally {
            activity.record = originalRecord;
          }
        },
      );

      assert.ok(
        form.fields.every((f) => ObjectId.isValid(String(f.id))),
        "stable nested field IDs survive DTO conversion",
      );

      await t.test(
        "forms can be bound to multiple domains without sharing responses",
        async () => {
          const courseId = new ObjectId(),
            attendeeId = new ObjectId();

          await forms.bind("COURSE", courseId, form.id);
          const answer = await forms.saveAnswers({
            context: "COURSE",
            owner: courseId,
            subject: attendeeId,
            respondent: String(author.id),
            form: form.id,
            answers: { [String(form.fields[0].id)]: "PUBLISH" },
            submitted: true,
          });
          assert.equal(answer.formVersion, form.version);
          await assert.rejects(
            forms.saveAnswers({
              context: "COURSE",
              owner: courseId,
              subject: attendeeId,
              respondent: String(author.id),
              form: form.id,
              answers: {},
              submitted: false,
              expectedRevision: answer.revision,
            }),
            /immutable/,
          );
          const newer = await forms.publish(
            form.definition,
            form.fields as any,
          );
          assert.equal(newer.version, form.version + 1);
          assert.equal(
            String((await forms.bound("COURSE", courseId)).id),
            String(form.id),
          );
        },
      );

      if (handover) {
        const template = await files.upload({
          user: admin,
          conference: conference._id,
          kind: "MANUSCRIPT_TEMPLATE",
          filename: "BPF.docx",
          buffer: readFileSync(
            join(
              handover,
              "01_Pravidla_a_sablony",
              "01_BPF_2026_Sablona_prispevku_EN_B5.docx",
            ),
          ),
        });
        await templates.setTemplate(
          admin,
          conference._id,
          ConferenceTemplateKind.Manuscript,
          new ObjectId(template.id),
        );
      }

      await files.upload({
        user: author,
        submission: paper._id,
        kind: "ORIGINAL",
        filename: "original.docx",
        buffer: sample("01_Original.docx", defaultReportTemplate()),
      });
      const reviewer1 = await reviews.saveReviewer(admin, {
        name: "Reviewer One",
        email: "one@example.test",
        institution: "Other university",
        department: "Law",
      });
      const reviewer2 = await reviews.saveReviewer(admin, {
        name: "Reviewer Two",
        email: "two@example.test",
        institution: "Other university",
        department: "IT",
      });
      const self = await reviews.saveReviewer(admin, {
        name: author.name,
        email: author.email,
      });
      const base = await reviews.cases.findOne({ submission: paper._id });
      await t.test(
        "self-review is rejected and the attempted round is rolled back",
        async () => {
          await assert.rejects(
            reviews.action(
              coordinator,
              paper._id,
              "ASSIGN",
              {
                reviewerId: self!._id,
                slot: 1,
                deadline: new Date(Date.now() + 7 * 86400000).toISOString(),
                reason: "verified",
              },
              "conferences.example.test",
            ),
            /Authors cannot/,
          );
          assert.equal(
            await reviews.rounds.countDocuments({ review: base!._id }),
            0,
          );
          assert.equal(
            (await reviews.cases.findOne({ _id: base!._id }))!.revision,
            base!.revision,
          );
        },
      );
      await t.test(
        "an audit failure rolls back the round, assignment and case revision",
        async () => {
          const original = activity.record.bind(activity);
          activity.record = async () => {
            throw new Error("Audit unavailable");
          };

          try {
            await assert.rejects(
              reviews.action(
                coordinator,
                paper._id,
                "ASSIGN",
                {
                  reviewerId: reviewer1!._id,
                  slot: 1,
                  deadline: new Date(Date.now() + 7 * 86400000).toISOString(),
                  reason: "Checked",
                },
                "conferences.example.test",
              ),
              /Audit unavailable/,
            );
            assert.equal(
              await reviews.rounds.countDocuments({ review: base!._id }),
              0,
            );
            assert.equal(
              await reviews.assignments.countDocuments({ review: base!._id }),
              0,
            );
            assert.equal(
              (await reviews.cases.findOne({ _id: base!._id }))!.revision,
              base!.revision,
            );
          } finally {
            activity.record = original;
          }
        },
      );

      for (const [index, reviewer] of [reviewer1, reviewer2].entries())
        await reviews.action(
          coordinator,
          paper._id,
          "ASSIGN",
          {
            reviewerId: reviewer!._id,
            slot: index + 1,
            deadline: new Date(Date.now() + 7 * 86400000).toISOString(),
            reason: "Department and section eligibility checked",
          },
          "conferences.example.test",
        );

      const review = await reviews.cases.findOne({ submission: paper._id });
      await t.test(
        "new rounds ignore historical conference layouts and older rounds retain their pinned report",
        async () => {
          const round = (await reviews.rounds.findOne({
            _id: review!.currentRound,
          }))!;
          assert.equal(round.templateFile, undefined);
          await assert.rejects(
            reviews.configure(admin, conference._id, {
              templateFile: reportTemplateId,
            }),
            /built-in/,
          );
          // Restore a historical round fixture to exercise its saved layout through real downloads.
          await reviews.rounds.findOneAndUpdate(
            { _id: round._id },
            { $set: { templateFile: reportTemplateId } },
          );
        },
      );
      const assignments = await reviews.assignments.findAll(
        { round: review!.currentRound },
        null,
        { sort: { slot: 1 } },
      );
      await assert.rejects(
        reviews.action(
          coordinator,
          paper._id,
          "SEND",
          { assignmentId: assignments[0]._id },
          "conferences.example.test",
        ),
        /Approve|Upload/,
      );
      await files.upload({
        user: coordinator,
        submission: paper._id,
        kind: "ANONYMOUS",
        filename: "anonymous.docx",
        buffer: sample("02_Anonymizovany.docx", defaultReportTemplate()),
      });
      await reviews.action(
        coordinator,
        paper._id,
        "PREPARE",
        { notes: "Language, formatting, and author removal checked" },
        "conferences.example.test",
      );
      const messagesBeforeLink = await new Repository(
        Notification,
      ).countDocuments({ assignmentId: { $exists: true } });
      const link = await reviews.action(
        coordinator,
        paper._id,
        "PREPARE_LINK",
        { assignmentId: assignments[0]._id },
        "conferences.example.test",
      );
      assert.match(link.url!, /\/review\/[A-Za-z0-9_-]{43}$/);

      assert.equal(
        await new Repository(Notification).countDocuments({
          assignmentId: { $exists: true },
        }),
        messagesBeforeLink,
      );

      const packageZip = new PizZip(
        await exports.export(
          coordinator,
          paper._id,
          review!.currentRound,
          assignments[0]._id,
        ),
      );
      assert.equal(packageZip.file(/\.docx$/).length, 1);
      assert.equal(packageZip.file("review-form.docx"), null);
      for (const a of assignments)
        await reviews.action(
          coordinator,
          paper._id,
          "SEND",
          { assignmentId: a._id },
          "conferences.example.test",
        );
      const stored = await reviews.assignments.findAll(
        { round: review!.currentRound },
        null,
        { sort: { slot: 1 } },
      );

      const token1 = unseal(stored[0].tokenEncrypted!),
        token2 = unseal(stored[1].tokenEncrypted!);

      const portal = await reviews.portal(token1);
      assert.equal(portal.assignmentId, String(stored[0]._id));
      assert.ok(!JSON.stringify(portal).includes(author.email));
      await t.test(
        "reviewer file access is restricted to their round",
        async () => {
          const version = await reviews.versions.findOne({
            submission: paper._id,
          });
          await assert.rejects(
            files.authorizedFile(version!.file, undefined, token1),
            /access denied/,
          );
          await files.authorizedFile(
            version!.anonymousFile!,
            undefined,
            token1,
          );
          await assert.rejects(
            files.authorizedFile(version!.anonymousFile!, author),
            /independent coordinator/,
          );
        },
      );
      await t.test(
        "private portal labels reflect the round's author visibility",
        async () => {
          const portal = await reviews.portal(token1);
          assert.ok(portal.authorFields.includes(config!.recommendationField!));
          assert.ok(
            portal.authorFields.every((fieldId) =>
              portal.form.fields.some(
                (f) => String(f.id) === fieldId && f.type !== "FileUpload",
              ),
            ),
          );
          assert.ok(
            portal.form.fields.every((f) =>
              [
                "Text",
                "Textarea",
                "Select",
                "RadioGroup",
                "FileUpload",
              ].includes(f.type),
            ),
          );
        },
      );
      const values = {
        [config!.recommendationField!]: "PUBLISH",
        [String(form.fields[1].id)]: "Clear and useful contribution.",
      };
      await reviews.saveReport(
        token1,
        values,
        undefined,
        false,
        "conferences.example.test",
      );
      await assert.rejects(
        reviews.saveReport(token1, values, 0, true, "conferences.example.test"),
        /changed/,
      );
      await reviews.saveReport(
        token1,
        values,
        1,
        true,
        "conferences.example.test",
      );
      assert.equal(
        await reviews.releases.countDocuments({ submission: paper._id }),
        0,
      );
      await reviews.saveReport(
        token2,
        { ...values, [config!.recommendationField!]: "CONDITIONAL" },
        undefined,
        true,
        "conferences.example.test",
      );
      await reviews.saveReport(
        token2,
        values,
        undefined,
        true,
        "conferences.example.test",
      );
      await t.test(
        "complete rounds release anonymized feedback exactly once",
        async () => {
          const released = await reviews.authorFeedback(author, paper._id);
          assert.equal(released.length, 1);
          assert.ok(!JSON.stringify(released).includes(reviewer1!.name));
          assert.ok(!JSON.stringify(released).includes(reviewer2!.email));
          const reports = new PizZip(
            await exports.export(coordinator, paper._id),
          );
          assert.equal(reports.file(/\.docx$/).length, 2);
          const report = new PizZip(reports.file(/\.docx$/)[0].asNodeBuffer());
          assert.match(
            report.file("word/document.xml")!.asText(),
            /ORIGINAL OFFICIAL REPORT/,
          );
          assert.match(
            report.file("word/document.xml")!.asText(),
            /Clear and useful/,
          );
        },
      );
      await t.test(
        "author conflicts apply to admins and original impersonating actors",
        async () => {
          await assert.rejects(
            access.paper({ ...author, access: [Access.Admin] }, paper._id),
            /independent/,
          );
          await assert.rejects(
            access.paper(
              { ...admin, originalActorId: String(author.id) },
              paper._id,
            ),
            /independent/,
          );
          const stranger = { ...coordinator, id: new ObjectId() };
          await assert.rejects(access.paper(stranger, paper._id), /coordinate/);
        },
      );
      await reviews.action(
        coordinator,
        paper._id,
        "REQUEST_REVISION",
        {
          reportPoints: {
            [String(assignments[1]._id)]: "Please clarify the conclusion.",
          },
          deadline: new Date(Date.now() + 7 * 86400000).toISOString(),
        },
        "conferences.example.test",
      );
      const revisionJob = await new Repository(Notification).findOne(
        { assignmentId: { $exists: false }, routingKey: "mail.review" },
        null,
        { sort: { createdAt: -1 } },
      );
      const correctionUrl = JSON.parse(unseal(revisionJob!.payload)).url;
      const revisionToken = correctionUrl.split("/").pop();
      const invitationCount = await new Repository(Notification).countDocuments(
        { assignmentId: { $exists: true } },
      );
      await assert.rejects(
        files.upload({
          revisionToken,
          kind: "REVISION",
          filename: "single.docx",
          buffer: sample("05_Oprava_cista.docx", defaultReportTemplate()),
        }),
        /both the clean/,
      );
      const tracked = new PizZip(defaultReportTemplate());
      tracked.file("word/settings.xml", "<settings/>");
      await files.upload({
        tracked: {
          filename: "tracked.docx",
          buffer: sample(
            "06_Oprava_sledovane_zmeny.docx",
            tracked.generate({ type: "nodebuffer" }),
          ),
        },
        revisionToken,
        kind: "REVISION",
        filename: "corrected.docx",
        buffer: sample("05_Oprava_cista.docx", defaultReportTemplate()),
        note: "Conclusion clarified.",
      });
      const correction = await reviews.revisions.findOne({
        submission: paper._id,
      });
      assert.equal(correction!.status, "RECEIVED");
      assert.equal(correction!.instructions, "Please clarify the conclusion.");
      assert.equal(correction!.points!.length, 1);
      assert.equal(
        await reviews.versions.countDocuments({ submission: paper._id }),
        2,
      );

      assert.equal(
        await new Repository(Notification).countDocuments({
          assignmentId: { $exists: true },
        }),
        invitationCount,
      );

      await assert.rejects(
        reviews.action(
          coordinator,
          paper._id,
          "DECIDE",
          { decision: "ACCEPTED", reason: "Ready" },
          "conferences.example.test",
        ),
        /verify outstanding/,
      );
      await t.test(
        "the original reviewer checks only anonymous correction files without changing the report",
        async () => {
          const hostname = "conferences.example.test";

          assert.equal(
            (await reviews.cases.findOne({
              submission: paper._id,
            }))!.currentVersion!.toString(),
            String(correction!.receivedVersion),
          );

          const checkData = {
            requestId: correction!._id,
            checkAssignment: assignments[1]._id,
            deadline: new Date(Date.now() + 86400000).toISOString(),
          };
          await assert.rejects(
            reviews.action(
              coordinator,
              paper._id,
              "REQUEST_REVIEWER_CHECK",
              checkData,
              hostname,
            ),
            /anonymous revision/,
          );

          if (handover) {
            await files.draftAnonymous(
              coordinator,
              paper._id,
              correction!.receivedVersion!,
            );
            const diff = await files.compare(
              coordinator,
              paper._id,
              correction!.receivedVersion,
            );
            assert.ok(
              diff.rows.some(
                (r) => r.changed && r.after?.includes("15 minutes"),
              ),
            );
          } else
            await files.upload({
              user: coordinator,
              submission: paper._id,
              sourceVersion: correction!.receivedVersion,
              kind: "ANONYMOUS",
              filename: "anonymous.docx",
              buffer: defaultReportTemplate(),
              tracked: {
                filename: "blind-tracked.docx",
                buffer: tracked.generate({ type: "nodebuffer" }),
              },
            });

          await reviews.action(
            coordinator,
            paper._id,
            "PREPARE",
            { notes: "Both correction files checked" },
            hostname,
          );
          await assert.rejects(
            reviews.action(
              coordinator,
              paper._id,
              "REQUEST_REVIEWER_CHECK",
              { ...checkData, pointIds: ["foreign-point"] },
              hostname,
            ),
            /unresolved points/,
          );
          await reviews.action(
            coordinator,
            paper._id,
            "REQUEST_REVIEWER_CHECK",
            checkData,
            hostname,
          );
          const check = (await reviews.revisions.findOne({
            parentRequest: correction!._id,
            kind: "CHECK",
          }))!;
          const job = await new Repository(Notification).findOne(
            { routingKey: "mail.review", submissionId: paper._id },
            null,
            { sort: { _id: -1 } },
          );
          const token = JSON.parse(unseal(job!.payload)).url.split("/").pop();
          assert.equal(
            (await reviews.revisionPortal(token)).id,
            String(check._id),
          );
          assert.ok(
            !(await reviews.authorWorkspace(author, paper._id)).revisions.some(
              (r) => r.id === String(check._id),
            ),
          );
          await files.authorizedFile(
            check.trackedFile!,
            undefined,
            undefined,
            token,
          );
          const revision = (await reviews.versions.findOne({
            _id: correction!.receivedVersion,
          }))!;
          await assert.rejects(
            files.authorizedFile(revision.file, undefined, undefined, token),
            /access denied/,
          );
          await assert.rejects(
            reviews.action(
              coordinator,
              paper._id,
              "VERIFY_REVISION",
              { requestId: correction!._id },
              hostname,
            ),
            /reviewer check/,
          );
          await assert.rejects(
            reviews.submitReviewerCheck(token, {}),
            /each requested point/,
          );
          const saved = await forms.answer("REVIEW", assignments[1]._id);
          await reviews.submitReviewerCheck(
            token,
            Object.fromEntries(check.points!.map((p) => [p.id, "VERIFIED"])),
          );
          assert.deepEqual(
            await forms.answer("REVIEW", assignments[1]._id),
            saved,
          );
          assert.equal(
            (await reviews.revisions.findOne({ _id: correction!._id }))!
              .points![0].status,
            "VERIFIED",
          );
          const receipt = new PizZip(await exports.receipt(token2));
          assert.match(
            receipt.file("word/document.xml")!.asText(),
            /Clear and useful/,
          );
        },
      );
      await reviews.action(
        coordinator,
        paper._id,
        "VERIFY_REVISION",
        {
          requestId: correction!._id,
          checks: Object.fromEntries(
            correction!.points!.map((p) => [p.id, "VERIFIED"]),
          ),
        },
        "conferences.example.test",
      );
      for (const assignment of assignments)
        await reviews.action(
          coordinator,
          paper._id,
          "CLOSE_REPORT",
          { assignmentId: assignment._id },
          "conferences.example.test",
        );
      await reviews.action(
        coordinator,
        paper._id,
        "DECIDE",
        { decision: "ACCEPTED", reason: "All conditions met" },
        "conferences.example.test",
      );
      await assert.rejects(reviews.portal(token1), /invalid or expired/);
      const bpf = await reviews.configure(admin, conference._id, {
        useBpfQuestionnaire: true,
      });
      const bpfForm = await forms.getForm(bpf!.form!);
      assert.equal(bpfForm.fields.length, 10);
      assert.equal(
        String(
          (await reviews.rounds.findOne({ _id: review!.currentRound }))!.form,
        ),
        String(form.id),
      );
      const pub = new PublicationService(
        reviews,
        access,
        exports,
        storage,
        activity,
      );
      const final = await files.upload({
        user: coordinator,
        submission: paper._id,
        kind: "FINAL",
        filename: "final.docx",
        buffer: sample("07_Finalny_clanok.docx", defaultReportTemplate()),
      });
      await files.upload({
        user: coordinator,
        submission: paper._id,
        kind: "PROOF_PDF",
        filename: "proof.pdf",
        buffer: sample("08_Autorska_korektura.pdf", Buffer.from("%PDF-1.4")),
      });
      await reviews.action(
        coordinator,
        paper._id,
        "REQUEST_PROOF",
        { deadline: new Date(Date.now() + 86400000).toISOString() },
        "conferences.example.test",
      );
      const proof = (await reviews.revisions.findOne({
        submission: paper._id,
        kind: "PROOF",
      }))!;
      assert.equal(String(proof.manuscriptFile), final.id);
      await assert.rejects(
        reviews.approveAuthorProof(proof._id, coordinator),
        /Author proof access/,
      );
      await assert.rejects(
        reviews.action(
          coordinator,
          paper._id,
          "NO_PROOF_RESPONSE",
          {},
          "conferences.example.test",
        ),
        /delivery/,
      );
      await reviews.approveAuthorProof(proof._id, author);
      const current = (await reviews.cases.findOne({ submission: paper._id }))!;
      const approved = await pub.approve(
        coordinator,
        paper._id,
        current.revision,
      );
      const pkg = new PizZip(await pub.download(coordinator, paper._id));
      assert.ok(pkg.file("00_Vydavatelsky_suhrn.xlsx"));
      assert.equal(pkg.file(/Posudok_.*docx$/).length, 2);
      assert.equal(pkg.file(/Autorska_korektura.pdf$/).length, 1);
      await submissions.findOneAndUpdate(
        { _id: paper._id },
        { $set: { "translations.en.name": "A different title" } },
      );
      await assert.rejects(pub.download(coordinator, paper._id), /superseded/);
      await submissions.findOneAndUpdate(
        { _id: paper._id },
        { $set: { "translations.en.name": paper.translations.en.name } },
      );

      if (handover) {
        assert.deepEqual(
          pkg.file(/01_Finalny_clanok.docx$/)[0].asNodeBuffer(),
          sample("07_Finalny_clanok.docx", Buffer.alloc(0)),
        );
        assert.deepEqual(
          pkg.file(/Autorska_korektura.pdf$/)[0].asNodeBuffer(),
          sample("08_Autorska_korektura.pdf", Buffer.alloc(0)),
        );
        const proceedings = new PizZip(
          await pub.proceedings(coordinator, [paper._id]),
        );
        assert.ok(proceedings.file("word/document.xml"));
      }

      await pub.deliver(coordinator, paper._id, approved.id);
      await files.upload({
        user: coordinator,
        submission: paper._id,
        kind: "FINAL",
        filename: "updated.docx",
        buffer: sample("05_Oprava_cista.docx", defaultReportTemplate()),
      });
      await assert.rejects(
        pub.download(coordinator, paper._id),
        /current closed author proof/,
      );
      await assert.rejects(
        reviews.approveAuthorProof(proof._id, author),
        /superseded/,
      );
      assert.equal(
        (await reviews.cases.findOne({ submission: paper._id }))!.decision,
        "ACCEPTED",
      );

      assert.ok(
        (await new Repository(ReviewModels.ActivityEvent).countDocuments({
          submission: paper._id,
        })) > 10,
      );

      await t.test(
        "author uploads use the manuscript template pinned to the first version",
        async () => {
          const history = new ManuscriptHistoryService(
            files,
            reviews,
            activity,
          );

          const sample = defaultReportTemplate(),
            altered = new PizZip(sample);

          const xml = altered.file("word/document.xml")!.asText();

          altered.file(
            "word/document.xml",
            xml.replace(
              /(<w:pgSz[^>]*w:w=")\d+"/,
              (_match, prefix) => prefix + '9000"',
            ),
          );

          const other = altered.generate({ type: "nodebuffer" });

          const publish = async (bytes: Buffer) => {
            const file = await files.upload({
              user: admin,
              conference: conference._id,
              kind: "MANUSCRIPT_TEMPLATE",
              filename: "instructions.docx",
              buffer: bytes,
            });
            await templates.setTemplate(
              admin,
              conference._id,
              ConferenceTemplateKind.Manuscript,
              new ObjectId(file.id),
            );
            return file.id;
          };

          const template = await publish(sample);
          await assert.rejects(
            files.stageManuscript(
              author,
              conference._id,
              undefined,
              "wrong.docx",
              other,
            ),
            /page size/,
          );
          const first = await files.stageManuscript(
            author,
            conference._id,
            undefined,
            "article.docx",
            sample,
          );
          await assert.rejects(
            files.legacyPermission(coordinator, [first.url], "READ"),
            /protected/,
          );
          await files.legacyPermission(author, [first.url], "READ");
          await history.validateUpload(
            first.url,
            undefined,
            author,
            conference._id,
          );
          const otherPaper = await submissions.create({
            conference: conference._id,
            section: section._id,
            authors: [author.id],
            translations: paper.translations,
            fileUrl: first.url,
          });
          await history.capture(toDTO(otherPaper), author);
          await publish(other);
          assert.equal(
            String(
              (await files.paperTemplate(
                conference._id,
                otherPaper._id,
                author,
              ))!._id,
            ),
            template,
          );
          await assert.rejects(
            files.stageManuscript(
              author,
              conference._id,
              otherPaper._id,
              "wrong.docx",
              other,
            ),
            /page size/,
          );
          const second = await files.stageManuscript(
            author,
            conference._id,
            otherPaper._id,
            "revision.docx",
            sample,
          );
          await history.validateUpload(
            second.url,
            first.url,
            author,
            conference._id,
            otherPaper._id,
          );
          await history.capture(
            { ...toDTO(otherPaper), fileUrl: second.url },
            author,
          );
          const versions = await reviews.versions.findAll(
            { submission: otherPaper._id },
            null,
            { sort: { number: 1 } },
          );

          assert.deepEqual(
            versions.map((v) => String(v.template)),
            [template, template],
          );

          assert.equal(
            String(versions[1].parentVersion),
            String(versions[0]._id),
          );
          await assert.rejects(
            files.legacyPermission(author, [first.url], "DELETE"),
            /cannot be deleted/,
          );
          await templates.setTemplate(
            admin,
            conference._id,
            ConferenceTemplateKind.Manuscript,
            null,
          );
        },
      );
      await t.test(
        "BPF uses the published online form, formal checklist, conditional answer and coordinator-selected feedback",
        async () => {
          const host = "conferences.example.test",
            deadline = new Date(Date.now() + 7 * 86400000).toISOString();

          await reviews.action(
            coordinator,
            paper._id,
            "DECIDE",
            { decision: "PENDING", reason: "Another round" },
            host,
          );
          await reviews.action(coordinator, paper._id, "NEXT_ROUND", {}, host);

          for (const [i, reviewer] of [reviewer1, reviewer2].entries())
            await reviews.action(
              coordinator,
              paper._id,
              "ASSIGN",
              {
                reviewerId: reviewer!._id,
                slot: i + 1,
                deadline,
                reason: "Eligibility checked",
              },
              host,
            );

          await files.upload({
            user: coordinator,
            submission: paper._id,
            kind: "ANONYMOUS",
            filename: "anonymous.docx",
            buffer: defaultReportTemplate(),
          });
          await assert.rejects(
            reviews.action(
              coordinator,
              paper._id,
              "PREPARE",
              { abstractWords: "201" },
              host,
            ),
            /150–200/,
          );
          await reviews.action(
            coordinator,
            paper._id,
            "PREPARE",
            {
              language: "EN",
              pageSize: "B5",
              abstractWords: "160",
              keywordCount: "5",
              contacts: "yes",
              bibliography: "yes",
            },
            host,
          );
          const latest = (await reviews.cases.findOne({
            submission: paper._id,
          }))!;
          const assignments = await reviews.assignments.findAll(
            { round: latest.currentRound },
            null,
            { sort: { slot: 1 } },
          );
          const answers = Object.fromEntries(
            bpfForm.fields
              .filter((f) => f.required)
              .map((f) => [String(f.id), f.selectOptions?.[0].value || ""]),
          );
          answers[bpf!.recommendationField!] = "CONDITIONAL";

          for (const a of assignments) {
            const link = await reviews.action(
              coordinator,
              paper._id,
              "PREPARE_LINK",
              { assignmentId: a._id },
              host,
            );
            const token = link.url!.split("/").pop()!;
            await reviews.saveReport(token, answers, undefined, false, host);
            await assert.rejects(
              reviews.saveReport(token, answers, 1, true, host),
              /Describe the changes/,
            );
            await reviews.saveReport(
              token,
              {
                ...answers,
                [bpf!.recommendationField!]:
                  a.slot === 1 ? "CONDITIONAL" : "REJECT",
                [String(bpfForm.fields[bpfForm.fields.length - 1].id)]:
                  "Clarify the observation unit.",
              },
              1,
              true,
              host,
            );
          }

          const newReport = new PizZip(
            await exports.report(coordinator, paper._id, assignments[0]._id),
          );
          assert.match(
            newReport.file("word/document.xml")!.asText(),
            /REVIEW REPORT/,
          );
          assert.doesNotMatch(
            newReport.file("word/document.xml")!.asText(),
            /ORIGINAL OFFICIAL REPORT/,
          );

          assert.equal(
            await reviews.releases.countDocuments({
              round: latest.currentRound,
            }),
            0,
          );

          await assert.rejects(
            reviews.action(
              coordinator,
              paper._id,
              "CLOSE_REPORT",
              { assignmentId: assignments[0]._id },
              host,
            ),
            /conditions/,
          );
          const act = (action: string, data: Record<string, unknown>) =>
            reviews.action(coordinator, paper._id, action, data, host);

          const correct = async (
            request: NonNullable<
              Awaited<ReturnType<typeof reviews.revisions.findOne>>
            >,
          ) => {
            const clean = sample(
              "05_Oprava_cista.docx",
              defaultReportTemplate(),
            );
            const tracked = new PizZip(clean);
            tracked.file("word/settings.xml", "<settings/>");
            const upload = {
              user: author,
              submission: paper._id,
              requestId: request._id,
              kind: "REVISION",
              filename: "clean.docx",
              buffer: clean,
              tracked: {
                filename: "tracked.docx",
                buffer: sample(
                  "06_Oprava_sledovane_zmeny.docx",
                  tracked.generate({ type: "nodebuffer" }),
                ),
              },
            };

            const responses = Object.fromEntries(
              request.points!.map((p) => [
                p.id,
                {
                  authorStatus: "addressed",
                  response: "Clarified",
                  location: "Methods",
                },
              ]),
            );

            await assert.rejects(
              files.upload({
                ...upload,
                responses: {
                  [request.points![0].id]: {
                    authorStatus: "addressed",
                    response: "Clarified",
                  },
                },
              }),
              /each correction|every correction/,
            );
            const receipt = await files.upload({ ...upload, responses });
            assert.deepEqual(
              await files.upload({ ...upload, responses }),
              receipt,
            );
            await assert.rejects(
              files.upload({ ...upload, responses, note: "A changed receipt" }),
              /different correction/,
            );
          };

          await act("REQUEST_REVISION", {
            deadline,
            reportPoints: {
              [String(assignments[0]._id)]:
                "Define the observation unit.\n\nExplain the counting rule.",
            },
          });
          const request = (await reviews.revisions.findOne({
            submission: paper._id,
            round: latest.currentRound,
            status: "REQUESTED",
          }))!;
          await correct(request);
          const [first, second] = request.points!;
          await act("VERIFY_REVISION", {
            requestId: request._id,
            checks: { [first.id]: "VERIFIED", [second.id]: "NEEDS_CHANGES" },
          });
          await assert.rejects(
            act("REQUEST_REVISION", {
              deadline,
              instructions: "Unrelated request",
            }),
            /follow-up/,
          );
          await act("REQUEST_REVISION", {
            deadline,
            parentRequest: String(request._id),
          });
          const followup = (await reviews.revisions.findOne({
            parentRequest: request._id,
            kind: "POST_REVIEW",
          }))!;

          assert.deepEqual(
            followup.points!.map((p) => p.id),
            [second.id],
          );

          await correct(followup);
          await act("VERIFY_REVISION", {
            requestId: followup._id,
            checks: { [second.id]: "VERIFIED" },
            language: "EN",
            pageSize: "B5",
            abstractWords: 160,
            keywordCount: 5,
            contacts: "yes",
            bibliography: "yes",
          });
          for (const a of assignments)
            await act("CLOSE_REPORT", { assignmentId: a._id });
          await act("SET_PARTICIPATION", { participation: "yes" });
          await assert.rejects(
            act("DECIDE", {
              decision: "ACCEPTED",
              reason: "Verify negative recommendation gate",
            }),
            /negative recommendations/,
          );
          await act("DECIDE", {
            decision: "REJECTED",
            reason: "Negative report upheld",
          });
        },
      );
    } finally {
      await mongoose.disconnect();
    }
  },
);
