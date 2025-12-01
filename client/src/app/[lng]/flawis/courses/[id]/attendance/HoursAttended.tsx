"use client";

import useUser from "@/hooks/useUser";
import { Access } from "@/lib/graphql/generated/graphql";
import { useEffect, useState, useTransition } from "react";

export default function HoursAttended({ hours }: { hours: number }) {
  const [value, setValue] = useState(hours.toString());

  const [pending, startTransition] = useTransition();

  useEffect(() => {
    setTimeout(() => startTransition(async () => {}), 1500);
  }, [value]);

  const user = useUser();

  return (
    <div className="w-full flex justify-center gap-1">
      <input
        disabled={!user?.access.includes(Access.Admin)}
        type="number"
        className="border-none text-right p-0 text-sm focus:ring-transparent w-6"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={(e) => {
          if (!e.target.value) {
            setValue("0");
          }
        }}
      />
      h
    </div>
  );
}
