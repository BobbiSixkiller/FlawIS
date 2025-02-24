"use client";

import { useRouter } from "next/navigation";
import SearchComponent from "@/components/Search";
import { searchUser } from "../../users/actions";

interface UserItem {
  id: string;
  name: string;
  email: string;
}

function ConferenceOption({
  active,
  data,
}: {
  active: boolean;
  data: UserItem;
}) {
  return (
    <div
      className={`px-4 py-2 ${
        active ? "bg-primary-500 text-white" : "bg-transparent"
      } flex gap-2 font-semibold cursor-pointer dark:text-white`}
    >
      {data.name}
      <span
        className={`font-normal ${
          active ? "text-gray-200" : "text-gray-500 dark:text-gray-400"
        }`}
      >
        {data.email}
      </span>
    </div>
  );
}

export default function SearchConference() {
  const router = useRouter();

  const onOptionSelect = (opt: UserItem) => {
    router.push(`/users/${opt?.id}`);
  };

  return (
    <SearchComponent
      Option={ConferenceOption}
      onOptionSelect={onOptionSelect}
      fetchOptions={searchUser}
    />
  );
}
