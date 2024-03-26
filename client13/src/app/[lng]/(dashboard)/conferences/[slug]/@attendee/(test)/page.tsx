export default function ConferencePage({
  params: { lng, slug },
}: {
  params: { slug: string; lng: string };
}) {
  return <div>ATTENDEE {slug}</div>;
}
