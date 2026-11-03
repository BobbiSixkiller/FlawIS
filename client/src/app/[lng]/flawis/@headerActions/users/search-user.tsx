"use client";

import { useRouter } from "next/navigation";
import SearchComponent from "@/components/search";
import { searchUser } from "../../users/actions";

interface UserItem {
  id: string;
  name: string;
  email: string;
}

function UserOption({ active, data }: { active: boolean; data: UserItem }) {
  return (
    <div
      className={`px-4 py-2 ${
        active ? "bg-accent text-accent-foreground" : "bg-transparent"
      } flex gap-2 font-medium cursor-pointer`}
    >
      {data.name}
      <span
        className={`font-normal ${
          active ? "text-accent-foreground" : "text-muted-foreground dark:text-muted-foreground"
        }`}
      >
        {data.email}
      </span>
    </div>
  );
}

export default function SearchUser() {
  const router = useRouter();

  const onOptionSelect = (opt: UserItem) => {
    router.push(`/users/${opt.id}`);
  };

  return (
    <SearchComponent
      Option={UserOption}
      onOptionSelect={onOptionSelect}
      fetchOptions={searchUser}
    />
  );
}
