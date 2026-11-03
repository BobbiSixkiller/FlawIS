import OfferingListSkeleton from "@/components/offering-list-skeleton";

export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="mx-auto h-7 w-28 animate-pulse rounded bg-muted dark:bg-muted" />
      <OfferingListSkeleton />
    </div>
  );
}
