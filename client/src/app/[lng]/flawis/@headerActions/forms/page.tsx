import { getFormLibrary } from "@/lib/reviews/actions";
import SearchForm from "./search-form";
export default async function FormControls() {
  return <SearchForm forms={await getFormLibrary()} />;
}
