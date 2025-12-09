import TopBar from "@/components/TopBar";
import { getMe } from "../(auth)/actions";
import Logo from "@/components/Logo";
import { translate } from "@/lib/i18n";
import { getCourses } from "../flawis/courses/actions";
import CourseList from "../flawis/courses/CourseList";
import LngSwitcher from "@/components/LngSwitcher";
import ThemeToggler from "@/components/ThemeToggler";
import { cookies } from "next/headers";
import Avatar from "@/components/Avatar";
import Button from "@/components/Button";
import Link from "next/link";
import {
  ArrowRightEndOnRectangleIcon,
  ChevronRightIcon,
  HomeIcon,
} from "@heroicons/react/24/outline";
import { cn } from "@/utils/helpers";
import Breadcrumbs from "@/components/Breadcrumbs";

export default async function CoursesPage({
  params,
}: {
  params: Promise<{ lng: string }>;
}) {
  const { lng } = await params;
  const user = await getMe();

  const { t, i18n } = await translate(lng, "dashboard");

  const initialData = await getCourses({ sort: [] });

  await new Promise((res) => setTimeout(() => res(null), 10000));

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold leading-7 text-center">Kurzy</h1>

      <CourseList initialData={initialData} vars={{ sort: [] }} />
    </div>
  );
}
