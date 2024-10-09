import { useTranslation } from "@/lib/i18n";
import { downloadFile } from "@/lib/minio";
import { NextRequest, NextResponse } from "next/server";
import { Readable } from "stream";
import { getMe } from "../(auth)/actions";
import archiver from "archiver";

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

export async function GET(
  request: NextRequest,
  {
    params: { lng },
  }: {
    params: { lng: string };
  }
) {
  const { t } = await useTranslation(lng, "minio");

  const user = await getMe();
  if (!user) {
    return NextResponse.json({ message: t("401") }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const bucketName = searchParams.get("bucketName")?.trim().toLowerCase();
  const objectNames = searchParams
    .getAll("url")
    .map((name) =>
      name.split(`http://minio:9000/${bucketName}`).pop()!.trim().toLowerCase()
    );

  console.log(bucketName);

  if (!bucketName || objectNames.length === 0) {
    return NextResponse.json({ message: t("400") }, { status: 400 });
  }

  try {
    // Download the file
    if (objectNames.length === 1) {
      const fileStream = await downloadFile(bucketName, objectNames[0]);

      // Convert Node.js stream to web ReadableStream
      const webReadableStream = nodeStreamToWebReadable(fileStream);

      // Return the file stream as the response
      return new NextResponse(webReadableStream, {
        headers: {
          "Content-Type": "application/octet-stream", // Set the appropriate MIME type
          "Content-Disposition": `attachment; filename="${objectNames[0]
            .split("-")
            .pop()}"`, // Set the filename for download
        },
      });
    } else {
      // Create a zip archive
      const archive = archiver("zip", { zlib: { level: 9 } });

      // Create a PassThrough stream to convert it to a web-readable stream
      const zipStream = new Readable().wrap(archive);

      // Stream the zip file back to the client
      const webReadableStream = nodeStreamToWebReadable(zipStream);

      // Add each file to the zip archive
      for (const objectName of objectNames) {
        const fileStream = await downloadFile(bucketName, objectName);
        archive.append(fileStream, { name: objectName.split("-").pop()! }); // Add file with appropriate name
      }

      // Finalize the archive
      archive.finalize();

      return new NextResponse(webReadableStream, {
        headers: {
          "Content-Type": "application/zip",
          "Content-Disposition": `attachment; filename="files.zip"`,
        },
      });
    }
  } catch (error: any) {
    console.log(error);
    return NextResponse.json({ message: t("500") }, { status: 500 });
  }
}

// export async function POST(request: NextRequest) {
//   const data = await request.json();
// }
