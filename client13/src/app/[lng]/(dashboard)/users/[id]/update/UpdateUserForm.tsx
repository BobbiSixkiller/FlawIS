"use client";

import { Role, UserFragment } from "@/lib/graphql/generated/graphql";
import { useTranslation } from "@/lib/i18n/client";
import { useContext, useEffect, useState } from "react";
import { ActionTypes, MessageContext } from "@/providers/MessageProvider";
import { updateUser } from "../../actions";
import { useRouter } from "next/navigation";
import Select from "@/components/Select";
import Button from "@/components/Button";
import { PencilIcon } from "@heroicons/react/24/outline";

export function UpdateUserLink({ id }: { id: string }) {
  const router = useRouter();

  return (
    <button
      className="w-full flex gap-2"
      onClick={() => router.push(`/users/${id}/update`, { scroll: false })}
    >
      <PencilIcon className="w-5 h-5" /> Aktualizovat
    </button>
  );
}

export default function UpdateUserForm({
  lng,
  user,
}: {
  lng: string;
  user: UserFragment;
}) {
  const router = useRouter();
  const { t } = useTranslation(lng, ["profile", "common"]);

  const [email, setEmail] = useState(user.email);
  const [org, setOrg] = useState(user.organization);

  useEffect(() => {
    if (email.includes("uniba")) {
      setOrg("Univerzita Komenského v Bratislave, Právnická fakulta");
    }
  }, [email, lng]);

  const { dispatch } = useContext(MessageContext);

  return (
    <form
      className="space-y-6 w-full sm:w-96"
      action={async (data) => {
        const state = await updateUser(null, data);

        if (state.message && !state.success) {
          dispatch({
            type: ActionTypes.SetFormMsg,
            payload: state,
          });
        }

        if (state.success) {
          dispatch({
            type: ActionTypes.SetAppMsg,
            payload: state,
          });
          router.back();
        }
      }}
    >
      <input type="hidden" name="id" value={user.id} />
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
            defaultValue={user.name}
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
            defaultValue={user.telephone}
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
      <Select
        label={t("role")}
        name="role"
        defaultSelected={user.role}
        options={[
          { name: "Admin", value: Role.Admin },
          { name: "Basic", value: Role.Basic },
        ]}
      />
      <Button color="primary" type="submit" fluid loadingText={t("submitting")}>
        {t("submit")}
      </Button>
    </form>
  );
}
