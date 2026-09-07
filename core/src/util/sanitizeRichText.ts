import { escapeAttrValue, FilterXSS, IWhiteList } from "xss";

const headingClasses = "dark:text-white/85 font-normal";

// Keep these in sync with the serialized HTMLAttributes in
// client/src/components/editor/Extensions.tsx. Editor UI/placeholder classes
// are not part of saved rich text.
const editorClassesByTag = new Map<string, ReadonlySet<string>>(
  Object.entries({
    p: "dark:text-gray-300",
    h1: headingClasses,
    h2: headingClasses,
    h3: headingClasses,
    h4: headingClasses,
    h5: headingClasses,
    h6: headingClasses,
    strong: "dark:text-white/85",
    b: "dark:text-white/85",
    ul: "list-disc list-outside leading-3 dark:text-gray-300 marker:text-primary-500 dark:marker:text-primary-300",
    ol: "list-decimal list-outside leading-3 dark:text-gray-300 marker:text-primary-500 dark:marker:text-primary-300",
    li: "leading-normal",
    blockquote: "border-l-2 border-primary-500 dark:border-primary-300 pl-4",
    pre: "rounded-md bg-gray-300/30 text-gray-900 border p-3 font-mono font-medium",
    code: "rounded-md bg-gray-300/30 px-1.5 py-1 font-mono font-medium",
    hr: "mt-4 mb-6 border-t",
    a: [
      "hover:underline text-primary-500 hover:text-primary-500/90 cursor-pointer",
      "focus:outline-hidden focus:ring-2 focus:ring-primary-500 focus:ring-offset-2",
      "dark:text-primary-300 dark:hover:text-primary-200 dark:focus:ring-offset-gray-900 dark:focus:ring-primary-300",
      // Older editor output used this before the Tailwind v4 migration.
      "focus:outline-none",
    ].join(" "),
  }).map(([tag, classes]) => [tag, new Set(classes.split(" "))])
);

const whiteList: IWhiteList = Object.fromEntries(
  [
    "p",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "ul",
    "ol",
    "li",
    "strong",
    "b",
    "em",
    "i",
    "u",
    "s",
    "strike",
    "pre",
    "code",
    "blockquote",
    "hr",
    "br",
  ].map((tag) => [tag, editorClassesByTag.has(tag) ? ["class"] : []])
);

whiteList.a = ["href", "class"];

const richTextFilter = new FilterXSS({
  whiteList,
  stripIgnoreTag: true,
  stripIgnoreTagBody: ["script", "style", "textarea", "title", "noscript"],
  onTagAttr(tag, name, value, isWhiteAttr) {
    if (!isWhiteAttr) {
      return undefined;
    }

    if (name === "class") {
      const allowedClasses = editorClassesByTag.get(tag);
      const classes = value
        .split(/\s+/)
        .filter((className) => allowedClasses?.has(className));

      return classes.length
        ? `class="${escapeAttrValue([...new Set(classes)].join(" "))}"`
        : "";
    }

    if (tag !== "a" || name !== "href") {
      return undefined;
    }

    const href = value.trim();
    if (!/^(https?:|mailto:)/i.test(href)) {
      return "";
    }

    return `href="${escapeAttrValue(href)}"`;
  },
});

export function sanitizeRichText(value: string) {
  return richTextFilter.process(value);
}
