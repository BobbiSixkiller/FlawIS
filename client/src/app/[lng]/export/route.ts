import { translate } from "@/lib/i18n";
import { NextRequest, NextResponse } from "next/server";
import { getMe } from "../(auth)/actions";
import { csvExportRegistry } from "./util";
import { createCSVResponse, toCSV } from "@/utils/helpers";

export async function GET(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{ lng: string }>;
  }
) {
  const { lng } = await params;
  const { t } = await translate(lng, "export");

  const user = await getMe();
  if (!user) {
    return new NextResponse(t("401"), { status: 401 });
  }

  const url = new URL(request.url);
  const type = url.searchParams.get("type");
  const queryParams = Object.fromEntries(url.searchParams.entries());

  if (!type) {
    return new NextResponse(t("400"), { status: 400 });
  }

  const fetcher = csvExportRegistry[type];
  if (!fetcher) {
    return new NextResponse(t("404", { type }), { status: 404 });
  }

  try {
    const data = await fetcher({ ...queryParams, lng });
    const csv = toCSV(data);
    return createCSVResponse(csv, `${type}-export.csv`);
  } catch (err: any) {
    console.error(err);
    return new NextResponse(err.message || t("500"), { status: 500 });
  }
}
