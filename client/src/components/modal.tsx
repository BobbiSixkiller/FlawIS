"use client";
import { type ReactNode, Suspense, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { useParams, usePathname, useRouter } from "next/navigation";
import Spinner from "./spinner";
import { useDialogStore } from "@/stores/dialogStore";
import { useTranslation } from "@/lib/i18n/client";
interface ModalProps {
  dialogId: string;
  isInterceptingRoute?: boolean;
  redirect?: string;
  title?: string;
  togglerHidden?: boolean;
  children: ReactNode;
}
export default function Modal({
  dialogId,
  title,
  children,
  togglerHidden = false,
  isInterceptingRoute = false,
}: ModalProps) {
  const router = useRouter();
  const path = usePathname();
  const { lng } = useParams<{ lng: string }>();
  const { t } = useTranslation(lng, "common");
  const returning = useRef(false);
  const isOpen = useDialogStore((s) => s.isDialogOpen(dialogId));
  const openDialog = useDialogStore((s) => s.openDialog);
  const closeDialog = useDialogStore((s) => s.closeDialog);
  useEffect(() => {
    if (isInterceptingRoute) openDialog(dialogId);
    return () => closeDialog(dialogId);
  }, [dialogId, isInterceptingRoute, openDialog, closeDialog, path]);
  return (
    <Dialog
      open={isOpen}
      disablePointerDismissal={togglerHidden}
      onOpenChange={(open) => {
        if (open || togglerHidden) return;
        returning.current = isInterceptingRoute;
        closeDialog(dialogId);
      }}
      onOpenChangeComplete={(open) => {
        if (!open && returning.current) {
          returning.current = false;
          router.back();
        }
      }}
    >
      <DialogContent
        showCloseButton={!togglerHidden}
        className="max-h-[calc(100dvh-2rem)] overflow-y-auto p-6 sm:w-fit sm:min-w-96 sm:max-w-3xl"
      >
        <DialogHeader>
          <DialogTitle className={title ? "pr-8 text-xl" : "sr-only"}>
            {title ?? t("dialog")}
          </DialogTitle>
        </DialogHeader>
        <Suspense fallback={<Spinner className="flex justify-center" />}>
          {children}
        </Suspense>
      </DialogContent>
    </Dialog>
  );
}
