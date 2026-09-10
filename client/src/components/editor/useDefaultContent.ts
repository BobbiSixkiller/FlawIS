import { useTranslation } from "@/lib/i18n/client";

const escape = (value: string) =>
  value.replace(
    /[&<>"']/g,
    (character) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        character
      ]!,
  );
const paragraph = (value: string) => `<p>${escape(value)}</p>`;
const label = (value: string) =>
  `<p><strong><u>${escape(value)}</u></strong></p>`;
const list = (value: string) => `<ul><li>${paragraph(value)}</li></ul>`;

export default function useDefaultContent(
  lng: string,
  organization?: string | null,
) {
  const { t } = useTranslation(lng, ["internships", "courses"]);
  const defaultInternshipEditorContent = [
    `<h2>${escape(organization ?? t("editor.org"))}</h2>`,
    ...[
      ["dept", "name"],
      ["semesterLabel", "semester"],
      ["estimatedLength", "timePeriod"],
      ["internsCountLabel", "internsCount"],
      ["educLabel", "educ"],
      ["lngLabel", "lng"],
      ["otherLabel", "other"],
    ].flatMap(([heading, value]) => [
      label(t(`editor.${heading}`)),
      paragraph(t(`editor.${value}`)),
    ]),
    label(t("editor.internshipDescLabel")),
    list(t("editor.internshipDesc")),
  ].join("");
  const defaultCourseEditorContent = [
    ...[
      ["term", "termValue"],
      ["variableSymbol", "variableSymbolValue"],
      ["price", "priceValue"],
    ].flatMap(([heading, value]) => [
      label(t(`editor.${heading}`, { ns: "courses" })),
      paragraph(t(`editor.${value}`, { ns: "courses" })),
    ]),
    label(t("editor.syllabus", { ns: "courses" })),
    list("Sylabus 1"),
    `<p><strong><u>${escape(t("editor.profile", { ns: "courses" }))}</u></strong> Laicka verejnost</p>`,
    label(t("editor.lecturers", { ns: "courses" })),
    list("Meno"),
  ].join("");
  return { defaultInternshipEditorContent, defaultCourseEditorContent };
}
