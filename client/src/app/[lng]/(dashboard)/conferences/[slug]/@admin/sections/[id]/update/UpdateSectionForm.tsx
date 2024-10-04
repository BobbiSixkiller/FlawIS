"use client";

import { SectionFragment } from "@/lib/graphql/generated/graphql";
import { useTranslation } from "@/lib/i18n/client";
import { ActionTypes, MessageContext } from "@/providers/MessageProvider";
import { yupResolver } from "@hookform/resolvers/yup";
import { useParams, useRouter } from "next/navigation";
import { useContext } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { object, string } from "yup";
import Button from "@/components/Button";
import { updateSection } from "../../actions";
import { LocalizedTextarea } from "@/components/Textarea";

export default function UpdateTicketForm({
  section,
  lng,
}: {
  lng: string;
  section: SectionFragment;
}) {
  const router = useRouter();
  const { slug } = useParams<{ slug: string }>();

  const { dispatch } = useContext(MessageContext);

  const { t } = useTranslation(lng, "validation");

  const methods = useForm({
    resolver: yupResolver(
      object({
        conference: string().required(),
        translations: object({
          sk: object({
            name: string().trim().required(t("required")),
            topic: string().trim().required(t("required")),
          }),
          en: object({
            name: string().trim().required(t("required")),
            topic: string().trim().required(t("required")),
          }),
        }),
      }).required(t("required"))
    ),
    values: {
      conference: section.conference?.id,
      translations: section.translations,
    },
  });

  return (
    <FormProvider {...methods}>
      <form
        className="space-y-6 min-w-80"
        onSubmit={methods.handleSubmit(async (data) => {
          const state = await updateSection(data, section?.id);

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
          fluid
          loading={methods.formState.isSubmitting}
          disabled={methods.formState.isSubmitting}
        >
          Aktualizovat sekciu
        </Button>
      </form>
    </FormProvider>
  );
}
