"use server";

import {
  CategoriesDocument,
  CategoriesQueryVariables,
  CoursesDocument,
  CoursesQueryVariables,
  CreateCategoryDocument,
  CreateCategoryMutationVariables,
  CreateCourseDocument,
  CreateCourseMutationVariables,
  DeleteCategoryDocument,
  DeleteCategoryMutationVariables,
  UpdateCategoryDocument,
  UpdateCategoryMutationVariables,
} from "@/lib/graphql/generated/graphql";
import { executeGqlFetch, executeGqlMutation } from "@/utils/actions";

export async function getCourses(args: CoursesQueryVariables) {
  const res = await executeGqlFetch(CoursesDocument, args, null, {
    tags: ["courses"],
  });
  if (res.errors) {
    console.log(res.errors[0]);
  }

  return res.data.courses;
}

export async function createCourse(vars: CreateCourseMutationVariables) {
  return await executeGqlMutation(
    CreateCourseDocument,
    vars,
    (data) => ({
      message: data.createCourse.message,
      data: data.createCourse.data,
    }),
    { revalidateTags: () => ["courses"] }
  );
}

export async function fetchCategories(search: string) {
  const res = await executeGqlFetch(
    CategoriesDocument,
    { search } as CategoriesQueryVariables,
    null,
    { tags: ["categories"] },
  );
  if (res.errors) {
    console.log(res.errors[0]);
  }
  return res.data.categories;
}

export async function createCategoryAction(
  vars: CreateCategoryMutationVariables,
) {
  return await executeGqlMutation(
    CreateCategoryDocument,
    vars,
    (data) => ({
      message: data.createCategory.message,
      data: data.createCategory.data,
    }),
    { revalidateTags: () => ["categories", "courses"] },
  );
}

export async function updateCategoryAction(
  vars: UpdateCategoryMutationVariables,
) {
  return await executeGqlMutation(
    UpdateCategoryDocument,
    vars,
    (data) => ({
      message: data.updateCategory.message,
      data: data.updateCategory.data,
    }),
    { revalidateTags: () => ["categories", "courses"] },
  );
}

export async function deleteCategoryAction(
  vars: DeleteCategoryMutationVariables,
) {
  return await executeGqlMutation(
    DeleteCategoryDocument,
    vars,
    (data) => ({
      message: data.deleteCategory.message,
      data: data.deleteCategory.data,
    }),
    { revalidateTags: () => ["categories", "courses"] },
  );
}
