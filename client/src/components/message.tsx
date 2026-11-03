"use client";
import { useEffect } from "react";
import { useParams } from "next/navigation";
import { useTranslation } from "@/lib/i18n/client";
import { useMessageStore } from "@/stores/messageStore";
import { cn } from "@/lib/utils";
import { Alert, AlertTitle, AlertDescription } from "./ui/alert";
import { Button } from "@/components/ui/button";
import Icon from "./icon";
function Message({ floating = false }: { floating?: boolean }) {
  const { lng } = useParams<{ lng: string }>();
  const { t } = useTranslation(lng, "common");
  const message = useMessageStore((state) => state.message);
  const clear = useMessageStore((state) => state.clearMessage);
  useEffect(() => {
    if (!message.visible) return;
    const timer = window.setTimeout(clear, 5000);
    return () => window.clearTimeout(timer);
  }, [message, clear]);
  if (!message.visible) return null;
  return (
    <Alert
      role={message.success ? "status" : "alert"}
      className={cn(
        "relative border bg-popover pr-12 text-popover-foreground shadow-sm",
        floating &&
          "fixed right-4 bottom-4 z-[100] w-[calc(100%-2rem)] max-w-md shadow-lg",
        message.success ? "border-success/40" : "border-destructive/40",
      )}
    >
      <AlertTitle
        className={message.success ? "text-success" : "text-destructive"}
      >
        {message.success ? t("success") : t("error")}
      </AlertTitle>
      <AlertDescription>{message.content}</AlertDescription>
      <Button
        size="icon-sm"
        variant="ghost"
        className="absolute top-2 right-2"
        aria-label={t("dismiss")}
        onClick={clear}
      >
        <Icon name="x-mark" className="size-4" />
      </Button>
    </Alert>
  );
}
export function FormMessage() {
  return <Message />;
}
export function Snackbar() {
  return <Message floating />;
}
