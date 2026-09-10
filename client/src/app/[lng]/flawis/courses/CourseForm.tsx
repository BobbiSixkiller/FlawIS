"use client";
import { z } from "zod";

import { FormField } from "@/components/form";
import { inputChange, inputValue } from "@/components/form-values";
import { compareFields } from "@/lib/validation/form-validation";

import TiptapEditor from "@/components/editor/Editor";
import useDefaultContent from "@/components/editor/useDefaultContent";
import GenericCombobox from "@/components/GenericCombobox";
import ImageFileInput from "@/components/ImageFileInput";
import { Input } from "@/components/Input";
import { Textarea } from "@/components/Textarea";
import WizzardForm, { WizzardStep } from "@/components/WizzardForm";
import useValidation from "@/hooks/useValidation";
import { cn, handleAPIErrors, uploadOrDelete } from "@/lib/utilsClient";
import {
  CategoryFragment,
  CourseFragment,
  FieldType,
  FormFieldInput,
  ReachCourseConfigInput,
} from "@/lib/graphql/generated/graphql";
import { useTranslation } from "@/lib/i18n/client";
import {
  normalizeVariableSymbolPrefix,
  VARIABLE_SYMBOL_PREFIX_MAX_LENGTH,
  VARIABLE_SYMBOL_PREFIX_PATTERN,
} from "@/lib/validation/invoice-validation";
import { useDialogStore } from "@/stores/dialogStore";
import { useMessageStore } from "@/stores/messageStore";
import { useParams } from "next/navigation";
import { useState } from "react";
import { updateCouse } from "./[id]/actions";
import { createCategoryAction, createCourse, fetchCategories } from "./actions";

