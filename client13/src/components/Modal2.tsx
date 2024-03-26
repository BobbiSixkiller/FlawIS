"use client";

import React, { Fragment, useContext, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/20/solid";
import { ActionTypes, MessageContext } from "@/providers/MessageProvider";
import { useRouter } from "next/navigation";

interface ModalProps {
  children: React.ReactNode;
  title: string;
  togglerHidden?: boolean;
}

export default function Modal2({
  children,
  title,
  togglerHidden = false,
}: ModalProps) {
  const [show, setShow] = useState(true);
  const router = useRouter();

  const { dispatch, dialogOpen } = useContext(MessageContext);

  return (
    <Transition.Root
      appear
      show={show}
      as={Fragment}
      afterLeave={() => {
        if (dialogOpen) {
          dispatch({ type: ActionTypes.ClearMsg });
        }
        router.back();
      }}
    >
      <Dialog
        as="div"
        className="fixed inset-0 p-4 pt-[25vh] overflow-y-auto"
        onClose={() => setShow(false)}
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

        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0 scale-95"
          enterTo="opacity-100 scale-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100 scale-100"
          leaveTo="opacity-0 scale-95"
        >
          <Dialog.Panel className="w-full max-w-fit mx-auto overflow-hidden rounded-xl ring-1 ring-black/5 bg-white p-6 text-left align-middle shadow-2xl">
            <div className="flex justify-between">
              <Dialog.Title
                as="h3"
                className="text-lg font-medium leading-6 text-gray-900"
              >
                {title}
              </Dialog.Title>
              {!togglerHidden && (
                <button
                  onClick={() => setShow(false)}
                  className="hover:text-gray-500 focus:outline-primary-500"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              )}
            </div>
            <div className="mt-2">{children}</div>
          </Dialog.Panel>
        </Transition.Child>
      </Dialog>
    </Transition.Root>
  );
}
