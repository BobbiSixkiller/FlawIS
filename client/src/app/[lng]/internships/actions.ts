"use server";

import {
  CreateInternshipDocument,
  InternshipInput,
  InternshipsDocument,
  InternshipsQueryVariables,
  UpdateInternshipDocument,
} from "@/lib/graphql/generated/graphql";
import { executeGqlFetch, executeGqlMutation } from "@/lib/graphql/actions";
import { cookies } from "next/headers";

export async function getInternships(vars: InternshipsQueryVariables) {
  const hasSession = (await cookies()).has("accessToken");
  const res = await executeGqlFetch(
    InternshipsDocument,
    vars,
    {},
    hasSession ? undefined : { tags: ["internships"], revalidate: 3600 },
    hasSession ? "no-store" : undefined,
  );

  if (res.errors) {
    console.log(res.errors[0]);
  }

  return res.data?.internships;
}

export async function createInternship(input: InternshipInput) {
  return await executeGqlMutation(
    CreateInternshipDocument,
    { input },
    (data) => ({
      message: data.createInternship.message,
    }),
    {
      revalidateTags: (data) => [
        "internships",
        `internships:${data.createInternship.data.id}`,
      ],
    },
  );
}

export async function updateInternship({
  id,
  input,
}: {
  id: string;
  input: InternshipInput;
}) {
  return executeGqlMutation(
    UpdateInternshipDocument,
    { id, input },
    (data) => ({
      message: data.updateInternship.message,
      data: data.updateInternship.data,
    }),
    {
      revalidateTags: () => ["internships", `internships:${id}`],
    },
  );
}
