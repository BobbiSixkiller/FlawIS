"use client";

import Toggle from "@/components/Toggle";
import Icon from "@/components/Icon";
import { setOnlineAttendance } from "./actions";
import { useMessageStore } from "@/stores/messageStore";

export default function OnlineSwitch({
  online,
  id,
  disabled = false,
}: {
  online: boolean;
  id: string;
  disabled?: boolean;
}) {
  const setMessage = useMessageStore((s) => s.setMessage);

  return (
    <Toggle
      disabled={disabled}
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
          <Icon name="computer-desktop" className="size-3" />
        ) : (
          <Icon name="user" className="size-3" />
        )
      }
    />
  );
}
