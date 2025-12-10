import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const url = searchParams.get("url");
  const redirectUrl = url ? decodeURIComponent(url) : "/login";

  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;

  const isRsc = searchParams.has("_rsc");

  // If this is an RSC prefetch, DO NOT mutate auth state.
  if (isRsc) {
    return new NextResponse(null, { status: 204 });
  }

  if (token) {
    cookieStore.delete({
      name: "accessToken",
      httpOnly: true,
      secure: process.env.NODE_ENV !== "development",
      sameSite: "lax",
      path: "/", // make it available on every route
      domain:
        process.env.NODE_ENV === "development" ? "localhost" : ".flaw.uniba.sk",
    });
  }

  redirect(redirectUrl);
}
