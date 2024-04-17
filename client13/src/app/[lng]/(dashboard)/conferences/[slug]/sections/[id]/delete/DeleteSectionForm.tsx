"use client";

import { useContext } from "react";
import { SectionFragment } from "@/lib/graphql/generated/graphql";
import { useTranslation } from "@/lib/i18n/client";
import { ActionTypes, MessageContext } from "@/providers/MessageProvider";
import Button from "@/components/Button";
import { useParams, useRouter } from "next/navigation";
import { deleteSection } from "../../actions";

export default function DeleteSectionForm({
  section,
  lng,
}: {
  section: SectionFragment;
  lng: string;
}) {
  const router = useRouter();
  const { slug } = useParams();

  const { t } = useTranslation(lng, ["profile", "common"]);

  const { dispatch } = useContext(MessageContext);

  return (
    <form
      className="space-y-6 w-full sm:w-96"
      action={async (data) => {
        const state = await deleteSection(null, data);

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
      <input type="hidden" name="id" value={section.id} />
      <input type="hidden" name="slug" value={slug} />

      <h1>
        Naozaj chcete zmazat sekciu{" "}
        {section?.translations[lng as "sk" | "en"].name} ?
      </h1>

      <Button color="primary" type="submit" fluid>
        Potvrdit
      </Button>
    </form>
  );
}
