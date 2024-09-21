import { MsalSignInDocument } from "@/lib/graphql/generated/graphql";
import { executeGqlFetch } from "@/utils/actions";
import { revalidateTag } from "next/cache";
import { cookies } from "next/headers";

import { redirect } from "next/navigation";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  const redirectUrl =
    state && state !== "{}" ? JSON.parse(state).redirectUrl : "/";

  if (!code) {
    return NextResponse.json({ error: "No code provided" }, { status: 400 });
  }

  const res = await executeGqlFetch(MsalSignInDocument, { authCode: code });
  if (res.errors) {
    return NextResponse.json({ error: res.errors }, { status: 500 });
  }
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
  cookies().set("user", res.data.msalSignIn.data.id, {
    httpOnly: true,
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
  });
  cookies().set("accessToken", res.data.msalSignIn.data.token, {
    httpOnly: true,
    expires, //accesstoken expires in 24 hours
  });
  revalidateTag(res.data.msalSignIn.data.id);

  return redirect(redirectUrl);
}
