"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { getMe } from "../(auth)/actions";

export default function MissingResume() {
  const router = useRouter();
  const path = usePathname();

  useEffect(() => {
    async function checkMissing() {
      const user = await getMe();
      if (!user?.cvUrl || !user?.studyProgramme) {
        router.push("/profile/update", { scroll: false });
      }
    }

    checkMissing();
  }, [path]);

  return null;
}
