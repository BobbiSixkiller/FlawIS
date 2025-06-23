export default async function Courses({
  params,
}: {
  params: Promise<{ lng: string }>;
}) {
  await params;

  return null;
}
