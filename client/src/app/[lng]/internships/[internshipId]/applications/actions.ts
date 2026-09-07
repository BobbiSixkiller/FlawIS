"use server";

import {
  InternshipAcademicYearsDocument,
  InternshipAcademicYearsQueryVariables,
  InternsDocument,
  InternsQueryVariables,
} from "@/lib/graphql/generated/graphql";
import { executeGqlFetch } from "@/lib/graphql/actions";

export async function getInternshipAcademicYears(
  vars: InternshipAcademicYearsQueryVariables,
) {
  const res = await executeGqlFetch(
    InternshipAcademicYearsDocument,
    vars,
    null,
    undefined,
    "no-store",
  );

  if (res.errors?.length) {
    throw new Error(res.errors[0].message);
  }

  return res.data?.internships;
}

export async function getInterns(vars: InternsQueryVariables) {
  const res = await executeGqlFetch(
    InternsDocument,
    vars,
    null,
    undefined,
    "no-store",
  );

  if (res.errors) {
    console.log(res.errors[0]);
  }

  return res.data?.interns;
}
