"use client";

import { MultipleInput } from "@/components/MultipleInput";
import Spinner from "@/components/Spinner";
import useValidation from "@/hooks/useValidation";
import { useTranslation } from "@/lib/i18n/client";
import { yupResolver } from "@hookform/resolvers/yup";
import { useParams } from "next/navigation";
import { FormProvider, useForm } from "react-hook-form";
import { useContext } from "react";
import { ActionTypes, MessageContext } from "@/providers/MessageProvider";
import { FormMessage } from "@/components/Message";
import Button from "@/components/Button";
import { useDialogStore } from "@/stores/dialogStore";
import { sendInvites } from "./actions";

export default function RegistrationInviteForm({
  dialogId,
}: {
  dialogId: string;
}) {
  const { lng } = useParams<{ lng: string }>();
  const { yup } = useValidation();

  const methods = useForm({
    resolver: yupResolver(
      yup.object({
        emails: yup
          .array()
          .of(yup.string().email().required())
          .min(1)
          .required(),
      })
    ),
    defaultValues: { emails: [] },
  });

  const { t } = useTranslation(lng, "common");

  const { dispatch } = useContext(MessageContext);

  const { closeDialog } = useDialogStore();

  return (
    <FormProvider {...methods}>
      <form
        className="space-y-6 mt-4 w-full sm:w-96 mx-auto"
        onSubmit={methods.handleSubmit(
          async (vals) => {
            const res = await sendInvites(vals.emails);

            if (!res.success) {
              dispatch({ type: ActionTypes.SetFormMsg, payload: res });
            }

            if (res.success) {
              dispatch({ type: ActionTypes.SetAppMsg, payload: res });
              closeDialog(dialogId);
            }
          },
          (errs) => {
            console.log(errs);
          }
        )}
      >
        <FormMessage />

        <MultipleInput
          name="emails"
          placeholder="Pre pridanie adresy stlacte Enter..."
        />

        <Button
          className="w-full"
          type="submit"
          size="sm"
          disabled={methods.formState.isSubmitting}
        >
          {methods.formState.isSubmitting ? <Spinner inverted /> : t("confirm")}
        </Button>
      </form>
    </FormProvider>
  );
}