export default function CourseForm({
  dialogId,
  course,
  reachCourseConfig,
}: {
  dialogId: string;
  course?: CourseFragment;
  reachCourseConfig?: ReachCourseConfigInput | null;
}) {
  const [price, setPrice] = useState(course?.price ?? 0);
  const { lng } = useParams<{ lng: string }>();
  const { v } = useValidation();

  const { t } = useTranslation(lng, ["validation", "courses"]);

  const { defaultCourseEditorContent } = useDefaultContent(lng);

  const setMessage = useMessageStore((s) => s.setMessage);
  const closeDialog = useDialogStore((s) => s.closeDialog);

  const infoSchema = compareFields(
    compareFields(
      z.object({
        name: v.string().min(1, v.required),
        description: v.string().min(1, v.required),
        categories: z.array(
          z.object({
            id: z.string(),
            val: z.object({
              id: z.string(),
              name: z.string(),
              slug: z.string(),
            }),
          }),
        ),
        thumbnailFile: z.file().nullish(),
        price: v.number(),
        maxAttendees: v.number().min(1, v.min(1)),
        start: v.date(),
        end: v.date(),
        registrationEnd: v.date(),
      }),
      "end",
      "start",
      (value, other) => value == null || other == null || value >= other,
      v.required,
    ),
    "registrationEnd",
    "end",
    (value, other) => value == null || other == null || value <= other,
    v.required,
  );
  const elearningSchema = z.discriminatedUnion("hasElearning", [
    z.object({
      hasElearning: z.literal(true),
      reachCourse: z.object({
        courseId: v.string().trim().min(1, v.required),
        launchUrl: v.string().trim().min(1, v.required).url(v.url),
      }),
    }),
    z.object({
      hasElearning: z.literal(false),
      reachCourse: z
        .object({ courseId: z.string(), launchUrl: z.string() })
        .nullish(),
    }),
  ]);
  const billingSchema = z.object({
    billing: z.object({
      name: v.string().trim().min(1, v.required),
      address: z.object({
        street: v.string().trim().min(1, v.required),
        city: v.string().trim().min(1, v.required),
        postal: v.string().trim().min(1, v.required),
        country: v.string().trim().min(1, v.required),
      }),
      variableSymbol: v
        .string()
        .trim()
        .refine(
          (value) => !value || VARIABLE_SYMBOL_PREFIX_PATTERN.test(value),
          t("variableSymbol"),
        )
        .min(1, v.required),
      IBAN: v.string().trim().min(1, v.required),
      SWIFT: v.string().trim().min(1, v.required),
      ICO: v.string().trim().min(1, v.required),
      DIC: v.string().trim().min(1, v.required),
      ICDPH: v.string().trim().min(1, v.required),
    }),
  });
  const fieldsSchema = z.object({
    formFields: z
      .array(
        z
          .object({
            id: v.string().nullable().optional(),
            type: z
              .enum(FieldType, { error: v.required })
              .refine(
                (value) =>
                  [
                    FieldType.Text,
                    FieldType.Textarea,
                    FieldType.Select,
                    FieldType.RadioGroup,
                    FieldType.FileUpload,
                  ].includes(value),
                v.required,
              ),
            label: v.string().min(1, v.required),
            required: z.boolean({ error: v.required }),
            placeholder: v.string().nullable().optional(),
            helpText: v.string().nullable().optional(),
            selectOptions: z
              .array(
                z.object({
                  value: v.string().min(1, v.required),
                  text: v.string().min(1, v.required),
                }),
              )
              .nullish(),
            minFiles: v.number().nullable().optional(),
            maxFiles: v.number().nullable().optional(),
          })
          .superRefine((field, ctx) => {
            if (
              (field.type === FieldType.Select ||
                field.type === FieldType.RadioGroup) &&
              !field.selectOptions?.length
            )
              ctx.addIssue({
                code: "custom",
                path: ["selectOptions"],
                message: v.min(1),
              });
          })
          .transform((field) => ({
            ...field,
            selectOptions:
              field.type === FieldType.Select ||
              field.type === FieldType.RadioGroup
                ? field.selectOptions
                : undefined,
          })),
      )
      .min(0, v.min(0)),
  });
  const schema = z.intersection(
    z.intersection(
      z.intersection(infoSchema, elearningSchema),
      price > 0
        ? billingSchema
        : z.object({
            // Keep edits while the step is hidden; validate when it is enabled.
            billing: z
              .custom<z.input<typeof billingSchema>["billing"]>()
              .nullish(),
          }),
    ),
    fieldsSchema,
  );
  type FormValues = z.input<typeof schema>;
  type FormOutput = z.output<typeof schema>;
  return (
    <WizzardForm
      schema={schema}
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
        description: course?.description ?? defaultCourseEditorContent,
        maxAttendees: course?.maxAttendees ?? 0,
        price: course?.price ?? 0,
        billing: course?.billing
          ? {
              ...course.billing,
              variableSymbol: course.billing.variableSymbol ?? "",
              IBAN: course.billing.IBAN ?? "",
              SWIFT: course.billing.SWIFT ?? "",
              ICO: course.billing.ICO ?? "",
              DIC: course.billing.DIC ?? "",
              ICDPH: course.billing.ICDPH ?? "",
            }
          : undefined,
        formFields: course?.registrationForm.fields ?? [],
        thumbnailFile: undefined,
        hasElearning: Boolean(reachCourseConfig),
        reachCourse: reachCourseConfig ?? {
          courseId: "",
          launchUrl: "",
        },
      }}
      onSubmitCb={async (vals, methods) => {
        const { url: thumbnail, error: thumbnailError } =
          vals.thumbnailFile === undefined
            ? { url: course?.thumbnail }
            : await uploadOrDelete(
                "images",
                course?.thumbnail ?? null,
                vals.thumbnailFile instanceof File ? vals.thumbnailFile : null,
                "courses/thumbnails",
              );
        if (thumbnailError) {
          methods.setError("thumbnailFile", { message: thumbnailError });
          return;
        }

        const { thumbnailFile: _, hasElearning, ...courseVals } = vals;
        const data = {
          ...courseVals,
          billing:
            courseVals.price > 0
              ? billingSchema.shape.billing.parse(courseVals.billing)
              : null,
          reachCourse: hasElearning ? courseVals.reachCourse : null,
          categories: courseVals.categories.map((category) => category.val.id),
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
      <WizzardStep<FormValues, FormOutput>
        name="Info o kurze"
        id="info"
        fields={[
          "name",
          "description",
          "price",
          "maxAttendees",
          "start",
          "end",
          "registrationEnd",
          "categories",
          "thumbnailFile",
        ]}
      >
        {(methods) => (
          <div className="space-y-6 max-w-2xl w-full">
            <FormField<FormValues, "thumbnailFile"> name="thumbnailFile">
              {({ field, controlProps, initialize, onError }) => (
                <ImageFileInput
                  {...field}
                  {...controlProps}
                  bucket="images"
                  avatarUrl={course?.thumbnail ?? undefined}
                  onLoad={initialize}
                  onError={onError}
                  buttonLabel={"Thumbnail"}
                  aria-label={"Thumbnail"}
                />
              )}
            </FormField>
            <FormField<FormValues, "name"> name="name" label="Nazov kurzu">
              {({ field, controlProps }) => (
                <Textarea
                  {...field}
                  {...controlProps}
                  value={field.value ?? ""}
                />
              )}
            </FormField>
            <FormField<FormValues, "categories">
              name="categories"
              label="Kategórie"
            >
              {({ field, controlProps, onError, itemErrors }) => (
                <GenericCombobox<
                  { id: string; val: CategoryFragment },
                  { id: string; val: CategoryFragment }
                >
                  lng={lng}
                  {...field}
                  {...controlProps}
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
                      {props.selected && (
                        <Icon name="check" className="size-3 stroke-2" />
                      )}
                    </p>
                  )}
                  onError={onError}
                  itemErrors={itemErrors}
                />
              )}
            </FormField>
            <div className="flex flex-col sm:flex-row gap-4">
              <FormField<FormValues, "start"> name="start" label="Zaciatok">
                {({ field, controlProps }) => (
                  <Input
                    {...field}
                    {...controlProps}
                    type="datetime-local"
                    value={inputValue(field.value, "datetime-local")}
                    onChange={(event) => {
                      field.onChange(inputChange(event));
                    }}
                  />
                )}
              </FormField>
              <FormField<FormValues, "end"> name="end" label="Koniec">
                {({ field, controlProps }) => (
                  <Input
                    {...field}
                    {...controlProps}
                    type="datetime-local"
                    value={inputValue(field.value, "datetime-local")}
                    onChange={(event) => {
                      field.onChange(inputChange(event));
                    }}
                  />
                )}
              </FormField>
              <FormField<FormValues, "registrationEnd">
                name="registrationEnd"
                label="Koniec registracie"
              >
                {({ field, controlProps }) => (
                  <Input
                    {...field}
                    {...controlProps}
                    type="datetime-local"
                    value={inputValue(field.value, "datetime-local")}
                    onChange={(event) => {
                      field.onChange(inputChange(event));
                    }}
                  />
                )}
              </FormField>
            </div>
            <FormField<FormValues, "description"> name="description">
              {({ field, controlProps }) => (
                <TiptapEditor
                  {...field}
                  {...controlProps}
                  aria-label={t("editor.label", { ns: "courses" })}
                  className="sm:w-[580px] md:w-[672px]"
                />
              )}
            </FormField>
            <div className="flex gap-4">
              <FormField<FormValues, "maxAttendees">
                name="maxAttendees"
                label="Kapacita ucastnikov"
              >
                {({ field, controlProps }) => (
                  <Input
                    {...field}
                    {...controlProps}
                    type="number"
                    value={inputValue(field.value, "number")}
                    onChange={(event) => {
                      field.onChange(inputChange(event));
                    }}
                  />
                )}
              </FormField>
              <FormField<FormValues, "price">
                name="price"
                label="Cena kurzu v centoch s DPH"
              >
                {({ field, controlProps }) => (
                  <Input
                    {...field}
                    {...controlProps}
                    type="number"
                    value={inputValue(field.value, "number")}
                    onChange={(event) => {
                      field.onChange(inputChange(event));
                      ((event) => {
                        const value = (event.target as HTMLInputElement)
                          .valueAsNumber;
                        setPrice(Number.isFinite(value) ? value : 0);
                      })(event);
                    }}
                  />
                )}
              </FormField>
            </div>
          </div>
        )}
      </WizzardStep>
      <WizzardStep<FormValues, FormOutput>
        name="E-learning"
        id="elearning"
        fields={["hasElearning", "reachCourse"]}
      >
        {(methods) => {
          const hasElearning = methods.watch("hasElearning");

          return (
            <div className="space-y-6 max-w-2xl w-full">
              <FormField<FormValues, "hasElearning">
                name="hasElearning"
                label="Kurz obsahuje e-learning v Reach 360"
                layout="inline"
              >
                {({ field, controlProps }) => (
                  <CheckBox
                    {...field}
                    {...controlProps}
                    checked={Boolean(field.value)}
                  />
                )}
              </FormField>

              <p className="text-sm text-gray-600 dark:text-gray-300">
                Použite ID publikovaného kurzu a odkaz skopírovaný z karty Learn
                v Reach 360. API URL kurzu nie je odkaz pre účastníkov.
              </p>

              <FormField<FormValues, "reachCourse.courseId">
                name="reachCourse.courseId"
                label="Reach 360 course ID"
              >
                {({ field, controlProps }) => (
                  <Input
                    {...field}
                    {...controlProps}
                    disabled={!hasElearning}
                    value={inputValue(field.value, undefined)}
                    onChange={(event) => {
                      field.onChange(inputChange(event));
                    }}
                  />
                )}
              </FormField>
              <FormField<FormValues, "reachCourse.launchUrl">
                name="reachCourse.launchUrl"
                label="Odkaz na spustenie e-learningu"
              >
                {({ field, controlProps }) => (
                  <Input
                    {...field}
                    {...controlProps}
                    type="url"
                    disabled={!hasElearning}
                    value={inputValue(field.value, "url")}
                    onChange={(event) => {
                      field.onChange(inputChange(event));
                    }}
                  />
                )}
              </FormField>
            </div>
          );
        }}
      </WizzardStep>
      {price > 0 && (
        <WizzardStep<FormValues, FormOutput>
          name="Fakturacne udaje"
          id="billing"
          fields={["billing"]}
        >
          <FormField<FormValues, "billing.name">
            name="billing.name"
            label="Meno"
          >
            {({ field, controlProps }) => (
              <Input
                {...field}
                {...controlProps}
                value={inputValue(field.value, undefined)}
                onChange={(event) => {
                  field.onChange(inputChange(event));
                }}
              />
            )}
          </FormField>
          <FormField<FormValues, "billing.address.street">
            name="billing.address.street"
            label="Ulica"
          >
            {({ field, controlProps }) => (
              <Input
                {...field}
                {...controlProps}
                value={inputValue(field.value, undefined)}
                onChange={(event) => {
                  field.onChange(inputChange(event));
                }}
              />
            )}
          </FormField>
          <FormField<FormValues, "billing.address.city">
            name="billing.address.city"
            label="Mesto"
          >
            {({ field, controlProps }) => (
              <Input
                {...field}
                {...controlProps}
                value={inputValue(field.value, undefined)}
                onChange={(event) => {
                  field.onChange(inputChange(event));
                }}
              />
            )}
          </FormField>
          <FormField<FormValues, "billing.address.postal">
            name="billing.address.postal"
            label="PSC"
          >
            {({ field, controlProps }) => (
              <Input
                {...field}
                {...controlProps}
                value={inputValue(field.value, undefined)}
                onChange={(event) => {
                  field.onChange(inputChange(event));
                }}
              />
            )}
          </FormField>
          <FormField<FormValues, "billing.address.country">
            name="billing.address.country"
            label="Krajina"
          >
            {({ field, controlProps }) => (
              <Input
                {...field}
                {...controlProps}
                value={inputValue(field.value, undefined)}
                onChange={(event) => {
                  field.onChange(inputChange(event));
                }}
              />
            )}
          </FormField>
          <FormField<FormValues, "billing.variableSymbol">
            name="billing.variableSymbol"
            label="Variabilny"
          >
            {({ field, controlProps }) => (
              <Input
                {...field}
                {...controlProps}
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={VARIABLE_SYMBOL_PREFIX_MAX_LENGTH}
                value={inputValue(field.value, undefined)}
                onChange={(event) => {
                  field.onChange(
                    inputChange(event, normalizeVariableSymbolPrefix),
                  );
                }}
              />
            )}
          </FormField>
          <FormField<FormValues, "billing.IBAN">
            name="billing.IBAN"
            label="IBAN"
          >
            {({ field, controlProps }) => (
              <Input
                {...field}
                {...controlProps}
                value={inputValue(field.value, undefined)}
                onChange={(event) => {
                  field.onChange(inputChange(event));
                }}
              />
            )}
          </FormField>
          <FormField<FormValues, "billing.SWIFT">
            name="billing.SWIFT"
            label="SWIFT"
          >
            {({ field, controlProps }) => (
              <Input
                {...field}
                {...controlProps}
                value={inputValue(field.value, undefined)}
                onChange={(event) => {
                  field.onChange(inputChange(event));
                }}
              />
            )}
          </FormField>
          <FormField<FormValues, "billing.ICO"> name="billing.ICO" label="ICO">
            {({ field, controlProps }) => (
              <Input
                {...field}
                {...controlProps}
                value={inputValue(field.value, undefined)}
                onChange={(event) => {
                  field.onChange(inputChange(event));
                }}
              />
            )}
          </FormField>
          <FormField<FormValues, "billing.DIC"> name="billing.DIC" label="DIC">
            {({ field, controlProps }) => (
              <Input
                {...field}
                {...controlProps}
                value={inputValue(field.value, undefined)}
                onChange={(event) => {
                  field.onChange(inputChange(event));
                }}
              />
            )}
          </FormField>
          <FormField<FormValues, "billing.ICDPH">
            name="billing.ICDPH"
            label="ICDPH"
          >
            {({ field, controlProps }) => (
              <Input
                {...field}
                {...controlProps}
                value={inputValue(field.value, undefined)}
                onChange={(event) => {
                  field.onChange(inputChange(event));
                }}
              />
            )}
          </FormField>
        </WizzardStep>
      )}
      <WizzardStep<FormValues, FormOutput>
        name="Form builder"
        id="fields"
        fields={["formFields"]}
      >
        {(methods) => <CourseRegistrationFormBuilder />}
      </WizzardStep>
    </WizzardForm>
  );
}

