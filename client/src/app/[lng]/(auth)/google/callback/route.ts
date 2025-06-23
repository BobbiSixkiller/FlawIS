import { NextRequest, NextResponse } from "next/server";
import { GoogleSignInDocument } from "@/lib/graphql/generated/graphql";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { executeGqlFetch } from "@/utils/actions";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  const redirectUrl =
    state && state !== "{}" ? JSON.parse(state).redirectUrl : "/";

  if (!code) {
    return NextResponse.json({ error: "No code provided" }, { status: 400 });
  }

  const res = await executeGqlFetch(GoogleSignInDocument, { authCode: code });
  if (res.errors) {
    return NextResponse.json({ error: res.errors }, { status: 500 });
  }
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

  const cookieStore = await cookies();
  cookieStore.set("accessToken", res.data.googleSignIn.data.token, {
    httpOnly: true,
    expires, //accesstoken expires in 24 hours
    secure: process.env.NODE_ENV !== "development",
    sameSite: "lax",
    path: "/", // make it available on every route
    domain:
      process.env.NODE_ENV === "development" ? "localhost" : ".flaw.uniba.sk",
  });

  return redirect(redirectUrl);
}
