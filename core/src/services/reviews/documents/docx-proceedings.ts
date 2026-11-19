import {
  DOMParser,
  XMLSerializer,
  type Document,
  type Element,
} from "@xmldom/xmldom";
import { readDocxParts, writeDocxParts } from "./docx-package";

const W = "http://schemas.openxmlformats.org/wordprocessingml/2006/main";
const R = "http://schemas.openxmlformats.org/officeDocument/2006/relationships";
const PKG = "http://schemas.openxmlformats.org/package/2006/relationships";
const CT = "http://schemas.openxmlformats.org/package/2006/content-types";
const A = "http://schemas.openxmlformats.org/drawingml/2006/main";
const XMLNS = "http://www.w3.org/2000/xmlns/";
const MIME = "application/vnd.openxmlformats-officedocument.wordprocessingml.";
export const MAX_PROCEEDINGS_SOURCE_BYTES = 20 * 1024 * 1024;
const MAX_EXPANDED = 24 * 1024 * 1024,
  MAX_XML = 6 * 1024 * 1024;

const enc = new TextEncoder(),
  serializer = new XMLSerializer();

type XmlDocument = Document & { documentElement: Element };

const unsupported = (detail = "") =>
  new Error(
    `Dokument obsahuje prvok, ktorý nemožno bezpečne spojiť${detail ? ": " + detail : "."} Uložte čistú verziu vo Worde a skúste to znova.`,
  );
const all = (n: Document | Element): Element[] =>
  Array.from(n.getElementsByTagName("*"));
const direct = (n: Element, name?: string): Element[] =>
  Array.from(n.childNodes).filter(
    (v): v is Element =>
      v.nodeType === 1 && (!name || (v as Element).localName === name),
  );
const get = (n: Element, name: string) => n.getAttributeNS(W, name) || "";

function xml(text: string): XmlDocument {
  if (/<!DOCTYPE|<!ENTITY/i.test(text)) throw unsupported("XML entity");

  try {
    const d = new DOMParser({
      onError: () => {
        throw unsupported("neplatné XML");
      },
    }).parseFromString(text, "application/xml");

    if (!d.documentElement) throw unsupported();
    return d as XmlDocument;
  } catch {
    throw unsupported("neplatné XML");
  }
}

const parse = (b: Uint8Array) =>
  xml(new TextDecoder("utf-8", { fatal: true }).decode(b));
const bytes = (d: Document) => enc.encode(serializer.serializeToString(d));

function root(name: string, ns = W): XmlDocument {
  return xml(`<${name} xmlns="${ns}" xmlns:w="${W}" xmlns:r="${R}"/>`);
}

function wNode(
  d: Document,
  name: string,
  values: Record<string, string> = {},
): Element {
  const n = d.createElementNS(W, "w:" + name);
  for (const [k, v] of Object.entries(values)) n.setAttributeNS(W, "w:" + k, v);
  return n;
}

function child(n: Element, name: string): Element | undefined {
  return direct(n).find((e) => e.namespaceURI === W && e.localName === name);
}

function property(
  n: Element,
  name: string,
  values: Record<string, string> = {},
): Element {
  let p = child(n, name);

  if (!p) {
    p = wNode(n.ownerDocument!, name);
    n.appendChild(p);
  }

  for (const [k, v] of Object.entries(values)) p.setAttributeNS(W, "w:" + k, v);
  return p;
}

function orderChildren(n: Element, names: string[]): void {
  const entries = direct(n);

  entries.sort((a, b) => {
    const x = names.indexOf(a.localName || ""),
      y = names.indexOf(b.localName || "");

    return (x < 0 ? names.length : x) - (y < 0 ? names.length : y);
  });

  for (const e of entries) n.appendChild(e);
}

function targetPath(source: string, target: string): string {
  let path = target.startsWith("/") ? [] : source.split("/").slice(0, -1);

  for (const part of target.split("/")) {
    if (!part || part === ".") continue;

    if (part === "..") {
      if (!path.length) throw unsupported("cesta prílohy");
      path.pop();
    } else path.push(part);
  }

  return path.join("/");
}

const relPath = (source: string) =>
  source.replace(/(^|\/)([^/]+)$/, "$1_rels/$2.rels");
