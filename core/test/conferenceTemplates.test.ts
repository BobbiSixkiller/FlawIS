import "reflect-metadata";
import assert from "node:assert/strict";
import test from "node:test";
import PizZip from "pizzip";
import {
  validateReviewFile,
  ReviewFileService,
} from "../src/services/reviews/file.service";
import {
  defaultReportTemplate,
  renderReport,
} from "../src/services/reviews/export.service";
import { ObjectId } from "mongodb";

test("conference templates accept only nonempty DOCX without embedded macros/programs", () => {
  assert.match(
    validateReviewFile(defaultReportTemplate(), "template.docx", true),
    /wordprocessingml/,
  );
  for (const [bytes, filename] of [
    [Buffer.from("%PDF-"), "x.pdf"],
    [Buffer.alloc(0), "x.docx"],
    [Buffer.alloc(20 * 1024 * 1024 + 1), "x.docx"],
    [Buffer.from("not a zip"), "x.docx"],
  ] as const)
    assert.throws(() => validateReviewFile(bytes, filename, true));
  const zip = new PizZip(defaultReportTemplate());
  zip.file("word/vbaProject.bin", "macro");
  assert.throws(
    () =>
      validateReviewFile(zip.generate({ type: "nodebuffer" }), "x.docx", true),
    /Macro/,
  );
});

test("template upload rejects submission scope and private links before writing storage", async () => {
  const service = new ReviewFileService(
    { upload: () => assert.fail("Unexpected storage write") } as any,
    {} as any,
    {} as any,
    {} as any,
  );
  for (const kind of ["MANUSCRIPT_TEMPLATE", "TEMPLATE"]) {
    for (const scope of [
      { submission: new ObjectId() },
      { assignment: new ObjectId() },
      { reviewerToken: "private" },
      { revisionToken: "private" },
    ]) {
      await assert.rejects(
        service.upload({
          ...scope,
          conference: new ObjectId(),
          kind,
          filename: "x.docx",
          buffer: defaultReportTemplate(),
        }),
        /conference-level/,
      );
    }
  }
});

test("official report placeholders retain surrounding Word formatting", () => {
  const zip = new PizZip(defaultReportTemplate());
  zip.file(
    "word/document.xml",
    zip
      .file("word/document.xml")!
      .asText()
      .replace("<w:r>", "<w:r><w:rPr><w:b/></w:rPr>"),
  );
  const xml = new PizZip(
    renderReport(zip.generate({ type: "nodebuffer" }), {
      paper: "Paper title",
      reviewer: "Reviewer name",
      answers: "Detailed answer",
      recommendation: "PUBLISH",
      date: "2026-11-13",
    }),
  )
    .file("word/document.xml")!
    .asText();
  assert.match(xml, /<w:b\/>/);
  for (const value of [
    "Paper title",
    "Reviewer name",
    "Detailed answer",
    "PUBLISH",
  ])
    assert.ok(xml.includes(value));
  assert.ok(!xml.includes("{paper}"));
});
