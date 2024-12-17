"use client";

import { useContext } from "react";
import { SectionFragment } from "@/lib/graphql/generated/graphql";
import { useTranslation } from "@/lib/i18n/client";
import { ActionTypes, MessageContext } from "@/providers/MessageProvider";
import Button from "@/components/Button";
import { useParams, useRouter } from "next/navigation";
import { deleteSection } from "../../actions";
import { FormMessage } from "@/components/Message";

export default function DeleteSectionForm({
  section,
  lng,
}: {
  section: SectionFragment;
  lng: string;
}) {
  const router = useRouter();

  const { t } = useTranslation(lng, ["profile", "common"]);

  const { dispatch } = useContext(MessageContext);

  return (
    <form
      className="space-y-6 min-w-80"
      action={async (data) => {
        const state = await deleteSection(null, data);

        if (state.message && !state.success) {
          dispatch({
            type: ActionTypes.SetFormMsg,
            payload: state.message,
          });
        }

        if (state.success) {
          dispatch({
            type: ActionTypes.SetAppMsg,
            payload: state.message,
          });
          router.back();
        }
      }}
    >
      <FormMessage />

      <input type="hidden" name="id" value={section.id} />

      <h1>
        Naozaj chcete zmazat sekciu{" "}
        {section?.translations[lng as "sk" | "en"].name} ?
      </h1>

      <Button color="primary" type="submit" className="w-full">
        Potvrdit
      </Button>
    </form>
  );
}
