"use client";

import Editor from "@/components/editor/Editor";
import useDefaultContent from "@/components/editor/useDefaultContent";
import { Input } from "@/components/Input";
import useValidation from "@/hooks/useValidation";
import { CourseInput } from "@/lib/graphql/generated/graphql";
import { useTranslation } from "@/lib/i18n/client";
import { useParams } from "next/navigation";
import { useState } from "react";
import { createCourse } from "./actions";
import { useMessageStore } from "@/stores/messageStore";
import { useDialogStore } from "@/stores/dialogStore";
import GenericCombobox from "@/components/GenericCombobox";
import { cn } from "@/utils/helpers";
import { CheckIcon } from "@heroicons/react/24/outline";
import WizzardForm, { WizzardStep } from "@/components/WizzardForm";

export default function CourseForm({ dialogId }: { dialogId: string }) {
  const [price, setPrice] = useState(0);
  const { lng } = useParams<{ lng: string }>();
  const { yup } = useValidation();

  const { t } = useTranslation(lng, ["validation", "courses"]);

  const { defaultCourseEditorContent } = useDefaultContent(lng);

  const setMessage = useMessageStore((s) => s.setMessage);
  const closeDialog = useDialogStore((s) => s.closeDialog);

  return (
    <WizzardForm<CourseInput>
      lng={lng}
      defaultValues={{
        name: "",
        // categoryIds: [],
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
        const res = await createCourse({ data: vals });

        setMessage(res.message, res.success);

        if (res.success) {
          closeDialog(dialogId);
        }
      }}
    >
      <WizzardStep
        name="Info o kurze"
        yupSchema={yup.object({
          name: yup.string().required(),
          // description: yup.string().required(),
          price: yup.number().required(),
          billing: yup.object({}),
        })}
      >
        <Input label="Nazov kurzu" name="name" />
        {/* <GenericCombobox
          allowCreateNewOptions
          multiple
          placeholder="Kategoria..."
          renderOption={(option, props) => (
            <p
              className={cn([
                props.focus &&
                  "text-white bg-primary-500 dark:bg-primary-300 dark:text-white/80 w-full",
                "p-2 flex justify-between items-center",
              ])}
            >
              {option.label}
              {props.selected && <CheckIcon className="size-3 stroke-2" />}
            </p>
          )}
          defaultOptions={[
            { id: 0, label: "Pravnici" },
            { id: 1, label: "nepravnici" },
          ]}
          getOptionLabel={({ label }) => label}
          onChange={(val) => {
            if (Array.isArray(val)) {
              console.log("ARR ", val);
            } else {
              console.log("SINGLE ", val);
            }
          }}
        /> */}
        <Input
          label="Cena kurzu v centoch s DPH"
          name="price"
          type="number"
          onChange={(e) => setPrice(parseInt(e.target.value))}
        />
        {/* <Editor
          className="sm:w-[580px] md:w-[600px]"
          name="description"
          initialValue={defaultCourseEditorContent}
        /> */}
      </WizzardStep>
      {price > 0 && (
        <WizzardStep
          name="Fakturacne udaje"
          yupSchema={yup.object({
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
