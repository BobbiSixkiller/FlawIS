"use client";

import { getMe } from "@/app/[lng]/(auth)/actions";
import { usePageVisibility } from "@/hooks/usePageVisibility";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";

//implement nextjs intercepting route with modal and move this logic to main page of the dashboard group
export default function SessionPolling() {
  const isPageVisible = usePageVisibility();
  const timerIdRef = useRef<any>(null);
  const [isPollingEnabled, setIsPollingEnabled] = useState(true);
  const router = useRouter();
  const path = usePathname();

  useEffect(() => {
    const pollingCallback = async () => {
      // Your polling logic here
      console.log("Polling...");

      const user = await getMe();

      if (!user) {
        setIsPollingEnabled(false);
        console.log("Polling failed. Stopped polling. Logging out.");
        router.replace(`/logout?url=${encodeURIComponent(path)}`);
      }
    };

    const startPolling = () => {
      pollingCallback(); // To immediately start fetching data
      timerIdRef.current = setInterval(pollingCallback, 1000 * 60 * 60); // Polling every hour
    };

    const stopPolling = () => {
      clearInterval(timerIdRef.current);
    };

    if (isPageVisible && isPollingEnabled) {
      startPolling();
    } else {
      stopPolling();
    }

    return () => {
      stopPolling();
    };
  }, [isPageVisible, isPollingEnabled]);

  return null;
}
