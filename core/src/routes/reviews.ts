import Express, { Request, Response } from "express";
import Container from "typedi";
import { ObjectId } from "mongodb";
import { createContext, verifyJwt } from "../util/auth";
import { ConferenceTemplateService } from "../services/conferences/conference-template.service";
import { ReviewFileService } from "../services/reviews/file.service";
import { ReviewExportService } from "../services/reviews/export.service";
import { RmqService } from "../services/rmq.service";
import { internalSecretValid, unseal } from "../util/secrets";
import { StoredObject } from "../entitites/StoredObject";
import { Notification } from "../entitites/Notification";
import { Repository } from "../repositories/base.repository";
import { ReviewService } from "../services/reviews/review.service";

const asId = (value: unknown) =>
  typeof value === "string" && ObjectId.isValid(value)
    ? new ObjectId(value)
    : undefined;
const route =
  (handler: (req: Request, res: Response) => Promise<unknown>) =>
  async (req: Request, res: Response) => {
    try {
      await handler(req, res);
    } catch (error) {
      res.status(400).json({
        error: error instanceof Error ? error.message : "Request failed.",
      });
    }
  };
export function registerReviewRoutes(app: Express.Express) {
  const context = (req: Request, res: Response) =>
    createContext({ req, res } as any);
  app.post(
    "/review-files",
    Express.raw({ type: "application/octet-stream", limit: "20mb" }),
    route(async (req, res) => {
      const { user } = context(req, res);
      const result = await Container.get(ReviewFileService).upload({
        user: user || undefined,
        reviewerToken: req.header("x-review-token"),
        revisionToken: req.header("x-revision-token"),
        assignment: asId(req.query.assignment),
        submission: asId(req.query.submission),
        conference: asId(req.query.conference),
        kind: String(req.query.kind),
        filename: decodeURIComponent(
          req.header("x-file-name") || "manuscript.docx",
        ),
        buffer: req.body,
        note: String(req.query.note || ""),
      });
      res.json(result);
    }),
  );
  app.get(
    "/conference-templates/:conference/manuscript",
    route(async (req, res) => {
      const conference = asId(req.params.conference);
      if (!conference) throw new Error("Invalid conference ID.");
      const file = await Container.get(
        ConferenceTemplateService,
      ).manuscriptTemplate(conference);
      res
        .set({
          "Content-Type": file.contentType,
          "Content-Disposition":
            'attachment; filename="manuscript-template.docx"',
          "Cache-Control": "private, no-store",
          "X-Content-Type-Options": "nosniff",
        })
        .send(await Container.get(ReviewFileService).bytes(file));
    }),
  );
  app.get(
    "/review-files/:id",
    route(async (req, res) => {
      const id = asId(req.params.id);
      if (!id) throw new Error("Invalid file ID.");
      const { user } = context(req, res);
      const service = Container.get(ReviewFileService);
      const file = await service.authorizedFile(
        id,
        user || undefined,
        req.header("x-review-token"),
      );
      res
        .set({
          "Content-Type": file.contentType,
          "Content-Disposition": `attachment; filename="${file.filename}"`,
          "Cache-Control": "private, no-store",
          "X-Content-Type-Options": "nosniff",
        })
        .send(await service.bytes(file));
    }),
  );
  app.post(
    "/review-files/adopt/:id",
    route(async (req, res) => {
      const { user } = context(req, res);
      const id = asId(req.params.id);
      if (!user || !id) throw new Error("Authentication required.");
      res.json(await Container.get(ReviewFileService).adoptOriginal(id, user));
    }),
  );
  app.post(
    "/review-files/register-legacy",
    Express.json(),
    route(async (req, res) => {
      if (!internalSecretValid(req.header("x-notification-secret"))) {
        res.sendStatus(401);
        return;
      }
      const { user } = context(req, res);
      if (!user || !/^http:\/\/minio:9000\/[a-z0-9.-]+\/.+/.test(req.body.url))
        throw new Error("Invalid upload registration.");
      await new Repository(StoredObject).create({
        url: req.body.url,
        owner: user.id,
      });
      res.json({ registered: true });
    }),
  );
  app.post(
    "/review-files/authorize-legacy",
    Express.json(),
    route(async (req, res) => {
      const { user } = context(req, res);
      if (!user || !Array.isArray(req.body.urls) || req.body.urls.length > 100)
        throw new Error("Authentication and file URLs required.");
      await Container.get(ReviewFileService).legacyPermission(
        user,
        req.body.urls,
        req.body.operation,
      );
      res.json({ authorized: true });
    }),
  );
  app.get(
    "/review-exports/:submission",
    route(async (req, res) => {
      const { user } = context(req, res),
        submission = asId(req.params.submission);
      if (user && req.params.submission === "bulk") {
        const ids = String(req.query.submissions || "")
          .split(",")
          .map(asId);
        if (ids.some((id) => !id))
          throw new Error("Invalid submission selection.");
        const buffer = await Container.get(ReviewExportService).exportMany(
          user,
          ids as ObjectId[],
        );
        res
          .set({
            "Content-Type": "application/zip",
            "Content-Disposition":
              'attachment; filename="conference-reviews.zip"',
            "Cache-Control": "private, no-store",
          })
          .send(buffer);
        return;
      }
      if (!user || !submission) throw new Error("Authentication required.");
      if (asId(req.query.report)) {
        const buffer = await Container.get(ReviewExportService).report(
          user,
          submission,
          asId(req.query.report)!,
        );
        res
          .set({
            "Content-Type":
              "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "Content-Disposition": 'attachment; filename="review-report.docx"',
            "Cache-Control": "private, no-store",
          })
          .send(buffer);
        return;
      }
      const buffer = await Container.get(ReviewExportService).export(
        user,
        submission,
        asId(req.query.round),
        asId(req.query.package),
      );
      res
        .set({
          "Content-Type": "application/zip",
          "Content-Disposition": `attachment; filename="reviews-${submission}.zip"`,
          "Cache-Control": "private, no-store",
        })
        .send(buffer);
    }),
  );
  app.post(
    "/internal/notifications/:id/claim",
    Express.json(),
    route(async (req, res) => {
      if (!internalSecretValid(req.header("x-notification-secret"))) {
        res.sendStatus(401);
        return;
      }
      const id = asId(req.params.id);
      if (!id) throw new Error("Invalid notification.");
      const jobs = new Repository(Notification),
        job = await jobs.findOne({ _id: id });
      const payload = job ? JSON.parse(unseal(job.payload)) : null;
      const tokenClaims = payload?.token
        ? verifyJwt<{ purpose?: string }>(payload.token)
        : null;
      const expectedPurpose =
        job?.routingKey === "mail.reset"
          ? "password-reset"
          : job?.routingKey === "mail.registration"
            ? "activation"
            : undefined;
      if (
        payload?.token &&
        [
          "mail.registration",
          "mail.reset",
          "mail.conference.coAuthor",
        ].includes(job!.routingKey) &&
        (!tokenClaims ||
          (expectedPurpose && tokenClaims.purpose !== expectedPurpose))
      ) {
        await jobs.findOneAndUpdate(
          { _id: id, state: { $in: ["PENDING", "QUEUED"] } },
          {
            $set: {
              state: "CANCELLED",
              lastError: "Link expired before delivery.",
            },
          },
        );
        res.json({ claimed: false });
        return;
      }
      if (payload?.url?.includes("/revise/")) {
        try {
          const request = await Container.get(ReviewService).revisionToken(
            payload.url.split("/").pop(),
          );
          if (request.status !== "REQUESTED") throw new Error("Closed");
        } catch {
          await jobs.findOneAndUpdate(
            { _id: id },
            { $set: { state: "CANCELLED" } },
          );
          res.json({ claimed: false });
          return;
        }
      }
      if (job?.assignmentId) {
        const assignment = await Container.get(
          ReviewService,
        ).assignments.findOne({
          _id: job.assignmentId,
          active: true,
          status: { $in: ["INVITED", "STARTED"] },
          expiresAt: { $gt: new Date() },
        });
        const owner = assignment
          ? await Container.get(ReviewService).cases.findOne({
              _id: assignment.review,
            })
          : null;
        if (
          !assignment ||
          !owner ||
          owner.decision !== "PENDING" ||
          owner.authorEmails.includes(assignment.email.toLowerCase())
        ) {
          await jobs.findOneAndUpdate(
            { _id: id },
            { $set: { state: "CANCELLED" } },
          );
          res.json({ claimed: false });
          return;
        }
      }
      res.json({
        claimed: await Container.get(RmqService).claim(
          id,
          Number(req.body.attempt),
        ),
      });
    }),
  );
  app.get(
    "/internal/notifications/:id/files/:file",
    route(async (req, res) => {
      if (!internalSecretValid(req.header("x-notification-secret"))) {
        res.sendStatus(401);
        return;
      }
      const id = asId(req.params.id),
        fileId = asId(req.params.file);
      if (!id || !fileId) throw new Error("Invalid attachment.");
      const job = await new Repository(Notification).findOne({
        _id: id,
        state: { $in: ["QUEUED", "SENDING"] },
      });
      if (
        !job ||
        !JSON.parse(unseal(job.payload)).fileIds?.includes(String(fileId))
      )
        throw new Error("Attachment not part of notification.");
      const service = Container.get(ReviewFileService),
        file = await Container.get(ReviewService).files.findOne({
          _id: fileId,
          kind: "ANONYMOUS",
        });
      if (!file) throw new Error("Attachment not found.");
      res
        .set({
          "Content-Type": file.contentType,
          "Content-Disposition": `attachment; filename="${file.filename}"`,
        })
        .send(await service.bytes(file));
    }),
  );
}
