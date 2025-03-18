"use server";

import { executeGqlFetch } from "@/utils/actions";
import {
  ConferenceDocument,
  ConferencesDocument,
  CreateConferenceDocument,
  DeleteConferenceDocument,
  TextSearchConferenceDocument,
} from "@/lib/graphql/generated/graphql";
import { deleteFiles, uploadFile } from "@/lib/minio";
import parseValidationErrors, { ErrorException } from "@/utils/parseErrors";
import { revalidateTag } from "next/cache";
import { GetDataFilter } from "@/components/withInfiniteScroll";
import { notFound } from "next/navigation";

export async function getConferences(filter: GetDataFilter) {
  const res = await executeGqlFetch(
    ConferencesDocument,
    { ...filter },
    {}
    // { tags: ["conferences"], revalidate: 3600 }
  );

  if (res.errors) {
    console.log(res.errors[0]);
  }

  return res.data?.conferences;
}

export async function getConference(slug: string) {
  //   await new Promise((resolve) => setTimeout(resolve, 5000));

  const res = await executeGqlFetch(
    ConferenceDocument,
    { slug }
    // {},
    // {
    //   tags: [`conference:${slug}`],
    //   revalidate: 3600,
    // }
  );

  if (res.errors) {
    console.log(res.errors[0]);
    return notFound();
  }

  return res.data?.conference;
}

export async function searchConference(params: { text: string }) {
  const res = await executeGqlFetch(TextSearchConferenceDocument, params);

  return res.data.textSearchConference || [];
}

export async function createConference(data: FormData) {
  try {
    const logo: File | null = data.get("translations.sk.logo") as File;
    const logoLocalized: File | null = data.get("translations.en.logo") as File;
    const stamp: File | null = data.get("billing.stamp") as File;

    if (!logo || !logoLocalized || !stamp)
      throw new Error("Files not provided!");

    const [logoUrl, logoLocalizedUrl, stampUrl] = await Promise.all([
      uploadFile(
        "images",
        logo.name.toLocaleLowerCase().replaceAll(" ", "-"),
        logo
      ),
      uploadFile(
        "images",
        logoLocalized.name.toLocaleLowerCase().replaceAll(" ", "-"),
        logoLocalized
      ),
      uploadFile(
        "images",
        stamp.name.toLocaleLowerCase().replaceAll(" ", "-"),
        stamp
      ),
    ]);

    const res = await executeGqlFetch(CreateConferenceDocument, {
      data: {
        translations: {
          sk: {
            name: data.get("translations.sk.name")?.toString() as string,
            logoUrl,
          },
          en: {
            name: data.get("translations.en.name")?.toString() as string,
            logoUrl,
          },
        },
        dates: {
          start: new Date(data.get("dates.start")?.toString() as string),
          end: new Date(data.get("dates.end")?.toString() as string),
        },
        slug: data.get("slug")?.toString() as string,
        billing: {
          name: data.get("billing.name") as string,
          address: {
            street: data.get("billing.address.street")?.toString() as string,
            city: data.get("billing.address.city")?.toString() as string,
            postal: data.get("billing.address.postal")?.toString() as string,
            country: data.get("billing.address.country")?.toString() as string,
          },
          DIC: data.get("billing.DIC")?.toString() as string,
          ICO: data.get("billing.ICO")?.toString() as string,
          ICDPH: data.get("billing.ICDPH")?.toString() as string,
          IBAN: data.get("billing.IBAN")?.toString() as string,
          SWIFT: data.get("billing.SWIFT")?.toString() as string,
          variableSymbol: data
            .get("billing.variableSymbol")
            ?.toString() as string,
          stampUrl,
        },
      },
    });
    if (res.errors) {
      const { validationErrors } = res.errors[0].extensions as ErrorException;

      await deleteFiles([logoUrl, logoLocalizedUrl, stampUrl]);

      throw new Error(
        validationErrors
          ? Object.values(parseValidationErrors(validationErrors)).join(" ")
          : res.errors[0].message
      );
    }

    revalidateTag("conferences");
    return { success: true, message: res.data.createConference.message };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function deleteConference(prevState: any, data: FormData) {
  try {
    const res = await executeGqlFetch(DeleteConferenceDocument, {
      id: data.get("id")?.toString(),
    });
    if (res.errors) {
      throw new Error(res.errors[0].message);
    }

    await deleteFiles([
      res.data.deleteConference.data.translations.sk.logoUrlEnv,
      res.data.deleteConference.data.translations.sk.logoUrlEnv,
      res.data.deleteConference.data.billing.stampUrl,
    ]);

    revalidateTag("conferences");
    revalidateTag(`conference:${res.data.deleteConference.data.slug}`);
    return { success: true, message: res.data.deleteConference.message };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}
