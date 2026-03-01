"use client";

import RHFormContainer from "@/components/RHFormContainer";
import useValidation from "@/hooks/useValidation";
import { CategoryFragment } from "@/lib/graphql/generated/graphql";
import { useDialogStore } from "@/stores/dialogStore";
import { useMessageStore } from "@/stores/messageStore";
import { handleAPIErrors } from "@/utils/helpers";
import { Input } from "@/components/Input";
import Button from "@/components/Button";
import Spinner from "@/components/Spinner";
import { createCategoryAction, updateCategoryAction } from "../actions";

export default function CategoryForm({
  dialogId,
  category,
}: {
  dialogId: string;
  category?: CategoryFragment;
}) {
  const { yup } = useValidation();
  const closeDialog = useDialogStore((s) => s.closeDialog);
  const setMessage = useMessageStore((s) => s.setMessage);

  return (
    <RHFormContainer<{ name: string }>
      yupSchema={yup.object({
        name: yup.string().required(),
      })}
      defaultValues={{
        name: category?.name ?? "",
      }}
    >
      {(methods) => (
        <form
          className="space-y-6 max-w-md w-full"
          onSubmit={methods.handleSubmit(async (vals) => {
            let res;
            if (category) {
              res = await updateCategoryAction({
                id: category.id,
                data: { name: vals.name },
              });
            } else {
              res = await createCategoryAction({ data: { name: vals.name } });
            }

            if (res.errors) {
              handleAPIErrors(res.errors, methods.setError);
            }

            setMessage(res.message, res.success);

            if (res.success) {
              closeDialog(dialogId);
            }
          })}
        >
          <Input label="Názov" name="name" />
          <Button
            type="submit"
            disabled={methods.formState.isSubmitting}
            className="w-full"
          >
            {methods.formState.isSubmitting ? (
              <Spinner inverted />
            ) : category ? (
              "Aktualizovať"
            ) : (
              "Vytvoriť"
            )}
          </Button>
        </form>
      )}
    </RHFormContainer>
  );
}
