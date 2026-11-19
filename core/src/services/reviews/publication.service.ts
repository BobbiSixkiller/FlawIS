import { createHash, randomUUID } from "node:crypto";
import { ObjectId } from "mongodb";
import PizZip from "pizzip";
import { Service } from "typedi";
import { CtxUser } from "../../util/types";
import { withOptionalTransaction } from "../../util/helpers";
import { ReviewService } from "./review.service";
import { ReviewAccessService } from "./access.service";
import { ReviewExportService } from "./export.service";
import { MinioService } from "../minio.service";
import { ActivityService } from "./activity.service";
import { safePart, summaryWorkbook } from "./documents/publication-workbook";
import {
  DocxProceedings,
  MAX_PROCEEDINGS_SOURCE_BYTES,
} from "./documents/docx-proceedings";
import { ReviewFile } from "../../entitites/Review";

const digest = (bytes: Buffer | string) =>
  createHash("sha256").update(bytes).digest("hex");

@Service()
export class PublicationService {
  constructor(
    private readonly reviews: ReviewService,
    private readonly access: ReviewAccessService,
    private readonly reports: ReviewExportService,
    private readonly storage: MinioService,
    private readonly activity: ActivityService,
  ) {}

  private async context(user: CtxUser, submission: ObjectId) {
    const paper = await this.access.paper(user, submission);
    const review = await this.reviews.cases.findOne({
      submission,
      decision: "ACCEPTED",
    });
    if (!review?.proof || !review.currentVersion || !review.currentRound)
      throw new Error(
        "An accepted manuscript and current closed author proof are required.",
      );

    const proof = await this.reviews.revisions.findOne({
      _id: review.proof,
      kind: "PROOF",
      submission,
      sourceVersion: review.currentVersion,
      status: { $in: ["APPROVED", "NO_RESPONSE"] },
    });
    if (!proof?.manuscriptFile)
      throw new Error("Complete author proof for this version first.");
    await this.reviews.checkProof(proof);

    const version = await this.reviews.versions.findOne({
      _id: review.currentVersion,
      file: proof.manuscriptFile,
      submission,
    });
    const round = await this.reviews.rounds.findOne({
      _id: review.currentRound,
      review: review._id,
    });
    const reports = await this.reviews.assignments.findAll(
      { round: review.currentRound, active: true, status: "SUBMITTED" },
      null,
      { sort: { slot: 1 } },
    );
    if (
      !version ||
      !round ||
      reports.length !== round.requiredReviews ||
      reports.some((a) => !a.closedVersion || a.recommendation === "REJECT")
    )
      throw new Error("Close every required report before publication.");

    const signature = digest(
      JSON.stringify([
        paper.translations,
        paper.authors,
        review.currentRound,
        version._id,
        version.file,
        proof._id,
        proof.attribution,
        proof.status,
        proof.proofPdf,
        reports.map((r) => [
          r._id,
          r.name,
          r.recommendation,
          r.submittedAt,
          r.closedVersion,
        ]),
      ]),
    );

    return { paper, review, version, proof, reports, signature };
  }

  private async bytes(file: ReviewFile) {
    const bytes = await this.storage.buffer(file.bucket, file.objectName);
    if (bytes.length !== file.size || digest(bytes) !== file.checksum)
      throw new Error(
        "The stored publication file failed its integrity check.",
      );

    return bytes;
  }

