import Search from "@/components/Search";

export default async function Sidebar({
  params: { lng },
}: {
  params: { lng: string };
}) {
  return (
    <div className="flex h-full flex-col justify-between">
      <Search />
    </div>
  );
}
