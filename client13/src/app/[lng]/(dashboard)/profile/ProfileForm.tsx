"use client";

import { User } from "@/lib/graphql/generated/graphql";
import { useTranslation } from "@/lib/i18n/client";
import { useEffect, useState } from "react";
import { useFormState } from "react-dom";
import { logout, updateProfile } from "../../(auth)/actions";
import Button from "@/components/Button";
import Message from "@/components/Message";

export default function ProfileForm({
  lng,
  user,
}: {
  lng: string;
  user?: Pick<User, "id" | "name" | "email" | "telephone" | "organisation">;
}) {
  const [state, formAction] = useFormState(updateProfile, {
    success: false,
    message: "",
  });

  const [email, setEmail] = useState(user?.email);
  const [org, setOrg] = useState(user?.organisation);

  useEffect(() => {
    if (email?.includes("uniba")) {
      setOrg(t("flaw"));
    }
  }, [email, lng]);

  const { t } = useTranslation(lng, "profile");

  return (
    <form className="space-y-6" action={formAction}>
      {state.message && (
        <Message success={state.success} message={state.message} />
      )}
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
            defaultValue={user?.organisation}
            onChange={(e) => setOrg(e.target.value)}
            id="organization"
            name="organization"
            type="text"
            autoComplete="organization"
            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-500 sm:text-sm sm:leading-6"
            required
          />
        </div>
      </div>

      <Button type="submit" loadingText={t("submitting")}>
        {t("submit")}
      </Button>
    </form>
  );
}
