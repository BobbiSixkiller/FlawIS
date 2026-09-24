import assert from "node:assert/strict";
import test from "node:test";

import { minioDownloadHref } from "../src/lib/minioUrl";

test("submission downloads use the application MinIO proxy", () => {
  const fileUrl =
    "http://minio:9000/bpf2026/section/816f3439-file name.docx";
  const href = minioDownloadHref("bpf2026", fileUrl);
  const parsed = new URL(href, "https://conference.example.com");

  assert.equal(parsed.pathname, "/minio");
  assert.equal(parsed.searchParams.get("bucketName"), "bpf2026");
  assert.deepEqual(parsed.searchParams.getAll("url"), [fileUrl]);
});

test("MinIO proxy links retain every file for archive downloads", () => {
  const urls = [
    "http://minio:9000/bpf2026/section/first.pdf",
    "http://minio:9000/bpf2026/section/second.docx",
  ];
  const href = minioDownloadHref("bpf2026", urls);
  const parsed = new URL(href, "https://conference.example.com");

  assert.deepEqual(parsed.searchParams.getAll("url"), urls);
});
