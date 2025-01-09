"use client";

import Button from "@/components/Button";
import { useContext } from "react";
import { useRouter } from "next/navigation";
import { ActionTypes, MessageContext } from "@/providers/MessageProvider";
import Spinner from "@/components/Spinner";
import { FormProvider, useForm } from "react-hook-form";
import { deleteIntern } from "./actions";
import { FormMessage } from "@/components/Message";

export default function DeleteApplicationForm({ id }: { id: string }) {
  const router = useRouter();

  const { dispatch } = useContext(MessageContext);

  const methods = useForm();

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit(async () => {
          const state = await deleteIntern(id);
          if (!state.success && state.message) {
            dispatch({ type: ActionTypes.SetFormMsg, payload: state });
          }

          if (state.success) {
            dispatch({
              type: ActionTypes.SetAppMsg,
              payload: state,
            });

            router.back();
          }
        })}
        className="space-y-6"
      >
        <FormMessage />

        <p>Naozaj si prajete zmazat Vasy prihlasku?</p>
        <Button
          className="w-full"
          type="submit"
          variant="destructive"
          size="sm"
          disabled={methods.formState.isSubmitting}
        >
          {methods.formState.isSubmitting ? <Spinner inverted /> : "Potvrdit"}
        </Button>
      </form>
    </FormProvider>
  );
}
