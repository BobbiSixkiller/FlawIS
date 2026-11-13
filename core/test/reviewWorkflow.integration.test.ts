import "reflect-metadata";
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
  { skip: !uri, timeout: 90000 },
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
            assert.match(((await protectedFile.json()) as { error: string }).error, /Authentication/);
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
          reportTemplateId = new ObjectId(
            (
              await upload("TEMPLATE", admin, {
                buffer: original.generate({ type: "nodebuffer" }),
              })
            ).id,
          );
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
            /purpose/,
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
          await templates.setTemplate(
            admin,
            conference._id,
            ConferenceTemplateKind.Review,
            reportTemplateId,
          );
          assert.equal(
            (await reviews.settings.findOne({ conference: conference._id }))
              ?.enabled,
            false,
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
      await files.upload({
        user: author,
        submission: paper._id,
        kind: "ORIGINAL",
        filename: "original.docx",
        buffer: defaultReportTemplate(),
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
                deadline: "2026-12-20",
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
                  deadline: "2026-12-20",
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
            deadline: "2026-12-20",
            reason: "Department and section eligibility checked",
          },
          "conferences.example.test",
        );
      const review = await reviews.cases.findOne({ submission: paper._id });
      await t.test(
        "replacing and removing report templates preserves the round's pinned report",
        async () => {
          const round = await reviews.rounds.findOne({
            _id: review!.currentRound,
          });
          assert.equal(String(round!.templateFile), String(reportTemplateId));
          const next = await files.upload({
            user: admin,
            conference: conference._id,
            kind: "TEMPLATE",
            filename: "next.docx",
            buffer: defaultReportTemplate(),
          });
          await templates.setTemplate(
            admin,
            conference._id,
            ConferenceTemplateKind.Review,
            new ObjectId(next.id),
          );
          assert.equal(
            String(
              (await reviews.settings.findOne({ conference: conference._id }))!
                .templateFile,
            ),
            next.id,
          );
          assert.equal(
            String(
              (await reviews.rounds.findOne({ _id: round!._id }))!.templateFile,
            ),
            String(reportTemplateId),
          );
          await templates.setTemplate(
            admin,
            conference._id,
            ConferenceTemplateKind.Review,
            null,
          );
          assert.equal(
            (await reviews.settings.findOne({ conference: conference._id }))!
              .templateFile,
            undefined,
          );
          assert.equal(
            String(
              (await reviews.rounds.findOne({ _id: round!._id }))!.templateFile,
            ),
            String(reportTemplateId),
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
        buffer: defaultReportTemplate(),
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
      assert.equal(packageZip.file(/\.docx$/).length, 2);
      assert.match(
        new PizZip(packageZip.file("review-form.docx")!.asNodeBuffer())
          .file("word/document.xml")!
          .asText(),
        /ORIGINAL OFFICIAL REPORT/,
      );
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
          instructions: "Please clarify the conclusion.",
          deadline: "2026-12-28",
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
      await files.upload({
        revisionToken,
        kind: "REVISION",
        filename: "corrected.docx",
        buffer: defaultReportTemplate(),
        note: "Conclusion clarified.",
      });
      const correction = await reviews.revisions.findOne({
        submission: paper._id,
      });
      assert.equal(correction!.status, "RECEIVED");
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
      await reviews.action(
        coordinator,
        paper._id,
        "VERIFY_REVISION",
        { requestId: correction!._id },
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
      assert.equal(
        (await reviews.cases.findOne({ submission: paper._id }))!.decision,
        "ACCEPTED",
      );
      assert.ok(
        (await new Repository(ReviewModels.ActivityEvent).countDocuments({
          submission: paper._id,
        })) > 10,
      );
    } finally {
      await mongoose.disconnect();
    }
  },
);
