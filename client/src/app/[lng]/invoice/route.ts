import { renderToBuffer } from "@react-pdf/renderer";
import { InvoiceDoc } from "./InvoiceDoc";

export async function POST(
  request: Request,
  {
    params: { lng },
  }: {
    params: { lng: string };
  }
) {
  const data = await request.json();

  const document = await InvoiceDoc({ data, lng });
  const pdf = await renderToBuffer(document);

  return new Response(pdf, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-disposition": `attachment;filename="myDocument.pdf"`,
    },
  });
}
