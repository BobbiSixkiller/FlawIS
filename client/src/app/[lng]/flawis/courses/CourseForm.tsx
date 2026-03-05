"use client";

import useDefaultContent from "@/components/editor/useDefaultContent";
import { Input } from "@/components/Input";
import useValidation from "@/hooks/useValidation";
import {
  CategoryFragment,
  CourseFragment,
  CourseInput,
  FormFieldInput,
} from "@/lib/graphql/generated/graphql";
import { useTranslation } from "@/lib/i18n/client";
import { useParams } from "next/navigation";
import { useState } from "react";
import { createCourse, createCategoryAction, fetchCategories } from "./actions";
import { useMessageStore } from "@/stores/messageStore";
import { useDialogStore } from "@/stores/dialogStore";
import GenericCombobox from "@/components/GenericCombobox";
import { cn, handleAPIErrors, uploadOrDelete } from "@/utils/helpers";
import ImageFileInput from "@/components/ImageFileInput";
import WizzardForm, { WizzardStep } from "@/components/WizzardForm";
import { updateCouse } from "./[id]/actions";
import { Textarea } from "@/components/Textarea";
import TiptapEditor from "@/components/editor/Editor";
import { FieldType } from "@/lib/graphql/generated/graphql";

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

  return (
    <WizzardForm<CourseInput & { thumbnailFile: File | null }>
      lng={lng}
      defaultValues={{
        name: course?.name ?? "",
        categories:
          course?.categories.map((c) => ({ id: String(c.id), val: c })) ?? [],
        start: course?.start ? new Date(course.start) : new Date(),
        end: course?.end ? new Date(course.end) : new Date(),
        registrationEnd: course?.registrationEnd
          ? new Date(course.registrationEnd)
          : new Date(),
        description: course?.description ?? "",
        maxAttendees: course?.maxAttendees ?? 0,
        price: course?.price ?? 0,
        billing: course?.billing,
        formFields: course?.registrationForm.fields ?? [],
        thumbnailFile: null,
      }}
      onSubmitCb={async (vals, methods) => {
        const { url: thumbnail, error: thumbnailError } = await uploadOrDelete(
          "images",
          course?.thumbnail ?? null,
          vals.thumbnailFile instanceof File ? vals.thumbnailFile : null,
          "courses/thumbnails",
        );
        if (thumbnailError) {
          methods.setError("thumbnailFile" as any, { message: thumbnailError });
          return;
        }

        const { thumbnailFile: _, ...courseVals } = vals;
        const data = {
          ...courseVals,
          categories: (courseVals.categories as any[]).map((c: any) =>
            typeof c === "object" && c !== null && c.val ? c.val.id : c,
          ),
          thumbnail: thumbnail !== undefined ? thumbnail : course?.thumbnail,
        };

        let res;
        if (course) {
          res = await updateCouse({ id: course.id, data });
        } else {
          res = await createCourse({ data });
        }

        console.log(res.errors);

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
          registrationEnd: yup.date().max(yup.ref("end")),
        })}
      >
        {(methods) => (
          <div className="space-y-6 max-w-2xl w-full">
            <ImageFileInput
              bucket="images"
              name="thumbnailFile"
              label="Thumbnail"
              avatarUrl={course?.thumbnail ?? undefined}
              control={methods.control}
            />
            <Textarea label="Nazov kurzu" name="name" />
            <GenericCombobox<
              { id: string; val: CategoryFragment },
              { id: string; val: CategoryFragment }
            >
              lng={lng}
              label="Kategórie"
              name="categories"
              control={methods.control}
              allowCreateNewOptions
              multiple
              placeholder="Hľadaj kategóriu..."
              defaultOptions={
                course?.categories.map((c) => ({
                  id: String(c.id),
                  val: c,
                })) ?? []
              }
              fetchOptions={async (query) => {
                const cats = await fetchCategories(query);
                return cats.map((c) => ({ id: String(c.id), val: c }));
              }}
              createOption={async (name) => {
                const res = await createCategoryAction({ data: { name } });
                if (res.success && res.data) {
                  return {
                    ...res,
                    data: { id: String(res.data.id), val: res.data },
                  };
                }
                return { ...res, data: undefined };
              }}
              getOptionValue={(opt) => opt!}
              getOptionLabel={(opt) => opt.val.name}
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
            />
            <div className="flex flex-col sm:flex-row gap-4">
              <Input label="Zaciatok" name="start" type="datetime-local" />
              <Input label="Koniec" name="end" type="datetime-local" />
              <Input
                label="Koniec registracie"
                name="registrationEnd"
                type="datetime-local"
              />
            </div>
            <TiptapEditor
              control={methods.control}
              className="sm:w-[580px] md:w-[672px]"
              name="description"
              initialValue={course?.description || defaultCourseEditorContent}
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
      <WizzardStep
        name="Form builder"
        yupSchema={yup.object({
          formFields: yup
            .array()
            .of(
              yup.object({
                id: yup.string().nullable(), // present on edit, absent on create
                type: yup
                  .mixed<FieldType>()
                  .oneOf([
                    FieldType.Text,
                    FieldType.Textarea,
                    FieldType.Select,
                    FieldType.FileUpload,
                  ] as any)
                  .required(),
                label: yup.string().required(),
                required: yup.boolean().required(),
                placeholder: yup.string().nullable(),
                helpText: yup.string().nullable(),
                selectOptions: yup.mixed().when("type", {
                  is: FieldType.Select,
                  then: () =>
                    yup
                      .array()
                      .of(
                        yup.object({
                          value: yup.string().required(),
                          text: yup.string().required(),
                        }),
                      )
                      .min(1)
                      .required(),
                  otherwise: () => yup.mixed().nullable().strip(),
                }),
                minFiles: yup.number().nullable(),
                maxFiles: yup.number().nullable(),
              }),
            )
            .min(0)
            .required(),
        })}
      >
        {(methods) => <CourseRegistrationFormBuilder methods={methods} />}
      </WizzardStep>
    </WizzardForm>
  );
}

