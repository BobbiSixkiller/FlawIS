"use client";

import useUser from "@/hooks/useUser";
import { Access } from "@/lib/graphql/generated/graphql";
import { useEffect, useState, useTransition } from "react";
import { setAttendedHours } from "./actions";
import Spinner from "@/components/Spinner";
import { useMessageStore } from "@/stores/messageStore";
import { useDebouncedCallback } from "use-debounce";

export default function HoursAttended({
  hoursAttended,
  id,
}: {
  hoursAttended: number;
  id: string;
}) {
  const [value, setValue] = useState(hoursAttended.toString());

  const [pending, startTransition] = useTransition();

  const setMessage = useMessageStore((s) => s.setMessage);

  const debounced = useDebouncedCallback((value: string) => {
    startTransition(async () => {
      const { message, success } = await setAttendedHours({
        id,
        hoursAttended: parseFloat(value),
      });
      setMessage(message, success);
    });
  }, 1000);

  useEffect(() => {
    if (value !== hoursAttended.toString() && !!value) {
      debounced(value);
    }
  }, [value, hoursAttended, id, setMessage, debounced]);

  const user = useUser();

  return (
    <div className="w-full flex justify-center items-center gap-1">
      {pending ? (
        <Spinner size="sm" />
      ) : (
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
      )}
      h
    </div>
  );
}
