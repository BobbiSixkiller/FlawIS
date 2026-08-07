import OfferingListSkeleton from "@/components/OfferingListSkeleton";

export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="h-7 w-40 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
        <div className="h-3 w-64 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
      </div>
      <OfferingListSkeleton />
    </div>
  );
}
