"use client";

import { UsersQuery } from "@/lib/graphql/generated/graphql";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import { getUsers } from "./actions";
import UserCardPlaceholder from "./UserCardPlaceholder";

export default function ListUsers({
  initialData,
}: {
  initialData: UsersQuery;
}) {
  const [userConnection, setUserConnection] = useState(initialData.users);

  const { ref, inView } = useInView();

  useEffect(() => {
    async function getMore() {
      const data = await getUsers(userConnection.pageInfo.endCursor);
      setUserConnection((prev) => ({
        edges: [...prev.edges, ...data.users.edges],
        pageInfo: data.users.pageInfo,
      }));
    }

    if (inView && userConnection.pageInfo.hasNextPage) {
      getMore();
    }
  }, [inView, userConnection]);

  //reflect changes after revalidating cache tagged users
  useEffect(() => {
    setUserConnection(initialData.users);
  }, [initialData]);

  return (
    <div className="flex flex-col gap-4">
      {userConnection.edges.map((edge) => (
        <Link
          key={edge?.cursor}
          className="rounded-2xl border p-4 shadow hover:shadow-lg text-gray-900 text-sm cursor-pointer focus:outline-primary-500"
          href={`/users/${edge?.node.id}`}
        >
          <h2 className="font-medium leading-6">{edge?.node.name}</h2>
          <p className="leading-none text-gray-500">
            {edge?.node.organization}
          </p>
          <p className="mt-2">Email: {edge?.node.email}</p>
          <p>Rola: {edge?.node.role}</p>
          <p
            className={`${
              edge?.node.verified ? "text-green-500" : "text-red-500"
            }`}
          >
            {edge?.node.verified ? "Ucet overeny" : "Ucet neovereny"}
          </p>
        </Link>
      ))}
      {userConnection.pageInfo.hasNextPage && (
        <UserCardPlaceholder cardRef={ref} />
      )}
    </div>
  );
}
