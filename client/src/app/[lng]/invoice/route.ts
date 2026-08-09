import {
  InvoiceDocument,
  InvoiceOwnerType,
} from "@/lib/graphql/generated/graphql";
import { invoicePdfHeaders, renderInvoiceToBuffer } from "@/lib/invoice/render";
import { executeGqlFetch } from "@/lib/graphql/actions";

export const runtime = "nodejs";

const objectIdPattern = /^[0-9a-fA-F]{24}$/;

export async function POST(
  request: Request,
  { params }: { params: Promise<{ lng: string }> },
) {
  const { lng } = await params;

  let payload: { attendeeId?: unknown; ownerType?: unknown };
  try {
    payload = await request.json();
  } catch {
    return Response.json({ message: "Invalid JSON body." }, { status: 400 });
  }

  if (
    typeof payload.attendeeId !== "string" ||
    !objectIdPattern.test(payload.attendeeId) ||
    !Object.values(InvoiceOwnerType).includes(
      payload.ownerType as InvoiceOwnerType,
    )
  ) {
    return Response.json(
      { message: "Invalid invoice owner." },
      { status: 400 },
    );
  }

  const { data, errors } = await executeGqlFetch(InvoiceDocument, {
    attendeeId: payload.attendeeId,
    ownerType: payload.ownerType as InvoiceOwnerType,
  });

  if (errors) {
    return Response.json({ message: errors[0].message }, { status: 403 });
  }

  if (!data.invoice) {
    return Response.json({ message: "Invoice not found." }, { status: 404 });
  }

  const pdf = await renderInvoiceToBuffer(data.invoice, lng);

  return new Response(pdf, {
    headers: invoicePdfHeaders(data.invoice),
  });
}
