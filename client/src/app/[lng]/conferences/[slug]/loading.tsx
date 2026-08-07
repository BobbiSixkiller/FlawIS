export default function Loading() {
  return (
    <div className="flex animate-pulse flex-col gap-6" aria-hidden="true">
      <div className="overflow-hidden rounded-3xl border dark:border-gray-700">
        <div className="h-44 bg-slate-200 dark:bg-slate-700" />
        <div className="space-y-3 p-6">
          <div className="h-5 w-24 rounded-full bg-slate-200 dark:bg-slate-700" />
          <div className="h-8 w-4/5 rounded bg-slate-200 dark:bg-slate-700" />
        </div>
      </div>
      {[0, 1, 2].map((item) => (
        <div
          key={item}
          className="space-y-3 rounded-2xl border p-5 dark:border-gray-700"
        >
          <div className="h-5 w-2/5 rounded bg-slate-200 dark:bg-slate-700" />
          <div className="h-3 rounded bg-slate-200 dark:bg-slate-700" />
          <div className="h-3 w-4/5 rounded bg-slate-200 dark:bg-slate-700" />
        </div>
      ))}
    </div>
  );
}