import Button from "@/components/Button";
import CheckBox from "@/components/Checkbox";
import Icon from "@/components/Icon";
import { Select } from "@headlessui/react";
import { useFieldArray, useFormContext } from "react-hook-form";

type BuilderValues = { formFields: FormFieldInput[] };

function CourseRegistrationFormBuilder() {
  const { control, watch, setValue } = useFormContext<BuilderValues>();

  const { fields, append, remove, move } = useFieldArray({
    control,
    name: "formFields",
  });

  const watched = watch("formFields") as FormFieldInput[] | undefined;

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
    });
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
          const type = watched?.[index]?.type ?? f.type;

          return (
            <div
              key={f.id ?? index}
              className={cn([
                "rounded-md shadow-sm border p-4 space-y-4",
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
                    <Icon name="chevron-up" className="size-5" />
                  </Button>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    disabled={index === fields.length - 1}
                    onClick={() => move(index, index + 1)}
                  >
                    <Icon name="chevron-down" className="size-5" />
                  </Button>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    onClick={() => remove(index)}
                  >
                    <Icon name="trash" className="size-5" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField<BuilderValues, `formFields.${number}.label`>
                  name={`formFields.${index}.label`}
                  label="Label"
                >
                  {({ field, controlProps }) => (
                    <Input
                      {...field}
                      {...controlProps}
                      value={inputValue(field.value, undefined)}
                      onChange={(event) => {
                        field.onChange(inputChange(event));
                      }}
                    />
                  )}
                </FormField>
                <FormField<BuilderValues, `formFields.${number}.type`>
                  name={`formFields.${index}.type`}
                  label="Type"
                >
                  {({ field, controlProps }) => (
                    <Select
                      {...field}
                      {...controlProps}
                      className={cn(
                        "w-fit focus:outline-hidden focus:ring-primary-500 py-1.5 h-9 mt-2 flex items-center rounded-md text-gray-900 shadow-xs ring-1 ring-inset focus-within:ring-2 border-none",
                        "dark:bg-gray-800 dark:ring-gray-600 dark:shadow-none dark:text-white/85 focus:ring-primary-300",
                      )}
                      value={type}
                      onChange={(e) => {
                        const newType = e.target.value as FieldType;
                        field.onChange(newType);

                        if (
                          newType === FieldType.Select ||
                          newType === FieldType.RadioGroup
                        ) {
                          const curr =
                            (watch(`formFields.${index}.selectOptions`) as
                              | Array<{ value: string; text: string }>
                              | null
                              | undefined) ?? [];
                          if (curr.length === 0) {
                            setValue(`formFields.${index}.selectOptions`, [
                              { value: "", text: "" },
                            ]);
                          }
                          setValue(`formFields.${index}.minFiles`, null);
                          setValue(`formFields.${index}.maxFiles`, null);
                        } else if (newType === FieldType.FileUpload) {
                          setValue(`formFields.${index}.selectOptions`, null);
                          setValue(`formFields.${index}.minFiles`, 1);
                          setValue(`formFields.${index}.maxFiles`, 5);
                        } else {
                          setValue(`formFields.${index}.selectOptions`, null);
                          setValue(`formFields.${index}.minFiles`, null);
                          setValue(`formFields.${index}.maxFiles`, null);
                        }
                      }}
                    >
                      <option value={FieldType.Text}>TEXT</option>
                      <option value={FieldType.Textarea}>TEXTAREA</option>
                      <option value={FieldType.Select}>SELECT</option>
                      <option value={FieldType.RadioGroup}>RADIO_GROUP</option>
                      <option value={FieldType.FileUpload}>FILE_UPLOAD</option>
                    </Select>
                  )}
                </FormField>

                <FormField<BuilderValues, `formFields.${number}.required`>
                  name={`formFields.${index}.required`}
                  label={"Required"}
                  layout="inline"
                >
                  {({ field, controlProps }) => (
                    <CheckBox
                      {...field}
                      {...controlProps}
                      checked={Boolean(field.value)}
                    />
                  )}
                </FormField>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {type !== FieldType.FileUpload &&
                type !== FieldType.RadioGroup ? (
                  <>
                    <FormField<
                      BuilderValues,
                      `formFields.${number}.placeholder`
                    >
                      name={`formFields.${index}.placeholder`}
                      label="Placeholder"
                    >
                      {({ field, controlProps }) => (
                        <Input
                          {...field}
                          {...controlProps}
                          value={inputValue(field.value, undefined)}
                          onChange={(event) => {
                            field.onChange(inputChange(event));
                          }}
                        />
                      )}
                    </FormField>
                    <div className="sm:col-span-2 space-y-2">
                      <FormField<BuilderValues, `formFields.${number}.helpText`>
                        name={`formFields.${index}.helpText`}
                        label="Help text"
                      >
                        {({ field, controlProps }) => (
                          <TiptapEditor {...field} {...controlProps} compact />
                        )}
                      </FormField>
                    </div>
                  </>
                ) : type === FieldType.RadioGroup ? (
                  <div className="sm:col-span-2 space-y-2">
                    <FormField<BuilderValues, `formFields.${number}.helpText`>
                      name={`formFields.${index}.helpText`}
                      label="Help text"
                    >
                      {({ field, controlProps }) => (
                        <TiptapEditor {...field} {...controlProps} compact />
                      )}
                    </FormField>
                  </div>
                ) : (
                  <div className="col-span-2 space-y-4">
                    <div className="flex gap-2 sm:w-1/3">
                      <FormField<BuilderValues, `formFields.${number}.minFiles`>
                        name={`formFields.${index}.minFiles`}
                        label="Min files"
                        className="w-fit"
                      >
                        {({ field, controlProps }) => (
                          <Input
                            {...field}
                            {...controlProps}
                            type="number"
                            value={inputValue(field.value, "number")}
                            onChange={(event) => {
                              field.onChange(inputChange(event));
                            }}
                          />
                        )}
                      </FormField>
                      <FormField<BuilderValues, `formFields.${number}.maxFiles`>
                        name={`formFields.${index}.maxFiles`}
                        label="Max files"
                        className="w-fit"
                      >
                        {({ field, controlProps }) => (
                          <Input
                            {...field}
                            {...controlProps}
                            type="number"
                            value={inputValue(field.value, "number")}
                            onChange={(event) => {
                              field.onChange(inputChange(event));
                            }}
                          />
                        )}
                      </FormField>
                    </div>
                    <div className="space-y-2">
                      <FormField<BuilderValues, `formFields.${number}.helpText`>
                        name={`formFields.${index}.helpText`}
                        label="Help text"
                      >
                        {({ field, controlProps }) => (
                          <TiptapEditor {...field} {...controlProps} compact />
                        )}
                      </FormField>
                    </div>
                  </div>
                )}
              </div>

              {(type === FieldType.Select || type === FieldType.RadioGroup) && (
                <SelectOptionsEditor fieldIndex={index} />
              )}
            </div>
          );
        })}
      </div>
      <div className="flex flex-wrap gap-2">
        <Button type="button" onClick={() => addField(FieldType.Text)}>
          <Icon name="plus" className="size-5" /> Text
        </Button>
        <Button type="button" onClick={() => addField(FieldType.Textarea)}>
          <Icon name="plus" className="size-5" /> Textarea
        </Button>
        <Button type="button" onClick={() => addField(FieldType.Select)}>
          <Icon name="plus" className="size-5" /> Select
        </Button>
        <Button type="button" onClick={() => addField(FieldType.RadioGroup)}>
          <Icon name="plus" className="size-5" /> Radio Group
        </Button>
        <Button type="button" onClick={() => addField(FieldType.FileUpload)}>
          <Icon name="plus" className="size-5" /> File Upload
        </Button>
      </div>
    </div>
  );
}

