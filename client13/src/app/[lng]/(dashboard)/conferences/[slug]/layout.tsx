import { getMe } from "@/app/[lng]/(auth)/actions";
import { Role } from "@/lib/graphql/generated/graphql";
import { ReactNode } from "react";

export default async function TabsLayout({
  admin,
  attendee,
  children,
  params: { lng, slug },
}: {
  children: ReactNode;
  attendee: ReactNode;
  admin: ReactNode;
  params: { slug: string; lng: string };
}) {
  const user = await getMe();

  return (
    <div className="h-full">{user?.role !== Role.Admin ? attendee : admin}</div>
  );
}
