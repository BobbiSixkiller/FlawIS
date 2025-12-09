export default function Loading() {
  return (
    <div>
      <div className="animate-pulse">
        <div className="flex flex-col items-center">
          <div className="h-4 bg-slate-200 dark:bg-slate-500 rounded w-1/3"></div>
        </div>
      </div>
      <div className="mt-6 flex flex-col gap-4">
        {[...new Array(6)].map((i, index) => (
          <div
            key={index}
            className="rounded-2xl border dark:border-slate-500 p-4 shadow"
          >
            <div className="animate-pulse  space-x-4">
              <div className="flex-1 space-y-6 py-1">
                <div className="h-2 bg-slate-200 dark:bg-slate-500 rounded"></div>
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="h-2 bg-slate-200 dark:bg-slate-500 rounded col-span-2"></div>
                    <div className="h-2 bg-slate-200 dark:bg-slate-500 rounded col-span-1"></div>
                  </div>
                  <div className="h-2 bg-slate-200 dark:bg-slate-500 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
