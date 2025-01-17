import Spinner from "@/components/Spinner";

export default function Loading() {
  return (
    <div className="h-screen flex flex-col items-center justify-center">
      <Spinner />
    </div>
  );
}
