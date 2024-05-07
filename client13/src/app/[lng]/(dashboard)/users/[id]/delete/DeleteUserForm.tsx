"use client";

import { useContext } from "react";
import { UserFragment } from "@/lib/graphql/generated/graphql";
import { useTranslation } from "@/lib/i18n/client";
import { deleteUser } from "../../actions";
import { ActionTypes, MessageContext } from "@/providers/MessageProvider";
import Button from "@/components/Button";
import { useRouter } from "next/navigation";
import { TrashIcon } from "@heroicons/react/24/outline";

export function DeleteUserLink({ id }: { id: string }) {
  const router = useRouter();

  return (
    <button
      className="px-4 py-2 sm:p-0 w-full flex gap-2"
      onClick={() => router.push(`/users/${id}/delete`, { scroll: false })}
    >
      <TrashIcon className="w-5 h-5 text-gray-400" /> Zmazat
    </button>
  );
}

export default function DeleteUserForm({
  user,
  lng,
}: {
  user: UserFragment;
  lng: string;
}) {
  const router = useRouter();

  const { t } = useTranslation(lng, ["profile", "common"]);

  const { dispatch } = useContext(MessageContext);

  return (
    <form
      className="space-y-6 w-full sm:w-96"
      action={async (data) => {
        const state = await deleteUser(null, data);

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
      <h1>Naozaj chcete zmazat pouzivatela {user.name} ?</h1>

      <Button color="primary" type="submit" fluid>
        Potvrdit
      </Button>
    </form>
  );
}
