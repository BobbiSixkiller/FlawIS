import { revalidatePath, revalidateTag } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const url = searchParams.get("url");
  const redirectUrl = url ? decodeURIComponent(url) : "/login";

  const token = cookies().get("accessToken")?.value;
  if (token) {
    cookies().delete("accessToken");
  }

  revalidatePath("/", "layout");
  redirect(redirectUrl);
}
