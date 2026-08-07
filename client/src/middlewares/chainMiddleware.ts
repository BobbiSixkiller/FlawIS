import type { NextProxy } from "next/server";
import { NextResponse } from "next/server";

export type CustomMiddleware = (
  req: Parameters<NextProxy>[0],
  event: Parameters<NextProxy>[1],
  res?: NextResponse
) => ReturnType<NextProxy>;

type MiddlewareFactory = (middleware: CustomMiddleware) => CustomMiddleware;

function compose(
  functions: MiddlewareFactory[],
  index = 0
): CustomMiddleware {
  const current = functions[index];

  if (current) {
    const next = compose(functions, index + 1);
    return current(next);
  }

  return (_req, _event, res) => res;
}

export function chain(functions: MiddlewareFactory[]): NextProxy {
  const composed = compose(functions);

  return (req, event) => composed(req, event);
}
