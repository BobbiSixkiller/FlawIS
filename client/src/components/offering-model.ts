import {
  ConferenceListItemFragment,
  CourseListItemFragment,
} from "@/lib/graphql/generated/graphql";

export type OfferingCardModel = {
  badges: string[];
  end: Date;
  href: string;
  imageFit: "cover" | "contain";
  imageSrc: string;
  registrationEnd?: Date;
  start: Date;
  title: string;
};

export function offeringHref(base: string, identifier: string) {
  return base ? `${base}/${identifier}` : `/${identifier}`;
}

export function courseOfferingModel(
  course: CourseListItemFragment,
  hrefBase: string,
): OfferingCardModel {
  return {
    badges: [
      ...(course.hasElearning ? ["E-learning"] : []),
      ...course.categories.map((category) => category.name),
    ],
    end: new Date(course.end),
    href: offeringHref(hrefBase, String(course.id)),
    imageFit: "cover",
    imageSrc: course.thumbnail || "/images/img-placeholder.jpg",
    registrationEnd: new Date(course.registrationEnd),
    start: new Date(course.start),
    title: course.name,
  };
}

export function conferenceOfferingModel(
  conference: ConferenceListItemFragment,
  hrefBase: string,
  lng: string,
): OfferingCardModel {
  const translation = conference.translations[lng === "en" ? "en" : "sk"];
  return {
    badges: [],
    end: new Date(conference.dates.end),
    href: offeringHref(hrefBase, conference.slug),
    imageFit: "contain",
    imageSrc: translation.logoUrl || "/images/img-placeholder.jpg",
    registrationEnd: conference.dates.regEnd
      ? new Date(conference.dates.regEnd)
      : undefined,
    start: new Date(conference.dates.start),
    title: translation.name,
  };
}
