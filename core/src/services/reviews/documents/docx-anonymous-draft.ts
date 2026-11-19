import {
  DOMParser,
  XMLSerializer,
  type Document,
  type Element,
} from "@xmldom/xmldom";
import { readDocxParts, writeDocxParts, decodeXml } from "./docx-package";

const W = "http://schemas.openxmlformats.org/wordprocessingml/2006/main";
const R = "http://schemas.openxmlformats.org/officeDocument/2006/relationships";
const XML = "http://www.w3.org/XML/1998/namespace";
const UNSUPPORTED =
  "Tento DOCX obsahuje zložité prvky. Anonymizujte ho ručne vo Worde a nahrajte novú kópiu.";
const MANUAL =
  "Ide iba o pracovný návrh. Pred overením skontrolujte mená, pracoviská, kontakty, obrázky, vlastné citácie (self-cites), hlavičky a päty aj výsledné rozloženie.";
const serialiser = new XMLSerializer();
const encoder = new TextEncoder();
const elements = (doc: Document | Element): Element[] =>
  Array.from(doc.getElementsByTagName("*"));

function parse(bytes: Uint8Array): Document {
  const xml = decodeXml(bytes);
  if (/<!DOCTYPE|<!ENTITY/i.test(xml)) throw new Error(UNSUPPORTED);

  try {
    return new DOMParser({
      onError: () => {
        throw new Error(UNSUPPORTED);
      },
    }).parseFromString(xml, "application/xml");
  } catch {
    throw new Error(
      "DOCX obsahuje neplatné XML. Najprv ho otvorte a uložte vo Worde.",
    );
  }
}

function remove(node: Element): void {
  node.parentNode?.removeChild(node);
}

function unwrap(node: Element): void {
  const parent = node.parentNode;
  if (!parent) return;
  while (node.firstChild) parent.insertBefore(node.firstChild, node);
  parent.removeChild(node);
}

