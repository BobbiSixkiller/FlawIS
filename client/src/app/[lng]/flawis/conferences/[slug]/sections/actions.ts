"use server";

import {
  ConferenceSectionsDocument,
  CreateSectionDocument,
  DeleteSectionDocument,
  SectionInput,
  UpdateSectionDocument,
} from "@/lib/graphql/generated/graphql";
import { executeGqlFetch } from "@/utils/actions";
import parseValidationErrors, { ErrorException } from "@/utils/parseErrors";
import { revalidateTag } from "next/cache";

export async function conferenceSections(params: {
  slug: string;
  first?: number;
  after?: string;
}) {
  const res = await executeGqlFetch(ConferenceSectionsDocument, params);
  if (res.errors) {
    console.log(res.errors[0]);
  }

  return res.data.conference;
}

export async function createSection(
  data: SectionInput,
  conferenceSlug: string
) {
  try {
    const res = await executeGqlFetch(CreateSectionDocument, {
      data,
    });

    if (res.errors) {
      const { validationErrors } = res.errors[0].extensions as ErrorException;

      throw new Error(
        validationErrors
          ? Object.values(parseValidationErrors(validationErrors)).join(" ")
          : res.errors[0].message
      );
    }

    revalidateTag(`conference:${conferenceSlug}`);
    return { success: true, message: res.data.createSection.message };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function deleteSection(prevState: any, data: FormData) {
  const res = await executeGqlFetch(DeleteSectionDocument, {
    id: data.get("id")?.toString(),
  });
  if (res.errors) {
    return { success: false, message: res.errors[0].message };
  }

  revalidateTag(`conference:${res.data.deleteSection.data.conference?.slug}`);
  return { success: true, message: res.data.deleteSection.message };
}

export async function updateSection(data: SectionInput, sectionId: string) {
  try {
    const res = await executeGqlFetch(UpdateSectionDocument, {
      id: sectionId,
      data,
    });
    if (res.errors) {
      throw new Error(res.errors[0].message);
    }

    revalidateTag(`conference:${res.data.updateSection.data.conference?.slug}`);
    return { success: true, message: res.data.updateSection.message };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}
