"use client";

import Spinner from "@/components/Spinner";
import useValidation from "@/hooks/useValidation";
import { useTranslation } from "@/lib/i18n/client";
import { yupResolver } from "@hookform/resolvers/yup";
import { useParams, useRouter } from "next/navigation";
import { FormProvider, useForm } from "react-hook-form";
import { createInternship, updateInternship } from "./actions";
import { useContext } from "react";
import { ActionTypes, MessageContext } from "@/providers/MessageProvider";
import { FormMessage } from "@/components/Message";
import Button from "@/components/Button";
import Editor from "@/components/editor/Editor";

export default function InternshipForm({
  data,
}: {
  data?: { id: string; description: string };
}) {
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

              router.back();
            }
          },
          (errs) => {
            console.log(errs);
          }
        )}
      >
        <div>
          <p className="block text-sm font-medium leading-6 text-gray-900 mb-2">
            Deatilný popis stáže. Upravte podľa potreby pomocou rich text
            editora.
          </p>

          {/* <Editor name="description" initialValue={defaultContent} /> */}

          <Editor
            name="description"
            initialValue={data?.description || defaultContent}
          />
        </div>

        <FormMessage />

        <Button type="submit" disabled={methods.formState.isSubmitting}>
          {methods.formState.isSubmitting ? <Spinner inverted /> : "Submit"}
        </Button>
      </form>
    </FormProvider>
  );
}
