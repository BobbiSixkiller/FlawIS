import OfferingListSkeleton from "@/components/offering-list-skeleton";

export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="flex animate-pulse items-center justify-between">
        <div className="space-y-2">
          <div className="h-7 w-40 rounded bg-muted dark:bg-muted" />
          <div className="h-3 w-64 rounded bg-muted dark:bg-muted" />
        </div>
        <div className="h-9 w-20 rounded bg-muted dark:bg-muted" />
      </div>
      <OfferingListSkeleton />
    </div>
  );
}
