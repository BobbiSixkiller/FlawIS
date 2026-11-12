"use client";
import { z } from "zod";
import Icon from "@/components/icon";
import { Checkbox } from "@/components/ui/checkbox";

import { FormField } from "@/components/form";
import { inputChange, inputValue } from "@/components/form-values";
import FormBuilder from "@/components/form-builder";
import { builderMessages, editableFormFields } from "@/lib/forms/builder";
import { createFormFieldsSchema } from "@/lib/validation/form-builder-schema";
import { compareFields } from "@/lib/validation/form-validation";

import TiptapEditor from "@/components/editor/editor";
import useDefaultContent from "@/components/editor/use-default-content";
import GenericCombobox from "@/components/generic-combobox";
import ImageFileInput from "@/components/image-file-input";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import WizzardForm, { WizzardStep } from "@/components/wizzard-form";
import useValidation from "@/hooks/useValidation";
import { cn, handleAPIErrors, uploadOrDelete } from "@/lib/utilsClient";
import {
  CategoryFragment,
  CourseFragment,
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
  const fieldsSchema = z.object({ formFields: createFormFieldsSchema(lng) });
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
        formFields: course ? editableFormFields(course.registrationForm) : [],
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
                          "text-primary-foreground bg-primary w-full",
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
                  <Checkbox
                    name={field.name}
                    ref={field.ref}
                    onBlur={field.onBlur}
                    disabled={field.disabled}
                    onCheckedChange={field.onChange}
                    {...controlProps}
                    checked={Boolean(field.value)}
                  />
                )}
              </FormField>

              <p className="text-sm text-muted-foreground dark:text-muted-foreground">
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
        name={builderMessages(lng).title}
        id="fields"
        fields={["formFields"]}
      >
        <FormBuilder lng={lng} />
      </WizzardStep>
    </WizzardForm>
  );
}
