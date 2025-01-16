"use client";

import { Status } from "@/lib/graphql/generated/graphql";
import {
  Fragment,
  ReactNode,
  useContext,
  useState,
  useTransition,
} from "react";
import { changeInternStatus } from "./actions";
import { useParams, useRouter } from "next/navigation";
import { useTranslation } from "@/lib/i18n/client";
import Button, { VariantType } from "@/components/Button";
import Spinner from "@/components/Spinner";
import { ActionTypes, MessageContext } from "@/providers/MessageProvider";
import { FormMessage } from "@/components/Message";
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { CheckIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { ArrowUturnLeftIcon } from "@heroicons/react/20/solid";

type TriggerButtonState = {
  icon: ReactNode;
  variant: VariantType;
};

type TriggerButton = {
  Applied: TriggerButtonState;
  Eligible: TriggerButtonState;
  Accepted: TriggerButtonState;
  Rejected: TriggerButtonState;
};

const triggerButton: TriggerButton = {
  Applied: {
    icon: <ArrowUturnLeftIcon className="size-5" />,
    variant: "ghost",
  },
  Eligible: { icon: <CheckIcon className="size-5" />, variant: "positive" },
  Accepted: { icon: <CheckIcon className="size-5" />, variant: "positive" },
  Rejected: {
    icon: <XMarkIcon className="size-5" />,
    variant: "destructive",
  },
};

export default function ChangeStatusForm({
  status,
  disabled,
}: {
  status: Status;
  disabled: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const { internId: id, lng } = useParams<{ internId: string; lng: string }>();
  const { t } = useTranslation(lng, ["internships", "common"]);
  const [show, setShow] = useState(false);

  const { dispatch } = useContext(MessageContext);

  const handleClick = () =>
    startTransition(async () => {
      const state = await changeInternStatus({ id, status });
      if (!state.success) {
        dispatch({ type: ActionTypes.SetFormMsg, payload: state });
      }

      if (state.success) {
        dispatch({ type: ActionTypes.SetAppMsg, payload: state });
        setShow(false);
      }
    });

  return (
    <div className="flex items-center">
      <Button
        size="icon"
        type="button"
        onClick={() => setShow(true)}
        disabled={disabled}
        variant={triggerButton[status].variant}
      >
        {triggerButton[status].icon}
      </Button>

      <Transition
        appear
        show={show}
        as={Fragment}
        afterLeave={() => setShow(false)}
      >
        <Dialog
          as="div"
          className="fixed z-10 inset-0 overflow-y-auto"
          onClose={() => setShow(false)}
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
              <DialogPanel className="z-20 overflow-hidden w-full max-w-96 rounded-xl ring-1 ring-black/5 bg-white p-6 text-left align-middle shadow-2xl flex flex-col gap-4">
                <div className="flex justify-between">
                  <DialogTitle
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900"
                  >
                    Zmazat autora
                  </DialogTitle>

                  <button
                    onClick={() => setShow(false)}
                    className="hover:text-gray-500 focus:outline-primary-500"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>

                <FormMessage />
                <p>
                  Naozaj si prajete zmenit stav prihlasky na{" "}
                  {t(status.toUpperCase())} ?
                </p>
                <Button
                  className="w-full"
                  type="button"
                  disabled={pending}
                  onClick={handleClick}
                >
                  {pending ? (
                    <Spinner inverted />
                  ) : (
                    t("confirm", { ns: "common" })
                  )}
                </Button>
              </DialogPanel>
            </TransitionChild>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
}
