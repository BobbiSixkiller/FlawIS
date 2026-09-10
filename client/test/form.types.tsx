import { z } from "zod";
import {
  FormContainer,
  FormField,
  type FormFieldRenderArgs,
} from "../src/components/form";
import { Input } from "../src/components/Input";

const schema = z.object({
  count: z.number(),
  email: z.string(),
  nested: z.object({ enabled: z.boolean() }),
});
type Values = z.input<typeof schema>;
const invalidName = (
  // @ts-expect-error Unknown paths must fail at compile time.
  <FormField<Values, "missing"> name="missing">{() => <Input />}</FormField>
);
const invalidDefault = (
  // @ts-expect-error Default values must match the schema's input.
  <FormContainer schema={schema} defaultValues={{ count: "one" }}>
    {() => null}
  </FormContainer>
);
function fieldTypes({
  field,
  initialize,
}: FormFieldRenderArgs<Values, "count">) {
  const count: number = field.value;
  // @ts-expect-error Numeric fields cannot initialize with strings.
  initialize("one");
  return count;
}
const transformed = z.object({ count: z.string().transform(Number) });
const outputTypes = (
  <FormContainer schema={transformed} defaultValues={{ count: "1" }}>
    {(methods) => {
      const input: string = methods.getValues("count");
      methods.handleSubmit((value) => {
        const output: number = value.count;
        return void output;
      });
      return input;
    }}
  </FormContainer>
);
void [invalidName, invalidDefault, fieldTypes, outputTypes];
