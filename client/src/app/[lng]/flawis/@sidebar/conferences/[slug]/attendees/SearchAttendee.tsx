"use client";

import SearchComponent from "@/components/Search";
import { useParams, useRouter } from "next/navigation";
import { searchAttendee } from "./actions";

interface AttendeeOpt {
  id: string;
  user: {
    name: string;
    email: string;
  };
}

function AttendeeOption({
  active,
  data,
}: {
  active: boolean;
  data: AttendeeOpt;
}) {
  return (
    <div
      className={`px-4 py-2 ${
        active ? "bg-primary-500 text-white" : "bg-white"
      } flex gap-2 font-semibold cursor-pointer`}
    >
      {data.user.name}
      <span
        className={`font-normal ${active ? "text-gray-200" : "text-gray-500"}`}
      >
        {data.user.email}
      </span>
    </div>
  );
}

export default function SearchAttendee() {
  const router = useRouter();
  const { slug } = useParams<{ slug: string }>();

  const onOptionSelect = (opt: AttendeeOpt) => {
    router.push(`/conferences/${slug}/attendees/${opt.id}`);
  };

  return (
    <SearchComponent
      Option={AttendeeOption}
      onOptionSelect={onOptionSelect}
      fetchOptions={searchAttendee}
    />
  );
}
