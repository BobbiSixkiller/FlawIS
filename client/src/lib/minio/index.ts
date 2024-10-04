import * as Minio from "minio";
import { Readable } from "stream";
import { v4 as uuid } from "uuid";

const minioClient = new Minio.Client({
  useSSL: false,
  // endPoint: "minio",
  endPoint: "172.18.0.5",
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
  const bucket = bucketName.toLowerCase();

  return new Promise<string>(async (resolve, reject) => {
    try {
      // Ensure the bucket exists, or create it
      await ensureBucketExists(bucket);

      const paths = path.split("/");
      paths[paths.length - 1] = uuid() + "-" + paths[paths.length - 1];
      const objectName = paths.join("/").toLowerCase();

      // Upload the object
      minioClient.putObject(bucket, objectName, buffer, (err) => {
        if (err) {
          reject(err);
        } else {
          console.log(
            `File '${objectName}' uploaded to bucket '${bucket}' successfully.`
          );
          resolve(`http://minio:9000/${bucket}/${objectName}`);
        }
      });
    } catch (error) {
      reject(error);
    }
  });
}

export async function downloadFile(
  bucketName: string,
  objectName: string
): Promise<Readable> {
  return new Promise<Readable>((resolve, reject) => {
    minioClient.getObject(
      bucketName.toLowerCase(),
      objectName.toLowerCase(),
      (err, stream) => {
        if (err) {
          reject(err);
        } else {
          resolve(stream as Readable);
        }
      }
    );
  });
}

export async function deleteFiles(
  bucket: string,
  objectList: string[]
): Promise<boolean> {
  return new Promise<boolean>((resolve, reject) => {
    const bucketName = bucket.toLowerCase();
    minioClient.bucketExists(bucketName, (err, res) => {
      if (err) {
        reject(err);
      }
      if (res) {
        minioClient.removeObjects(bucketName, objectList, (err) => {
          if (err) {
            reject(err);
          }
          resolve(true);
        });
      }
    });
  });
}