  /** Freeze the approved files in storage. Repeat downloads return the same archive bytes. */
  async approve(user: CtxUser, submission: ObjectId, expected: number) {
    const c = await this.context(user, submission);
    if (c.review.revision !== expected)
      throw new Error("The manuscript changed. Reload before approving.");

    const manuscript = await this.reviews.files.findOne({
      _id: c.version.file,
      submission,
    });
    if (!manuscript || !manuscript.filename.endsWith(".docx"))
      throw new Error("A final Word manuscript is required.");

    const archive = new PizZip();
    const authors = (await this.reviews.detail(user, submission)).authors
      .map((a) => a.name)
      .join(", ");
    const directory = String(submission) + "_" + safePart(authors) + "/";

    const headers = [
      "ID článku",
      "Autor alebo autori",
      "Názov článku",
      "Priečinok v balíku",
      "Zdroj finálneho článku",
      "Verzia článku",
    ];
    const row: (string | number)[] = [
      String(submission),
      authors,
      c.paper.translations.en.name,
      directory,
      manuscript.filename,
      c.version.number,
    ];

    let total = 0;

    const add = (name: string, buffer: Buffer) => {
      total += buffer.length;
      if (total > 24 * 1024 * 1024)
        throw new Error("Publication package exceeds 24 MiB.");
      archive.file(directory + name, buffer);
    };

    add("01_Finalny_clanok.docx", await this.bytes(manuscript));
    const bundle = new PizZip(
      await this.reports.export(user, submission, c.review.currentRound),
    );

    for (const a of c.reports) {
      const report = Object.values(bundle.files).find(
        (f) => !f.dir && f.name.endsWith("-" + a._id + ".docx"),
      );
      if (!report) throw new Error("A completed report is missing.");
      add(
        String(a.slot + 1).padStart(2, "0") + "_Posudok_" + a.slot + ".docx",
        report.asNodeBuffer(),
      );
      headers.push(
        "Recenzent " + a.slot,
        "Výsledok posudku " + a.slot,
        "Kontrola opráv " + a.slot,
        "Dátum kontroly " + a.slot,
        "Zdroj posudku " + a.slot,
      );

      row.push(
        a.name,
        a.recommendation || "",
        a.recommendation === "CONDITIONAL" ? "Overené" : "Uzavreté",
        a.closedAt?.toLocaleDateString("sk-SK", {
          timeZone: "Europe/Bratislava",
        }) || "",
        report.name,
      );
    }

    if (c.proof.proofPdf) {
      const pdf = await this.reviews.files.findOne({
        _id: c.proof.proofPdf,
        kind: "PROOF_PDF",
        submission,
      });
      if (!pdf) throw new Error("Proof PDF is missing.");
      add(
        String(c.reports.length + 2).padStart(2, "0") +
          "_Autorska_korektura.pdf",
        await this.bytes(pdf),
      );
    }

    headers.push(
      "Konečné zaradenie",
      "Pripravenosť potvrdil",
      "Pripravené (Bratislava)",
      "Odovzdané redakcii",
      "Autorská korektúra",
    );
    row.push(
      c.review.decision,
      user.name,
      new Date().toLocaleString("sk-SK", { timeZone: "Europe/Bratislava" }),
      "",
      c.proof.status,
    );
    archive.file("00_Vydavatelsky_suhrn.xlsx", summaryWorkbook(headers, [row]));

    const bytes = archive.generate({
      type: "nodebuffer",
      compression: "DEFLATE",
    });

    const bucket = "conference-reviews",
      objectName = String(submission) + "/" + randomUUID() + ".zip";
    await this.storage.upload(bucket, objectName, bytes, "application/zip");

    try {
      return await withOptionalTransaction(undefined, async (session) => {
        const fresh = await this.context(user, submission);
        if (fresh.signature !== c.signature)
          throw new Error("Publication documents changed.");

        const file = await this.reviews.files.create(
          {
            conference: c.review.conference,
            submission,
            kind: "PUBLICATION",
            bucket,
            objectName,
            filename: "publication.zip",
            contentType: "application/zip",
            size: bytes.length,
            checksum: digest(bytes),
            actor: String(user.id),
            signature: c.signature,
          },
          { session },
        );

        if (
          !(await this.reviews.cases.findOneAndUpdate(
            { _id: c.review._id, revision: expected },
            {
              $set: { publication: file._id },
              $unset: { deliveredAt: 1 },
              $inc: { revision: 1 },
            },
            { session },
          ))
        )
          throw new Error("The publication approval is stale.");

        await this.activity.record(
          user,
          "publication.approved",
          c.review.conference,
          submission,
          { archive: String(file._id), version: String(c.version._id) },
          session,
        );
        return { id: String(file._id) };
      });
    } catch (error) {
      await this.storage.deleteFiles([
        "http://minio:9000/" + bucket + "/" + objectName,
      ]);
      throw error;
    }
  }

  private async approved(user: CtxUser, submission: ObjectId) {
    const c = await this.context(user, submission);
    if (!c.review.publication)
      throw new Error("Approve the publication package first.");

    const file = await this.reviews.files.findOne({
      _id: c.review.publication,
      kind: "PUBLICATION",
      submission,
      signature: c.signature,
    });
    if (!file)
      throw new Error("The publication package must be approved again.");

    return { c, file };
  }

  async download(user: CtxUser, submission: ObjectId) {
    const { file } = await this.approved(user, submission);
    const bytes = await this.bytes(file);
    if (!(await this.approved(user, submission)).file._id.equals(file._id))
      throw new Error("Publication documents changed.");

    return bytes;
  }

  async deliver(user: CtxUser, submission: ObjectId, archive: string) {
    const snapshot = await this.approved(user, submission);
    if (String(snapshot.file._id) !== archive)
      throw new Error("The approved package has changed.");
    if (!snapshot.c.review.deliveredAt) await this.bytes(snapshot.file);

    return withOptionalTransaction(undefined, async (session) => {
      const { c, file } = await this.approved(user, submission);
      if (String(file._id) !== archive)
        throw new Error("The approved package has changed.");

      if (!c.review.deliveredAt) {
        await this.reviews.cases.findOneAndUpdate(
          { _id: c.review._id, publication: file._id },
          { $set: { deliveredAt: new Date() }, $inc: { revision: 1 } },
          { session },
        );
        await this.activity.record(
          user,
          "publication.delivered",
          c.review.conference,
          submission,
          { archive },
          session,
        );
      }

      return { id: archive };
    });
  }

  async proceedings(user: CtxUser, submissions: ObjectId[]) {
    if (
      !submissions.length ||
      submissions.length > 50 ||
      new Set(submissions.map(String)).size !== submissions.length
    )
      throw new Error(
        "Choose between 1 and 50 different manuscripts in reading order.",
      );

    const doc = new DocxProceedings();
    const snapshots = [];
    let size = 0;

    for (const submission of submissions) {
      const { c, file } = await this.approved(user, submission);
      const asset = await this.reviews.files.findOne({
        _id: c.version.file,
        submission,
      });
      if (!asset || (size += asset.size) > MAX_PROCEEDINGS_SOURCE_BYTES)
        throw new Error("Selected manuscripts exceed the proceedings limit.");
      doc.add(await this.bytes(asset), String(submission));

      snapshots.push({
        submission,
        id: file._id,
        conference: String(c.review.conference),
      });
    }

    if (new Set(snapshots.map((s) => s.conference)).size !== 1)
      throw new Error("Choose manuscripts from one conference.");

    const bytes = Buffer.from(doc.finish());
    for (const s of snapshots)
      if (!(await this.approved(user, s.submission)).file._id.equals(s.id))
        throw new Error("Publication documents changed.");

    return bytes;
  }
}
