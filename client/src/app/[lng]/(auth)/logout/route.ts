import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const url = searchParams.get("url");
  const redirectUrl = url ? decodeURIComponent(url) : "/login";

  const token = cookies().get("accessToken")?.value;
  if (token) {
    cookies().delete({
      name: "accessToken",
      httpOnly: true,
      secure: process.env.NODE_ENV !== "development",
      sameSite: "lax",
      domain:
        process.env.NODE_ENV === "development" ? "localhost" : ".flaw.uniba.sk",
    });
  }

  revalidatePath("/", "layout");
  redirect(redirectUrl);
}
