import Heading from "@/components/Heading";
import CloseButton from "@/components/CloseButton";
import { fetchCategories } from "../actions";
import CategoriesManager from "./CategoriesManager";

export default async function CategoriesPage({
  params,
}: {
  params: Promise<{ lng: string }>;
}) {
  const { lng } = await params;
  const categories = await fetchCategories("");

  return (
    <div className="space-y-6">
      <Heading
        lng={lng}
        heading="Kategórie kurzov"
        subHeading="Správa kategórií kurzov"
        items={[<CloseButton key={0} href="/courses" />]}
      />
      <CategoriesManager initialCategories={categories} />
    </div>
  );
}