function SelectOptionsEditor({ fieldIndex }: { fieldIndex: number }) {
  const { control } = useFormContext<BuilderValues>();

  const { fields, append, remove, move } = useFieldArray({
    control,
    name: `formFields.${fieldIndex}.selectOptions`,
  });

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="font-medium">Select options</p>
        <Button
          type="button"
          variant="ghost"
          onClick={() => append({ value: "", text: "" })}
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
          <div key={opt.id ?? optIndex} className="flex gap-2 items-start">
            <div className="flex-1">
              <FormField<
                BuilderValues,
                `formFields.${number}.selectOptions.${number}.value`
              >
                name={`formFields.${fieldIndex}.selectOptions.${optIndex}.value`}
                label="Value"
              >
                {({ field, controlProps }) => (
                  <Input
                    {...field}
                    {...controlProps}
                    value={inputValue(field.value, undefined)}
                    onChange={(event) => {
                      field.onChange(inputChange(event));
                    }}
                  />
                )}
              </FormField>
            </div>
            <div className="flex-1">
              <FormField<
                BuilderValues,
                `formFields.${number}.selectOptions.${number}.text`
              >
                name={`formFields.${fieldIndex}.selectOptions.${optIndex}.text`}
                label="Text"
              >
                {({ field, controlProps }) => (
                  <Input
                    {...field}
                    {...controlProps}
                    value={inputValue(field.value, undefined)}
                    onChange={(event) => {
                      field.onChange(inputChange(event));
                    }}
                  />
                )}
              </FormField>
            </div>

            <div className="flex gap-2 mt-8">
              <Button
                type="button"
                disabled={optIndex === 0}
                onClick={() => move(optIndex, optIndex - 1)}
                variant="ghost"
                size="icon"
              >
                <Icon name="chevron-up" className="size-3" />
              </Button>
              <Button
                type="button"
                disabled={optIndex === fields.length - 1}
                onClick={() => move(optIndex, optIndex + 1)}
                variant="ghost"
                size="icon"
              >
                <Icon name="chevron-down" className="size-3" />
              </Button>
              <Button
                type="button"
                onClick={() => remove(optIndex)}
                variant="ghost"
                size="icon"
              >
                <Icon name="x-mark" className="size-3" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
