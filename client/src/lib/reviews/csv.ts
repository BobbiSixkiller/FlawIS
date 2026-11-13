export function parseReviewerCsv(text: string): Record<string, string>[] {
  const rows: string[][] = [];
  let row: string[] = [],
    cell = "",
    quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"') {
      if (quoted && text[i + 1] === '"') {
        cell += '"';
        i++;
      } else quoted = !quoted;
    } else if (c === "," && !quoted) {
      row.push(cell);
      cell = "";
    } else if ((c === "\n" || c === "\r") && !quoted) {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(cell);
      if (row.some(Boolean)) rows.push(row);
      row = [];
      cell = "";
    } else cell += c;
  }
  if (quoted) throw new Error("CSV contains an unclosed quoted value.");
  row.push(cell);
  if (row.some(Boolean)) rows.push(row);
  const headings =
    rows.shift()?.map((h) => h.replace(/^\uFEFF/, "").trim()) || [];
  if (!headings.includes("name") || !headings.includes("email"))
    throw new Error("CSV must include name and email columns.");
  if (rows.length > 500)
    throw new Error("Import at most 500 reviewers at a time.");
  return rows.map((values) =>
    Object.fromEntries(headings.map((h, i) => [h, values[i] || ""])),
  );
}
export function reviewerCsv(
  rows: {
    name: string;
    email: string;
    institution: string;
    department: string;
    languages: string[];
    expertise: string[];
    notes: string;
  }[],
) {
  const columns = [
    "name",
    "email",
    "institution",
    "department",
    "languages",
    "expertise",
    "notes",
  ] as const;
  const quote = (s: string) =>
    '"' + (/^[\s]*[=+@-]/.test(s) ? "'" + s : s).replaceAll('"', '""') + '"';
  return [
    columns.join(","),
    ...rows.map((row) =>
      columns
        .map((key) =>
          quote(
            Array.isArray(row[key])
              ? (row[key] as string[]).join(";")
              : (row[key] as string),
          ),
        )
        .join(","),
    ),
  ].join("\r\n");
}
