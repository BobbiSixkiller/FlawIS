"use client";

import { ReactNode, Suspense, useEffect } from "react";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/20/solid";
import { usePathname, useRouter } from "next/navigation";
import Spinner from "./Spinner";
import { useDialogStore } from "@/stores/dialogStore";

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

  const isOpen = useDialogStore((s) => s.isDialogOpen(dialogId));
  const openDialog = useDialogStore((s) => s.openDialog);
  const closeDialog = useDialogStore((s) => s.closeDialog);

  useEffect(() => {
    if (isInterceptingRoute) {
      openDialog(dialogId);
    }

    return () => {
      closeDialog(dialogId);
    };
  }, [dialogId, isInterceptingRoute, openDialog, closeDialog, path]);

  const handleClose = () => {
    if (togglerHidden) {
      return;
    }
    // Blur whatever is currently focused inside the dialog
    const active = document.activeElement as HTMLElement | null;
    if (active && active.blur) active.blur();

    closeDialog(dialogId);
    if (isInterceptingRoute) {
      // Let the route interceptor go back when dialog fully closed
      return setTimeout(() => router.back(), 300);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={handleClose}
      onAnimationEnd={() => console.log("ENDS")}
      className="relative z-50"
    >
      {/* Backdrop with built-in transition */}
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-black/25 data-[closed]:opacity-0 transition-opacity duration-300 ease-out"
      />

      <div className="fixed inset-0 w-screen overflow-y-auto p-4">
        <div className="flex min-h-full items-center justify-center">
          <DialogPanel
            transition
            className="
            w-full sm:w-fit sm:min-w-96
            rounded-xl ring-1 ring-black/5
            bg-white dark:bg-gray-700 dark:text-white
            p-6 text-left align-middle shadow-2xl
            transition duration-300 ease-out data-[closed]:opacity-0 data-[closed]:scale-95
          "
          >
            <div className="flex justify-between mb-6">
              {title && (
                <DialogTitle
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900 dark:text-white"
                >
                  {title}
                </DialogTitle>
              )}

              {!togglerHidden && (
                <button
                  onClick={handleClose}
                  className="hover:text-gray-500 dark:text-gray-300 focus:outline-primary-500"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              )}
            </div>

            <Suspense fallback={<Spinner className="flex justify-center" />}>
              {children}
            </Suspense>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
}
