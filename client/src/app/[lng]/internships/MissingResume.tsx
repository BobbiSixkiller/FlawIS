"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { getMe } from "../(auth)/actions";
import { Access } from "@/lib/graphql/generated/graphql";

export default function MissingResume() {
  const router = useRouter();
  const path = usePathname();

  useEffect(() => {
    async function checkMissing() {
      const user = await getMe();
      if (
        (!user?.cvUrl || !user?.studyProgramme || !user.telephone) &&
        user.verified &&
        user.access.includes(Access.Student)
      ) {
        router.push("/profile/update", { scroll: false });
      }
    }

    checkMissing();
  }, [path]);

  return null;
}
