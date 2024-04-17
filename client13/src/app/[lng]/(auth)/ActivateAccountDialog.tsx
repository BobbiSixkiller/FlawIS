"use client";

import {
  Fragment,
  useContext,
  useEffect,
  useState,
  useTransition,
} from "react";
import { UserFragment } from "@/lib/graphql/generated/graphql";
import { useTranslation } from "@/lib/i18n/client";
import Button from "../../../components/Button";
import { activate, resendActivationLink } from "@/app/[lng]/(auth)/actions";
import { ActionTypes, MessageContext } from "@/providers/MessageProvider";
import { Dialog, Transition } from "@headlessui/react";
import { FormMessage } from "../../../components/Message";

export default function ActivateAccountDialog({
  lng,
  user,
}: {
  lng: string;
  user?: UserFragment;
}) {
  const [open, setOpen] = useState((user && !user?.verified) || false);
  const { dispatch } = useContext(MessageContext);

  const { t } = useTranslation(lng, "activateAccount");

  useEffect(() => {
    async function activateCb() {
      const res = await activate();
      if (res) {
        if (res?.message && !res.success) {
          dispatch({
            type: ActionTypes.SetFormMsg,
            payload: res,
          });
        }
        if (res?.message && res.success) {
          dispatch({
            type: ActionTypes.SetAppMsg,
            payload: res,
          });
        }
      }
    }

    activateCb();
  }, []);

  const [isPending, startTransition] = useTransition();

  const onClick = () => {
    startTransition(async () => {
      const { message, success } = await resendActivationLink();
      dispatch({
        type: ActionTypes.SetFormMsg,
        payload: { message, success },
      });
    });
  };

  return (
    <Transition.Root appear show={open} as={Fragment}>
      <Dialog
        as="div"
        className="fixed inset-0 overflow-y-auto z-20"
        onClose={() => setOpen(!user?.verified)}
      >
        <Transition.Child
          enter="duration-300 ease-out"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="duration-200 ease-in"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Dialog.Overlay className="fixed inset-0 bg-black/25" />
        </Transition.Child>

        <div className="flex min-h-full items-center justify-center p-4 text-center">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="w-full max-w-lg mx-auto overflow-hidden rounded-xl ring-1 ring-black/5 bg-white p-6 text-left align-middle shadow-2xl">
              <div className="flex justify-between">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900"
                >
                  {t("heading")}
                </Dialog.Title>
              </div>
              <div className="flex flex-col gap-4">
                {t("body")}
                <Button
                  color="primary"
                  type="button"
                  fluid
                  onClick={onClick}
                  disabled={isPending}
                  loading={isPending}
                >
                  {t("button")}
                </Button>
                <FormMessage lng={lng} />
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
