import { Access } from "@/lib/graphql/generated/graphql";

type InternshipViewer = {
  id: unknown;
  access: Access[];
};

export function getInternshipAccess(
  viewer?: InternshipViewer | null,
  ownerId?: unknown,
) {
  const isAdmin = viewer?.access.includes(Access.Admin) ?? false;
  const isOrganization =
    !isAdmin && (viewer?.access.includes(Access.Organization) ?? false);
  const isStudent =
    !isAdmin &&
    !isOrganization &&
    (viewer?.access.includes(Access.Student) ?? false);
  const isOwner =
    isOrganization &&
    ownerId != null &&
    String(viewer?.id) === String(ownerId);

  return {
    canApply: isStudent,
    canCreate: isOrganization,
    canManage: isOwner,
    isAdmin,
    isOrganization,
    isStudent,
  };
}

export function normalizeQueryValues(value?: string | string[]) {
  if (!value) return undefined;
  return Array.isArray(value) ? value : [value];
}

export function internshipListHref(base: string, id: string) {
  const normalizedBase = base === "/" ? "" : base.replace(/\/$/, "");
  return `${normalizedBase}/${id}`;
}

export function isObjectId(value: string) {
  return /^[0-9a-fA-F]{24}$/.test(value);
}

export function replaceQueryParameter(
  query: string | URLSearchParams,
  key: string,
  value: string,
) {
  const params = new URLSearchParams(query);
  params.set(key, value);
  return params.toString();
}
