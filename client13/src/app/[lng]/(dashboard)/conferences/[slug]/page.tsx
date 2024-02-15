export default function Conference({
  params: { lng, slug },
}: {
  params: { lng: string; slug: string };
}) {
  return <div>{slug}</div>;
}
