import { SubmissionDocument } from "@/lib/graphql/generated/graphql";
import { downloadFile } from "@/lib/minio";
import { executeGqlFetch } from "@/utils/actions";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params: { id } }: { params: { lng: string; slug: string; id: string } }
) {
  const res = await executeGqlFetch(SubmissionDocument, { id });
  if (res.errors) {
    return NextResponse.json({ status: 404, message: "Submission not found!" });
  }

  const submission = res.data?.submission;

  if (!submission?.fileUrl) {
    return NextResponse.json({
      status: 400,
      message: "Submission does not have an uploaded file!",
    });
  }

  try {
    const objectName = submission.fileUrl.replace(
      `http://minio:9000/${submission.conference.slug.toLowerCase()}/`,
      ""
    );

    // Download the file
    const fileStream = await downloadFile(
      submission.conference.slug,
      objectName
    );

    // Convert Node.js stream to web ReadableStream
    const webReadableStream = nodeStreamToWebReadable(fileStream);

    // Return the file stream as the response
    return new NextResponse(webReadableStream, {
      headers: {
        "Content-Type": "application/octet-stream", // Set the appropriate MIME type
        "Content-Disposition": `attachment; filename="${submission.fileUrl
          .split("/")
          .pop()}"`, // Set the filename for download
      },
    });
  } catch (error: any) {
    console.log(error);
    return NextResponse.json({
      status: 500,
      message: "Error downloading the file.",
    });
  }
}

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
