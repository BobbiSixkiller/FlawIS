"use client";

import { useParams, useRouter } from "next/navigation";
import SearchComponent from "@/components/Search";
import { searchConference } from "./actions";
import { ConferenceFragment } from "@/lib/graphql/generated/graphql";

function ConferenceOption({
  active,
  data,
}: {
  active: boolean;
  data: ConferenceFragment;
}) {
  const { lng } = useParams<{ lng: string }>();

  return (
    <div
      className={`px-4 py-2 ${
        active ? "bg-primary-500 text-white" : ""
      } flex gap-2 font-semibold cursor-pointer dark:text-white`}
    >
      {data?.translations[lng as "sk" | "en"].name}
      <span
        className={`font-normal ${active ? "text-gray-200" : "text-gray-500"}`}
      >
        {data.slug}
      </span>
    </div>
  );
}

export default function SearchConference() {
  const router = useRouter();

  const onOptionSelect = (opt: ConferenceFragment) => {
    router.push(`/conferences/${opt.slug}`);
  };

  return (
    <SearchComponent
      Option={ConferenceOption}
      onOptionSelect={onOptionSelect}
      fetchOptions={searchConference}
      placeholder="Hladat konferenciu..."
    />
  );
}