import { useFieldArray, UseFormReturn } from "react-hook-form";
import Button from "@/components/Button";
import {
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  PlusIcon,
  TrashIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { Field, Label, Select } from "@headlessui/react";
import CheckBox from "@/components/Checkbox";

function CourseRegistrationFormBuilder({
  methods,
}: {
  methods: UseFormReturn<any>;
}) {
  const { control, watch, setValue } = methods;

  const { fields, append, remove, move } = useFieldArray({
    control,
    name: "formFields" as any,
  });

  console.log(watch());

  const watched = watch("formFields" as any) as FormFieldInput[] | undefined;

  function addField(type: FieldType) {
    append({
      type,
      label: "",
      required: false,
      placeholder: "",
      helpText: "",
      selectOptions:
        type === FieldType.Select || type === FieldType.RadioGroup
          ? [{ value: "", text: "" }]
          : null,
      minFiles: type === FieldType.FileUpload ? 1 : null,
      maxFiles: type === FieldType.FileUpload ? 5 : null,
    } as any);
  }

  return (
    <div className="space-y-6 max-w-2xl w-full">
      {fields.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No registration fields yet. Add one above.
        </p>
      )}

      <div className="space-y-4">
        {fields.map((f, index) => {
          const type = watched?.[index]?.type ?? (f as FormFieldInput).type;

          return (
            <div
              key={(f as any).id ?? index}
              className={cn([
                "rounded-md shadow border p-4 space-y-4",
                "dark:border-gray-800 border-2 dark:bg-gray-900",
              ])}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="font-medium">
                  Field #{index + 1}{" "}
                  <span className="text-sm text-muted-foreground">
                    ({type})
                  </span>
                </p>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    disabled={index === 0}
                    onClick={() => move(index, index - 1)}
                  >
                    <ChevronUpIcon className="size-5" />
                  </Button>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    disabled={index === fields.length - 1}
                    onClick={() => move(index, index + 1)}
                  >
                    <ChevronDownIcon className="size-5" />
                  </Button>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    onClick={() => remove(index)}
                  >
                    <TrashIcon className="size-5" />
                  </Button>
                </div>
              </div>

              {/* Keep id in state if present (editing), undefined on create */}
              {/* <input
                type="hidden"
                {...register(`formFields.${index}.id` as any)}
              /> */}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Label" name={`formFields.${index}.label`} />
                <Field>
                  <Label className="text-sm font-medium">Type</Label>
                  <Select
                    className={cn(
                      "w-fit focus:outline-none focus:ring-primary-500 py-1.5 h-9 mt-2 flex items-center rounded-md text-gray-900 shadow-sm ring-1 ring-inset focus-within:ring-2 border-none",
                      "dark:bg-gray-800 dark:ring-gray-600 dark:shadow-none dark:text-white/85 focus:ring-primary-300",
                    )}
                    value={type}
                    onChange={(e) => {
                      const newType = e.target.value as FieldType;
                      setValue(`formFields.${index}.type` as any, newType);

                      if (
                        newType === FieldType.Select ||
                        newType === FieldType.RadioGroup
                      ) {
                        const curr =
                          (watch(`formFields.${index}.selectOptions` as any) as
                            | Array<{ value: string; text: string }>
                            | null
                            | undefined) ?? [];
                        if (curr.length === 0) {
                          setValue(`formFields.${index}.selectOptions` as any, [
                            { value: "", text: "" },
                          ]);
                        }
                        setValue(`formFields.${index}.minFiles` as any, null);
                        setValue(`formFields.${index}.maxFiles` as any, null);
                      } else if (newType === FieldType.FileUpload) {
                        setValue(
                          `formFields.${index}.selectOptions` as any,
                          null,
                        );
                        setValue(`formFields.${index}.minFiles` as any, 1);
                        setValue(`formFields.${index}.maxFiles` as any, 5);
                      } else {
                        setValue(
                          `formFields.${index}.selectOptions` as any,
                          null,
                        );
                        setValue(`formFields.${index}.minFiles` as any, null);
                        setValue(`formFields.${index}.maxFiles` as any, null);
                      }
                    }}
                  >
                    <option value={FieldType.Text}>TEXT</option>
                    <option value={FieldType.Textarea}>TEXTAREA</option>
                    <option value={FieldType.Select}>SELECT</option>
                    <option value={FieldType.RadioGroup}>RADIO_GROUP</option>
                    <option value={FieldType.FileUpload}>FILE_UPLOAD</option>
                  </Select>
                </Field>

                <CheckBox
                  control={control}
                  label={"Required"}
                  name={`formFields.${index}.required`}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {type !== FieldType.FileUpload && type !== FieldType.RadioGroup ? (
                  <>
                    <Input
                      label="Placeholder"
                      name={`formFields.${index}.placeholder`}
                    />
                    <div className="sm:col-span-2 space-y-2">
                      <p className="text-sm font-medium">Help text</p>
                      <TiptapEditor
                        compact
                        name={`formFields.${index}.helpText`}
                        control={control}
                      />
                    </div>
                  </>
                ) : type === FieldType.RadioGroup ? (
                  <div className="sm:col-span-2 space-y-2">
                    <p className="text-sm font-medium">Help text</p>
                    <TiptapEditor
                      compact
                      name={`formFields.${index}.helpText`}
                      control={control}
                    />
                  </div>
                ) : (
                  <div className="col-span-2 space-y-4">
                    <div className="flex gap-2 sm:w-1/3">
                      <Input
                        label="Min files"
                        name={`formFields.${index}.minFiles`}
                        type="number"
                        className="w-fit"
                      />
                      <Input
                        label="Max files"
                        name={`formFields.${index}.maxFiles`}
                        type="number"
                        className="w-fit"
                      />
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Help text</p>
                      <TiptapEditor
                        compact
                        name={`formFields.${index}.helpText`}
                        control={control}
                      />
                    </div>
                  </div>
                )}
              </div>

              {(type === FieldType.Select || type === FieldType.RadioGroup) && (
                <SelectOptionsEditor methods={methods} fieldIndex={index} />
              )}
            </div>
          );
        })}
      </div>
      <div className="flex flex-wrap gap-2">
        <Button type="button" onClick={() => addField(FieldType.Text)}>
          <PlusIcon className="size-5" /> Text
        </Button>
        <Button type="button" onClick={() => addField(FieldType.Textarea)}>
          <PlusIcon className="size-5" /> Textarea
        </Button>
        <Button type="button" onClick={() => addField(FieldType.Select)}>
          <PlusIcon className="size-5" /> Select
        </Button>
        <Button type="button" onClick={() => addField(FieldType.RadioGroup)}>
          <PlusIcon className="size-5" /> Radio Group
        </Button>
        <Button type="button" onClick={() => addField(FieldType.FileUpload)}>
          <PlusIcon className="size-5" /> File Upload
        </Button>
      </div>
    </div>
  );
}

