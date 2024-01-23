"use client";

import { getMe } from "@/app/[lng]/(auth)/actions";
import { usePageVisibility } from "@/hooks/usePageVisibility";
import { useEffect, useState, useRef } from "react";
import { User } from "@/lib/graphql/generated/graphql";

//implement nextjs intercepting route with modal and move this logic to main page of the dashboard group
export default function LoginDialog({
  lng,
  user,
}: {
  lng: string;
  user?: User;
}) {
  const isPageVisible = usePageVisibility();
  const timerIdRef = useRef<any>(null);
  const [isPollingEnabled, setIsPollingEnabled] = useState(true);

  useEffect(() => {
    const pollingCallback = async () => {
      // Your polling logic here
      console.log("Polling...");

      const user = await getMe();

      if (!user) {
        setIsPollingEnabled(false);
        console.log("Polling failed. Stopped polling. Refresh page.");
        location.reload();
      }
    };

    const startPolling = () => {
      pollingCallback(); // To immediately start fetching data
      timerIdRef.current = setInterval(pollingCallback, 1000 * 60 * 60 * 24); // Polling every day
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