const sourcePath = (rels: string) =>
  rels.replace(/(^|\/)\_rels\//, "$1").replace(/\.rels$/, "");

function relative(from: string, to: string): string {
  const a = from.split("/").slice(0, -1),
    b = to.split("/");

  while (a.length && b.length && a[0] === b[0]) {
    a.shift();
    b.shift();
  }

  return [...a.map(() => ".."), ...b].join("/");
}

function remapFields(doc: Document, names: Map<string, string>): void {
  const rewrite = (s: string) => {
    if (
      /^\s*(?:DDE(?:AUTO)?|INCLUDETEXT|INCLUDEPICTURE|DATABASE|LINK)\b/i.test(s)
    )
      throw unsupported("externé pole");
    return s
      .replace(
        /\b(REF|PAGEREF|NOTEREF)\s+(?:"([^"]+)"|([^\s\\]+))/gi,
        (full, cmd, a, b) =>
          names.has(a || b) ? `${cmd} ${names.get(a || b)}` : full,
      )
      .replace(/\\l\s+"([^"]+)"/g, (full, name) =>
        names.has(name) ? `\\l "${names.get(name)}"` : full,
      );
  };

  const stack: { nodes: Element[]; begin: Element }[] = [];

  const flush = (f: { nodes: Element[]; begin: Element }) => {
    if (!f.nodes.length) return;

    const original = f.nodes.map((n) => n.textContent || "").join(""),
      updated = rewrite(original);

    f.nodes[0].textContent = updated;

    f.nodes.slice(1).forEach((n) => {
      n.textContent = "";
    });

    if (/\b(?:CITATION|BIBLIOGRAPHY)\b/i.test(original))
      f.begin.setAttributeNS(W, "w:fldLock", "true");
    f.nodes = [];
  };

  for (const n of all(doc)) {
    if (n.namespaceURI !== W) continue;

    if (n.localName === "fldSimple") {
      const s = get(n, "instr");
      n.setAttributeNS(W, "w:instr", rewrite(s));
      if (/\b(?:CITATION|BIBLIOGRAPHY)\b/i.test(s))
        n.setAttributeNS(W, "w:fldLock", "true");
    }

    if (n.localName === "fldChar") {
      const type = get(n, "fldCharType");

      if (type === "begin") stack.push({ nodes: [], begin: n });
      else if (type === "separate" && stack.length)
        flush(stack[stack.length - 1]);
      else if (type === "end" && stack.length) flush(stack.pop()!);
    }

    if (n.localName === "instrText" && stack.length)
      stack[stack.length - 1].nodes.push(n);
  }

  stack.forEach(flush);
}

/** OOXML composition, not altChunk. Documents remain editable in Word and LibreOffice. */
export class DocxProceedings {
  private parts: Record<string, Uint8Array> = Object.create(null);
  private main = root("w:document");
  private body: Element;
  private globals = new Map<string, XmlDocument>();
  private relationships = new Map<string, XmlDocument>();
  private types = new Map<string, string>();
  private index = 0;
  private sourceBytes = 0;
  private retainedBytes = 0;
  private expandedXml = 0;
  private notes = { footnote: 1, endnote: 1 };
  private numbers = { num: 1, abstractNum: 1, numPicBullet: 1 };
  private bookmarks = 1;
  private drawings = 1;
  private pending: { body: Element; final: Element } | undefined;
  private bodyChunks: string[] = [];
  private fontNames = new Set<string>();

  constructor() {
    this.body = wNode(this.main, "body");
    this.main.documentElement.appendChild(this.body);

    for (const [part, type] of Object.entries({
      styles: "styles",
      numbering: "numbering",
      footnotes: "footnotes",
      endnotes: "endnotes",
      fontTable: "fontTable",
      settings: "settings",
    })) {
      this.globals.set(`word/${part}.xml`, root("w:" + part));
      this.types.set(`word/${part}.xml`, MIME + type + "+xml");
      this.relation(
        "word/document.xml",
        "global_" + part,
        R + "/" + part,
        `${part}.xml`,
      );
    }

    for (const tag of ["header", "footer"]) {
      const p = `word/merge_blank_${tag}.xml`,
        d = root("w:" + tag);

      d.documentElement.appendChild(wNode(d, "p"));
      this.parts[p] = bytes(d);
      this.types.set(p, MIME + tag + "+xml");
      this.relation(
        "word/document.xml",
        "blank_" + tag,
        R + "/" + tag,
        p.split("/").pop()!,
      );
    }

    for (const tag of ["footnote", "endnote"])
      for (const [id, type] of [
        [-1, "separator"],
        [0, "continuationSeparator"],
      ] as const) {
        const d = this.globals.get(`word/${tag}s.xml`)!,
          n = wNode(d, tag, { id: String(id), type }),
          p = wNode(d, "p"),
          r = wNode(d, "r");

        r.appendChild(wNode(d, type));
        p.appendChild(r);
        n.appendChild(p);
        d.documentElement.appendChild(n);
      }
  }

  private relation(
    part: string,
    id: string,
    type: string,
    target: string,
    external = false,
  ): void {
    let d = this.relationships.get(part);

    if (!d) {
      d = root("Relationships", PKG);
      this.relationships.set(part, d);
    }

    const n = d.createElementNS(PKG, "Relationship");

    for (const [k, v] of Object.entries({
      Id: id,
      Type: type,
      Target: target,
      ...(external ? { TargetMode: "External" } : {}),
    }))
      n.setAttribute(k, v);

    d.documentElement.appendChild(n);
  }

