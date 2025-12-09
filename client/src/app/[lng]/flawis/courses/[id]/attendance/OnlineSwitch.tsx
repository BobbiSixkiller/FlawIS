"use client";

import Toggle from "@/components/Toggle";
import { ComputerDesktopIcon, UserIcon } from "@heroicons/react/24/outline";
import { setOnlineAttendance } from "./actions";
import { useMessageStore } from "@/stores/messageStore";

export default function OnlineSwitch({
  online,
  id,
}: {
  online: boolean;
  id: string;
}) {
  const setMessage = useMessageStore((s) => s.setMessage);

  return (
    <Toggle
      size="small"
      defaultChecked={online}
      handleToggle={async () => {
        const { message, success } = await setOnlineAttendance({
          id,
          online: !online,
        });
        setMessage(message, success);
      }}
      icon={
        online ? (
          <ComputerDesktopIcon className="size-3" />
        ) : (
          <UserIcon className="size-3" />
        )
      }
    />
  );
}
