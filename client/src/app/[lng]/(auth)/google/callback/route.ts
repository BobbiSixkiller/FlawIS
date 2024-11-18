import { NextRequest, NextResponse } from "next/server";
import { executeGqlFetch } from "@/utils/actions";
import { GoogleSignInDocument } from "@/lib/graphql/generated/graphql";
import { cookies } from "next/headers";
import { revalidateTag } from "next/cache";
import { redirect } from "next/navigation";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  const redirectUrl =
    state && state !== "{}" ? JSON.parse(state).redirectUrl : "/";

  console.log("REDIRECT TO ", redirectUrl);

  if (!code) {
    return NextResponse.json({ error: "No code provided" }, { status: 400 });
  }

  const res = await executeGqlFetch(GoogleSignInDocument, { authCode: code });
  if (res.errors) {
    return NextResponse.json({ error: res.errors }, { status: 500 });
  }
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
  cookies().set("user", res.data.googleSignIn.data.id, {
    httpOnly: true,
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
  });
  cookies().set("accessToken", res.data.googleSignIn.data.token, {
    httpOnly: true,
    expires, //accesstoken expires in 24 hours
  });
  revalidateTag(res.data.googleSignIn.data.id);

  return redirect(redirectUrl);
}
