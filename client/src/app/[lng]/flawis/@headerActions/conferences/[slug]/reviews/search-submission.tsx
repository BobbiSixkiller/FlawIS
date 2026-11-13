"use client";
import { useCallback } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import SearchComponent from "@/components/search";
import { getReviewQueue } from "@/lib/reviews/actions";
import type { QueueRow } from "@/lib/reviews/types";
function SubmissionOption({
  data,
}: {
  data: QueueRow & { id: string; name: string };
  active: boolean;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span>{data.name}</span>
      <span className="text-xs text-muted-foreground">
        {data.authors.map((author) => author.name).join(", ")}
      </span>
    </div>
  );
}
export default function SearchSubmission({
  conference,
  slug,
}: {
  conference: string;
  slug: string;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const { lng } = useParams<{ lng: string }>();
  const base = `/conferences/${slug}/reviews`;
  const searchSubmissions = useCallback(
    async ({ text }: { text: string }) => {
      const result = await getReviewQueue(conference, undefined, undefined, {
        search: text,
      });
      return result.rows.map((row) => ({
        ...row,
        id: row.submissionId,
        name: lng === "en" ? row.title : row.titleSk || row.title,
      }));
    },
    [conference, lng],
  );
  return (
    <SearchComponent
      placeholder={lng === "en" ? "Find a submission" : "Hľadať príspevok"}
      fetchOptions={searchSubmissions}
      Option={SubmissionOption}
      onOptionSelect={(row) =>
        router.push(
          `${base}/${row.submissionId}?returnTo=${encodeURIComponent(`${base}?${params}`)}`,
        )
      }
    />
  );
}
