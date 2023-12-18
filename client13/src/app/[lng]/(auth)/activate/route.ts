import { NextRequest, NextResponse } from "next/server";
import { activate } from "../actions";
import { cookies } from "next/headers";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const token = searchParams.get("token");

  if (token) {
    cookies().set("activationToken", token, {
      httpOnly: true,
      expires: new Date(Date.now() + 60 * 60 * 1000),
    });
    await activate();
    // if (res && res.success) {
    //   cookies().delete("activationToken");
    // }
  }

  return NextResponse.redirect(new URL("/", req.url));
}