function sourceForRels(path: string): string {
  return path === "_rels/.rels"
    ? ""
    : path.replace(/(^|\/)\_rels\//, "$1").replace(/\.rels$/, "");
}

function resolveTarget(source: string, target: string): string {
  const output = target.startsWith("/") ? [] : source.split("/").slice(0, -1);

  for (const part of target.split("/")) {
    if (!part || part === ".") continue;

    if (part === "..") {
      if (!output.length) throw new Error(UNSUPPORTED);
      output.pop();
    } else output.push(part);
  }

  return output.join("/");
}

function isMetadata(path: string): boolean {
  return (
    /^(docProps|docMetadata|customXml)\//i.test(path) ||
    /^word\/(?:comments[^/]*|people|intelligence\d*)\.xml$/i.test(path)
  );
}

export type AnonymizationSummary = {
  authorParagraphs: number;
  projectParagraphs: number;
  removedNotes: number;
};

export function authorVariants(value: string): string[] {
  if (value.length > 4000) throw new Error("Zoznam autorov je príliš dlhý.");
  return Array.from(
    new Set(
      value
        .normalize("NFC")
        .split(/;|\n|,|\s+and\s+|\s+&\s+/i)
        .map(withoutTitles)
        .filter((name) => name.split(/\s+/).length >= 2),
    ),
  );
}

function withoutTitles(value: string): string {
  return value
    .replace(
      /\b(?:prof|doc|JUDr|PhDr|Mgr|Ing|Bc|Ph\.?D|LL\.?M|Dr|RNDr)\b\.?/gi,
      "",
    )
    .replace(/^[,\s]+|[,\s]+$/g, "")
    .replace(/\s+/g, " ");
}

function folded(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLocaleLowerCase("sk-SK")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}

function textNodes(paragraph: Element): Element[] {
  return elements(paragraph).filter(
    (e) =>
      e.namespaceURI === W &&
      (e.localName === "t" || e.localName === "delText"),
  );
}

function textOf(node: Element): string {
  return textNodes(node)
    .map((n) => n.textContent || "")
    .join("");
}

function paragraphs(node: Document | Element): Element[] {
  return elements(node).filter(
    (e) => e.namespaceURI === W && e.localName === "p",
  );
}

export function isByline(text: string, names: string[]): boolean {
  let remaining = ` ${folded(withoutTitles(text))} `,
    found = false;

  for (const name of [...names].sort((a, b) => b.length - a.length)) {
    const normalized = ` ${folded(name)} `;

    while (remaining.includes(normalized)) {
      remaining = remaining.replace(normalized, " ");
      found = true;
    }
  }

  return (
    found && !remaining.replace(/\b(?:and|a|authors?|by)\b|\d+/g, "").trim()
  );
}

function noteReferences(node: Document | Element): Element[] {
  return elements(node).filter(
    (e) =>
      e.namespaceURI === W &&
      /^(?:footnote|endnote)Reference$/.test(e.localName || ""),
  );
}

function noteKey(node: Element): string {
  return `${node.localName?.replace("Reference", "")}:${node.getAttributeNS(W, "id")}`;
}

function clearParagraph(
  paragraph: Element,
  orphanCandidates: Set<string>,
  trimContactParagraph = false,
): void {
  for (const reference of noteReferences(paragraph))
    orphanCandidates.add(noteKey(reference));
  // Trim only the known terminal contact block to avoid blank final pages.
  // Elsewhere preserve spacing, section boundaries and required table paragraphs.
  const parent = paragraph.parentNode as Element | null;

  if (
    trimContactParagraph &&
    parent?.namespaceURI === W &&
    parent.localName === "body" &&
    !elements(paragraph).some(
      (e) => e.namespaceURI === W && e.localName === "sectPr",
    )
  ) {
    remove(paragraph);
    return;
  }

  for (const child of Array.from(paragraph.childNodes)) {
    if (
      child.nodeType === 1 &&
      (child as Element).namespaceURI === W &&
      (child as Element).localName === "pPr"
    )
      continue;
    paragraph.removeChild(child);
  }
}

function removeTextRanges(
  nodes: Element[],
  matches: { start: number; end: number }[],
): void {
  for (const match of [...matches].sort((a, b) => b.start - a.start)) {
    let offset = 0;

    for (const node of nodes) {
      const value = node.textContent || "",
        end = offset + value.length;

      if (end > match.start && offset < match.end) {
        const from = Math.max(0, match.start - offset),
          to = Math.min(value.length, match.end - offset);

        node.textContent = value.slice(0, from) + value.slice(to);
        node.setAttributeNS(XML, "xml:space", "preserve");
      }

      offset = end;
    }
  }
}

function nameRanges(
  text: string,
  names: string[],
): { start: number; end: number }[] {
  // Keep original character offsets while matching accent-insensitive names
  // split across Word runs, including upper-case bylines.
  let normalized = "";
  const offsets: { start: number; end: number }[] = [];

  for (let index = 0; index < text.length;) {
    const value = String.fromCodePoint(text.codePointAt(index)!);
    const end = index + value.length;
    const unit = value
      .normalize("NFD")
      .replace(/\p{M}/gu, "")
      .toLocaleLowerCase("sk-SK");

    if (/[\p{L}\p{N}]/u.test(unit)) {
      for (const character of unit) {
        normalized += character;
        offsets.push({ start: index, end });
      }
    } else if (normalized && !normalized.endsWith(" ")) {
      normalized += " ";
      offsets.push({ start: index, end });
    }

    index = end;
  }

  const ranges: { start: number; end: number }[] = [];

  for (const name of names) {
    const target = folded(name);
    let from = 0,
      index = -1;

    while (target && (index = normalized.indexOf(target, from)) >= 0) {
      const end = index + target.length;
      if (
        (!index || normalized[index - 1] === " ") &&
        (end === normalized.length || normalized[end] === " ")
      )
        ranges.push({ start: offsets[index].start, end: offsets[end - 1].end });
      from = end;
    }
  }

  return ranges
    .sort((a, b) => a.start - b.start || b.end - a.end)
    .filter((range, i, all) => !i || range.start >= all[i - 1].end);
}

function redactNames(
  doc: Document,
  names: string[],
  header: boolean,
  orphanCandidates: Set<string>,
): number {
  let count = 0;
  const all = paragraphs(doc);

  for (let index = 0; index < all.length; index++) {
    const paragraph = all[index];

    const nodes = textNodes(paragraph),
      text = nodes.map((n) => n.textContent || "").join("");

    if (!text) continue;

    if (isByline(text, names)) {
      clearParagraph(paragraph, orphanCandidates);
      count++;

      if (!header)
        for (const next of all.slice(index + 1, index + 4)) {
          const nextText = textOf(next).trim(),
            normal = folded(nextText);

          if (!nextText) continue;
          const affiliation =
            nextText.length < 650 &&
            /\b(?:university|univerzita|univerzity|faculty|fakulta|department|katedra|institute|ustav|school)\b/.test(
              normal,
            ) &&
            (/^(?:both authors|all authors|affiliation)\b/.test(normal) ||
              !/\b(?:is|are|was|were|has|have|examines|examined|discusses|argues|requires|must|should|je|su|bol|bola)\b/.test(
                normal,
              ));
          const contact = /^[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}$/.test(nextText);
          if (!affiliation && !contact) break;
          clearParagraph(next, orphanCandidates);
          count++;
        }

      continue;
    }

    // Do not rewrite body citations or other substantive sentences.
    if (!header) continue;

    const ranges = nameRanges(text, names);
    for (const match of text.matchAll(
      /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/giu,
    ))
      ranges.push({ start: match.index!, end: match.index! + match[0].length });
    const unique = ranges
      .sort((a, b) => a.start - b.start || b.end - a.end)
      .filter((range, i, all) => !i || range.start >= all[i - 1].end);

    if (unique.length) {
      removeTextRanges(nodes, unique);
      count++;
    }
  }

  return count;
}

function removeContactBlock(
  doc: Document,
  names: string[],
  orphanCandidates: Set<string>,
): number {
  const all = paragraphs(doc).filter((p) => textOf(p).trim());
  const index = all.findIndex(
    (p, i) =>
      i >= all.length - 20 &&
      /^(?:contact details|contact information|contacts|kontaktne udaje|kontakt)$/.test(
        folded(textOf(p)),
      ),
  );
  if (index < 0) return 0;
  const tail = all.slice(index + 1);

  // Limit to a terminal, short contact block backed by an author or email.
  if (
    !tail.length ||
    tail.some((p) => textOf(p).length > 650) ||
    !tail.some(
      (p) =>
        /[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/.test(textOf(p)) ||
        isByline(textOf(p), names),
    )
  )
    return 0;

  if (
    tail.some((p) =>
      /^(?:references|bibliography|conclusions?|abstract|literatura|zaver|zoznam literatury)$/.test(
        folded(textOf(p)),
      ),
    )
  )
    return 0;
  for (const paragraph of all.slice(index))
    clearParagraph(paragraph, orphanCandidates, true);
  return all.length - index;
}

const GRANT_CODE =
  /\b(?:apvv\s*[-–]?\s*\d{2}\s*[-–]\s*\d{4}|vega\s*\d\s*\/\s*\d{4}\s*\/\s*\d{2}|kega\s*\d{3}[a-z]+\s*[-–]\s*\d{1,2}\s*\/\s*\d{4}|vv\s*[-–]\s*mvp\s*[-–]\s*\d{2}\s*[-–]\s*\d{4}|vvgs\s*[-–]\s*\d{4}\s*[-–]\s*\d+)\b/i;

export function projectDedication(
  text: string,
  frontMatterNote = false,
): boolean {
  const value = folded(text);
  if (!value || text.length > 3500) return false;

  // Bare grant identifiers/project titles in a note on the article title are
  // dedications; the same project discussion/citation in the body is retained.
  if (frontMatterNote && GRANT_CODE.test(text) && value.split(" ").length <= 90)
    return true;

  const subject =
    /^(?:(?:this|the|our)\s+)?(?:paper|article|contribution|research|study|work|publication)\b/;
  const englishSupport =
    /\b(?:(?:was|is|has been|have been)\s+(?:(?:co|partially|partly|fully|wholly|financially)\s+)*(?:funded|supported|financed)|(?:was|is|has been)\s+(?:prepared|created|written|developed|produced|carried out|conducted)\s+(?:as part of|within|in the framework of|under|with the support of)|(?:is|was)\s+(?:an?\s+)?(?:output|result)\s+of)\b/;
  if (
    subject.test(value) &&
    englishSupport.test(value) &&
    /\b(?:project|projects|grant|grants|agency|council|centre|center|foundation|programme|program|funding|apvv|vega|kega)\b/.test(
      value,
    )
  )
    return true;
  if (
    /^(?:funded|supported|financed)(?: in (?:whole|part))? by\b/.test(value) &&
    /\b(?:project|grant|agency|council|centre|center|foundation|apvv|vega|kega)\b/.test(
      value,
    )
  )
    return true;
  if (
    /^(?:(?:tento|tato|tato vedecka|predlozeny|predkladany)\s+)?(?:prispevok|clanok|studia|praca|vyskum|publikacia)\b/.test(
      value,
    ) &&
    /\b(?:bol|bola|je|vznikol|vznikla|vznikli|boli)\b/.test(value) &&
    /\b(?:v ramci|s podporou|za podpory|podporen|podporena|podporeny|financovan|financovana|financovany|vystupom|vysledkom)\b/.test(
      value,
    ) &&
    /\b(?:projektu|projektov|projekt|grantoveho|grantovych|grantu|agentury|apvv|vega|kega)\b/.test(
      value,
    )
  )
    return true;

  if (
    /^(?:acknowledg(?:e)?ments?|funding(?: statement)?|project dedication|dedication|podakovanie|financovanie|dedikacia)\b/.test(
      value,
    )
  ) {
    const rest = text.replace(
      /^\s*(?:acknowledg(?:e)?ments?|funding(?: statement)?|project dedication|dedication|poďakovanie|financovanie|dedikácia)\s*[:.\-–—]?\s*/i,
      "",
    );
    return (
      rest !== text &&
      !!rest &&
      (projectDedication(rest, false) ||
        (GRANT_CODE.test(rest) && folded(rest).split(" ").length <= 90))
    );
  }

  return false;
}

function frontMatterNotes(doc?: Document): Set<string> {
  const keys = new Set<string>();
  if (!doc) return keys;

  for (const paragraph of paragraphs(doc)
    .filter((p) => textOf(p).trim())
    .slice(0, 12)) {
    if (
      /^(?:abstract|abstrakt|keywords|key words|klucove slova|introduction|uvod)\b/.test(
        folded(textOf(paragraph)),
      )
    )
      break;
    for (const ref of noteReferences(paragraph)) keys.add(noteKey(ref));
  }

  return keys;
}

function removeReference(reference: Element): void {
  const run = reference.parentNode as Element | null;
  remove(reference);
  if (
    run?.namespaceURI === W &&
    run.localName === "r" &&
    /^[\s\d*†‡]*$/.test(textOf(run)) &&
    elements(run).every(
      (e) =>
        e.namespaceURI === W &&
        ["rPr", "rStyle", "vertAlign", "t"].includes(e.localName || ""),
    )
  )
    remove(run);
}

function anonymizeText(
  docs: Map<string, Document>,
  names: string[],
): AnonymizationSummary {
  const summary = {
    authorParagraphs: 0,
    projectParagraphs: 0,
    removedNotes: 0,
  };

  const orphanCandidates = new Set<string>(),
    removeNotes = new Set<string>(),
    titleNotes = frontMatterNotes(docs.get("word/document.xml"));

  const main = docs.get("word/document.xml");

  // Contact blocks must be identified before their standalone name disappears.
  if (main)
    summary.authorParagraphs += removeContactBlock(
      main,
      names,
      orphanCandidates,
    );

  for (const [path, doc] of docs) {
    if (/^word\/(?:document|header\d*|footer\d*)\.xml$/.test(path))
      summary.authorParagraphs += redactNames(
        doc,
        names,
        /\/(?:header|footer)/.test(path),
        orphanCandidates,
      );

    if (path === "word/document.xml")
      for (const paragraph of paragraphs(doc)) {
        if (projectDedication(textOf(paragraph))) {
          clearParagraph(paragraph, orphanCandidates);
          summary.projectParagraphs++;
        }
      }

    if (!/^word\/(?:footnotes|endnotes)\.xml$/.test(path)) continue;

    for (const note of elements(doc).filter(
      (e) =>
        e.namespaceURI === W &&
        /^(?:footnote|endnote)$/.test(e.localName || ""),
    )) {
      const id = note.getAttributeNS(W, "id");
      if (!id || Number(id) <= 0 || note.getAttributeNS(W, "type")) continue;

      const key = noteKey(note),
        all = paragraphs(note).filter((p) => textOf(p).trim());

      if (
        all.length &&
        all.every((paragraph) =>
          projectDedication(textOf(paragraph), titleNotes.has(key)),
        )
      ) {
        summary.projectParagraphs += all.length;
        removeNotes.add(key);
      } else {
        for (const paragraph of all)
          if (projectDedication(textOf(paragraph))) {
            clearParagraph(paragraph, orphanCandidates);
            summary.projectParagraphs++;
          }

        if (all.length && !paragraphs(note).some((p) => textOf(p).trim()))
          removeNotes.add(key);
      }
    }
  }

  const remainingReferences = new Set(
    [...docs.values()].flatMap(noteReferences).map(noteKey),
  );
  for (const key of orphanCandidates)
    if (!remainingReferences.has(key)) removeNotes.add(key);

  for (const doc of docs.values()) {
    for (const reference of noteReferences(doc))
      if (removeNotes.has(noteKey(reference))) removeReference(reference);

    for (const note of elements(doc).filter(
      (e) =>
        e.namespaceURI === W &&
        /^(?:footnote|endnote)$/.test(e.localName || ""),
    )) {
      if (
        removeNotes.has(noteKey(note)) &&
        !note.getAttributeNS(W, "type") &&
        Number(note.getAttributeNS(W, "id")) > 0
      ) {
        remove(note);
        summary.removedNotes++;
      }
    }
  }

  return summary;
}

/** Best-effort working copy only. The caller must keep anonymity unverified. */
export function makeAnonymousDraft(
  bytes: Uint8Array,
  authorNames: string,
  options: { preserveChanges?: boolean } = {},
): { bytes: Uint8Array; warnings: string[]; summary: AnonymizationSummary } {
  const parts = readDocxParts(bytes),
    names = authorVariants(authorNames);

  const xmlParts = Object.entries(parts).filter(([path]) =>
    /\.(?:xml|rels)$/i.test(path),
  );

  if (
    xmlParts.some(([, data]) => data.byteLength > 2 * 1024 * 1024) ||
    xmlParts.reduce((size, [, data]) => size + data.byteLength, 0) >
      4 * 1024 * 1024
  ) {
    throw new Error(
      "XML obsah dokumentu je príliš veľký na automatický návrh. Anonymizujte ho ručne vo Worde.",
    );
  }

  const warnings = new Set<string>([MANUAL]);
  const removed = new Set(Object.keys(parts).filter(isMetadata));
  const docs = new Map<string, Document>();

  for (const [path, data] of Object.entries(parts)) {
    if (
      /^(?:_xmlsignatures|word\/(?:embeddings|activeX))\//i.test(path) ||
      /vbaProject|\.bin$/i.test(path)
    )
      throw new Error(UNSUPPORTED);

    if (/^customXml\/item\d*\.xml$/i.test(path)) {
      const custom = parse(data),
        root = custom.documentElement;

      const emptyBibliography =
        root?.localName === "Sources" &&
        root.namespaceURI ===
          "http://schemas.openxmlformats.org/officeDocument/2006/bibliography" &&
        !elements(root).length;
      const googleMetadata =
        root?.localName === "gDocsCustomXmlDataStorage" &&
        root.namespaceURI === "http://customooxmlschemas.google.com/";
      if (!emptyBibliography && !googleMetadata) throw new Error(UNSUPPORTED);
    }

    if (removed.has(path) || !/\.(?:xml|rels)$/i.test(path)) continue;
    const doc = parse(data);
    docs.set(path, doc);

    for (const node of elements(doc)) {
      if (
        node.namespaceURI === W &&
        /^(?:moveFrom|moveTo|moveFromRangeStart|moveFromRangeEnd|moveToRangeStart|moveToRangeEnd|cellIns|cellDel|cellMerge|numberingChange|conflictIns|conflictDel|dataBinding|altChunk|customXml.*Range.*)$/.test(
          node.localName || "",
        )
      )
        throw new Error(UNSUPPORTED);
      if (
        node.namespaceURI === W &&
        node.localName === "del" &&
        (node.parentNode as Element)?.namespaceURI === W &&
        ["rPr", "pPr", "trPr"].includes(
          (node.parentNode as Element).localName || "",
        )
      )
        throw new Error(UNSUPPORTED);
    }
  }

  // Remove relationship edges along with privacy-related parts. Other external
  // resources cannot be fetched or safely evaluated in this pure helper.
  for (const [path, doc] of docs) {
    if (!path.endsWith(".rels")) continue;
    const source = sourceForRels(path);

    for (const rel of elements(doc).filter(
      (e) => e.localName === "Relationship",
    )) {
      const target = rel.getAttribute("Target") || "",
        type = rel.getAttribute("Type") || "",
        external = rel.getAttribute("TargetMode") === "External";

      if (external) {
        if (
          !type.endsWith("/hyperlink") ||
          !/^(?:https?:|mailto:)/i.test(target)
        )
          throw new Error(UNSUPPORTED);

        if (/^mailto:/i.test(target)) {
          const id = rel.getAttribute("Id");
          remove(rel);
          const sourceDoc = docs.get(source);
          if (sourceDoc)
            for (const link of elements(sourceDoc).filter(
              (e) =>
                e.namespaceURI === W &&
                e.localName === "hyperlink" &&
                e.getAttributeNS(R, "id") === id,
            ))
              unwrap(link);
          warnings.add(
            "E-mailové odkazy boli odpojené; viditeľné kontakty v texte skontrolujte ručne.",
          );
        } else
          warnings.add(
            "Dokument obsahuje webové odkazy; skontrolujte, či neodhaľujú autora alebo jeho úložisko.",
          );

        continue;
      }

      const resolved = resolveTarget(source, target);

      if (
        removed.has(resolved) ||
        isMetadata(resolved) ||
        /\/(?:comments[^/]*|people|core-properties|extended-properties|custom-properties)$/.test(
          type,
        )
      ) {
        removed.add(resolved);
        remove(rel);
      }
    }
  }

  for (const [path, doc] of docs) {
    if (removed.has(path)) continue;

    if (path === "[Content_Types].xml") {
      for (const node of elements(doc))
        if (
          node.localName === "Override" &&
          removed.has((node.getAttribute("PartName") || "").replace(/^\//, ""))
        )
          remove(node);
    }

    for (const node of elements(doc).reverse()) {
      if (node.namespaceURI === W) {
        if (
          [
            "commentRangeStart",
            "commentRangeEnd",
            "commentReference",
            "rsids",
          ].includes(node.localName || "") ||
          (!options.preserveChanges &&
            (["del", "delText", "delInstrText", "trackRevisions"].includes(
              node.localName || "",
            ) ||
              /(?:PrChange|tblGridChange)$/.test(node.localName || "")))
        ) {
          remove(node);
          continue;
        }

        if (!options.preserveChanges && node.localName === "ins") {
          unwrap(node);
          continue;
        }
      }

      for (const attr of Array.from(node.attributes)) {
        if (
          (attr.namespaceURI === W &&
            /^(?:author|initials|date|rsid.*)$/.test(attr.localName || "")) ||
          (/schemas\.microsoft\.com\/office\/word/.test(
            attr.namespaceURI || "",
          ) &&
            /^(?:author|dateUtc|paraId|textId)$/.test(attr.localName || ""))
        )
          node.removeAttributeNode(attr);
      }

      if (
        options.preserveChanges &&
        node.namespaceURI === W &&
        (/^(?:ins|del)$/.test(node.localName || "") ||
          /(?:PrChange|tblGridChange)$/.test(node.localName || ""))
      )
        node.setAttributeNS(W, "w:author", "Author");
    }
  }

  const summary = anonymizeText(docs, names);
  for (const [path, doc] of docs)
    if (!removed.has(path))
      parts[path] = encoder.encode(serialiser.serializeToString(doc));

  for (const path of Object.keys(parts)) {
    if (
      removed.has(path) ||
      (path.endsWith(".rels") && removed.has(sourceForRels(path)))
    )
      delete parts[path];
  }

  if (Object.keys(parts).some((path) => /^word\/media\//.test(path)))
    warnings.add(
      "Obrázky a ich vložené metadáta neboli anonymizované; skontrolujte ich ručne.",
    );
  if (!names.length)
    warnings.add(
      "Nebolo možné rozpoznať celé meno autora; viditeľné mená skontrolujte a odstráňte ručne.",
    );
  warnings.add(
    options.preserveChanges
      ? "Sledované zmeny zostali zachované; mená ich autorov boli nahradené označením Author. Skontrolujte aj odstránený text, ktorý môže prezrádzať autora."
      : "Vložený text bol prijatý a odstránený text vynechaný. Overte, že výsledné znenie zodpovedá poslednej schválenej verzii.",
  );
  return { bytes: writeDocxParts(parts), warnings: [...warnings], summary };
}
