import { inflateSync } from "fflate";

export const MAX_ATTACHMENT_BYTES = 20 * 1024 * 1024;
const MAX_CONTENT_TYPES_BYTES = 128 * 1024;
const MAX_ZIP_ENTRY_BYTES = 64 * 1024 * 1024;
const MAX_ZIP_TOTAL_BYTES = 128 * 1024 * 1024;
const INVALID_ZIP =
  "Súbor DOCX je poškodený alebo nemá podporovanú štruktúru Word.";
const DOCX_MIME =
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
const WORD_PART =
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml";
const CONTENT_TYPES_NS =
  "http://schemas.openxmlformats.org/package/2006/content-types";

/** The display filename is never used as an object-storage key. */
function safeFilename(input: string): string {
  if (typeof input !== "string") throw new Error("Názov súboru nie je platný.");
  const name = input.normalize("NFC").trim();

  if (
    !name ||
    [...name].length > 200 ||
    /[/\\<>:"|?*\p{Cc}\p{Cf}\p{Cs}]/u.test(name) ||
    name === "." ||
    name === ".." ||
    /[. ]$/.test(name)
  ) {
    throw new Error(
      "Názov súboru nesmie obsahovať cestu, skryté znaky ani viac ako 200 znakov.",
    );
  }

  return name;
}

type ZipEntry = {
  name: string;
  compressed: number;
  size: number;
  method: number;
  crc: number;
  start: number;
  end: number;
};

// Only small, single-disk, non-encrypted ZIP archives are supported. We inspect
// central and local headers before decompressing only [Content_Types].xml.
function zipEntries(bytes: Uint8Array): ZipEntry[] {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const u16 = (offset: number) => view.getUint16(offset, true);
  const u32 = (offset: number) => view.getUint32(offset, true);

  const fail = (): never => {
    throw new Error(INVALID_ZIP);
  };

  if (bytes.length < 22 || u32(0) !== 0x04034b50) fail();
  let eocd = -1;

  for (let i = bytes.length - 22; i >= Math.max(0, bytes.length - 65557); i--) {
    if (u32(i) === 0x06054b50 && i + 22 + u16(i + 20) === bytes.length) {
      eocd = i;
      break;
    }
  }

  if (eocd < 0 || u16(eocd + 4) !== 0 || u16(eocd + 6) !== 0) fail();

  const count = u16(eocd + 10),
    centralSize = u32(eocd + 12),
    centralStart = u32(eocd + 16);

  if (
    !count ||
    count > 10000 ||
    count !== u16(eocd + 8) ||
    centralStart + centralSize !== eocd
  )
    fail();
  let offset = centralStart,
    total = 0;

  const entries: ZipEntry[] = [],
    names = new Set<string>();

  const decoder = new TextDecoder("utf-8", { fatal: true });

  for (let i = 0; i < count; i++) {
    if (offset + 46 > eocd || u32(offset) !== 0x02014b50) fail();

    const flags = u16(offset + 8),
      method = u16(offset + 10),
      crc = u32(offset + 16);

    const compressed = u32(offset + 20),
      size = u32(offset + 24),
      length = u16(offset + 28);

    const next = offset + 46 + length + u16(offset + 30) + u16(offset + 32),
      local = u32(offset + 42);

    if (
      !length ||
      next > eocd ||
      u16(offset + 34) !== 0 ||
      flags & 0x41 ||
      ![0, 8].includes(method)
    )
      fail();
    if (size > MAX_ZIP_ENTRY_BYTES || (total += size) > MAX_ZIP_TOTAL_BYTES)
      throw new Error("Rozbalený obsah DOCX je príliš veľký.");
    if (compressed > bytes.length || (method === 0 && compressed !== size))
      fail();
    const nameBytes = bytes.subarray(offset + 46, offset + 46 + length);
    const name = decoder.decode(nameBytes).normalize("NFC");
    const normalized = name.toLowerCase();
    if (
      names.has(normalized) ||
      /[\\\p{Cc}\p{Cf}]/u.test(name) ||
      name.startsWith("/") ||
      name.split("/").some((p) => p === "." || p === "..") ||
      name.includes(":")
    )
      fail();
    names.add(normalized);
    if (/(^|\/)vbaproject\.bin$/i.test(name))
      throw new Error("Dokument DOCX nesmie obsahovať makrá.");
    if (
      local + 30 > centralStart ||
      u32(local) !== 0x04034b50 ||
      u16(local + 6) !== flags ||
      u16(local + 8) !== method ||
      u16(local + 26) !== length
    )
      fail();
    const start = local + 30 + length + u16(local + 28),
      end = start + compressed;
    if (
      end > centralStart ||
      start > centralStart ||
      !nameBytes.every((b, n) => bytes[local + 30 + n] === b)
    )
      fail();
    if (
      !(flags & 8) &&
      (u32(local + 14) !== crc ||
        u32(local + 18) !== compressed ||
        u32(local + 22) !== size)
    )
      fail();
    entries.push({ name, compressed, size, method, crc, start, end });
    offset = next;
  }

  if (offset !== eocd) fail();
  const sorted = [...entries].sort((a, b) => a.start - b.start);
  for (let i = 1; i < sorted.length; i++)
    if (sorted[i].start < sorted[i - 1].end) fail();
  return entries;
}

function crc32(bytes: Uint8Array): number {
  let crc = 0xffffffff;

  for (const byte of bytes) {
    crc ^= byte;
    for (let j = 0; j < 8; j++) crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
  }

  return (crc ^ 0xffffffff) >>> 0;
}

function readZipPart(bytes: Uint8Array, entry: ZipEntry): Uint8Array {
  const compressed = bytes.subarray(entry.start, entry.end);
  // One extra byte detects a forged uncompressed size without allocating arbitrary output.
  const part =
    entry.method === 0
      ? compressed
      : inflateSync(compressed, { out: new Uint8Array(entry.size + 1) });
  if (part.length !== entry.size || crc32(part) !== entry.crc)
    throw new Error(INVALID_ZIP);
  return part;
}

function validateDocx(
  bytes: Uint8Array,
  inspectMainDocument?: (part: Uint8Array) => void,
): void {
  try {
    const entries = zipEntries(bytes);
    const document = entries.find((e) => e.name === "word/document.xml");
    const types = entries.find((e) => e.name === "[Content_Types].xml");
    if (!document?.size || !document.compressed || !types?.size)
      throw new Error(INVALID_ZIP);
    if (
      types.size > MAX_CONTENT_TYPES_BYTES ||
      types.compressed > MAX_CONTENT_TYPES_BYTES
    )
      throw new Error("Údaje o typoch obsahu DOCX sú príliš veľké.");
    const xmlBytes = readZipPart(bytes, types);
    const xml = new TextDecoder("utf-8", { fatal: true })
      .decode(xmlBytes)
      .replace(/<!--[\s\S]*?-->/g, "");
    if (/<!DOCTYPE|<!ENTITY/i.test(xml)) throw new Error(INVALID_ZIP);
    if (/macroEnabled|vbaProject/i.test(xml))
      throw new Error("Dokument DOCX nesmie obsahovať makrá.");
    const root = xml.match(/<(?:[\w.-]+:)?Types\b([^>]*)>/);
    if (!root || !root[1].includes(CONTENT_TYPES_NS))
      throw new Error(INVALID_ZIP);
    const overrides = xml.match(/<(?:[\w.-]+:)?Override\b[^>]*\/?\s*>/g) || [];

    const wordType = overrides.some((tag) => {
      const attrs: Record<string, string> = {};
      for (const match of tag.matchAll(/([\w:.-]+)\s*=\s*(["'])(.*?)\2/g))
        attrs[match[1]] = match[3];
      return (
        attrs.PartName === "/word/document.xml" &&
        attrs.ContentType === WORD_PART
      );
    });

    if (!wordType) throw new Error(INVALID_ZIP);

    if (inspectMainDocument) {
      if (document.size > 8 * 1024 * 1024)
        throw new Error("Hlavná XML časť dokumentu je príliš veľká.");
      inspectMainDocument(readZipPart(bytes, document));
    }
  } catch (error) {
    if (
      error instanceof Error &&
      [
        INVALID_ZIP,
        "Dokument DOCX nesmie obsahovať makrá.",
        "Rozbalený obsah DOCX je príliš veľký.",
        "Údaje o typoch obsahu DOCX sú príliš veľké.",
      ].includes(error.message)
    )
      throw error;
    throw new Error(INVALID_ZIP);
  }
}

/** File-type checks only; this does not claim antivirus or document sanitising. */
export function validateAttachment(
  filename: string,
  bytes: Uint8Array,
  inspectMainDocument?: (part: Uint8Array) => void,
): { filename: string; mimeType: string } {
  const name = safeFilename(filename);
  if (!(bytes instanceof Uint8Array) || !bytes.byteLength)
    throw new Error("Prázdny súbor nie je možné nahrať.");
  if (bytes.byteLength > MAX_ATTACHMENT_BYTES)
    throw new Error("Súbor môže mať najviac 20 MiB.");
  const extension = name.slice(name.lastIndexOf(".") + 1).toLowerCase();
  if (!["pdf", "doc", "docx"].includes(extension) || !name.includes("."))
    throw new Error("Nahrajte súbor PDF, DOC alebo DOCX.");

  if (extension === "pdf") {
    if (
      bytes.length < 5 ||
      ![0x25, 0x50, 0x44, 0x46, 0x2d].every((byte, i) => bytes[i] === byte)
    )
      throw new Error("Obsah súboru nezodpovedá formátu PDF.");
    return { filename: name, mimeType: "application/pdf" };
  }

  if (extension === "doc") {
    if (
      ![0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1].every(
        (byte, i) => bytes[i] === byte,
      )
    )
      throw new Error("Obsah súboru nezodpovedá formátu DOC.");
    return { filename: name, mimeType: "application/msword" };
  }

  validateDocx(bytes, inspectMainDocument);
  return { filename: name, mimeType: DOCX_MIME };
}