function SelectOptionsEditor({
  methods,
  fieldIndex,
}: {
  methods: UseFormReturn<any>;
  fieldIndex: number;
}) {
  const { control } = methods;

  const { fields, append, remove, move } = useFieldArray({
    control,
    name: `formFields.${fieldIndex}.selectOptions` as any,
  });

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="font-medium">Select options</p>
        <Button
          type="button"
          variant="ghost"
          onClick={() => append({ value: "", text: "" } as any)}
        >
          + Add option
        </Button>
      </div>

      {fields.length === 0 && (
        <p className="text-sm text-muted-foreground">
          Add at least one option.
        </p>
      )}

      <div className="space-y-2">
        {fields.map((opt, optIndex) => (
          <div
            key={(opt as any).id ?? optIndex}
            className="flex gap-2 items-start"
          >
            <div className="flex-1">
              <Input
                label="Value"
                name={`formFields.${fieldIndex}.selectOptions.${optIndex}.value`}
              />
            </div>
            <div className="flex-1">
              <Input
                label="Text"
                name={`formFields.${fieldIndex}.selectOptions.${optIndex}.text`}
              />
            </div>

            <div className="flex gap-2 mt-8">
              <Button
                type="button"
                disabled={optIndex === 0}
                onClick={() => move(optIndex, optIndex - 1)}
                variant="ghost"
                size="icon"
              >
                <ChevronUpIcon className="size-3" />
              </Button>
              <Button
                type="button"
                disabled={optIndex === fields.length - 1}
                onClick={() => move(optIndex, optIndex + 1)}
                variant="ghost"
                size="icon"
              >
                <ChevronDownIcon className="size-3" />
              </Button>
              <Button
                type="button"
                onClick={() => remove(optIndex)}
                variant="ghost"
                size="icon"
              >
                <XMarkIcon className="size-3" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
