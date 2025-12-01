"use client";

import Toggle from "@/components/Toggle";
import { ComputerDesktopIcon, UserIcon } from "@heroicons/react/24/outline";

export default function OnlineSwitch({ online }: { online: boolean }) {
  return (
    <Toggle
      size="small"
      defaultChecked={online}
      handleToggle={() => console.log("action")}
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
