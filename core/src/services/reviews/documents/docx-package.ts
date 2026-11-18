import { inflateSync, zipSync } from "fflate";
import {
  MAX_ATTACHMENT_BYTES,
  validateAttachment,
} from "./attachment-validation";

export const MAX_DOCX_EXPANDED_BYTES = 32 * 1024 * 1024;
const MAX_XML_BYTES = 8 * 1024 * 1024;
const MAX_ENTRIES = 2048;
export const ZIP_FIXED_MTIME = new Date(1980, 0, 1);

export function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function decodeXml(bytes: Uint8Array): string {
  if (bytes.byteLength > MAX_XML_BYTES)
    throw new Error(
      "XML časť dokumentu je príliš veľká na automatické spracovanie.",
    );
  let text: string;

  try {
    text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    throw new Error(
      "Dokument má nepodporované kódovanie XML. Spracujte ho ručne.",
    );
  }

  if (/<!DOCTYPE|<!ENTITY/i.test(text))
    throw new Error(
      "Dokument obsahuje nepodporované XML entity. Spracujte ho ručne.",
    );
  return text;
}

function crc32(bytes: Uint8Array): number {
  let crc = 0xffffffff;

  for (const byte of bytes) {
    crc ^= byte;
    for (let j = 0; j < 8; j++) crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
  }

  return (crc ^ 0xffffffff) >>> 0;
}

/** Validation is performed before any full entry is inflated. No filesystem use. */
export function readDocxParts(bytes: Uint8Array): Record<string, Uint8Array> {
  validateAttachment("document.docx", bytes);
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);

  const u16 = (offset: number) => view.getUint16(offset, true),
    u32 = (offset: number) => view.getUint32(offset, true);

  let eocd = bytes.length - 22;
  while (
    eocd >= 0 &&
    !(u32(eocd) === 0x06054b50 && eocd + 22 + u16(eocd + 20) === bytes.length)
  )
    eocd--;
  if (eocd < 0) throw new Error("Dokument DOCX je poškodený.");
  const count = u16(eocd + 10);
  if (count > MAX_ENTRIES)
    throw new Error(
      "Dokument má príliš veľa častí na automatické spracovanie.",
    );

  let offset = u32(eocd + 16),
    total = 0;

  const entries: {
    name: string;
    method: number;
    start: number;
    size: number;
    compressed: number;
    crc: number;
  }[] = [];

  for (let i = 0; i < count; i++) {
    const nameLength = u16(offset + 28),
      local = u32(offset + 42);

    const name = new TextDecoder("utf-8", { fatal: true }).decode(
      bytes.subarray(offset + 46, offset + 46 + nameLength),
    );

    const size = u32(offset + 24),
      compressed = u32(offset + 20);

    total += size;

    if (
      total > MAX_DOCX_EXPANDED_BYTES ||
      size > MAX_ATTACHMENT_BYTES ||
      (/\.(xml|rels)$/i.test(name) && size > MAX_XML_BYTES)
    ) {
      throw new Error(
        "Rozbalený dokument je príliš veľký na automatické spracovanie.",
      );
    }

    entries.push({
      name,
      size,
      compressed,
      method: u16(offset + 10),
      crc: u32(offset + 16),
      start: local + 30 + u16(local + 26) + u16(local + 28),
    });

    offset += 46 + nameLength + u16(offset + 30) + u16(offset + 32);
  }

  const parts: Record<string, Uint8Array> = Object.create(null);

  for (const entry of entries) {
    const encoded = bytes.subarray(entry.start, entry.start + entry.compressed);
    let decoded: Uint8Array;

    try {
      decoded =
        entry.method === 0
          ? encoded.slice()
          : inflateSync(encoded, { out: new Uint8Array(entry.size + 1) });
    } catch {
      throw new Error("Komprimovaná časť dokumentu je poškodená.");
    }

    if (decoded.byteLength !== entry.size || crc32(decoded) !== entry.crc)
      throw new Error("Kontrola integrity dokumentu DOCX zlyhala.");
    parts[entry.name] = decoded;
  }

  return parts;
}

/** Stable ordering and timestamps make repeated generation byte-identical. */
export function writeDocxParts(parts: Record<string, Uint8Array>): Uint8Array {
  const ordered: Record<string, Uint8Array> = Object.create(null);
  let size = 0;

  for (const name of Object.keys(parts).sort()) {
    size += parts[name].byteLength;
    if (size > MAX_DOCX_EXPANDED_BYTES)
      throw new Error("Spracovaný dokument je príliš veľký.");
    ordered[name] = parts[name];
  }

  const bytes = zipSync(ordered, { level: 6, mtime: ZIP_FIXED_MTIME });
  validateAttachment("document.docx", bytes);
  return bytes;
}
