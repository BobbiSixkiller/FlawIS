import TabMenu from "@/components/TabMenu";
import {
  FolderOpenIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
import { ReactNode } from "react";
import { getConference } from "@/app/[lng]/flawis/conferences/actions";
import { translate } from "@/lib/i18n";

export default async function Layout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ lng: string; slug: string }>;
}) {
  const { lng, slug } = await params;
  const { t } = await translate(lng, "conferences");

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
      icon: <FolderOpenIcon className="size-5" />,
    });
  }

  return (
    <>
      <TabMenu tabs={tabs} />
      {children}
    </>
  );
}
