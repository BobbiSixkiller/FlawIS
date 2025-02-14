"use client";

import React, { Fragment, useEffect } from "react";
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/20/solid";
import { useRouter } from "next/navigation";
import { useDialog } from "@/providers/DialogProvider";

interface ModalProps {
  dialogId: string;
  isInterceptingRoute?: boolean;
  title?: string;
  togglerHidden?: boolean;
  children: React.ReactNode;
}

export default function Modal({
  dialogId,
  title,
  children,
  togglerHidden = false,
  isInterceptingRoute = false,
}: ModalProps) {
  const { closeDialog, openDialog, isDialogOpen } = useDialog();

  useEffect(() => {
    if (isInterceptingRoute) {
      openDialog(dialogId);
    }
  }, [dialogId, isInterceptingRoute, openDialog]);

  const router = useRouter();

  function handleClose() {
    if (!togglerHidden) {
      closeDialog(dialogId);
    }
  }

  return (
    <Transition
      appear
      show={isDialogOpen(dialogId)}
      as={Fragment}
      afterLeave={() => {
        if (isInterceptingRoute) {
          router.back();
        }
      }}
    >
      <Dialog
        as="div"
        className="fixed z-10 inset-0 overflow-y-auto"
        onClose={handleClose}
      >
        <TransitionChild
          enter="duration-300 ease-out"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="duration-200 ease-in"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/25" />
        </TransitionChild>

        <div className="flex min-h-full items-center justify-center p-4">
          <TransitionChild
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <DialogPanel className="z-20 w-full sm:w-fit sm:min-w-96 overflow-hidden rounded-xl ring-1 ring-black/5 bg-white dark:bg-gray-900 dark:text-white p-6 text-left align-middle shadow-2xl">
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
              {children}
            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </Transition>
  );
}
