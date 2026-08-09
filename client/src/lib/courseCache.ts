export const COURSE_CACHE_REVALIDATE_SECONDS = 3600;

export const courseCacheTags = {
  collection: "courses",
  allDetails: "courses:details",
  categories: "categories",
  detail: (courseId: string) => `courses:${courseId}`,
  attendance: (courseId: string) => `courses:${courseId}:attendance`,
  reachConfig: (courseId: string) => `courses:${courseId}:reach-config`,
};

export function courseCacheConfig(...tags: string[]) {
  return {
    tags,
    revalidate: COURSE_CACHE_REVALIDATE_SECONDS,
  };
}

export function courseEntityMutationTags(courseId: string) {
  return [
    courseCacheTags.collection,
    courseCacheTags.detail(courseId),
    courseCacheTags.attendance(courseId),
    courseCacheTags.reachConfig(courseId),
  ];
}

export function courseAttendeeMutationTags(courseId: string) {
  return [
    courseCacheTags.detail(courseId),
    courseCacheTags.attendance(courseId),
  ];
}

export function courseCategoryMutationTags() {
  return [
    courseCacheTags.categories,
    courseCacheTags.collection,
    courseCacheTags.allDetails,
  ];
}
