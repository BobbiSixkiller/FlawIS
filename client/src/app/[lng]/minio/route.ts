import { useTranslation } from "@/lib/i18n";
import { downloadFile } from "@/lib/minio";
import { NextRequest, NextResponse } from "next/server";
import { Readable } from "stream";
import { getMe } from "../(auth)/actions";

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
  const bucketName = searchParams.get("bucketName")?.valueOf().toLowerCase();
  const objectName = searchParams.get("objectName")?.valueOf().toLowerCase();

  if (!bucketName || !objectName) {
    return NextResponse.json({ message: t("400") }, { status: 400 });
  }

  try {
    // Download the file
    const fileStream = await downloadFile(
      bucketName,
      objectName.split(`http://minio:9000/${bucketName}`)[1]
    );

    // Convert Node.js stream to web ReadableStream
    const webReadableStream = nodeStreamToWebReadable(fileStream);

    // Return the file stream as the response
    return new NextResponse(webReadableStream, {
      headers: {
        "Content-Type": "application/octet-stream", // Set the appropriate MIME type
        "Content-Disposition": `attachment; filename="${objectName
          .split("-")
          .pop()}"`, // Set the filename for download
      },
    });
  } catch (error: any) {
    console.log(error);
    return NextResponse.json({ message: t("500") }, { status: 500 });
  }
}

// export async function POST(request: NextRequest) {
//   const data = await request.json();
// }
