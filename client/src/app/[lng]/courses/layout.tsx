import { Metadata, ResolvingMetadata } from "next";
import { headers } from "next/headers";

import ParticipantTenantShell from "@/components/ParticipantTenantShell";
import { translate } from "@/lib/i18n";
import { getMe } from "../(auth)/actions";

export async function generateMetadata(
  {
    params,
  }: {
    params: Promise<{ lng: string }>;
  },
  _parent: ResolvingMetadata,
): Promise<Metadata> {
  const { lng } = await params;
  const { t } = await translate(lng, "dashboard");
  const headerStore = await headers();
  const host = headerStore.get("host") || "flawis.flaw.uniba.sk";
  const tenant = host.split(".")[0].replace("-staging", "");
  const url =
    process.env.NODE_ENV !== "development"
      ? new URL(`https://${host}`)
      : undefined;
  const title = `${t("courses")} | ${t("coursesDesc")}`;
  const description = t(`${tenant}Desc`);

  return {
    metadataBase: url,
    title,
    description,
    openGraph: {
      url,
      type: "website",
      siteName: "FlawIS",
      locale: lng,
      title,
      description,
      images: [`/images/Praf-logo-text-${lng}.png`],
    },
  };
}

export default async function CoursesLayout({
  children,
  modal,
  params,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
  params: Promise<{ lng: string }>;
}) {
  const [{ lng }, user] = await Promise.all([params, getMe()]);

  return (
    <ParticipantTenantShell lng={lng} user={user} modal={modal}>
      {children}
    </ParticipantTenantShell>
  );
}
