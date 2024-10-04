"use client";

import Button from "@/components/Button";
import { SubmissionFragment } from "@/lib/graphql/generated/graphql";
import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useParams } from "next/navigation";
import { Fragment, useContext, useState, useTransition } from "react";
import { removeAuthor } from "./actions";
import { ActionTypes, MessageContext } from "@/providers/MessageProvider";
import { FormMessage } from "@/components/Message";

export default function RemoveAuthor({
  author,
  submission,
}: {
  submission: SubmissionFragment;
  author: { name: string; email: string; id: string };
}) {
  const { lng, slug, id } = useParams<{
    lng: string;
    slug: string;
    id: string;
  }>();
  const [show, setShow] = useState(false);

  const [pending, startTransition] = useTransition();

  const { dispatch } = useContext(MessageContext);

  function handleClick() {
    startTransition(async () => {
      const { message, success } = await removeAuthor(
        submission.id,
        author.id,
        { slug, id }
      );
      if (!success) {
        dispatch({
          type: ActionTypes.SetFormMsg,
          payload: { message, success },
        });
      }

      if (success) {
        dispatch({
          type: ActionTypes.SetAppMsg,
          payload: { message, success },
        });
        setShow(false);
      }
    });
  }

  return (
    <div className="flex items-center">
      <button
        className="hover:text-primary-500 flex items-center"
        type="button"
        onClick={() => setShow(true)}
      >
        <XMarkIcon className="size-4 stroke-2" />
      </button>

      <Transition.Root
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

          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="z-20 overflow-hidden w-full max-w-96 rounded-xl ring-1 ring-black/5 bg-white p-6 text-left align-middle shadow-2xl flex flex-col gap-4">
                <div className="flex justify-between">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900"
                  >
                    Zmazat autora
                  </Dialog.Title>

                  <button
                    onClick={() => setShow(false)}
                    className="hover:text-gray-500 focus:outline-primary-500"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>

                <div className="">
                  Naozaj chcete zmazat {author.name} ako autora prispevku{" "}
                  {submission.translations[lng as "sk" | "en"].name} ?
                </div>

                <FormMessage lng={lng} />

                <Button
                  color="red"
                  type="button"
                  fluid
                  onClick={handleClick}
                  disabled={pending}
                  loading={pending}
                >
                  Potvrdit
                </Button>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>
    </div>
  );
}