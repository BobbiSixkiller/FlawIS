// validation error exception interface of validation errors returned by the GraphQL API
export interface ErrorException {
  validationErrors?: ValidationErrors[];
}

export interface ValidationErrors {
  target: object;
  value: string;
  children: [];
  property: string;
  constraints: object;
}

export default function parseValidationErrors(
  errors: ValidationErrors[]
): Record<string, string> {
  return errors.reduce(
    (previous, current) => ({
      ...previous,
      [current.property]: Object.values(current.constraints).join(", "),
    }),
    {}
  );
}
