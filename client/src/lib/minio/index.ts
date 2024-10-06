import * as Minio from "minio";
import { Readable } from "stream";
import { v4 as uuid } from "uuid";

const minioClient = new Minio.Client({
  useSSL: false,
  endPoint: "minio",
  port: 9000,
  accessKey: process.env.MINIO_ACCESS_KEY || "",
  secretKey: process.env.MINIO_SECRET_KEY || "",
});

async function ensureBucketExists(bucketName: string): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    minioClient.bucketExists(bucketName.toLowerCase(), (err, exists) => {
      if (err) {
        return reject(err);
      }
      if (exists) {
        return resolve();
      } else {
        // Create the bucket if it does not exist
        minioClient.makeBucket(bucketName.toLowerCase(), "", (err) => {
          if (err) {
            return reject(err);
          }
          console.log(
            `Bucket '${bucketName.toLowerCase()}' created successfully.`
          );
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

  // Ensure the bucket exists
  await ensureBucketExists(bucketName);

  const paths = path.split("/").map(
    (p) =>
      p
        .replace(/\s+/g, "_") // Replace spaces with underscores
        .replace(/[^\w\-_.áčéíóúýžš]+/g, "") // Allow word characters, hyphen, underscore, period, and specific accented characters
  );
  paths[paths.length - 1] = uuid() + "-" + paths[paths.length - 1];

  const objectName = paths.join("/").toLowerCase();

  // Upload the object
  return new Promise<string>((resolve, reject) => {
    minioClient.putObject(bucketName, objectName, buffer, (err) => {
      if (err) {
        console.error(`Error uploading file: ${err.message}`);
        return reject(err);
      }
      console.log(
        `File '${objectName}' uploaded to bucket '${bucketName}' successfully.`
      );
      resolve(`http://minio:9000/${bucketName}/${objectName}`);
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

export async function deleteFiles(
  bucketName: string,
  objectList: string[]
): Promise<boolean> {
  return new Promise<boolean>((resolve, reject) => {
    minioClient.bucketExists(bucketName, (err, res) => {
      if (err) {
        console.error(`Error checking bucket existence: ${err.message}`);
        return reject(err);
      }
      if (res) {
        minioClient.removeObjects(bucketName, objectList, (err: any) => {
          if (err) {
            console.error(`Error deleting objects: ${err.message}`);
            return reject(err);
          }
          resolve(true);
        });
      } else {
        console.error(`Bucket '${bucketName}' does not exist.`);
        reject(new Error(`Bucket '${bucketName}' does not exist.`));
      }
    });
  });
}
