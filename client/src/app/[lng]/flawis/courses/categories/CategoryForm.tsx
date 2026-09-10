"use client";
import { z } from "zod";

import { FormField } from "@/components/form";
import { inputChange, inputValue } from "@/components/form-values";

import Button from "@/components/Button";
import { FormContainer } from "@/components/form";
import { Input } from "@/components/Input";
import Spinner from "@/components/Spinner";
import useValidation from "@/hooks/useValidation";
import { handleAPIErrors } from "@/lib/utilsClient";
import { CategoryFragment } from "@/lib/graphql/generated/graphql";
import { useDialogStore } from "@/stores/dialogStore";
import { useMessageStore } from "@/stores/messageStore";
import { createCategoryAction, updateCategoryAction } from "../actions";

export default function CategoryForm({
  dialogId,
  category,
}: {
  dialogId: string;
  category?: CategoryFragment;
}) {
  const { v } = useValidation();
  const closeDialog = useDialogStore((s) => s.closeDialog);
  const setMessage = useMessageStore((s) => s.setMessage);

  const schema = z.object({ name: v.string().min(1, v.required) });
  type FormValues = z.input<typeof schema>;
  return (
    <FormContainer
      schema={schema}
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
          <FormField<FormValues, "name"> name="name" label="Názov">
            {({ field, controlProps }) => (
              <Input
                {...field}
                {...controlProps}
                value={inputValue(field.value, undefined)}
                onChange={(event) => {
                  field.onChange(inputChange(event));
                }}
              />
            )}
          </FormField>
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
    </FormContainer>
  );
}
