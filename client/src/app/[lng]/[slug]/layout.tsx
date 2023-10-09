export default function ConferenceLayout({
  // Layouts must accept a children prop.
  // This will be populated with nested layouts or pages
  children,
  params: { lng, slug },
}: {
  children: React.ReactNode;
  params: { lng: string; slug: string };
}) {
  return (
    <html lang={lng}>
      <head>
        <title>FlawIS</title>
      </head>
      <body>{children}</body>
    </html>
  );
}
