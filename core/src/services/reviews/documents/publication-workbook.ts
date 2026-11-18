import { strToU8, zipSync } from "fflate";
const XML = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>';
const MAIN = "http://schemas.openxmlformats.org/spreadsheetml/2006/main";
const REL =
  "http://schemas.openxmlformats.org/officeDocument/2006/relationships";
const PACKAGE_REL =
  "http://schemas.openxmlformats.org/package/2006/relationships";

function xml(value: string): string {
  return Array.from(value)
    .map((char) => {
      const n = char.codePointAt(0)!;
      return n === 9 ||
        n === 10 ||
        n === 13 ||
        (n >= 32 && n <= 0xd7ff) ||
        (n >= 0xe000 && n <= 0xfffd) ||
        n >= 0x10000
        ? char
        : "\ufffd";
    })
    .join("")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function safePart(value: string): string {
  return (
    value
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9_-]+/g, "_")
      .replace(/^_+|_+$/g, "")
      .slice(0, 90) || "Autor"
  );
}

function column(index: number): string {
  let value = "";
  for (let n = index + 1; n > 0; n = Math.floor((n - 1) / 26))
    value = String.fromCharCode(65 + ((n - 1) % 26)) + value;
  return value;
}

/** Deliberately excludes internal notes, email bodies, access URLs and storage metadata. */
export function summaryWorkbook(
  headers: string[],
  rows: (string | number)[][],
) {
  const widths = headers.map((_, i) => (i === 2 ? 64 : 28));
  const range = `A1:${column(headers.length - 1)}${rows.length + 1}`;

  const rowXml = [headers, ...rows]
    .map((row, i) => {
      const lines = Math.max(
        ...row.map((value, j) =>
          String(value ?? "")
            .split("\n")
            .reduce(
              (n, line) =>
                n +
                Math.max(
                  1,
                  Math.ceil(line.length / Math.max(8, widths[j] - 3)),
                ),
              0,
            ),
        ),
      );

      const height = i ? Math.min(409, Math.max(60, lines * 15 + 10)) : 42;

      const cells = row
        .map((value, j) => {
          const numeric = typeof value === "number" && Number.isFinite(value);
          const style = !i ? 1 : 2;
          return numeric
            ? `<c r="${column(j)}${i + 1}" s="${style}" t="n"><v>${value}</v></c>`
            : `<c r="${column(j)}${i + 1}" s="${style}" t="inlineStr"><is><t xml:space="preserve">${xml(String(value ?? ""))}</t></is></c>`;
        })
        .join("");

      return `<row r="${i + 1}" ht="${height}" customHeight="1">${cells}</row>`;
    })
    .join("");

  const sheet = `${XML}<worksheet xmlns="${MAIN}"><dimension ref="${range}"/><sheetViews><sheetView workbookViewId="0" showGridLines="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews><sheetFormatPr defaultRowHeight="45"/><cols>${widths.map((w, i) => `<col min="${i + 1}" max="${i + 1}" width="${w}" customWidth="1"/>`).join("")}</cols><sheetData>${rowXml}</sheetData><autoFilter ref="${range}"/><pageMargins left="0.3" right="0.3" top="0.5" bottom="0.5" header="0.2" footer="0.2"/><pageSetup orientation="landscape" paperSize="9" fitToWidth="1" fitToHeight="0"/></worksheet>`;
  return zipSync(
    {
      "[Content_Types].xml": strToU8(
        `${XML}<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/></Types>`,
      ),
      "_rels/.rels": strToU8(
        `${XML}<Relationships xmlns="${PACKAGE_REL}"><Relationship Id="rId1" Type="${REL}/officeDocument" Target="xl/workbook.xml"/></Relationships>`,
      ),
      "xl/workbook.xml": strToU8(
        `${XML}<workbook xmlns="${MAIN}" xmlns:r="${REL}"><bookViews><workbookView activeTab="0"/></bookViews><sheets><sheet name="Vydavateľský súhrn" sheetId="1" r:id="rId1"/></sheets></workbook>`,
      ),
      "xl/_rels/workbook.xml.rels": strToU8(
        `${XML}<Relationships xmlns="${PACKAGE_REL}"><Relationship Id="rId1" Type="${REL}/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="${REL}/styles" Target="styles.xml"/></Relationships>`,
      ),
      "xl/styles.xml": strToU8(
        `${XML}<styleSheet xmlns="${MAIN}"><numFmts count="2"><numFmt numFmtId="164" formatCode="dd.mm.yyyy"/><numFmt numFmtId="165" formatCode="dd.mm.yyyy hh:mm"/></numFmts><fonts count="2"><font><sz val="11"/><color rgb="FF272333"/><name val="Calibri"/></font><font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Calibri"/></font></fonts><fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FF97357C"/><bgColor indexed="64"/></patternFill></fill></fills><borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="5"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1" applyAlignment="1"><alignment vertical="center" wrapText="1"/></xf><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0" applyAlignment="1"><alignment vertical="top" wrapText="1"/></xf><xf numFmtId="164" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1" applyAlignment="1"><alignment vertical="top" wrapText="1"/></xf><xf numFmtId="165" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1" applyAlignment="1"><alignment vertical="top" wrapText="1"/></xf></cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>`,
      ),
      "xl/worksheets/sheet1.xml": strToU8(sheet),
    },
    { level: 6 },
  );
}
