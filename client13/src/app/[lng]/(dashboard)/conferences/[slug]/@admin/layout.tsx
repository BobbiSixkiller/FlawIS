import { ReactNode } from "react";
import { getConference } from "../../actions";
import {
  AcademicCapIcon,
  FolderOpenIcon,
  InformationCircleIcon,
  TicketIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";
import TabMenu from "@/components/TabMenu";

export default async function TabsLayout({
  children,
  params: { lng, slug },
}: {
  children: ReactNode;
  params: { slug: string; lng: string };
}) {
  const conference = await getConference(slug);

  const tabs = [
    {
      href: `/conferences/${slug}`,
      name: "Info",
      icon: <InformationCircleIcon className="h-5 w-5" />,
    },
    {
      href: `/conferences/${slug}/attendees`,
      name: "Ucastnici",
      icon: <UserGroupIcon className="h-5 w-5" />,
    },
    {
      href: `/conferences/${slug}/sections`,
      name: "Sekcie",
      icon: <FolderOpenIcon className="h-5 w-5" />,
    },
    {
      href: `/conferences/${slug}/tickets`,
      name: "Listky",
      icon: <TicketIcon className="h-5 w-5" />,
    },
  ];

  if (!conference.attending) {
    tabs.push({
      href: `/conferences/${slug}/register`,
      name: "Registrovat",
      icon: <AcademicCapIcon className="h-5 w-5" />,
    });
  }

  return (
    <>
      <TabMenu tabs={tabs} />
      {children}
    </>
  );
}
