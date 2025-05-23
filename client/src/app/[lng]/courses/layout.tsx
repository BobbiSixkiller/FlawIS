import { translate } from "@/lib/i18n";
import { Metadata, ResolvingMetadata } from "next";
import { headers } from "next/headers";

export async function generateMetadata(
  {
    params: { lng },
  }: {
    params: { lng: string };
  },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { t } = await translate(lng, "dashboard");
  const host = headers().get("host") || "flawis.flaw.uniba.sk";
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
}: {
  children: React.ReactNode;
  params: { lng: string };
}) {
  return <div>{children}</div>;
}
