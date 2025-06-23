import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const token = searchParams.get("token");

  if (token) {
    const cookieStore = await cookies();
    cookieStore.set("activationToken", token, {
      httpOnly: true,
      expires: new Date(Date.now() + 60 * 60 * 1000),
    });
  }

  return redirect("/");
}
