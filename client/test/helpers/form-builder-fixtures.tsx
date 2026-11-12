import { z } from "zod";
import FormBuilder, {
  type FormBuilderValues,
} from "../../src/components/form-builder";
import { FormContainer, FormField } from "../../src/components/form";
import WizzardForm, { WizzardStep } from "../../src/components/wizzard-form";
import { Input } from "../../src/components/ui/input";
import { createFormFieldsSchema } from "../../src/lib/validation/form-builder-schema";

export function BuilderFixture({
  initial = [],
  lng = "en",
  save = () => {},
}: {
  initial?: FormBuilderValues["formFields"];
  lng?: string;
  save?: (data: FormBuilderValues) => void;
}) {
  return (
    <FormContainer
      schema={z.object({ formFields: createFormFieldsSchema(lng) })}
      defaultValues={{ formFields: initial }}
    >
      {(form) => (
        <form onSubmit={form.handleSubmit(save)}>
          <FormBuilder lng={lng} />
          <output data-testid="draft">
            {JSON.stringify(form.watch("formFields"))}
          </output>
          <button type="submit">Save</button>
        </form>
      )}
    </FormContainer>
  );
}

/** Exercises the same parent RHF/wizard contract used by the course form. */
export function BuilderWizardFixture({
  save,
}: {
  save: (data: FormBuilderValues) => void;
}) {
  return (
    <WizzardForm
      lng="en"
      schema={z.object({
        name: z.string().min(1),
        formFields: createFormFieldsSchema("en"),
      })}
      defaultValues={{ name: "Course", formFields: [] }}
      onSubmitCb={async (data) => save(data)}
    >
      <WizzardStep id="info" name="Course details" fields={["name"]}>
        <FormField name="name" label="Course name">
          {({ field, controlProps }) => <Input {...field} {...controlProps} />}
        </FormField>
      </WizzardStep>
      <WizzardStep id="fields" name="Form builder" fields={["formFields"]}>
        <FormBuilder lng="en" />
      </WizzardStep>
    </WizzardForm>
  );
}
