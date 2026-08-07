export default function OfferingListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="flex flex-col gap-4" aria-hidden="true">
      {Array.from({ length: count }, (_, index) => (
        <div
          key={index}
          className="animate-pulse rounded-2xl border p-4 shadow-sm dark:border-gray-700"
        >
          <div className="h-40 rounded-xl bg-slate-200 dark:bg-slate-700" />
          <div className="mt-4 h-3 w-2/3 rounded-sm bg-slate-200 dark:bg-slate-700" />
          <div className="mt-5 h-2 rounded-sm bg-slate-200 dark:bg-slate-700" />
          <div className="mt-2 h-2 w-4/5 rounded-sm bg-slate-200 dark:bg-slate-700" />
        </div>
      ))}
    </div>
  );
}
