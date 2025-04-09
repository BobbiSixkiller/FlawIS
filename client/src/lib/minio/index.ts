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
    .toLowerCase()
    .replace(/[^a-z0-9.-]/g, "-") // Replace invalid characters
    .replace(/(^[^a-z0-9]+)|([^a-z0-9]+$)/g, ""); // Trim invalid start/end

  // Remove consecutive periods or hyphens (optional, for stricter validation)
  sanitized = sanitized.replace(/[-.]{2,}/g, "-");

  // Ensure minimum length
  if (sanitized.length < 3) {
    sanitized = sanitized.padEnd(3, "0");
  }

  // Ensure maximum length
  if (sanitized.length > 63) {
    sanitized = sanitized.slice(0, 63);
  }

  return sanitized;
}

async function ensureBucketExists(bucketName: string): Promise<void> {
  const sanitizedBucketName = sanitizeBucketName(bucketName);

  return new Promise<void>((resolve, reject) => {
    minioClient.bucketExists(sanitizedBucketName, (err, exists) => {
      if (err) {
        return reject(err);
      }
      if (exists) {
        return resolve();
      } else {
        // Create the bucket if it does not exist
        minioClient.makeBucket(sanitizedBucketName, "", (err) => {
          if (err) {
            return reject(err);
          }
          console.log(`Bucket '${sanitizedBucketName}' created successfully.`);
          return resolve();
        });
      }
    });
  });
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

  const paths = path.split("/").map(
    (p) =>
      p
        .replace(/\s+/g, "_") // Replace spaces with underscores
        .replace(/[^\w\-_.@áčéíóúýžš]+/g, "") // Allow word characters, hyphen, underscore, period, and specific accented characters
  );
  paths[paths.length - 1] = uuid() + "-" + paths[paths.length - 1];

  const objectName = paths.join("/").toLowerCase();

  // Upload the object
  return new Promise<string>((resolve, reject) => {
    minioClient.putObject(sanitizedBucketName, objectName, buffer, (err) => {
      if (err) {
        console.error(`Error uploading file: ${err.message}`);
        return reject(err);
      }
      console.log(
        `File '${objectName}' uploaded to bucket '${sanitizedBucketName}' successfully.`
      );
      resolve(`http://minio:9000/${sanitizedBucketName}/${objectName}`);
    });
  });
}

export async function downloadFile(
  bucketName: string,
  objectName: string
): Promise<Readable> {
  return new Promise<Readable>((resolve, reject) => {
    minioClient.getObject(bucketName, objectName, (err, stream) => {
      if (err) {
        reject(err);
      } else {
        resolve(stream as Readable);
      }
    });
  });
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
    }
  } catch (error) {
    console.log(error);
    throw error;
  }
}
