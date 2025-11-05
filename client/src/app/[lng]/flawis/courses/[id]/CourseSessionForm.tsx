"use client";

import RHFormContainer from "@/components/RHFormContainer";
import useValidation from "@/hooks/useValidation";
import {
  CourseSessionFragment,
  CourseSessionInput,
} from "@/lib/graphql/generated/graphql";
import { useDialogStore } from "@/stores/dialogStore";
import { useMessageStore } from "@/stores/messageStore";
import { useParams } from "next/navigation";
import { createCourseSession, updateCourseSession } from "./actions";
import { formatDatetimeLocal, handleAPIErrors } from "@/utils/helpers";
import { Textarea } from "@/components/Textarea";
import { Input } from "@/components/Input";
import TiptapEditor from "@/components/editor/Editor";
import Button from "@/components/Button";
import Spinner from "@/components/Spinner";

export default function CourseSessionForm({
  dialogId,
  courseSession,
}: {
  dialogId: string;
  courseSession?: CourseSessionFragment;
}) {
  const { yup } = useValidation();

  const { id: courseId } = useParams<{ lng: string; id: string }>();

  const closeDialog = useDialogStore((s) => s.closeDialog);
  const setMessage = useMessageStore((s) => s.setMessage);

  const today = new Date().toUTCString();

  return (
    <RHFormContainer<CourseSessionInput>
      yupSchema={yup.object({
        course: yup.string().required(),
        name: yup.string().required(),
        description: yup.string(),
        start: yup.date(),
        end: yup.date().min(yup.ref("start")),
        maxAttendees: yup.number().min(1).required(),
      })}
      defaultValues={{
        course: courseId,
        name: courseSession?.name ?? "",
        description: courseSession?.description ?? "",
        start: formatDatetimeLocal(courseSession?.start ?? today, true),
        end: formatDatetimeLocal(courseSession?.end ?? today, true),
        maxAttendees: courseSession?.maxAttendees ?? 0,
      }}
    >
      {(methods) => (
        <form
          className="space-y-6 max-w-2xl w-full"
          onSubmit={methods.handleSubmit(
            async (vals) => {
              console.log(vals);
              let res;
              if (courseSession) {
                res = await updateCourseSession({
                  id: courseSession.id,
                  data: vals,
                });
              } else {
                res = await createCourseSession({ data: vals });
              }

              if (res.errors) {
                handleAPIErrors(res.errors, methods.setError);
              }

              setMessage(res.message, res.success);

              if (res.success) {
                closeDialog(dialogId);
              }
            },
            (errs) => console.log(errs)
          )}
        >
          <Textarea label="Nazov terminu" name="name" />
          <div className="flex flex-col sm:flex-row gap-4">
            <Input label="Zaciatok" name="start" type="datetime-local" />
            <Input label="Koniec" name="end" type="datetime-local" />{" "}
            <Input type="number" label="Kapacita terminu" name="maxAttendees" />
          </div>
          <TiptapEditor
            control={methods.control}
            className="sm:w-[580px] md:w-[672px]"
            name="description"
          />

          <Button
            type="submit"
            disabled={methods.formState.isSubmitting}
            className="w-full"
          >
            {methods.formState.isSubmitting ? <Spinner inverted /> : "Vytvorit"}
          </Button>
        </form>
      )}
    </RHFormContainer>
  );
}
