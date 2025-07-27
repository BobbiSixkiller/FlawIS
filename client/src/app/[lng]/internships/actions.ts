"use server";

import {
  CreateInternshipDocument,
  InternshipInput,
  InternshipsDocument,
  InternshipsQueryVariables,
  UpdateInternshipDocument,
} from "@/lib/graphql/generated/graphql";
import { executeGqlFetch, executeGqlMutation } from "@/utils/actions";

export async function getInternships(vars: InternshipsQueryVariables) {
  //   await new Promise((resolve) => setTimeout(resolve, 5000));
  const res = await executeGqlFetch(
    InternshipsDocument,
    vars,
    {},
    { tags: ["internships"], revalidate: 3600 }
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
    { revalidateTags: () => ["internships"] }
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
      revalidateTags: () => ["internships", `internship:${id}`],
    }
  );
}
