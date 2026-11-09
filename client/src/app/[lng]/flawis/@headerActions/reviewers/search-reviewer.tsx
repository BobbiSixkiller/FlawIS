"use client";
import { useParams, useRouter } from "next/navigation";
import SearchComponent from "@/components/search";
import { getReviewerDirectory } from "@/lib/reviews/actions";
import type { ReviewerRecord } from "@/lib/reviews/types";
import { Badge } from "@/components/ui/badge";
async function searchReviewers({ text }: { text: string }) {
  return (await getReviewerDirectory(text)).rows;
}
function ReviewerOption({ data }: { data: ReviewerRecord; active: boolean }) {
  const { lng } = useParams<{ lng: string }>();
  return (
    <div className="flex flex-col gap-1">
      <span>
        {data.name}{" "}
        {data.archived && (
          <Badge variant="outline">
            {lng === "en" ? "Archived" : "Archív"}
          </Badge>
        )}
      </span>
      <span className="text-xs text-muted-foreground">
        {data.email} · {data.institution}
      </span>
    </div>
  );
}
export default function SearchReviewer() {
  const router = useRouter();
  const { lng } = useParams<{ lng: string }>();
  return (
    <SearchComponent
      placeholder={lng === "en" ? "Find a reviewer" : "Hľadať recenzenta"}
      fetchOptions={searchReviewers}
      Option={ReviewerOption}
      onOptionSelect={(reviewer) =>
        router.push(`/reviewers?search=${encodeURIComponent(reviewer.email)}`)
      }
    />
  );
}
