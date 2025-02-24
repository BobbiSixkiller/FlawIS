"use client";

import { useTranslation } from "@/lib/i18n/client";
import { ActionTypes, MessageContext } from "@/providers/MessageProvider";
import { Transition } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useParams } from "next/navigation";
import { Fragment, useContext } from "react";
import { setTimeout } from "timers";

export function FormMessage() {
  const { lng } = useParams<{ lng: string }>();
  const { t } = useTranslation(lng, "common");
  const { formMessage, dispatch } = useContext(MessageContext);

  return (
    <Transition
      appear
      show={formMessage.visible}
      as={Fragment}
      enter="ease-out duration-300"
      enterFrom="opacity-0"
      enterTo="opacity-100"
      leave="ease-in duration-200"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
      afterEnter={() =>
        setTimeout(() => dispatch({ type: ActionTypes.ClearFormMsg }), 3000)
      }
    >
      <div
        className={`flex flex-col gap-1 p-3 rounded-lg border ${
          formMessage.success
            ? "border-green-500 text-green-500 bg-green-200"
            : "border-red-500 text-red-500 bg-red-200"
        }`}
      >
        <div className="relative h-6">
          <h2 className="font-bold absolute mr-auto ml-auto inset-x-0">
            {formMessage.success ? t("success") : t("error")}
          </h2>
          <button
            type="button"
            className={`absolute right-0 align-text-bottom ${
              formMessage.success
                ? "hover:text-green-700"
                : "hover:text-red-700"
            }`}
            onClick={() => dispatch({ type: ActionTypes.ClearFormMsg })}
          >
            <span className="sr-only">Hide message</span>
            <XMarkIcon className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {formMessage.content}
      </div>
    </Transition>
  );
}

export function AppMessage({ lng }: { lng: string }) {
  const { t } = useTranslation(lng, "common");
  const { appMessage, dispatch } = useContext(MessageContext);

  return (
    <Transition
      appear
      show={appMessage.visible}
      as={Fragment}
      enter="ease-out duration-300"
      enterFrom="translate-y-full"
      enterTo="translate-y-0"
      leave="ease-in duration-200"
      leaveFrom="translate-y-0"
      leaveTo="translate-y-full"
      afterEnter={() =>
        setTimeout(() => dispatch({ type: ActionTypes.ClearAppMsg }), 3000)
      }
    >
      <div
        className={`
           fixed h-fit z-20 inset-x-0 bottom-0 text-center flex flex-col gap-1 p-3 border-t ${
             appMessage.success
               ? "border-green-500 text-green-500 bg-green-200"
               : "border-red-500 text-red-500 bg-red-200"
           }
           `}
      >
        <div className="relative h-6">
          <h2 className="font-bold absolute mr-auto ml-auto inset-x-0">
            {appMessage.success ? t("success") : t("error")}
          </h2>
          <button
            type="button"
            className={`absolute right-0 align-text-bottom  ${
              appMessage.success ? "hover:text-green-700" : "hover:text-red-700"
            }`}
            onClick={() => dispatch({ type: ActionTypes.ClearAppMsg })}
          >
            <span className="sr-only">Hide message</span>
            <XMarkIcon className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {appMessage.content}
      </div>
    </Transition>
  );
}
