import { redirect } from "next/navigation";
import { getMe } from "../(auth)/actions";

export default async function HomePage() {
  const user = await getMe();
  if (!user) {
    redirect("/login");
  } else {
    redirect("/conferences");
  }
}
