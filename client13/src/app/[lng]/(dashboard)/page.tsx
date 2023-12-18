import { redirect } from "next/navigation";
import { getMe } from "../(auth)/actions";

export default async function Home() {
  const user = await getMe();
  if (user) {
    redirect("/conferences");
  }
  redirect("/login");
}
