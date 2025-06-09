import ActivateAccountDialog from "@/app/[lng]/(auth)/ActivateAccountDialog";
import { getMe } from "../(auth)/actions";
import SessionPolling from "@/components/SessionPolling";
import { HomeIcon } from "@heroicons/react/24/outline";
import { translate } from "@/lib/i18n";
import { Metadata, ResolvingMetadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Dashboard from "@/components/Dashboard";
import { Snackbar } from "@/components/Message";

export async function generateMetadata(
  {
    params: { lng },
  }: {
    params: { lng: string };
    sidebar: React.ReactNode;
    modal: React.ReactNode;
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
  const title = `${t("internships")} | ${t("title")}`;
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

export default async function DashboardLayout({
  children,
  modal,
  sidebar,
  params: { lng },
}: {
  children: React.ReactNode;
  sidebar: React.ReactNode;
  modal: React.ReactNode;
  params: { lng: string };
}) {
  const user = await getMe();
  if (!user) {
    redirect("/logout");
  }

  const { t } = await translate(lng, "dashboard");

  return (
    <div>
      <Dashboard
        sidebar={sidebar}
        lng={lng}
        user={user}
        navLinks={[
          {
            href: "/",
            icon: <HomeIcon className="mr-2 h-5 w-5" aria-hidden="true" />,
            text: t("home"),
          },
        ]}
      >
        {children}
      </Dashboard>

      {modal}

      <ActivateAccountDialog lng={lng} user={user} />
      <SessionPolling />
      <Snackbar />
    </div>
  );
}