  private appendGlobal(part: string, node: Element): void {
    const d = this.globals.get(part)!;
    d.documentElement.appendChild(d.importNode(node, true));
  }

  private flushBody(last: boolean): void {
    if (!this.pending) return;
    const { body, final } = this.pending,
      doc = body.ownerDocument!;

    if (!last) {
      body.removeChild(final);
      let paragraph = body.lastChild as Element | null;

      if (
        !paragraph ||
        paragraph.nodeType !== 1 ||
        paragraph.namespaceURI !== W ||
        paragraph.localName !== "p" ||
        child(child(paragraph, "pPr") || paragraph, "sectPr")
      ) {
        paragraph = wNode(doc, "p");
        body.appendChild(paragraph);
      }

      let props = child(paragraph, "pPr");

      if (!props) {
        props = wNode(doc, "pPr");
        paragraph.insertBefore(props, paragraph.firstChild);
      }

      props.appendChild(final);
    }

    const serialized = serializer.serializeToString(body),
      chunk = serialized.slice(
        serialized.indexOf(">") + 1,
        serialized.lastIndexOf("</"),
      );

    this.expandedXml += enc.encode(chunk).byteLength;
    if (this.expandedXml > MAX_XML)
      throw new Error(
        "Spojený dokument je príliš veľký. Vyberte menej príspevkov.",
      );
    this.bodyChunks.push(chunk);
    this.pending = undefined;
  }

  add(input: Uint8Array, label: string): void {
    try {
      this.addDocument(input);
    } catch (error) {
      throw new Error(
        `${label}: ${error instanceof Error ? error.message : "Dokument sa nepodarilo spojiť."}`,
      );
    }
  }

