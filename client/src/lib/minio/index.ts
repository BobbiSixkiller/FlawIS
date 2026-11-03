"use server";

import * as Minio from "minio";
import { Readable } from "stream";
import { v4 as uuid } from "uuid";

const minioClient = new Minio.Client({
  useSSL: false,
  endPoint: process.env.MINIO_ENDPOINT || "minio",
  port: 9000,
  accessKey: process.env.MINIO_ACCESS_KEY || "",
  secretKey: process.env.MINIO_SECRET_KEY || "",
});

/**
 * Sanitizes a string to be a valid MinIO (S3-compatible) bucket name.
 * - Converts to lowercase
 * - Replaces invalid characters with hyphens
 * - Trims leading/trailing non-alphanumerics
 * - Ensures length is between 3 and 63 characters
 */
function sanitizeBucketName(input: string): string {
  let sanitized = input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove accents
    .toLowerCase()
    .replace(/[^a-z0-9.-]/g, "-") // only allow DNS-safe characters
    .replace(/(^[^a-z0-9]+)|([^a-z0-9]+$)/g, ""); // trim invalid start/end

  sanitized = sanitized.replace(/[-.]{2,}/g, "-"); // prevent sequences like -- or ..

  if (sanitized.length < 3) {
    sanitized = sanitized.padEnd(3, "0");
  }

  if (sanitized.length > 63) {
    sanitized = sanitized.slice(0, 63);
  }

  return sanitized;
}

function sanitizeObjectPath(path: string): string {
  const parts = path.split("/").map(
    (p) =>
      p
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // remove accents
        .replace(/\s+/g, "_")
        .replace(/[^\w\-_.@]+/g, "") // keep safe filename chars
  );

  parts[parts.length - 1] = uuid() + "-" + parts[parts.length - 1];
  return parts.join("/").toLowerCase();
}

async function ensureBucketExists(bucketName: string): Promise<void> {
  const sanitizedBucketName = sanitizeBucketName(bucketName);

  if (!(await minioClient.bucketExists(sanitizedBucketName))) {
    await minioClient.makeBucket(sanitizedBucketName);
  }
}

export async function uploadFile(
  bucketName: string,
  path: string,
  file: File
): Promise<string> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const sanitizedBucketName = sanitizeBucketName(bucketName);

  // Ensure the bucket exists
  await ensureBucketExists(sanitizedBucketName);

  const objectName = sanitizeObjectPath(path);

  await minioClient.putObject(sanitizedBucketName, objectName, buffer);
  return `http://minio:9000/${sanitizedBucketName}/${objectName}`;
}

export async function downloadFile(
  bucketName: string,
  objectName: string
): Promise<Readable> {
  return minioClient.getObject(bucketName, objectName);
}

export async function deleteFiles(urls: string[]) {
  const minioObjects = urls.map((url) => {
    const paths = url.replace("http://minio:9000/", "").split("/");
    const bucketName = paths.shift() || "";

    return { bucketName, objectName: paths.join("/") };
  });

  try {
    for (const { bucketName, objectName } of minioObjects) {
      await ensureBucketExists(bucketName);
      await minioClient.removeObject(bucketName, objectName);

      console.log(
        `File '${objectName}' deleted from '${bucketName}' successfully.`
      );
    }
  } catch (error) {
    console.log(error);
    throw error;
  }
}
