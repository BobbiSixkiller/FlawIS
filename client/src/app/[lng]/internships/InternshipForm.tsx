"use client";

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
import Editor from "@/components/editor/Editor";
import { createInternship, updateInternship } from "./actions";
import { useDialogStore } from "@/stores/dialogStore";

export default function InternshipForm({
  data,
}: {
  data?: { id: string; description: string };
}) {
  const { lng } = useParams<{ lng: string }>();
  const { t } = useTranslation(lng, ["internships", "common"]);
  const { closeDialog } = useDialogStore();

  const { yup } = useValidation();
  const methods = useForm({
    resolver: yupResolver(
      yup.object({
        description: yup.string().required(),
      })
    ),
    defaultValues: { description: data?.description || "" },
  });

  const defaultContent = {
    type: "doc",
    content: [
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            marks: [
              {
                type: "bold",
              },
              {
                type: "underline",
              },
            ],
            text: t("form.dept"),
          },
        ],
      },
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: t("form.name"),
          },
        ],
      },
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            marks: [
              {
                type: "bold",
              },
              {
                type: "underline",
              },
            ],
            text: t("form.semesterLabel"),
          },
        ],
      },
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: t("form.semester"),
          },
        ],
      },
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            marks: [
              {
                type: "bold",
              },
              {
                type: "underline",
              },
            ],
            text: t("form.estimatedLength"),
          },
        ],
      },
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: t("form.timePeriod"),
          },
        ],
      },
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            marks: [
              {
                type: "bold",
              },
              {
                type: "underline",
              },
            ],
            text: t("form.internsCountLabel"),
          },
        ],
      },
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: t("form.internsCount"),
          },
        ],
      },
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            marks: [
              {
                type: "bold",
              },
              {
                type: "underline",
              },
            ],
            text: t("form.educLabel"),
          },
        ],
      },
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: t("form.educ"),
          },
        ],
      },
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            marks: [
              {
                type: "bold",
              },
              {
                type: "underline",
              },
            ],
            text: t("form.lngLabel"),
          },
        ],
      },
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: t("form.lng"),
          },
        ],
      },
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            marks: [
              {
                type: "bold",
              },
              {
                type: "underline",
              },
            ],
            text: t("form.otherLabel"),
          },
        ],
      },
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: t("form.other"),
          },
        ],
      },
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            marks: [
              {
                type: "bold",
              },
              {
                type: "underline",
              },
            ],
            text: t("form.internshipDescLabel"),
          },
        ],
      },
      {
        type: "bulletList",
        attrs: {
          tight: true,
        },
        content: [
          {
            type: "listItem",
            content: [
              {
                type: "paragraph",
                content: [
                  {
                    type: "text",
                    text: t("form.internshipDesc"),
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  };

  const { dispatch } = useContext(MessageContext);

  return (
    <FormProvider {...methods}>
      <form
        className="space-y-6 w-full"
        onSubmit={methods.handleSubmit(
          async (vals) => {
            let state: {
              success: boolean;
              message: string;
            };
            console.log(vals);

            if (data) {
              state = await updateInternship({ id: data.id, input: vals });
            } else {
              state = await createInternship(vals);
            }

            if (state && !state.success) {
              dispatch({
                type: ActionTypes.SetFormMsg,
                payload: state,
              });
            }

            if (state && state.success) {
              dispatch({
                type: ActionTypes.SetAppMsg,
                payload: state,
              });

              closeDialog("create-internship");
              closeDialog("update-internship");
            }
          },
          (errs) => {
            console.log(errs);
          }
        )}
      >
        <div>
          <p className="block text-sm font-medium leading-6 text-gray-900 dark:text-white mb-2">
            Deatilný popis stáže. Upravte podľa potreby pomocou rich text
            editora.
          </p>

          <Editor
            name="description"
            initialValue={data?.description || defaultContent}
          />
        </div>

        <FormMessage />

        <Button
          type="submit"
          className="w-full sm:w-fit"
          disabled={methods.formState.isSubmitting}
        >
          {methods.formState.isSubmitting ? (
            <Spinner inverted />
          ) : data ? (
            t("confirm", { ns: "common" })
          ) : (
            t("submit", { ns: "common" })
          )}
        </Button>
      </form>
    </FormProvider>
  );
}
