import * as Minio from "minio";
import { Stream } from "stream";
import { v4 as uuid } from "uuid";

const minioClient = new Minio.Client({
  useSSL: false,
  endPoint: "minio",
  port: 9000,
  accessKey: process.env.MINIO_ACCESS_KEY || "",
  secretKey: process.env.MINIO_SECRET_KEY || "",
});

export async function uploadFile(
  bucketName: string,
  path: string,
  file: File
): Promise<string> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  return new Promise<string>((resolve, reject) => {
    const paths = path.split("/");
    paths[paths.length - 1] = uuid() + "-" + paths[paths.length - 1];
    const objectName = paths.join("/");

    minioClient.putObject(bucketName, objectName, buffer, (err) => {
      if (err) {
        reject(err);
      } else {
        console.log(
          `File '${
            paths[paths.length]
          }' uploaded to bucket '${bucketName}' successfully.`
        );
        resolve(`http://minio:9000/${bucketName}/${objectName}`);
      }
    });
  });
}

export async function downloadFile(
  bucketName: string,
  objectName: string
): Promise<Stream> {
  return new Promise<Stream>((resolve, reject) => {
    minioClient.getObject(bucketName, objectName, (err, stream) => {
      if (err) {
        reject(err);
      } else {
        resolve(stream);
      }
    });
  });
}

export async function deleteFiles(
  bucket: string,
  objectList: string[]
): Promise<boolean> {
  return new Promise<boolean>((resolve, reject) => {
    minioClient.bucketExists(bucket, (err, res) => {
      if (err) {
        reject(err);
      }
      if (res) {
        minioClient.removeObjects(bucket, objectList, (err) => {
          if (err) {
            reject(err);
          }
          resolve(true);
        });
      }
    });
  });
}
