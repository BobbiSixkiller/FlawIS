import { revalidateTag } from "next/cache";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const user = cookies().get("user")?.value;
  if (!user) return;

  cookies().delete("user");
  cookies().delete("accessToken");

  revalidateTag(user);

  return NextResponse.redirect(new URL("/", req.url));
}
