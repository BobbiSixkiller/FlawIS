import { getMe } from "@/app/[lng]/(auth)/actions";
import { Role } from "@/lib/graphql/generated/graphql";
import Link from "next/link";
import { ReactNode } from "react";
import { getConference } from "../actions";
import { redirect } from "next/navigation";
import {
  FolderOpenIcon,
  InformationCircleIcon,
  TicketIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";
import Heading from "@/components/Heading";

export default async function TabsLayout({
  attendee,
  children,
  params: { lng, slug },
}: {
  children: ReactNode;
  attendee: ReactNode;
  params: { slug: string; lng: string };
}) {
  const user = await getMe();
  const conference = await getConference(slug);

  if (user?.role !== Role.Admin && conference.attending) {
    return <>{attendee}</>;
  }

  return (
    <div className="w-full h-full flex flex-col gap-2">
      <nav className="flex gap-3 overflow-x-auto border-b">
        <Link
          href={`/conferences/${slug}`}
          className="px-4 py-1 mb-2 rounded-md hover:bg-gray-700 hover:bg-opacity-10 flex items-center gap-2"
        >
          <InformationCircleIcon className="h-5 w-5" />
          Info
        </Link>
        <Link
          href={`/conferences/${slug}/attendees`}
          className="px-4 py-1 mb-2 rounded-md hover:bg-gray-700 hover:bg-opacity-10 flex items-center gap-2"
        >
          <UserGroupIcon className="h-5 w-5" />
          Ucastnici
        </Link>
        <Link
          href={`/conferences/${slug}/sections`}
          className="px-4 py-1 mb-2 rounded-md hover:bg-gray-700 hover:bg-opacity-10 flex items-center gap-2"
        >
          <FolderOpenIcon className="h-5 w-5" />
          Sekcie
        </Link>
        <Link
          href={`/conferences/${slug}/tickets`}
          className="px-4 py-1 mb-2 rounded-md hover:bg-gray-700 hover:bg-opacity-10 flex items-center gap-2"
        >
          <TicketIcon className="h-5 w-5" />
          Listky
        </Link>
      </nav>
      <div className="pt-3 h-full">{children}</div>
    </div>
  );
}
