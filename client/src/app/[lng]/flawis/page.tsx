import { redirect } from "next/navigation";
import { getReviewContext } from "@/lib/reviews/actions";
export default async function HomePage() {
  return redirect(
    (await getReviewContext()).isAdmin ? "/users" : "/conferences",
  );
}
