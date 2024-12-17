"use client";

import Editor from "@/components/editor/Editor";
import Spinner from "@/components/Spinner";
import useValidation from "@/hooks/useValidation";
import { useTranslation } from "@/lib/i18n/client";
import { yupResolver } from "@hookform/resolvers/yup";
import { useParams, useRouter } from "next/navigation";
import { FormProvider, useForm } from "react-hook-form";
import { createInternship } from "./actions";
import { useContext } from "react";
import { ActionTypes, MessageContext } from "@/providers/MessageProvider";
import { FormMessage } from "@/components/Message";
import Button from "@/components/Button";

export default function InternshipForm() {
  const { lng } = useParams<{ lng: string }>();
  const router = useRouter();
  const { t } = useTranslation(lng, "intertnships");

  const { yup } = useValidation();
  const methods = useForm({
    resolver: yupResolver(
      yup.object({
        description: yup.string().required(),
      })
    ),
    defaultValues: {},
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
            text: "Odbor (organizačný útvar) / Sekcia:",
          },
        ],
      },
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "Nazov...",
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
            text: "Stáž prebieha v semestri:",
          },
        ],
      },
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "Zimný, letný",
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
            text: "Predpokladané trvanie stáže:",
          },
        ],
      },
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "1-2 mesiace (prípadne podľa dohody)",
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
            text: "Počet stážistov/semester:",
          },
        ],
      },
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "Max. 2",
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
            text: "Stupeň vzdelania:",
          },
        ],
      },
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "študenti Mgr. štúdia",
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
            text: "Jazykové požiadavky:",
          },
        ],
      },
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "Štátny jazyk",
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
            text: "Iné požiadavky:",
          },
        ],
      },
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "Proaktívny a zodpovedný prístup k práci, dôslednosť pri plnení zadaných úloh",
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
            text: "Predpokladaná náplň stáže:",
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
                    text: "Bod naplne staze...",
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
            console.log(vals);
            const state = await createInternship(vals);
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
              router.back();
            }
          },
          (errs) => {
            console.log(errs);
          }
        )}
      >
        <Editor
          name="description"
          label="Popis stáže (rich text editor)"
          initialValue={defaultContent}
        />

        <FormMessage />

        <Button type="submit" disabled={methods.formState.isSubmitting}>
          {methods.formState.isSubmitting ? <Spinner inverted /> : "Submit"}
        </Button>
      </form>
    </FormProvider>
  );
}
