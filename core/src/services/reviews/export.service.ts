import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import { ObjectId } from "mongodb";
import { Service } from "typedi";
import { CtxUser } from "../../util/types";
import { FieldType } from "../../entitites/Form";
import { FormService } from "../form.service";
import { ReviewService } from "./review.service";
import { ReviewAccessService } from "./access.service";
import { ReviewFileService } from "./file.service";
import { ActivityService } from "./activity.service";

export function defaultReportTemplate() {
  const zip = new PizZip();
  zip.file(
    "[Content_Types].xml",
    '<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>',
  );
  zip.file(
    "_rels/.rels",
    '<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>',
  );
  zip.file(
    "word/document.xml",
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>' +
      [
        "REVIEW REPORT / RECENZNÝ POSUDOK",
        "Paper / Príspevok: {paper}",
        "Reviewer / Recenzent: {reviewer}",
        "Overall recommendation / Celkové odporúčanie: {recommendation}",
        "{answers}",
        "Date / Dátum: {date}",
      ]
        .map(
          (t) => `<w:p><w:r><w:t xml:space="preserve">${t}</w:t></w:r></w:p>`,
        )
        .join("") +
      '<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1134" w:right="1134" w:bottom="1134" w:left="1134"/></w:sectPr></w:body></w:document>',
  );
  return zip.generate({ type: "nodebuffer" });
}

export function renderReport(
  template: Buffer,
  values: Record<string, unknown>,
) {
  const document = new Docxtemplater(new PizZip(template), {
    paragraphLoop: true,
    linebreaks: true,
    nullGetter: () => "",
  });
  document.render(values);
  return document
    .getZip()
    .generate({ type: "nodebuffer", compression: "DEFLATE" });
}

@Service()
export class ReviewExportService {
  constructor(
    private readonly reviews: ReviewService,
    private readonly access: ReviewAccessService,
    private readonly files: ReviewFileService,
    private readonly forms: FormService,
    private readonly activity: ActivityService,
  ) {}
  async exportMany(user: CtxUser, submissions: ObjectId[]) {
    if (!submissions.length || submissions.length > 50)
      throw new Error("Select between 1 and 50 papers.");
    const result = new PizZip();
    for (const submission of submissions) {
      const zip = new PizZip(await this.export(user, submission));
      for (const [name, entry] of Object.entries(zip.files))
        if (!entry.dir)
          result.file(`${submission}/${name}`, entry.asNodeBuffer());
    }
    return result.generate({ type: "nodebuffer", compression: "DEFLATE" });
  }
  async report(user: CtxUser, submission: ObjectId, assignmentId: ObjectId) {
    const assignment = await this.reviews.assignments.findOne({
      _id: assignmentId,
      status: "SUBMITTED",
    });
    if (!assignment) throw new Error("Submitted report not found.");
    const zip = new PizZip(
      await this.export(user, submission, assignment.round),
    );
    const file = Object.keys(zip.files).find((name) =>
      name.endsWith(`-${assignmentId}.docx`),
    );
    if (!file) throw new Error("Report not found for this paper.");
    return zip.files[file].asNodeBuffer();
  }
  async export(
    user: CtxUser,
    submission: ObjectId,
    roundId?: ObjectId,
    packageId?: ObjectId,
  ) {
    const paper = await this.access.paper(user, submission);
    const review = await this.reviews.cases.findOne({ submission });
    const round = review
      ? await this.reviews.rounds.findOne({
          _id: roundId || review.currentRound,
          review: review._id,
        })
      : null;
    if (!round) throw new Error("Review round not found.");
    const form = await this.forms.getForm(round.form);
    let template = defaultReportTemplate();
    if (round.templateFile) {
      // Paper access above permits section coordinators to generate reports with the pinned
      // template, without granting them access to download/manage conference templates.
      const asset = await this.reviews.files.findOne({
        _id: round.templateFile,
        conference: paper.conference,
        kind: "TEMPLATE",
        submission: { $exists: false },
      });
      if (!asset) throw new Error("Review template not found.");
      template = await this.files.bytes(asset);
    }
    const zip = new PizZip();
    if (packageId) {
      const assignment = await this.reviews.assignments.findOne({
        _id: packageId,
        round: round._id,
        active: true,
      });
      const version = review?.currentVersion
        ? await this.reviews.versions.findOne({ _id: review.currentVersion })
        : null;
      const anonymousFile =
        round.anonymousFile ||
        (review?.formalApproved && version?.anonymousApproved
          ? version.anonymousFile
          : undefined);
      if (!assignment || !anonymousFile)
        throw new Error(
          "Approve the manuscript and anonymity before preparing a package.",
        );
      const manuscript = await this.files.authorizedFile(anonymousFile, user);
      zip.file(
        `paper-${submission}.${manuscript.filename.endsWith(".pdf") ? "pdf" : "docx"}`,
        await this.files.bytes(manuscript),
      );
      zip.file(
        "review-form.docx",
        renderReport(template, {
          paper: `Paper ${submission}`,
          reviewer: "",
          recommendation: "",
          answers: form.fields.map((f) => f.label).join("\n\n"),
          date: "",
        }),
      );
    } else {
      const assignments = await this.reviews.assignments.findAll(
        { round: round._id, status: "SUBMITTED" },
        null,
        { sort: { slot: 1 } },
      );
      for (const assignment of assignments) {
        const answer = await this.forms.answer("REVIEW", assignment._id);
        if (!answer?.submitted) continue;
        const answers =
          answer.answers instanceof Map
            ? Object.fromEntries(answer.answers)
            : answer.answers;
        const values: Record<string, unknown> = {
          paper: paper.translations.en.name,
          reviewer: assignment.name,
          recommendation: assignment.recommendation,
          date: assignment.submittedAt?.toLocaleDateString("sk-SK", {
            timeZone: "Europe/Bratislava",
          }),
          answers: form.fields
            .map(
              (f) =>
                `${f.label}\n${f.type === FieldType.FileUpload ? "See attachments in the report ZIP" : answers[String(f.id)] || ""}`,
            )
            .join("\n\n"),
          publish: assignment.recommendation === "PUBLISH" ? "☒" : "☐",
          conditional: assignment.recommendation === "CONDITIONAL" ? "☒" : "☐",
          reject: assignment.recommendation === "REJECT" ? "☒" : "☐",
        };
        for (const field of form.fields)
          values[`answer_${field.id}`] =
            field.type === FieldType.FileUpload
              ? "See attachments in the report ZIP"
              : answers[String(field.id)] || "";
        zip.file(
          `paper-${submission}-round-${round.number}-review-${assignment.slot}-${assignment._id}.docx`,
          renderReport(template, values),
        );
        for (const attachment of await this.reviews.files.findAll({
          assignment: assignment._id,
          kind: "REPORT",
        })) {
          const asset = await this.files.authorizedFile(attachment._id, user);
          zip.file(
            `attachments/${assignment._id}-${attachment._id}-${asset.filename}`,
            await this.files.bytes(asset),
          );
        }
      }
    }
    await this.activity.read(
      user,
      "review.exported",
      paper.conference as ObjectId,
      submission,
    );
    return zip.generate({ type: "nodebuffer", compression: "DEFLATE" });
  }
}
