/** Renders help sanitized by core, or parsed through the editor for a local preview. */
export default function RichTextHelp({ html }: { html: string }) {
  return (
    <div
      className="prose prose-sm max-w-none whitespace-pre-line text-muted-foreground"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
