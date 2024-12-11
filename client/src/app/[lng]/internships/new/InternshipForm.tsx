"use client";

import Editor from "@/components/editor/Editor";
import { Input } from "@/components/Input";
import { Button } from "@/components/MyButton";
import Spinner from "@/components/Spinner";
import useValidation from "@/hooks/useValidation";
import { useTranslation } from "@/lib/i18n/client";
import { yupResolver } from "@hookform/resolvers/yup";
import { useParams } from "next/navigation";
import { FormProvider, useForm } from "react-hook-form";

export default function InternshipForm() {
  const { lng } = useParams<{ lng: string }>();
  const { t } = useTranslation(lng, "intertnships");

  const { yup } = useValidation();
  const methods = useForm({
    resolver: yupResolver(
      yup.object({
        department: yup.string().required(),
        organization: yup.string().required(),
        internshipInfo: yup.string().required(),
      })
    ),
  });

  const defaultContent = {
    type: "doc",
    content: [
      {
        type: "heading",
        attrs: {
          level: 1,
        },
        content: [
          {
            type: "text",
            text: "Nadpis 1",
          },
        ],
      },
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "This is an example for the editor",
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
                    text: "new idea",
                  },
                ],
              },
            ],
          },
          {
            type: "listItem",
            content: [
              {
                type: "paragraph",
                content: [
                  {
                    type: "text",
                    text: "idea",
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  };

  return (
    <FormProvider {...methods}>
      <form
        className="space-y-6 w-full "
        onSubmit={methods.handleSubmit(
          async (vals) => {
            console.log(vals);
          },
          (errs) => {
            console.log(errs);
          }
        )}
      >
        <Input name="department" />
        <Input name="organization" />
        <Editor name="internshipInfo" initialValue={defaultContent} />

        <Button type="submit" disabled={methods.formState.isSubmitting}>
          {methods.formState.isSubmitting ? <Spinner /> : "Submit"}
        </Button>
      </form>
    </FormProvider>
  );
}
