import GenericCombobox from "../../src/components/GenericCombobox";
import type { GqlMutationResponse } from "../../src/lib/graphql/actions";
import { createInstance } from "i18next";
import { PathParamsContext } from "next/dist/shared/lib/hooks-client-context.shared-runtime";
import { useState, type ReactNode } from "react";
import { I18nextProvider } from "react-i18next";
import { z } from "zod";
import Ticket from "../../src/app/[lng]/conferences/[slug]/register/Ticket";
import CheckBox from "../../src/components/Checkbox";
import Editor from "../../src/components/editor/Editor";
import { FormContainer, FormError, FormField } from "../../src/components/form";
import { inputChange, inputValue } from "../../src/components/form-values";
import ImageFileInput from "../../src/components/ImageFileInput";
import { Input } from "../../src/components/Input";
import MultipleFileUploadField from "../../src/components/MultipleFileUploadField";
import PhoneInput from "../../src/components/PhoneInput";
import Select from "../../src/components/Select";
import WizzardForm, { WizzardStep } from "../../src/components/WizzardForm";
import common from "../../src/lib/i18n/locales/en/common.json";

export const testI18n = createInstance();
export const initialized = testI18n.init({
  lng: "en",
  resources: { en: { common } },
  defaultNS: "common",
  interpolation: { escapeValue: false },
});
export function Environment({ children }: { children: ReactNode }) {
  return (
    <PathParamsContext.Provider value={{ lng: "en" }}>
      <I18nextProvider i18n={testI18n}>{children}</I18nextProvider>
    </PathParamsContext.Provider>
  );
}
const schema = z.object({
  email: z.string().email("Invalid email"),
  count: z.number().nullable(),
  date: z.date().nullable(),
  invoiceDate: z.date().nullable(),
  choice: z.string(),
  phone: z.string().optional(),
  enabled: z.boolean(),
  description: z.string(),
});
type Values = z.input<typeof schema>;
export const defaults: Values = {
  email: "initial@example.com",
  count: 5,
  date: new Date(2026, 8, 8, 14, 30),
  invoiceDate: new Date("2026-09-10T00:00:00.000Z"),
  choice: "a",
  phone: "+421900123456",
  enabled: false,
  description: "<p>Initial text</p>",
};
export function ControlsForm({
  onSubmit,
  values,
  editor = false,
}: {
  onSubmit: (value: Values) => void;
  values?: Values;
  editor?: boolean;
}) {
  return (
    <FormContainer schema={schema} defaultValues={defaults} values={values}>
      {(methods) => (
        <form onSubmit={methods.handleSubmit(onSubmit)}>
          <FormField<Values, "email">
            name="email"
            label="Email"
            description="Work email"
          >
            {({ field, controlProps }) => (
              <Input {...field} {...controlProps} />
            )}
          </FormField>
          <FormField<Values, "count"> name="count" label="Count">
            {({ field, controlProps }) => (
              <Input
                {...field}
                {...controlProps}
                type="number"
                value={inputValue(field.value, "number")}
                onChange={(event) => field.onChange(inputChange(event))}
              />
            )}
          </FormField>
          <FormField<Values, "date"> name="date" label="Date">
            {({ field, controlProps }) => (
              <Input
                {...field}
                {...controlProps}
                type="datetime-local"
                value={inputValue(field.value, "datetime-local")}
                onChange={(event) => field.onChange(inputChange(event))}
              />
            )}
          </FormField>
          <FormField<Values, "invoiceDate">
            name="invoiceDate"
            label="Invoice date"
          >
            {({ field, controlProps }) => (
              <Input
                {...field}
                {...controlProps}
                type="date"
                value={inputValue(field.value, "date")}
                onChange={(event) => field.onChange(inputChange(event))}
              />
            )}
          </FormField>
          <FormField<Values, "choice"> name="choice" label="Choice">
            {({ field, controlProps }) => (
              <Select
                {...field}
                {...controlProps}
                options={[
                  { name: "Alpha", value: "a" },
                  { name: "Beta", value: "b" },
                ]}
              />
            )}
          </FormField>
          <FormField<Values, "phone"> name="phone" label="Phone">
            {({ field, controlProps }) => (
              <PhoneInput {...field} {...controlProps} />
            )}
          </FormField>
          <FormField<Values, "enabled">
            name="enabled"
            label="Enabled"
            layout="inline"
          >
            {({ field, controlProps }) => (
              <CheckBox {...field} {...controlProps} checked={field.value} />
            )}
          </FormField>
          {editor && (
            <FormField<Values, "description">
              name="description"
              label="Description"
            >
              {({ field, controlProps }) => (
                <Editor {...field} {...controlProps} compact />
              )}
            </FormField>
          )}
          <output data-testid="touched">
            {String(Boolean(methods.formState.touchedFields.email))}
          </output>
          <button
            type="button"
            onClick={() =>
              methods.reset({
                ...defaults,
                choice: "b",
                phone: "+420777123456",
              })
            }
          >
            Reset
          </button>
          <button
            type="button"
            onClick={() =>
              methods.setError("root", { message: "Server unavailable" })
            }
          >
            Server error
          </button>
          <FormError />
          <button type="submit">Save</button>
        </form>
      )}
    </FormContainer>
  );
}
const wizardSchema = z.object({
  title: z.string().trim().min(1, "Title required"),
  details: z.string().min(1, "Details required"),
  files: z.array(z.file()),
  image: z.file().nullable(),
  categories: z.array(z.string()),
  extra: z.string().optional(),
});
type WizardValues = z.input<typeof wizardSchema>;
export function WizardFixture({
  onSubmit,
  serverError = false,
}: {
  onSubmit: (value: WizardValues) => void;
  serverError?: boolean;
}) {
  const [extra, setExtra] = useState(true);
  return (
    <>
      <button onClick={() => setExtra((value) => !value)}>Toggle extra</button>
      <WizzardForm
        schema={wizardSchema}
        lng="en"
        defaultValues={{
          title: "  Title  ",
          details: "",
          files: [],
          image: null,
          categories: ["law"],
          extra: "retained",
        }}
        onSubmitCb={async (value, methods) => {
          if (serverError)
            methods.setError("title", { message: "Duplicate title" });
          else onSubmit(value);
        }}
      >
        <WizzardStep<WizardValues>
          id="info"
          name="Info"
          fields={["title", "files", "image", "categories"]}
        >
          <FormField<WizardValues, "title"> name="title" label="Title">
            {({ field, controlProps }) => (
              <Input {...field} {...controlProps} />
            )}
          </FormField>
          <FormField<WizardValues, "files"> name="files" label="Files">
            {({ field, controlProps, initialize, onError }) => (
              <MultipleFileUploadField
                {...field}
                {...controlProps}
                onLoad={initialize}
                onError={onError}
              />
            )}
          </FormField>
        </WizzardStep>
        {extra && (
          <WizzardStep<WizardValues> id="extra" name="Extra" fields={["extra"]}>
            <FormField<WizardValues, "extra"> name="extra" label="Extra value">
              {({ field, controlProps }) => (
                <Input {...field} {...controlProps} />
              )}
            </FormField>
          </WizzardStep>
        )}
        <WizzardStep<WizardValues>
          id="details"
          name="Details"
          fields={["details"]}
        >
          <FormField<WizardValues, "details"> name="details" label="Details">
            {({ field, controlProps }) => (
              <Input {...field} {...controlProps} />
            )}
          </FormField>
        </WizzardStep>
      </WizzardForm>
    </>
  );
}
const fileSchema = z.object({
  files: z.array(z.file()).optional(),
  image: z.file().nullish(),
});
type FileValues = z.input<typeof fileSchema>;
export function FileFixture({
  onSubmit,
}: {
  onSubmit: (value: FileValues) => void;
}) {
  const [visible, setVisible] = useState(true);
  return (
    <FormContainer
      schema={fileSchema}
      defaultValues={{ files: undefined, image: undefined }}
    >
      {(methods) => (
        <form onSubmit={methods.handleSubmit(onSubmit)}>
          <button type="button" onClick={() => setVisible((value) => !value)}>
            Toggle files
          </button>
          {visible && (
            <>
              <FormField<FileValues, "files"> name="files" label="Files">
                {({ field, controlProps, initialize, onError }) => (
                  <MultipleFileUploadField
                    {...field}
                    {...controlProps}
                    fileSources={{ courses: "existing.pdf" }}
                    onLoad={initialize}
                    onError={onError}
                  />
                )}
              </FormField>
              <FormField<FileValues, "image"> name="image" label="Image">
                {({ field, controlProps, initialize, onError }) => (
                  <ImageFileInput
                    {...field}
                    {...controlProps}
                    avatarUrl="/avatar.png"
                    onLoad={initialize}
                    onError={onError}
                    buttonLabel="Choose image"
                  />
                )}
              </FormField>
            </>
          )}
          <output data-testid="dirty">
            {String(methods.formState.isDirty)}
          </output>
          <button type="submit">Save</button>
        </form>
      )}
    </FormContainer>
  );
}
export function TicketFixture() {
  const [value, setValue] = useState("a"),
    [submission, setSubmission] = useState(false);
  return (
    <>
      <Ticket
        value={value}
        onChange={setValue}
        setSubmission={setSubmission}
        tickets={[
          {
            id: "a",
            name: "Attend",
            desc: "",
            price: 0,
            withSubmission: false,
          },
          {
            id: "b",
            name: "Present",
            desc: "",
            price: 0,
            withSubmission: true,
          },
        ]}
      />
      <output data-testid="submission">{String(submission)}</output>
    </>
  );
}

