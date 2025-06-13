"use client";

import { useTranslation } from "@/lib/i18n/client";
import { useMessageStore } from "@/stores/messageStore";
import { Transition } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useParams, usePathname } from "next/navigation";
import { Fragment, useEffect } from "react";
import { setTimeout } from "timers";

export function FormMessage() {
  const { lng } = useParams<{ lng: string }>();
  const path = usePathname();
  const { t } = useTranslation(lng, "common");

  const message = useMessageStore((s) => s.message);
  const clear = useMessageStore((s) => s.clearMessage);

  useEffect(() => {
    clear();
  }, [path]);

  return (
    <Transition
      appear
      show={message.visible}
      as={Fragment}
      enter="ease-out duration-300"
      enterFrom="opacity-0"
      enterTo="opacity-100"
      leave="ease-in duration-200"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
      afterEnter={() => setTimeout(() => clear(), 3000)}
    >
      <div
        className={`flex flex-col gap-1 p-3 rounded-lg border ${
          message.success
            ? "border-green-500 text-green-500 bg-green-200"
            : "border-red-500 text-red-500 bg-red-200"
        }`}
      >
        <div className="relative h-6">
          <h2 className="font-bold absolute mr-auto ml-auto inset-x-0">
            {message.success ? t("success") : t("error")}
          </h2>
          <button
            type="button"
            className={`absolute right-0 align-text-bottom ${
              message.success ? "hover:text-green-700" : "hover:text-red-700"
            }`}
            onClick={() => clear()}
          >
            <span className="sr-only">Hide message</span>
            <XMarkIcon className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {message.content}
      </div>
    </Transition>
  );
}

export function Snackbar() {
  const { lng } = useParams<{ lng: string }>();
  const path = usePathname();
  const { t } = useTranslation(lng, "common");

  const message = useMessageStore((s) => s.message);
  const clear = useMessageStore((s) => s.clearMessage);

  useEffect(() => {
    clear();
  }, [path]);

  return (
    <Transition
      appear
      show={message.visible}
      as={Fragment}
      enter="ease-out duration-300"
      enterFrom="translate-y-full"
      enterTo="translate-y-0"
      leave="ease-in duration-200"
      leaveFrom="translate-y-0"
      leaveTo="translate-y-full"
      afterEnter={() => setTimeout(() => clear(), 3000)}
    >
      <div
        className={`
           fixed h-fit z-40 inset-x-0 bottom-0 text-center flex flex-col gap-1 p-3 border-t ${
             message.success
               ? "border-green-500 text-green-500 bg-green-200"
               : "border-red-500 text-red-500 bg-red-200"
           }
           `}
      >
        <div className="relative h-6">
          <h2 className="font-bold absolute mr-auto ml-auto inset-x-0">
            {message.success ? t("success") : t("error")}
          </h2>
          <button
            type="button"
            className={`absolute right-0 align-text-bottom  ${
              message.success ? "hover:text-green-700" : "hover:text-red-700"
            }`}
            onClick={() => clear()}
          >
            <span className="sr-only">Hide message</span>
            <XMarkIcon className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {message.content}
      </div>
    </Transition>
  );
}
