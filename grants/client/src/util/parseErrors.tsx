interface validationErrors {
  target: object;
  value: string;
  children: [];
  property: string;
  constraints: object;
}

export default function parseErrors(errors: validationErrors[]): object {
  return errors.reduce(
    (previous, current) => ({
      ...previous,
      [current.property]: Object.values(current.constraints).join(", "),
    }),
    {}
  );
}
