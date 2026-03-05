import { OAuth2Client } from "google-auth-library";
import { NextRequest, NextResponse } from "next/server";

const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
);

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ lng: string }> },
) {
  const { lng } = await params;
  const { searchParams } = new URL(req.url);
  const redirectUrl = searchParams.get("url");

  const host =
    req.headers.get("x-forwarded-host") ??
    req.headers.get("host") ??
    "localhost:3000";

  const dynamicRedirectUri = `https://${host}/google/callback`;

  const authUrl = googleClient.generateAuthUrl({
    access_type: "offline",
    scope: [
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/userinfo.email",
    ],
    redirect_uri: dynamicRedirectUri,
    state: JSON.stringify({ redirectUrl }),
  });

  return NextResponse.redirect(authUrl);
}
