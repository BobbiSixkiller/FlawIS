import { redirect } from "next/navigation";
import { getMe } from "../(auth)/actions";

export default async function Dashboard() {
  const user = await getMe();
  if (user) {
    return redirect("/conferences");
  }
  return redirect("/login");
}
