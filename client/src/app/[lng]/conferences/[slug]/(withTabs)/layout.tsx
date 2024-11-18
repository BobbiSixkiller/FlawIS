import TabMenu from "@/components/TabMenu";
import {
  FolderOpenIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
import { ReactNode } from "react";
import { useTranslation } from "@/lib/i18n";
import { getConference } from "@/app/[lng]/flawis/conferences/actions";

export default async function Layout({
  children,
  params: { slug, lng },
}: {
  children: ReactNode;
  params: { lng: string; slug: string };
}) {
  const { t } = await useTranslation(lng, "conferences");

  const conference = await getConference(slug);
  const tabs = [
    {
      href: `/${slug}`,
      name: "Info",
      icon: <InformationCircleIcon className="h-5 w-5" />,
    },
  ];

  if (
    conference &&
    conference.attending &&
    conference.attending.ticket.withSubmission
  ) {
    tabs.push({
      href: `/${slug}/submissions`,
      name: t("submission.submissions"),
      icon: <FolderOpenIcon className="h-5 w-5" />,
    });
  }

  return (
    <>
      <TabMenu tabs={tabs} />
      {children}
    </>
  );
}
