import { escapeAttrValue, FilterXSS, IWhiteList } from "xss";

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
  ].map((tag) => [tag, []])
);

whiteList.a = ["href"];

const richTextFilter = new FilterXSS({
  whiteList,
  stripIgnoreTag: true,
  stripIgnoreTagBody: ["script", "style", "textarea", "title", "noscript"],
  onTagAttr(tag, name, value, isWhiteAttr) {
    if (tag !== "a" || name !== "href" || !isWhiteAttr) {
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
