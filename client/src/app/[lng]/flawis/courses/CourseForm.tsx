"use client";

import Editor from "@/components/editor/Editor";
import useDefaultContent from "@/components/editor/useDefaultContent";
import { Input } from "@/components/Input";
import { WizzardForm, WizzardStep } from "@/components/WIzzardForm";
import useValidation from "@/hooks/useValidation";
import { CourseInput } from "@/lib/graphql/generated/graphql";
import { useTranslation } from "@/lib/i18n/client";
import { useParams } from "next/navigation";
import { useState } from "react";

export default function CourseForm(props: { dialogId: string }) {
  const { lng } = useParams<{ lng: string }>();
  const { yup } = useValidation();

  const { t } = useTranslation(lng, ["validation", "courses"]);

  const { defaultCourseEditorContent } = useDefaultContent(lng);

  const [price, setPrice] = useState(0);

  return (
    <WizzardForm<CourseInput>
      lng={lng}
      values={{
        name: "",
        description: "",
        price: 0,
        billing: {
          name: "",
          address: {
            street: "",
            city: "",
            postal: "",
            country: "",
          },
          variableSymbol: "",
          ICO: "",
          DIC: "",
          ICDPH: "",
          IBAN: "",
          SWIFT: "",
        },
      }}
      onSubmitCb={async (vals) => {
        console.log(vals);
      }}
    >
      <WizzardStep
        name="Info o kurze"
        validationSchema={yup.object({
          name: yup.string().required(),
          description: yup.string().required(),
          price: yup.number().required(),
          billing: yup.object({}),
        })}
      >
        <Input label="Nazov kurzu" name="name" />
        <Input
          label="Cena kurzu"
          name="price"
          type="number"
          onChange={(e) => setPrice(parseInt(e.target.value))}
        />
        <Editor
          className="sm:w-[580px] md:w-[600px]"
          name="description"
          initialValue={defaultCourseEditorContent}
        />
      </WizzardStep>
      {price > 0 && (
        <WizzardStep
          name="Fakturacne udaje"
          validationSchema={yup.object({
            billing: yup.object({
              name: yup.string().trim().required(),
              address: yup.object({
                street: yup.string().trim().required(),
                city: yup.string().trim().required(),
                postal: yup.string().trim().required(),
                country: yup.string().trim().required(),
              }),
              variableSymbol: yup.string().trim().required(),
              IBAN: yup.string().trim().required(),
              SWIFT: yup.string().trim().required(),
              ICO: yup.string().trim().required(),
              DIC: yup.string().trim().required(),
              ICDPH: yup.string().trim().required(),
              stamp: yup
                .mixed<File>() // Pass in the type of `fileUpload`
                .test("required", t("required"), (file) => file !== undefined)
                .test(
                  "fileSize",
                  "Only documents up to 2MB are permitted.",
                  (file) => file && file.size < 2_000_000
                ),
            }),
          })}
        >
          <Input label="Meno" name="billing.name" />
          <Input label="Ulica" name="billing.address.street" />
          <Input label="Mesto" name="billing.address.city" />
          <Input label="PSC" name="billing.address.postal" />
          <Input label="Krajina" name="billing.address.country" />
          <Input label="Variabilny" name="billing.variableSymbol" />
          <Input label="IBAN" name="billing.IBAN" />
          <Input label="SWIFT" name="billing.SWIFT" />
          <Input label="ICO" name="billing.ICO" />
          <Input label="DIC" name="billing.DIC" />
          <Input label="ICDPH" name="billing.ICDPH" />
        </WizzardStep>
      )}
    </WizzardForm>
  );
}
