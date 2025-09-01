"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="ring-red-500 ring-1 bg-red-300 text-red-500 space-y-1 p-3 rounded-lg">
      <h1 className="text-xl font-bold text-red-600">Error</h1>
      <p>{error.message}</p>
    </div>
  );
}
