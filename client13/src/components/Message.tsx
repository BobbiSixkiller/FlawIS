"use client";

import { useTranslation } from "@/lib/i18n/client";
import { ActionTypes, MessageContext } from "@/providers/MessageProvider";
import { Transition } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { Fragment, useContext } from "react";
import { useFormStatus } from "react-dom";

export function DashboardMessage({ lng }: { lng: string }) {
  const { dialogOpen } = useContext(MessageContext);

  if (dialogOpen) {
    return null;
  }

  return <Message lng={lng} />;
}

export function Message({ lng }: { lng: string }) {
  const { t } = useTranslation(lng, "common");
  const { pending } = useFormStatus();
  const { visible, content, positive, dispatch } = useContext(MessageContext);

  return (
    <Transition
      show={visible && !pending}
      as={Fragment}
      enter="ease-out duration-300"
      enterFrom="opacity-0"
      enterTo="opacity-100"
      leave="ease-in duration-200"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
    >
      <div
        className={`flex flex-col gap-1 p-3 rounded-md border ${
          positive
            ? "border-green-500 text-green-500 bg-green-200"
            : "border-red-500 text-red-500 bg-red-200"
        }`}
      >
        <div className="flex justify-between">
          <h2 className="font-bold">{positive ? t("success") : t("error")}</h2>
          <button
            type="button"
            className={`align-text-bottom   ${
              positive ? "hover:text-green-700" : "hover:text-red-700"
            }`}
            onClick={() => dispatch({ type: ActionTypes.ClearMsg })}
          >
            <span className="sr-only">Hide message</span>
            <XMarkIcon className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {content}
      </div>
    </Transition>
  );
}
