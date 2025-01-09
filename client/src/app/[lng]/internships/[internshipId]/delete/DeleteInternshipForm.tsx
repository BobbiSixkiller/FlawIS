"use client";

import Button from "@/components/Button";
import { useContext } from "react";
import { deleteInternship } from "./actions";
import { useRouter } from "next/navigation";
import { ActionTypes, MessageContext } from "@/providers/MessageProvider";
import Spinner from "@/components/Spinner";
import { FormProvider, useForm } from "react-hook-form";

export default function DeleteInternshipForm({ id }: { id: string }) {
  const router = useRouter();

  const { dispatch } = useContext(MessageContext);

  const methods = useForm();

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit(async () => {
          const state = await deleteInternship(id);
          if (!state.success && state.message) {
            dispatch({ type: ActionTypes.SetFormMsg, payload: state });
          }

          if (state.success) {
            dispatch({
              type: ActionTypes.SetAppMsg,
              payload: { ...state, message: "YEAH!" },
            });

            router.back();
          }
        })}
        className="space-y-6"
      >
        <p>Naozaj si prajete zmazat tuto staz?</p>
        <Button
          className="w-full"
          type="submit"
          variant="destructive"
          size="sm"
          disabled={methods.formState.isSubmitting}
        >
          {methods.formState.isSubmitting ? <Spinner inverted /> : "Confirm"}
        </Button>
      </form>
    </FormProvider>
  );
}
