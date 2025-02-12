import { NextRequest } from "next/server";
import { activate } from "../actions";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const token = searchParams.get("token");

  if (token) {
    cookies().set("activationToken", token, {
      httpOnly: true,
      expires: new Date(Date.now() + 60 * 60 * 1000),
    });
    await activate();
  }

  return redirect("/");
}
