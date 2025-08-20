"use client";

import Spinner from "@/components/Spinner";
import useValidation from "@/hooks/useValidation";
import { useTranslation } from "@/lib/i18n/client";
import { useParams } from "next/navigation";
import Button from "@/components/Button";
import { useDialogStore } from "@/stores/dialogStore";
import { sendInvites } from "./actions";
import { useMessageStore } from "@/stores/messageStore";
import RHFormContainer from "@/components/RHFormContainer";
import GenericCombobox from "@/components/GenericCombobox";

export default function RegistrationInviteForm({
  dialogId,
}: {
  dialogId: string;
}) {
  const { lng } = useParams<{ lng: string }>();
  const { yup } = useValidation();

  const { t } = useTranslation(lng, "common");

  const closeDialog = useDialogStore((s) => s.closeDialog);
  const setMessage = useMessageStore((s) => s.setMessage);

  return (
    <RHFormContainer
      defaultValues={{ emails: [] }}
      yupSchema={yup.object({
        emails: yup
          .array()
          .of(yup.string().email().required())
          .min(1)
          .required(),
      })}
    >
      {(methods) => (
        <form
          className="space-y-6 mt-4 w-full sm:w-96 mx-auto"
          onSubmit={methods.handleSubmit(
            async ({ emails }) => {
              const res = await sendInvites({ input: { emails } });

              setMessage(res.message, res.success);

              if (res.errors) {
                for (const [key, value] of Object.entries(res.errors)) {
                  methods.setError(
                    key as keyof (typeof methods)["formState"]["errors"],
                    {
                      message: value,
                    },
                    { shouldFocus: true }
                  );
                }
              }

              if (res.success) {
                closeDialog(dialogId);
              }
            },
            (errs) => {
              console.log(errs);
            }
          )}
        >
          <GenericCombobox<{ id: number; val: string }>
            placeholder="Email adresy organizacii pre staze..."
            control={methods.control}
            name="emails"
            allowCreateNewOptions
            multiple
            lng={lng}
            defaultOptions={[]}
            getOptionLabel={(opt) => opt.val}
            renderOption={(opt, props) => <span>{opt.val}</span>}
            getOptionValue={(opt) => opt?.val}
          />

          <Button
            className="w-full"
            type="submit"
            size="sm"
            disabled={methods.formState.isSubmitting}
          >
            {methods.formState.isSubmitting ? (
              <Spinner inverted />
            ) : (
              t("confirm")
            )}
          </Button>
        </form>
      )}
    </RHFormContainer>
  );
}
