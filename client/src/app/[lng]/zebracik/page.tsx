import { headers } from "next/headers";

export default async function zebracikP() {
  const headerList = headers();
  console.log(headerList.get("host"));

  return <div>zebracik</div>;
}
