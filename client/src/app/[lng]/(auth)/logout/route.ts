import { revalidateTag } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const url = searchParams.get("url");
  const redirectUrl = url ? decodeURIComponent(url) : "/login";

  const token = cookies().get("accessToken")?.value;
  const user = cookies().get("user")?.value;

  if (token) {
    cookies().delete({
      name: "accessToken",
      httpOnly: true,
      secure: process.env.NODE_ENV !== "development",
      sameSite: "lax",
      path: "/", // make it available on every route
      domain:
        process.env.NODE_ENV === "development" ? "localhost" : ".flaw.uniba.sk",
    });
  }
  if (user) {
    cookies().delete({
      name: "user",
      httpOnly: true,
      secure: process.env.NODE_ENV !== "development",
      sameSite: "lax",
      path: "/", // make it available on every route
      domain:
        process.env.NODE_ENV === "development" ? "localhost" : ".flaw.uniba.sk",
    });
  }

  revalidateTag(user || "me");
  redirect(redirectUrl);
}
