"use client";

import { useParams } from "next/navigation";
import Button from "@/components/Button";
import { createSection, updateSection } from "./actions";
import { LocalizedTextarea } from "@/components/Textarea";
import Spinner from "@/components/Spinner";
import { useDialogStore } from "@/stores/dialogStore";
import { useMessageStore } from "@/stores/messageStore";
import { SectionFragment } from "@/lib/graphql/generated/graphql";
import RHFormContainer from "@/components/RHFormContainer";
import useValidation from "@/hooks/useValidation";

export default function SectionForm({
  conferenceId,
  dialogId,
  section,
}: {
  dialogId: string;
  conferenceId: string;
  section?: SectionFragment;
}) {
  const { lng } = useParams<{ slug: string; lng: string }>();

  const { yup } = useValidation();

  const closeDialog = useDialogStore((s) => s.closeDialog);
  const setMessage = useMessageStore((s) => s.setMessage);

  return (
    <RHFormContainer
      defaultValues={{
        conference: conferenceId,
        translations: section?.translations || {
          sk: { name: "", topic: "" },
          en: { name: "", topic: "" },
        },
      }}
      yupSchema={yup.object({
        conference: yup.string().required(),
        translations: yup.object({
          sk: yup.object({
            name: yup.string().trim().required(),
            topic: yup.string().trim().required(),
          }),
          en: yup.object({
            name: yup.string().trim().required(),
            topic: yup.string().trim().required(),
          }),
        }),
      })}
    >
      {(methods) => (
        <form
          className="space-y-6 min-w-80"
          onSubmit={methods.handleSubmit(async (data) => {
            let res;
            if (section) {
              res = await updateSection({ id: section.id, data });
            } else {
              res = await createSection({ data });
            }

            setMessage(res.message, res.success);

            if (res.success) {
              closeDialog(dialogId);
            }
          })}
        >
          <LocalizedTextarea
            lng={lng}
            label="Nazov sekcie"
            name={`translations.${lng}.name`}
          />
          <LocalizedTextarea
            lng={lng}
            label="Tema sekcie"
            name={`translations.${lng}.topic`}
          />

          <Button
            color="primary"
            type="submit"
            className="w-full"
            disabled={methods.formState.isSubmitting}
          >
            {methods.formState.isSubmitting ? <Spinner inverted /> : "Vytvorit"}
          </Button>
        </form>
      )}
    </RHFormContainer>
  );
}