const comboboxSchema = z.object({ options: z.array(z.string()) });
type ComboboxValues = z.input<typeof comboboxSchema>;
export function ComboboxFixture({
  onSubmit,
  fetchOptions,
  createOption,
}: {
  onSubmit: (values: ComboboxValues) => void;
  fetchOptions: (query: string) => Promise<{ id: string; val: string }[]>;
  createOption: (
    text: string,
  ) => Promise<GqlMutationResponse<{ id: string; val: string }>>;
}) {
  return (
    <FormContainer schema={comboboxSchema} defaultValues={{ options: [] }}>
      {(methods) => (
        <form onSubmit={methods.handleSubmit(onSubmit)}>
          <FormField<ComboboxValues, "options">
            name="options"
            label="Options"
            description="Choose or create"
          >
            {({ field, controlProps, onError, itemErrors }) => (
              <GenericCombobox
                {...field}
                {...controlProps}
                lng="en"
                multiple
                allowCreateNewOptions
                defaultOptions={[]}
                fetchOptions={fetchOptions}
                createOption={createOption}
                getOptionLabel={(option) => option.val}
                getOptionValue={(option) => option?.val ?? ""}
                renderOption={(option) => <span>{option.val}</span>}
                onError={onError}
                itemErrors={itemErrors}
              />
            )}
          </FormField>
          <button type="submit">Save</button>
        </form>
      )}
    </FormContainer>
  );
}
