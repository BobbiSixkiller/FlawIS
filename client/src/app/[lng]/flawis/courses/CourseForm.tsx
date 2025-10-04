"use client";

import useDefaultContent from "@/components/editor/useDefaultContent";
import { Input } from "@/components/Input";
import useValidation from "@/hooks/useValidation";
import {
  Category,
  CourseFragment,
  CourseInput,
} from "@/lib/graphql/generated/graphql";
import { useTranslation } from "@/lib/i18n/client";
import { useParams } from "next/navigation";
import { useState } from "react";
import { createCourse } from "./actions";
import { useMessageStore } from "@/stores/messageStore";
import { useDialogStore } from "@/stores/dialogStore";
import GenericCombobox from "@/components/GenericCombobox";
import {
  cn,
  getLocalDate,
  handleAPIErrors,
  todayAtMidnight,
} from "@/utils/helpers";
import { CheckIcon } from "@heroicons/react/24/outline";
import WizzardForm, { WizzardStep } from "@/components/WizzardForm";
import { updateCouse } from "./[id]/actions";
import { Textarea } from "@/components/Textarea";
import TiptapEditor from "@/components/editor/Editor";

export default function CourseForm({
  dialogId,
  course,
}: {
  dialogId: string;
  course?: CourseFragment;
}) {
  const [price, setPrice] = useState(0);
  const { lng } = useParams<{ lng: string }>();
  const { yup } = useValidation();

  const { t } = useTranslation(lng, ["validation", "courses"]);

  const { defaultCourseEditorContent } = useDefaultContent(lng);

  const setMessage = useMessageStore((s) => s.setMessage);
  const closeDialog = useDialogStore((s) => s.closeDialog);

  const today = new Date().toUTCString();

  return (
    <WizzardForm<CourseInput>
      lng={lng}
      defaultValues={{
        name: course?.name ?? "",
        categoryIds: course?.categories.map((c) => c.id) ?? [],
        start: getLocalDate(course?.start ?? today),
        end: getLocalDate(course?.end ?? today),
        registrationEnd: getLocalDate(course?.registrationEnd ?? today),
        description: course?.description ?? "",
        maxAttendees: course?.maxAttendees ?? 0,
        price: course?.price ?? 0,
        billing: course?.billing ?? {
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
      onSubmitCb={async (vals, methods) => {
        let res;
        if (course) {
          res = await updateCouse({ id: course.id, data: vals });
        } else {
          res = await createCourse({ data: vals });
        }

        if (res.errors) {
          handleAPIErrors(res.errors, methods.setError);
        }

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
          description: yup.string().required(),
          price: yup.number().required(),
          maxAttendees: yup.number().required().min(1),
          start: yup.date(),
          end: yup.date().min(yup.ref("start")),
          registrationEnd: yup.date().min(yup.ref("start")).max(yup.ref("end")),
        })}
      >
        {(methods) => (
          <div className="space-y-6 max-w-2xl w-full">
            <Textarea label="Nazov kurzu" name="name" />
            {/* <GenericCombobox<{ id: string; val: Category }, string>
              lng={lng}
              label="Kategoria"
              name="categoryIds"
              control={methods.control}
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
                  {option.val.name}
                  {props.selected && <CheckIcon className="size-3 stroke-2" />}
                </p>
              )}
              defaultOptions={[]}
              getOptionValue={(opt) => opt?.id ?? ""}
              getOptionLabel={({ val }) => val.name}
            /> */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Input label="Zaciatok" name="start" type="date" />
              <Input label="Koniec" name="end" type="date" />
              <Input
                label="Koniec registracie"
                name="registrationEnd"
                type="date"
              />
            </div>
            <TiptapEditor
              control={methods.control}
              className="sm:w-[580px] md:w-[672px]"
              name="description"
              initialValue={defaultCourseEditorContent}
            />
            <div className="flex gap-4">
              <Input
                label="Kapacita ucastnikov"
                name="maxAttendees"
                type="number"
              />
              <Input
                label="Cena kurzu v centoch s DPH"
                name="price"
                type="number"
                onChange={(e) => setPrice(parseInt(e.target.value))}
              />
            </div>
          </div>
        )}
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
