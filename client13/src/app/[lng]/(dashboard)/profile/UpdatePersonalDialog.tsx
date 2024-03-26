"use client";

import Modal from "@/components/Modal";
import { useContext, useEffect, useState } from "react";
import { UserFragment } from "@/lib/graphql/generated/graphql";
import { useTranslation } from "@/lib/i18n/client";
import Button from "@/components/Button";
import { PencilIcon } from "@heroicons/react/24/outline";
import { useFormState } from "react-dom";
import { updateProfile } from "../../(auth)/actions";
import { ActionTypes, MessageContext } from "@/providers/MessageProvider";
import { Message } from "@/components/Message";

export default function UpdatePersonalDialog({
  user,
  lng,
}: {
  user?: UserFragment;
  lng: string;
}) {
  const [open, setOpen] = useState(false);

  const { t } = useTranslation(lng, ["profile", "common"]);

  const [state, formAction] = useFormState(updateProfile, {
    success: false,
    message: "",
  });

  const [email, setEmail] = useState(user?.email);
  const [org, setOrg] = useState(user?.organization);

  useEffect(() => {
    if (email?.includes("uniba")) {
      setOrg("Univerzita Komenského v Bratislave, Právnická fakulta");
    }
  }, [email, lng]);

  const { dispatch, dialogOpen } = useContext(MessageContext);

  useEffect(() => {
    if (state.message) {
      dispatch({
        type: ActionTypes.SetMsg,
        payload: {
          positive: state.success,
          content: state.message,
          dialogOpen: !state.success,
        },
      });

      if (state.success) {
        setOpen(false);
      }
    }
  }, [state]);

  return (
    <>
      <Button color="primary" type="button" onClick={() => setOpen(true)}>
        <PencilIcon className="mr-2 h-4 w-4" aria-hidden="true" />
        {t("update", { ns: "common" })}
      </Button>
      <Modal
        isOpen={open || false}
        onClose={() => setOpen(false)}
        title={t("heading", { ns: "profile" })}
      >
        <form className="space-y-6" action={formAction}>
          {dialogOpen && <Message lng={lng} />}

          <input type="hidden" name="id" value={user?.id} />
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium leading-6 text-gray-900"
            >
              {t("name")}
            </label>
            <div className="mt-2">
              <input
                id="name"
                name="name"
                defaultValue={user?.name}
                type="text"
                autoComplete="name"
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-500 sm:text-sm sm:leading-6"
                required
              />
            </div>
          </div>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium leading-6 text-gray-900"
            >
              {t("email")}
            </label>
            <div className="mt-2">
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-500 sm:text-sm sm:leading-6"
                required
                defaultValue={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label
              htmlFor="telephone"
              className="block text-sm font-medium leading-6 text-gray-900"
            >
              {t("phone")}
            </label>
            <div className="mt-2">
              <input
                id="telephone"
                name="telephone"
                defaultValue={user?.telephone}
                type="tel"
                autoComplete="tel"
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-500 sm:text-sm sm:leading-6"
                required
              />
            </div>
          </div>
          <div>
            <label
              htmlFor="organization"
              className="block text-sm font-medium leading-6 text-gray-900"
            >
              {t("org")}
            </label>
            <div className="mt-2">
              <input
                onChange={(e) => setOrg(e.target.value)}
                value={org}
                id="organization"
                name="organization"
                type="text"
                autoComplete="organization"
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-500 sm:text-sm sm:leading-6"
                required
              />
            </div>
          </div>

          <Button
            color="primary"
            type="submit"
            fluid
            loadingText={t("submitting")}
          >
            {t("submit")}
          </Button>
        </form>
      </Modal>
    </>
  );
}
