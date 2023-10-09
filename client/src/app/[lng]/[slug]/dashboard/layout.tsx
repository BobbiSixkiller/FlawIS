export default function DashboardLayout({
  // Layouts must accept a children prop.
  // This will be populated with nested layouts or pages
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <title>Auth | FlawIS</title>
      </head>
      <body>{children}</body>
    </html>
  );
}