  private addDocument(input: Uint8Array): void {
    if ((this.sourceBytes += input.length) > MAX_PROCEEDINGS_SOURCE_BYTES)
      throw new Error(
        "Vybrané Wordy presahujú 20 MiB. Rozdeľte ich do menších celkov.",
      );
    this.flushBody(false);

    const parts = readDocxParts(input),
      documents = new Map<string, XmlDocument>(),
      index = ++this.index,
      prefix = `m${index}_`;

    for (const [path, data] of Object.entries(parts)) {
      if (/^(_xmlsignatures|word\/activeX)\//i.test(path))
        throw unsupported("podpis alebo aktívny objekt");
      if (!/\.(xml|rels)$/i.test(path)) continue;
      const d = parse(data);
      documents.set(path, d);
      if (data.length > 2 * 1024 * 1024)
        throw new Error("XML časť článku je príliš veľká na spojenie.");

      for (const n of all(d)) {
        if (
          n.namespaceURI === W &&
          (/^(ins|del|moveFrom|moveTo|moveFromRangeStart|moveFromRangeEnd|moveToRangeStart|moveToRangeEnd|cellIns|cellDel|cellMerge|conflictIns|conflictDel|comment|commentReference|commentRangeStart|commentRangeEnd|altChunk|object|permStart|permEnd)$/.test(
            n.localName || "",
          ) ||
            /(PrChange|tblGridChange)$/.test(n.localName || ""))
        )
          throw new Error(
            "Finálna verzia obsahuje komentáre, neprijaté sledované zmeny alebo vložený objekt. Nahrajte čistú verziu.",
          );
        if (
          n.namespaceURI === W &&
          n.localName === "documentProtection" &&
          ["true", "1", "on"].includes(get(n, "enforcement"))
        )
          throw unsupported("ochrana dokumentu");
      }
    }

    const main = documents.get("word/document.xml");
    if (
      !main ||
      main.documentElement.namespaceURI !== W ||
      main.documentElement.localName !== "document"
    )
      throw unsupported("nepodporovaný formát Word Strict");
    const body = child(main.documentElement, "body");
    if (!body) throw unsupported("chýba obsah");

    for (const n of [
      ...Array.from(main.documentElement.attributes),
      ...Array.from(body.attributes),
    ]) {
      if (n.namespaceURI !== XMLNS || n.localName === "xmlns") continue;
      const existing = this.main.documentElement.getAttribute(n.name);
      if (existing && existing !== n.value)
        throw unsupported("kolízia XML priestorov");
      this.main.documentElement.setAttributeNS(XMLNS, n.name, n.value);
    }

    const mc = "http://schemas.openxmlformats.org/markup-compatibility/2006",
      ignorable = main.documentElement.getAttributeNS(mc, "Ignorable");

    if (ignorable) {
      this.main.documentElement.setAttributeNS(XMLNS, "xmlns:mc", mc);
      this.main.documentElement.setAttributeNS(
        mc,
        "mc:Ignorable",
        Array.from(
          new Set(
            (
              (this.main.documentElement.getAttributeNS(mc, "Ignorable") ||
                "") +
              " " +
              ignorable
            )
              .trim()
              .split(/\s+/),
          ),
        ).join(" "),
      );
    }

    const sourceTypes = documents.get("[Content_Types].xml");
    if (!sourceTypes) throw unsupported("chýbajú typy súborov");
    const overrides = new Map(
      direct(sourceTypes.documentElement, "Override").map((n) => [
        (n.getAttribute("PartName") || "").replace(/^\//, ""),
        n.getAttribute("ContentType") || "",
      ]),
    );
    const defaults = new Map(
      direct(sourceTypes.documentElement, "Default").map((n) => [
        (n.getAttribute("Extension") || "").toLowerCase(),
        n.getAttribute("ContentType") || "",
      ]),
    );
    const contentType = (path: string) =>
      overrides.get(path) ||
      defaults.get(path.split(".").pop()!.toLowerCase()) ||
      "application/octet-stream";
    const combined = new Set(["word/document.xml", ...this.globals.keys()]);
    const ignored = (p: string) =>
      p === "[Content_Types].xml" ||
      p === "_rels/.rels" ||
      /^docProps\//i.test(p) ||
      /^word\/(comments[^/]*|people)\.xml$/i.test(p);
    const paths = new Map<string, string>();
    for (const path of Object.keys(parts))
      if (!ignored(path) && !path.endsWith(".rels"))
        paths.set(
          path,
          combined.has(path) ? path : `word/merged/${index}/${path}`,
        );
    const relationMaps = new Map<string, Map<string, string>>();

    for (const [path, d] of documents) {
      if (!path.endsWith(".rels") || path === "_rels/.rels") continue;

      const source = sourcePath(path),
        destination = paths.get(source);

      if (!destination) continue;
      const map = new Map<string, string>();
      relationMaps.set(source, map);

      for (const n of direct(d.documentElement, "Relationship")) {
        const id = n.getAttribute("Id") || "",
          type = n.getAttribute("Type") || "",
          target = n.getAttribute("Target") || "";
        if (!id || map.has(id)) throw unsupported("vzťahy súborov");
        if (/\/(attachedTemplate|comments[^/]*|people)$/.test(type)) continue;
        const external = n.getAttribute("TargetMode") === "External";
        if (
          external &&
          (!type.endsWith("/hyperlink") || !/^https?:|^mailto:/i.test(target))
        )
          throw unsupported("externá príloha");

        const [targetName, fragment] = target.split("#"),
          resolved = external ? "" : targetPath(source, targetName),
          mapped = paths.get(resolved);

        if (!external && !mapped) throw unsupported("chýbajúca príloha");
        const globalName = resolved
          .replace(/^word\//, "")
          .replace(/\.xml$/, "");

        if (
          !external &&
          this.globals.has(resolved) &&
          type === R + "/" + globalName &&
          source === "word/document.xml"
        ) {
          map.set(id, "global_" + globalName);
          continue;
        }

        const newId = prefix + id;
        map.set(id, newId);
        this.relation(
          destination,
          newId,
          type,
          external
            ? target
            : relative(destination, mapped!) + (fragment ? "#" + fragment : ""),
          external,
        );
      }
    }

    const styleDoc = documents.get("word/styles.xml");
    const styles = styleDoc ? direct(styleDoc.documentElement, "style") : [];
    const styleMap = new Map(
      styles.map((n) => [get(n, "styleId"), prefix + get(n, "styleId")]),
    );
    if (
      styleMap.size !== styles.length ||
      styles.some((n) => !get(n, "styleId"))
    )
      throw unsupported("štýly");
    const normal = styles.find(
      (n) =>
        get(n, "type") === "paragraph" &&
        ["true", "1", "on"].includes(get(n, "default")),
    );
    const normalId = normal
      ? styleMap.get(get(normal, "styleId"))!
      : prefix + "DefaultParagraph";
    const baseId = prefix + "SourceDefaults",
      styleTarget = this.globals.get("word/styles.xml")!;

    const base = wNode(styleTarget, "style", {
      type: "paragraph",
      styleId: baseId,
    });

    base.appendChild(
      wNode(styleTarget, "name", { val: prefix + "Source defaults" }),
    );
    const docDefaults =
      styleDoc && child(styleDoc.documentElement, "docDefaults");

    for (const kind of ["pPr", "rPr"]) {
      const source = docDefaults && child(docDefaults, kind + "Default"),
        value = source && child(source, kind);
      if (value) base.appendChild(styleTarget.importNode(value, true));
    }

    if (!normal) {
      base.setAttributeNS(W, "w:styleId", normalId);
      if (index === 1) base.setAttributeNS(W, "w:default", "1");
    }

    const numMaps = {
      num: new Map<string, string>(),
      abstractNum: new Map<string, string>(),
      numPicBullet: new Map<string, string>(),
    };
    const numbering = documents.get("word/numbering.xml");

    if (numbering)
      for (const n of direct(numbering.documentElement))
        if (n.localName && n.localName in numMaps) {
          const kind = n.localName as keyof typeof numMaps,
            id = get(
              n,
              kind === "numPicBullet" ? "numPicBulletId" : kind + "Id",
            );

          if (numMaps[kind].has(id)) throw unsupported("číslovanie");
          numMaps[kind].set(id, String(this.numbers[kind]++));
        }

    const noteMaps = {
      footnote: new Map<string, string>(),
      endnote: new Map<string, string>(),
    };

    for (const kind of ["footnote", "endnote"] as const) {
      const d = documents.get(`word/${kind}s.xml`);

      if (d)
        for (const n of direct(d.documentElement, kind)) {
          const id = get(n, "id");
          if (!/^-?\d+$/.test(id)) throw unsupported("poznámky");

          if (Number(id) > 0) {
            if (noteMaps[kind].has(id)) throw unsupported("poznámky");
            noteMaps[kind].set(id, String(this.notes[kind]++));
          }
        }
    }

    const bookmarkIds = new Map<string, string>(),
      bookmarkNames = new Map<string, string>();

    for (const d of documents.values())
      for (const n of all(d))
        if (n.namespaceURI === W && n.localName === "bookmarkStart") {
          const id = get(n, "id"),
            name = get(n, "name"),
            value = String(this.bookmarks++);

          if (bookmarkIds.has(id) || bookmarkNames.has(name))
            throw unsupported("záložky");
          bookmarkIds.set(id, value);
          bookmarkNames.set(
            name,
            `${prefix}b${value}_${name.replace(/[^A-Za-z0-9_]/g, "").slice(0, 20)}`,
          );
        }

    const theme = documents.get("word/theme/theme1.xml"),
      fonts = new Map<string, string>(),
      colors = new Map<string, string>();

    if (theme)
      for (const n of all(theme)) {
        if (
          n.namespaceURI === A &&
          ["majorFont", "minorFont"].includes(n.localName || "")
        )
          for (const f of direct(n))
            if (f.getAttribute("typeface"))
              fonts.set(
                n.localName!.replace("Font", "") + f.localName,
                f.getAttribute("typeface")!,
              );

        if (
          n.namespaceURI === A &&
          n.parentNode &&
          (n.parentNode as Element).localName === "clrScheme"
        ) {
          const c = direct(n)[0],
            value = c?.getAttribute(
              c.localName === "sysClr" ? "lastClr" : "val",
            );
          if (value) colors.set(n.localName!, value);
        }
      }

    const usedStyles = new Set<string>();

    const transform = (d: Document, part: string) => {
      const rels = relationMaps.get(part);

      for (const n of all(d)) {
        for (const attr of Array.from(n.attributes))
          if (
            attr.namespaceURI === R &&
            ["id", "embed", "link"].includes(attr.localName || "")
          ) {
            const value = rels?.get(attr.value);
            if (!value) throw unsupported("neplatný odkaz na prílohu");
            n.setAttributeNS(R, attr.name, value);
          }

        if (n.namespaceURI === W) {
          const local = n.localName || "";

          if (
            [
              "pStyle",
              "rStyle",
              "tblStyle",
              "basedOn",
              "next",
              "link",
              "numStyleLink",
              "styleLink",
            ].includes(local)
          ) {
            const id = get(n, "val");

            if (styleMap.has(id)) {
              usedStyles.add(id);
              n.setAttributeNS(W, "w:val", styleMap.get(id)!);
            } else if (["pStyle", "rStyle", "tblStyle"].includes(local))
              throw unsupported("chýbajúci štýl");
          }

          if (local === "style") {
            const old = get(n, "styleId");
            if (styleMap.has(old))
              n.setAttributeNS(W, "w:styleId", styleMap.get(old)!);
            if (index !== 1) n.removeAttributeNS(W, "default");
            const name = child(n, "name");
            if (name && !get(name, "val").startsWith(prefix))
              name.setAttributeNS(W, "w:val", prefix + get(name, "val"));
          }

          for (const [kind, map] of Object.entries(numMaps)) {
            const attribute =
              local === kind
                ? kind === "numPicBullet"
                  ? "numPicBulletId"
                  : kind + "Id"
                : local === kind + "Id" ||
                    (local === "lvlPicBulletId" && kind === "numPicBullet")
                  ? "val"
                  : undefined;

            if (attribute) {
              const old = get(n, attribute);

              if (map.has(old))
                n.setAttributeNS(W, "w:" + attribute, map.get(old)!);
              else if (old !== "0") throw unsupported("chýbajúce číslovanie");
            }
          }

          if (local === "nsid" || local === "tmpl")
            n.setAttributeNS(
              W,
              "w:val",
              (index * 100000 + this.numbers.abstractNum++)
                .toString(16)
                .padStart(8, "0"),
            );

          for (const kind of ["footnote", "endnote"] as const)
            if (local === kind || local === kind + "Reference") {
              const old = get(n, "id");

              if (Number(old) > 0) {
                const mapped = noteMaps[kind].get(old);
                if (!mapped) throw unsupported("chýbajúca poznámka");
                n.setAttributeNS(W, "w:id", mapped);
              }
            }

          if (local === "bookmarkStart" || local === "bookmarkEnd") {
            const value = bookmarkIds.get(get(n, "id"));
            if (!value) throw unsupported("neplatná záložka");
            n.setAttributeNS(W, "w:id", value);
            if (local === "bookmarkStart")
              n.setAttributeNS(W, "w:name", bookmarkNames.get(get(n, "name"))!);
          }

          if (local === "hyperlink" && get(n, "anchor")) {
            const value = bookmarkNames.get(get(n, "anchor"));
            if (value) n.setAttributeNS(W, "w:anchor", value);
          }

          if (
            local === "id" &&
            (n.parentNode as Element)?.localName === "sdtPr"
          )
            n.setAttributeNS(W, "w:val", String(this.drawings++));

          if (local === "rFonts")
            for (const key of ["ascii", "hAnsi", "eastAsia", "cs"]) {
              const attr = key === "cs" ? "cstheme" : key + "Theme",
                value = get(n, attr);

              if (!value) continue;

              const major = value.startsWith("major") ? "major" : "minor",
                name = fonts.get(
                  major +
                    (key === "eastAsia" ? "ea" : key === "cs" ? "cs" : "latin"),
                );

              if (name) {
                n.setAttributeNS(W, "w:" + key, name);
                n.removeAttributeNS(W, attr);
              }
            }

          for (const [themeAttr, dest] of [
            ["themeColor", "val"],
            ["themeFill", "fill"],
          ] as const) {
            const value = get(n, themeAttr);
            if (!value) continue;
            const alias: Record<string, string> = {
              dark1: "dk1",
              dark2: "dk2",
              light1: "lt1",
              light2: "lt2",
              text1: "dk1",
              text2: "dk2",
              background1: "lt1",
              background2: "lt2",
              hyperlink: "hlink",
              followedHyperlink: "folHlink",
            };
            let color = colors.get(alias[value] || value);

            if (color && /^[0-9A-F]{6}$/i.test(color)) {
              const stem = themeAttr === "themeFill" ? "themeFill" : "theme",
                tint = get(n, stem === "theme" ? "themeTint" : "themeFillTint"),
                shade = get(
                  n,
                  stem === "theme" ? "themeShade" : "themeFillShade",
                );

              color = color
                .match(/../g)!
                .map((c) => {
                  let v = parseInt(c, 16);
                  if (shade) v *= parseInt(shade, 16) / 255;
                  if (tint) v += ((255 - v) * parseInt(tint, 16)) / 255;
                  return Math.round(v).toString(16).padStart(2, "0");
                })
                .join("")
                .toUpperCase();
              n.setAttributeNS(W, "w:" + dest, color);
              for (const attr of [
                themeAttr,
                stem === "theme" ? "themeTint" : "themeFillTint",
                stem === "theme" ? "themeShade" : "themeFillShade",
              ])
                n.removeAttributeNS(W, attr);
            }
          }
        }

        if (
          n.namespaceURI ===
            "http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing" &&
          n.localName === "docPr"
        )
          n.setAttribute("id", String(this.drawings++));

        if (n.namespaceURI === "urn:schemas-microsoft-com:vml") {
          if (n.getAttribute("id"))
            n.setAttribute("id", prefix + n.getAttribute("id"));
          if ((n.getAttribute("type") || "").startsWith("#"))
            n.setAttribute(
              "type",
              "#" + prefix + n.getAttribute("type")!.slice(1),
            );
        }

        for (const attr of Array.from(n.attributes))
          if (
            attr.namespaceURI === "urn:schemas-microsoft-com:office:office" &&
            attr.localName === "spid"
          )
            n.setAttributeNS(attr.namespaceURI, attr.name, prefix + attr.value);
      }

      remapFields(d, bookmarkNames);
    };

    // Only styles actually used by content and their dependency graph are copied.
    for (const [path, d] of documents)
      if (
        path !== "word/styles.xml" &&
        !path.endsWith(".rels") &&
        !ignored(path)
      )
        transform(d, path);

    if (normal) usedStyles.add(get(normal, "styleId"));
    const styleById = new Map(styles.map((n) => [get(n, "styleId"), n]));

    const dependencies = (id: string) => {
      const n = styleById.get(id);
      if (!n) return;

      for (const e of all(n))
        if (
          ["basedOn", "next", "link", "pStyle", "rStyle", "tblStyle"].includes(
            e.localName || "",
          )
        ) {
          const ref = get(e, "val");

          if (styleById.has(ref) && !usedStyles.has(ref)) {
            usedStyles.add(ref);
            dependencies(ref);
          }
        }
    };

    Array.from(usedStyles).forEach(dependencies);
    const selectedStyles = new Set(usedStyles);
    if (styleDoc) transform(styleDoc, "word/styles.xml");

    // Source docDefaults are applied as a per-article base, so Normal style IDs
    // and theme-font collisions cannot silently reformat later articles.
    const baseDoc = root("w:styles");

    baseDoc.documentElement.appendChild(baseDoc.importNode(base, true));
    transform(baseDoc, "word/styles.xml");
    this.appendGlobal("word/styles.xml", direct(baseDoc.documentElement)[0]);

    for (const original of selectedStyles) {
      const style = styles.find(
        (n) => get(n, "styleId") === styleMap.get(original),
      );
      if (!style) continue;

      if (get(style, "type") === "paragraph" && !child(style, "basedOn"))
        style.insertBefore(
          wNode(style.ownerDocument!, "basedOn", {
            val: normal ? baseId : normalId,
          }),
          child(style, "pPr") || child(style, "rPr") || null,
        );

      orderChildren(style, [
        "name",
        "aliases",
        "basedOn",
        "next",
        "link",
        "autoRedefine",
        "hidden",
        "uiPriority",
        "semiHidden",
        "unhideWhenUsed",
        "qFormat",
        "locked",
        "personal",
        "personalCompose",
        "personalReply",
        "rsid",
        "pPr",
        "rPr",
        "tblPr",
        "trPr",
        "tcPr",
        "tblStylePr",
      ]);
      this.appendGlobal("word/styles.xml", style);
    }

    for (const [path, d] of documents)
      if (
        !path.endsWith(".rels") &&
        !ignored(path) &&
        path !== "word/styles.xml"
      )
        for (const p of all(d).filter(
          (n) => n.namespaceURI === W && n.localName === "p",
        )) {
          let props = child(p, "pPr");

          if (!props) {
            props = wNode(d, "pPr");
            p.insertBefore(props, p.firstChild);
          }

          if (!child(props, "pStyle"))
            props.insertBefore(
              wNode(d, "pStyle", { val: normalId }),
              props.firstChild,
            );
        }

    if (numbering)
      for (const n of direct(numbering.documentElement))
        if (["abstractNum", "num", "numPicBullet"].includes(n.localName || ""))
          this.appendGlobal("word/numbering.xml", n);

    for (const kind of ["footnote", "endnote"] as const) {
      const d = documents.get(`word/${kind}s.xml`);
      if (d)
        for (const n of direct(d.documentElement, kind))
          if (Number(get(n, "id")) > 0)
            this.appendGlobal(`word/${kind}s.xml`, n);
    }

    const fontTable = documents.get("word/fontTable.xml");

    if (fontTable)
      for (const n of direct(fontTable.documentElement, "font")) {
        const name = get(n, "name");

        if (!this.fontNames.has(name)) {
          this.fontNames.add(name);
          this.appendGlobal("word/fontTable.xml", n);
        }
      }

    const settings = documents.get("word/settings.xml");

    if (index === 1 && settings) {
      const d = this.globals.get("word/settings.xml")!;
      for (const n of direct(settings.documentElement))
        if (
          ![
            "attachedTemplate",
            "trackRevisions",
            "rsids",
            "evenAndOddHeaders",
            "updateFields",
            "footnotePr",
            "endnotePr",
          ].includes(n.localName || "")
        )
          d.documentElement.appendChild(d.importNode(n, true));
    }

    const even =
      !!settings && !!child(settings.documentElement, "evenAndOddHeaders");
    const effective = {
      header: {
        default: "blank_header",
        even: "blank_header",
        first: "blank_header",
      },
      footer: {
        default: "blank_footer",
        even: "blank_footer",
        first: "blank_footer",
      },
    };
    const sections = all(main).filter(
      (n) => n.namespaceURI === W && n.localName === "sectPr",
    );
    const final =
      direct(body).find(
        (n) => n.namespaceURI === W && n.localName === "sectPr",
      ) || wNode(main, "sectPr");
    if (!final.parentNode) body.appendChild(final);
    if (!sections.includes(final)) sections.push(final);

    sections.forEach((s, i) => {
      if (i === 0 && index > 1) property(s, "type", { val: "nextPage" });
      const page = property(s, "pgNumType", { fmt: "decimal" });

      if (index === 1 && i === 0) page.setAttributeNS(W, "w:start", "1");
      else page.removeAttributeNS(W, "start");

      for (const tag of ["header", "footer"] as const) {
        for (const ref of direct(s, tag + "Reference")) {
          const type = get(ref, "type");
          if (type in effective[tag])
            effective[tag][type as "default" | "even" | "first"] =
              ref.getAttributeNS(R, "id")!;
          s.removeChild(ref);
        }

        for (const type of ["default", "even", "first"] as const) {
          const ref = wNode(main, tag + "Reference", { type });
          ref.setAttributeNS(
            R,
            "r:id",
            effective[tag][type === "even" && !even ? "default" : type],
          );
          s.insertBefore(ref, s.firstChild);
        }
      }

      // Restarting is a document setting. Per-section numStart overrides are
      // inconsistently interpreted by Word-compatible renderers (including zero
      // reference marks), so keep one coherent numbering policy for the book.
      for (const kind of ["footnote", "endnote"]) {
        const note = child(s, kind + "Pr");
        if (note) s.removeChild(note);
      }

      orderChildren(s, [
        "headerReference",
        "footerReference",
        "footnotePr",
        "endnotePr",
        "type",
        "pgSz",
        "pgMar",
        "paperSrc",
        "pgBorders",
        "lnNumType",
        "pgNumType",
        "cols",
        "formProt",
        "vAlign",
        "noEndnote",
        "titlePg",
        "textDirection",
        "bidi",
        "rtlGutter",
        "docGrid",
        "printerSettings",
        "sectPrChange",
      ]);
    });

    this.pending = { body, final };

    for (const [path, data] of Object.entries(parts)) {
      const destination = paths.get(path);
      if (!destination || combined.has(path) || path.endsWith(".rels"))
        continue;

      const d = documents.get(path),
        out = d ? bytes(d) : data;

      this.parts[destination] = out;
      this.types.set(destination, contentType(path));
      this.retainedBytes += out.byteLength;
      if (d) this.expandedXml += out.byteLength;
    }

    if (this.retainedBytes > MAX_EXPANDED || this.expandedXml > MAX_XML)
      throw new Error(
        "Spojený dokument je príliš veľký. Vyberte menej príspevkov.",
      );
  }

  finish(): Uint8Array {
    if (!this.index) throw new Error("Vyberte aspoň jeden finálny Word.");
    this.flushBody(true);
    const main = serializer
      .serializeToString(this.main)
      .replace(
        /<w:body\s*\/>/,
        () => "<w:body>" + this.bodyChunks.join("") + "</w:body>",
      );
    this.parts["word/document.xml"] = enc.encode(main);
    this.types.set("word/document.xml", MIME + "document.main+xml");
    const settings = this.globals.get("word/settings.xml")!;
    property(settings.documentElement, "evenAndOddHeaders");
    property(settings.documentElement, "updateFields", { val: "true" });

    for (const kind of ["footnote", "endnote"]) {
      const note = property(settings.documentElement, kind + "Pr");
      if (kind === "endnote") property(note, "pos", { val: "sectEnd" });
      property(note, "numFmt", { val: "decimal" });
      property(note, "numStart", { val: "1" });
      property(note, "numRestart", { val: "eachSect" });
      for (const id of ["-1", "0"])
        note.appendChild(wNode(settings, kind, { id }));
    }

    for (const [path, d] of this.globals) {
      // Numbering child order matters in strict OOXML consumers.
      if (path === "word/numbering.xml") {
        const order = ["numPicBullet", "abstractNum", "num"];
        for (const name of order)
          for (const n of direct(d.documentElement, name))
            d.documentElement.appendChild(n);
      }

      this.parts[path] = bytes(d);
    }

    for (const [path, d] of this.relationships)
      this.parts[relPath(path)] = bytes(d);

    const rel = root("Relationships", PKG),
      r = rel.createElementNS(PKG, "Relationship");

    r.setAttribute("Id", "main");
    r.setAttribute("Type", R + "/officeDocument");
    r.setAttribute("Target", "word/document.xml");
    rel.documentElement.appendChild(r);
    this.parts["_rels/.rels"] = bytes(rel);
    const types = root("Types", CT);

    for (const [extension, type] of [
      ["rels", "application/vnd.openxmlformats-package.relationships+xml"],
      ["xml", "application/xml"],
    ]) {
      const n = types.createElementNS(CT, "Default");
      n.setAttribute("Extension", extension);
      n.setAttribute("ContentType", type);
      types.documentElement.appendChild(n);
    }

    for (const [path, type] of this.types) {
      const n = types.createElementNS(CT, "Override");
      n.setAttribute("PartName", "/" + path);
      n.setAttribute("ContentType", type);
      types.documentElement.appendChild(n);
    }

    this.parts["[Content_Types].xml"] = bytes(types);

    const total = Object.values(this.parts).reduce(
        (sum, p) => sum + p.byteLength,
        0,
      ),
      xmlSize = Object.entries(this.parts)
        .filter(([p]) => /\.(xml|rels)$/.test(p))
        .reduce((sum, [, p]) => sum + p.byteLength, 0);

    if (total > MAX_EXPANDED || xmlSize > MAX_XML)
      throw new Error(
        "Spojený dokument je príliš veľký. Vyberte menej príspevkov.",
      );
    return writeDocxParts(this.parts);
  }
}
