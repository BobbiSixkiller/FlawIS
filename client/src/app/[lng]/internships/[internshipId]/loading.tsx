import Spinner from "@/components/Spinner";

export default function Loading() {
  return (
    <div className="flex min-h-64 flex-1 items-center justify-center py-16">
      <Spinner />
    </div>
  );
}
