import { DOMParser } from "@xmldom/xmldom";
import { readDocxParts, decodeXml } from "./documents/docx-package";

const word = "http://schemas.openxmlformats.org/wordprocessingml/2006/main";

function documentPart(parts: Record<string, Uint8Array>, name: string) {
  const part = parts[name];
  if (!part) throw new Error("The Word document is missing a required part.");

  const xml = decodeXml(part);
  return new DOMParser({
    onError: () => {
      throw new Error("Invalid Word document.");
    },
  }).parseFromString(xml, "application/xml");
}

/** Compare section layouts using Word's twips. A millimetre conversion can round by one twip. */
export function manuscriptLayouts(buffer: Buffer) {
  const doc = documentPart(readDocxParts(buffer), "word/document.xml");
  if (
    doc.documentElement?.namespaceURI !== word ||
    doc.documentElement.localName !== "document"
  )
    throw new Error("Invalid Word document.");

  const sections = Array.from(
    doc.getElementsByTagNameNS(word, "sectPr"),
  ).filter((s) => s.parentNode?.localName !== "sectPrChange");
  if (!sections.length)
    throw new Error("The manuscript template must specify its page layout.");

  return sections.map((s) => {
    const read = (name: string, keys: string[]) => {
      const el = Array.from(s.childNodes).find(
        (n) =>
          n.nodeType === 1 && n.namespaceURI === word && n.localName === name,
      ) as import("@xmldom/xmldom").Element | undefined;

      return keys.map((key) => {
        const value = el?.getAttributeNS(word, key);
        if (!value || !/^-?\d+$/.test(value))
          throw new Error(
            "The Word document must specify page size and margins.",
          );
        return Number(value);
      });
    };

    return [
      ...read("pgSz", ["w", "h"]),
      ...read("pgMar", ["top", "bottom", "left", "right"]),
    ];
  });
}

export function assertManuscriptLayout(template: Buffer, manuscript: Buffer) {
  const allowed = manuscriptLayouts(template);
  if (
    manuscriptLayouts(manuscript).some(
      (layout) =>
        !allowed.some((a) => a.every((n, i) => Math.abs(n - layout[i]) <= 2)),
    )
  )
    throw new Error(
      "Use the conference manuscript template's page size and margins.",
    );
}

export function manuscriptText(buffer: Buffer) {
  const parts = readDocxParts(buffer);
  return ["word/document.xml", "word/footnotes.xml"]
    .filter((n) => parts[n])
    .flatMap((name) =>
      Array.from(
        documentPart(parts, name).getElementsByTagNameNS(word, "p"),
        (p) =>
          Array.from(
            p.getElementsByTagNameNS(word, "t"),
            (t) => t.textContent || "",
          ).join(""),
      ).filter(Boolean),
    );
}
