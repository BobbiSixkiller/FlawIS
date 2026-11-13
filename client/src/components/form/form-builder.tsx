"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState, type Ref } from "react";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import {
  FieldType,
  type FormFieldInput,
} from "@/lib/graphql/generated/graphql";
import {
  builderMessages,
  fieldTypes,
  isChoiceField,
  newFieldId,
  newFormField,
} from "@/lib/forms/builder";
import { FormField } from "./form";
import { firstErrorPath } from "./wizzard-form";
import { ErrorAlert } from "./field-controls";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { NativeSelect } from "../ui/native-select";
import { Checkbox } from "../ui/checkbox";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "../ui/card";
import { FieldGroup } from "../ui/field";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs";
import Icon from "../icon";

const HelpEditor = dynamic(() => import("./editor/editor"), { ssr: false });
const Preview = dynamic(() => import("./form-builder-preview"), { ssr: false });

export type FormBuilderValues = { formFields: FormFieldInput[] };
/** A caller-owned shortcut; the builder always assigns a fresh question ID. */
export type FormBuilderPreset = {
  key: string;
  label: string;
  field: Omit<FormFieldInput, "id">;
};

/** Edits the parent RHF formFields array. Persistence and submission belong to the host. */
export default function FormBuilder({
  lng,
  presets = [],
  showTemplatePlaceholders = false,
}: {
  lng: string;
  presets?: FormBuilderPreset[];
  showTemplatePlaceholders?: boolean;
}) {
  const t = builderMessages(lng);
  const form = useFormContext<FormBuilderValues>();
  const {
    control,
    setValue,
    setFocus,
    formState: { errors, submitCount },
  } = form;
  const { fields, append, remove, move } = useFieldArray({
    control,
    name: "formFields",
    keyName: "rowKey",
  });
  const values = useWatch({ control, name: "formFields" }) ?? [];
  const [tab, setTab] = useState("fields");
  const [previousSubmit, setPreviousSubmit] = useState(submitCount);
  if (previousSubmit !== submitCount) {
    setPreviousSubmit(submitCount);
    if (errors.formFields) setTab("fields");
  }
  const [previewValues, setPreviewValues] = useState<
    Record<string, string | string[]>
  >({});
  const lastSubmit = useRef(submitCount);
  const addFieldRef = useRef<HTMLButtonElement>(null);
  const addOptionRefs = useRef(new Map<number, HTMLButtonElement>());
  useEffect(() => {
    if (lastSubmit.current === submitCount) return;
    lastSubmit.current = submitCount;
    if (!errors.formFields) return;
    const path = firstErrorPath(errors);
    if (path === "formFields" || path?.startsWith("formFields.")) {
      const timer = setTimeout(() => {
        const options = /^formFields\.(\d+)\.selectOptions$/.exec(path);
        if (path === "formFields") addFieldRef.current?.focus();
        else if (options)
          addOptionRefs.current.get(Number(options[1]))?.focus();
        else
          setFocus(
            path.replace(/\.id$/, ".label") as `formFields.${number}.label`,
          );
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [submitCount, errors, setFocus]);

  function add(field: FormFieldInput) {
    append(field, { focusName: `formFields.${fields.length}.label` });
  }
  function changeType(index: number, type: FieldType) {
    const current = values[index];
    setValue(`formFields.${index}.type`, type, {
      shouldDirty: true,
      shouldValidate: true,
    });
    setValue(
      `formFields.${index}.selectOptions`,
      isChoiceField(type)
        ? current.selectOptions?.length
          ? current.selectOptions
          : [{ value: "", text: "" }]
        : null,
      { shouldDirty: true },
    );
    setValue(
      `formFields.${index}.minFiles`,
      type === FieldType.FileUpload
        ? (current.minFiles ?? (current.required ? 1 : 0))
        : null,
      { shouldDirty: true },
    );
    setValue(
      `formFields.${index}.maxFiles`,
      type === FieldType.FileUpload ? (current.maxFiles ?? 10) : null,
      { shouldDirty: true },
    );
  }
  return (
    <Tabs value={tab} onValueChange={(value) => setTab(String(value))}>
      <TabsList>
        <TabsTrigger value="fields">{t.fields}</TabsTrigger>
        <TabsTrigger value="preview">{t.preview}</TabsTrigger>
      </TabsList>
      <TabsContent value="fields" className="flex flex-col gap-4 pt-3">
        {errors.formFields && (
          <ErrorAlert
            message={
              errors.formFields.message ||
              errors.formFields.root?.message ||
              t.checkFields
            }
          />
        )}
        {!fields.length && (
          <p className="text-sm text-muted-foreground">{t.empty}</p>
        )}
        {fields.map((row, index) => {
          const value = values[index] ?? row;
          return (
            <Card key={row.rowKey} size="sm">
              <CardHeader>
                <CardTitle>
                  {t.field} {index + 1} · {t[value.type]}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <FieldGroup>
                  <FormField<FormBuilderValues>
                    name={`formFields.${index}.label`}
                    label={t.label}
                  >
                    {({ field, controlProps }) => (
                      <Input
                        {...field}
                        {...controlProps}
                        value={(field.value as string) ?? ""}
                      />
                    )}
                  </FormField>
                  <FormField<FormBuilderValues>
                    name={`formFields.${index}.type`}
                    label={t.type}
                  >
                    {({ field, controlProps }) => (
                      <NativeSelect
                        {...controlProps}
                        name={field.name}
                        ref={field.ref}
                        onBlur={field.onBlur}
                        value={value.type}
                        onChange={(e) =>
                          changeType(index, e.target.value as FieldType)
                        }
                      >
                        {fieldTypes.map((type) => (
                          <option key={type} value={type}>
                            {t[type]}
                          </option>
                        ))}
                      </NativeSelect>
                    )}
                  </FormField>
                  <FormField<FormBuilderValues>
                    name={`formFields.${index}.required`}
                    label={t.required}
                    layout="inline"
                  >
                    {({ field, controlProps }) => (
                      <Checkbox
                        {...controlProps}
                        name={field.name}
                        ref={field.ref}
                        onBlur={field.onBlur}
                        checked={Boolean(field.value)}
                        onCheckedChange={(checked) => {
                          field.onChange(Boolean(checked));
                          if (checked && value.type === FieldType.FileUpload)
                            setValue(
                              `formFields.${index}.minFiles`,
                              Math.max(1, value.minFiles ?? 0),
                              { shouldDirty: true, shouldValidate: true },
                            );
                        }}
                      />
                    )}
                  </FormField>
                  {![FieldType.FileUpload, FieldType.RadioGroup].includes(
                    value.type,
                  ) && (
                    <FormField<FormBuilderValues>
                      name={`formFields.${index}.placeholder`}
                      label={t.placeholder}
                    >
                      {({ field, controlProps }) => (
                        <Input
                          {...field}
                          {...controlProps}
                          value={(field.value as string) ?? ""}
                        />
                      )}
                    </FormField>
                  )}
                  <FormField<FormBuilderValues>
                    name={`formFields.${index}.helpText`}
                    label={t.help}
                  >
                    {({ field, controlProps }) => (
                      <HelpEditor
                        {...controlProps}
                        ref={field.ref}
                        value={field.value as string}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        compact
                      />
                    )}
                  </FormField>
                  {isChoiceField(value.type) && (
                    <OptionsEditor
                      index={index}
                      lng={lng}
                      addButtonRef={(element) => {
                        if (element) addOptionRefs.current.set(index, element);
                        else addOptionRefs.current.delete(index);
                      }}
                    />
                  )}
                  {value.type === FieldType.FileUpload && (
                    <FieldGroup className="sm:grid sm:grid-cols-2">
                      <FormField<FormBuilderValues>
                        name={`formFields.${index}.minFiles`}
                        label={t.minFiles}
                        description={
                          !value.required ? t.optionalFiles : undefined
                        }
                      >
                        {({ field, controlProps }) => (
                          <Input
                            {...controlProps}
                            name={field.name}
                            ref={field.ref}
                            onBlur={field.onBlur}
                            type="number"
                            min={value.required ? 1 : 0}
                            max={20}
                            value={
                              typeof field.value === "number" &&
                              !Number.isNaN(field.value)
                                ? field.value
                                : ""
                            }
                            onChange={(e) =>
                              field.onChange(e.target.valueAsNumber)
                            }
                          />
                        )}
                      </FormField>
                      <FormField<FormBuilderValues>
                        name={`formFields.${index}.maxFiles`}
                        label={t.maxFiles}
                      >
                        {({ field, controlProps }) => (
                          <Input
                            {...controlProps}
                            name={field.name}
                            ref={field.ref}
                            onBlur={field.onBlur}
                            type="number"
                            min={1}
                            max={20}
                            value={
                              typeof field.value === "number" &&
                              !Number.isNaN(field.value)
                                ? field.value
                                : ""
                            }
                            onChange={(e) =>
                              field.onChange(e.target.valueAsNumber)
                            }
                          />
                        )}
                      </FormField>
                    </FieldGroup>
                  )}
                </FieldGroup>
              </CardContent>
              <CardFooter className="flex-wrap gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  disabled={index === 0}
                  aria-label={`${t.up}: ${t.field} ${index + 1}`}
                  onClick={() => move(index, index - 1)}
                >
                  <Icon name="chevron-up" />
                  {t.up}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  disabled={index === fields.length - 1}
                  aria-label={`${t.down}: ${t.field} ${index + 1}`}
                  onClick={() => move(index, index + 1)}
                >
                  <Icon name="chevron-down" />
                  {t.down}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  aria-label={`${t.remove} ${index + 1}`}
                  onClick={() => {
                    remove(index);
                    setFocus(`formFields.${Math.max(0, index - 1)}.label`);
                  }}
                >
                  <Icon name="trash" />
                  {t.remove}
                </Button>
                {showTemplatePlaceholders && value.id && (
                  <details className="text-xs text-muted-foreground">
                    <summary>{t.template}</summary>
                    <code>{`{answer_${value.id}}`}</code>
                  </details>
                )}
              </CardFooter>
            </Card>
          );
        })}
        <div className="flex flex-wrap gap-2">
          {fieldTypes.map((type) => (
            <Button
              key={type}
              ref={type === FieldType.Text ? addFieldRef : undefined}
              type="button"
              variant="outline"
              disabled={fields.length >= 100}
              onClick={() => add(newFormField(type))}
            >
              <Icon name="plus" />
              {t[type]}
            </Button>
          ))}
          {presets.map((preset) => (
            <Button
              key={preset.key}
              type="button"
              variant="outline"
              disabled={fields.length >= 100}
              onClick={() =>
                add({ ...structuredClone(preset.field), id: newFieldId() })
              }
            >
              <Icon name="plus" />
              {preset.label}
            </Button>
          ))}
        </div>
      </TabsContent>
      <TabsContent value="preview" className="pt-3">
        <Preview
          fields={values}
          lng={lng}
          values={previewValues}
          onChange={(id, value) =>
            setPreviewValues((current) => ({ ...current, [id]: value }))
          }
        />
      </TabsContent>
    </Tabs>
  );
}

function OptionsEditor({
  index,
  lng,
  addButtonRef,
}: {
  index: number;
  lng: string;
  addButtonRef: Ref<HTMLButtonElement>;
}) {
  const t = builderMessages(lng);
  const {
    control,
    formState: { errors },
  } = useFormContext<FormBuilderValues>();
  const { fields, append, remove, move } = useFieldArray({
    control,
    name: `formFields.${index}.selectOptions`,
    keyName: "rowKey",
  });
  const error = errors.formFields?.[index]?.selectOptions;
  return (
    <FieldGroup>
      <p className="font-medium">{t.options}</p>
      {(error?.message || error?.root?.message) && (
        <ErrorAlert message={error.message || error.root?.message || ""} />
      )}
      {fields.map((option, i) => (
        <FieldGroup
          key={option.rowKey}
          className="rounded-md border p-3 sm:grid sm:grid-cols-2"
        >
          <FormField<FormBuilderValues>
            name={`formFields.${index}.selectOptions.${i}.value`}
            label={`${t.optionValue} ${i + 1}`}
          >
            {({ field, controlProps }) => (
              <Input
                {...field}
                {...controlProps}
                value={(field.value as string) ?? ""}
              />
            )}
          </FormField>
          <FormField<FormBuilderValues>
            name={`formFields.${index}.selectOptions.${i}.text`}
            label={`${t.optionText} ${i + 1}`}
          >
            {({ field, controlProps }) => (
              <Input
                {...field}
                {...controlProps}
                value={(field.value as string) ?? ""}
              />
            )}
          </FormField>
          <div className="flex flex-wrap gap-2 sm:col-span-2">
            <Button
              type="button"
              variant="ghost"
              disabled={i === 0}
              aria-label={`${t.up}: ${t.options} ${i + 1}`}
              onClick={() => move(i, i - 1)}
            >
              <Icon name="chevron-up" />
              {t.up}
            </Button>
            <Button
              type="button"
              variant="ghost"
              disabled={i === fields.length - 1}
              aria-label={`${t.down}: ${t.options} ${i + 1}`}
              onClick={() => move(i, i + 1)}
            >
              <Icon name="chevron-down" />
              {t.down}
            </Button>
            <Button
              type="button"
              variant="ghost"
              aria-label={`${t.removeOption} ${i + 1}`}
              onClick={() => remove(i)}
            >
              <Icon name="trash" />
              {t.removeOption}
            </Button>
          </div>
        </FieldGroup>
      ))}
      <Button
        type="button"
        variant="outline"
        className="w-fit"
        ref={addButtonRef}
        disabled={fields.length >= 100}
        onClick={() =>
          append(
            { value: "", text: "" },
            {
              focusName: `formFields.${index}.selectOptions.${fields.length}.value`,
            },
          )
        }
      >
        <Icon name="plus" />
        {t.addOption}
      </Button>
    </FieldGroup>
  );
}
