import { revalidateTag } from "next/cache";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const url = searchParams.get("url");
  const redirectUrl = url ? decodeURIComponent(url) : "/login";

  const user = cookies().get("user")?.value;
  if (user) {
    cookies().delete("user");
    cookies().delete("accessToken");
    revalidateTag(user);
  }

  return NextResponse.redirect(new URL(redirectUrl, req.url));
}
