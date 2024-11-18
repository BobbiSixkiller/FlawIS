export default function Loading() {
  return (
    <div>
      <div className="animate-pulse">
        <div className="flex justify-between">
          <div className="h-4 bg-slate-200 rounded w-1/3"></div>
          <div className="rounded-md bg-slate-200 h-9 w-20"></div>
        </div>
        <div className="h-2 bg-slate-200 rounded w-1/2"></div>
      </div>
      <div className="mt-6 flex flex-col gap-4">
        {[...new Array(6)].map((i, index) => (
          <div key={index} className="rounded-2xl border p-4 shadow">
            <div className="animate-pulse flex space-x-4">
              <div className="rounded-full bg-slate-200 h-10 w-10"></div>
              <div className="flex-1 space-y-6 py-1">
                <div className="h-2 bg-slate-200 rounded"></div>
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="h-2 bg-slate-200 rounded col-span-2"></div>
                    <div className="h-2 bg-slate-200 rounded col-span-1"></div>
                  </div>
                  <div className="h-2 bg-slate-200 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
