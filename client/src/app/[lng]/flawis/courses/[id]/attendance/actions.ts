"use server";

import {
  AttendanceDocument,
  AttendanceQueryVariables,
} from "@/lib/graphql/generated/graphql";
import { executeGqlFetch } from "@/utils/actions";

export async function getCourseAttendance(vars: AttendanceQueryVariables) {
  const res = await executeGqlFetch(AttendanceDocument, vars);

  if (res.errors) {
    console.log(res.errors[0]);
  }

  return res.data.course;
}
