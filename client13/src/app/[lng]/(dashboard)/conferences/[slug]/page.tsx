export default function Conference({
  params: { lng, slug },
}: {
  params: { lng: string; slug: string };
  searchParams: {};
}) {
  return <div>{slug}</div>;
}
