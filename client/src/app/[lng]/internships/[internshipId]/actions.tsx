"use server";

import {
  CreateInternDocument,
  CreateInternMutationVariables,
  DeleteInternDocument,
  DeleteInternshipDocument,
  InternshipDocument,
  UpdateInternDataDocument,
  UpdateInternDataMutationVariables,
} from "@/lib/graphql/generated/graphql";
import { executeGqlFetch, executeGqlMutation } from "@/utils/actions";

export async function getInternship(id: string) {
  const res = await executeGqlFetch(
    InternshipDocument,
    { id },
    {},
    { revalidate: 3600, tags: [`internships:${id}`] }
  );

  if (res.errors) {
    console.log(res.errors[0]);
  }

  return res.data?.internship;
}

export async function deleteInternship(id: string) {
  return await executeGqlMutation(
    DeleteInternshipDocument,
    { id },
    (data) => ({
      message: data.deleteInternship.message,
      data: data.deleteInternship.data,
    }),
    { revalidateTags: () => ["internships", `internships:${id}`] }
  );
}

export async function deleteIntern(id: string) {
  return await executeGqlMutation(
    DeleteInternDocument,
    { id },
    (data) => ({
      message: data.deleteIntern.message,
      data: data.deleteIntern.data,
    }),
    {
      revalidateTags: (data) => [
        "internships",
        `internships:${data.deleteIntern.data.internship}`,
      ],
    }
  );
}

export async function createIntern(vars: CreateInternMutationVariables) {
  return await executeGqlMutation(
    CreateInternDocument,
    vars,
    (data) => ({ message: data.createIntern.message }),
    {
      revalidateTags: () => ["internships", `internships:${vars.internshipId}`],
    }
  );
}

export async function changeInternData(
  vars: UpdateInternDataMutationVariables
) {
  return await executeGqlMutation(
    UpdateInternDataDocument,
    vars,
    (data) => ({
      message: data.updateInternData.message,
      data: data.updateInternData.data,
    }),
    {
      revalidateTags: (data) => [
        `internships:${data.updateInternData.data.internship}`,
      ],
    }
  );
}
