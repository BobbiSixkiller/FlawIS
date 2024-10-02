import { useTranslation } from "@/lib/i18n";
import { downloadFile } from "@/lib/minio";
import { NextRequest, NextResponse } from "next/server";
import { Readable } from "stream";

function nodeStreamToWebReadable(stream: Readable): ReadableStream {
  return new ReadableStream({
    start(controller) {
      stream.on("data", (chunk) => {
        controller.enqueue(chunk);
      });
      stream.on("end", () => {
        controller.close();
      });
      stream.on("error", (err) => {
        controller.error(err);
      });
    },
  });
}

interface Download {
  bucketName?: string;
  objectName?: string;
}

export async function GET(
  request: NextRequest,
  { params: { lng } }: { params: { lng: string } }
) {
  const { t } = await useTranslation(lng, "minio");
  const { bucketName, objectName }: Download = await request.json();
  if (!bucketName || !objectName) {
    return NextResponse.json({ error: t("400") }, { status: 400 });
  }

  try {
    // Download the file
    const fileStream = await downloadFile(bucketName, objectName);

    // Convert Node.js stream to web ReadableStream
    const webReadableStream = nodeStreamToWebReadable(fileStream);

    // Return the file stream as the response
    return new NextResponse(webReadableStream, {
      headers: {
        "Content-Type": "application/octet-stream", // Set the appropriate MIME type
        "Content-Disposition": `attachment; filename="${objectName
          .split("/")
          .pop()}"`, // Set the filename for download
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: t("500") }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const data = await request.json();
}
