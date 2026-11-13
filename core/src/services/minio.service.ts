import { Service } from "typedi";
import * as Minio from "minio";
import { Readable } from "stream";
import { v4 as uuid } from "uuid";

@Service()
export class MinioService {
  private readonly client: Minio.Client;

  constructor() {
    this.client = new Minio.Client({
      useSSL: false,
      endPoint: process.env.MINIO_ENDPOINT || "minio",
      port: 9000,
      accessKey: process.env.MINIO_ACCESS_KEY || "",
      secretKey: process.env.MINIO_SECRET_KEY || "",
    });
  }

  private async ensureBucketExists(bucketName: string): Promise<void> {
    try {
      const bucketExists = await this.client.bucketExists(
        bucketName.toLowerCase(),
      );
      if (bucketExists) {
        return;
      }
      await this.client.makeBucket(bucketName.toLowerCase());
      console.log(`Bucket '${bucketName.toLowerCase()}' created successfully.`);
    } catch (error) {
      throw error;
    }
  }

  async upload(
    bucketName: string,
    objectName: string,
    buffer: Buffer,
    contentType: string,
  ) {
    await this.ensureBucketExists(bucketName);
    await this.client.putObject(bucketName, objectName, buffer, buffer.length, {
      "Content-Type": contentType,
    });
  }

  async buffer(bucketName: string, objectName: string) {
    const stream = await this.downloadFile(bucketName, objectName);
    const chunks: Buffer[] = [];
    let size = 0;
    for await (const chunk of stream) {
      size += chunk.length;
      if (size > 25 * 1024 * 1024) {
        stream.destroy();
        throw new Error("File exceeds the supported size.");
      }
      chunks.push(Buffer.from(chunk));
    }
    return Buffer.concat(chunks);
  }

  public async downloadFile(
    bucketName: string,
    objectName: string,
  ): Promise<Readable> {
    try {
      return await this.client.getObject(bucketName, objectName);
    } catch (error) {
      throw error;
    }
  }

  public async deleteFiles(urls: string[]): Promise<void> {
    const minioObjects = urls.map((url) => {
      const paths = url.replace("http://minio:9000/", "").split("/");
      const bucketName = paths.shift() || "";

      return { bucketName, objectName: paths.join("/") };
    });

    try {
      for (const { bucketName, objectName } of minioObjects) {
        await this.ensureBucketExists(bucketName);
        await this.client.removeObject(bucketName, objectName);
      }
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}
