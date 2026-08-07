import OfferingListSkeleton from "@/components/OfferingListSkeleton";

export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="mx-auto h-7 w-28 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
      <OfferingListSkeleton />
    </div>
  );
}
