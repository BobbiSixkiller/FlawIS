export default async function CoursePageLayout({
  children,
  modal,
  params,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
  params: Promise<{ lng: string; id: string }>;
}) {
  return (
    <>
      {children}
      {modal}
    </>
  );
}
