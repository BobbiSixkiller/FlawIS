"use client";

import { useParams, useRouter } from "next/navigation";
import { searchConference } from "../../conferences/actions";
import SearchComponent from "@/components/Search";

interface ConferenceItem {
  id: string;
  translations: { sk: { name: string }; en: { name: string } };
  slug: string;
}

function ConferenceOption({
  active,
  data,
}: {
  active: boolean;
  data: ConferenceItem;
}) {
  const { lng } = useParams<{ lng: string }>();

  return (
    <div
      className={`px-4 py-2 ${
        active ? "bg-primary-500 text-white" : "bg-white"
      } flex gap-2 font-semibold cursor-pointer`}
    >
      {data.translations[lng as "sk" | "en"].name}
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

  const onOptionSelect = (opt: ConferenceItem) => {
    router.push(`/conferences/${opt.slug}`);
  };

  return (
    <SearchComponent
      Option={ConferenceOption}
      onOptionSelect={onOptionSelect}
      fetchOptions={searchConference}
    />
  );
}
