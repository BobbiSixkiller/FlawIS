import { useTranslation } from "@/lib/i18n/client";

export default function useDefaultContent(lng: string, organization?: string) {
  const { t } = useTranslation(lng, ["internships", "courses"]);

  const defaultInternshipEditorContent = {
    type: "doc",
    content: [
      {
        type: "heading",
        attrs: { level: 2 },
        content: [
          {
            type: "text",
            text: organization ?? t("editor.org"),
          },
        ],
      },
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            marks: [
              {
                type: "bold",
              },
              {
                type: "underline",
              },
            ],
            text: t("editor.dept"),
          },
        ],
      },
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: t("editor.name"),
          },
        ],
      },
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            marks: [
              {
                type: "bold",
              },
              {
                type: "underline",
              },
            ],
            text: t("editor.semesterLabel"),
          },
        ],
      },
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: t("editor.semester"),
          },
        ],
      },
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            marks: [
              {
                type: "bold",
              },
              {
                type: "underline",
              },
            ],
            text: t("editor.estimatedLength"),
          },
        ],
      },
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: t("editor.timePeriod"),
          },
        ],
      },
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            marks: [
              {
                type: "bold",
              },
              {
                type: "underline",
              },
            ],
            text: t("editor.internsCountLabel"),
          },
        ],
      },
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: t("editor.internsCount"),
          },
        ],
      },
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            marks: [
              {
                type: "bold",
              },
              {
                type: "underline",
              },
            ],
            text: t("editor.educLabel"),
          },
        ],
      },
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: t("editor.educ"),
          },
        ],
      },
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            marks: [
              {
                type: "bold",
              },
              {
                type: "underline",
              },
            ],
            text: t("editor.lngLabel"),
          },
        ],
      },
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: t("editor.lng"),
          },
        ],
      },
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            marks: [
              {
                type: "bold",
              },
              {
                type: "underline",
              },
            ],
            text: t("editor.otherLabel"),
          },
        ],
      },
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: t("editor.other"),
          },
        ],
      },
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            marks: [
              {
                type: "bold",
              },
              {
                type: "underline",
              },
            ],
            text: t("editor.internshipDescLabel"),
          },
        ],
      },
      {
        type: "bulletList",
        attrs: {
          tight: true,
        },
        content: [
          {
            type: "listItem",
            content: [
              {
                type: "paragraph",
                content: [
                  {
                    type: "text",
                    text: t("editor.internshipDesc"),
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  };

  const defaultCourseEditorContent = {
    type: "doc",
    content: [
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            marks: [
              {
                type: "bold",
              },
              {
                type: "underline",
              },
            ],
            text: t("editor.term", { ns: "courses" }),
          },
        ],
      },
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: t("editor.termValue", { ns: "courses" }),
          },
        ],
      },
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            marks: [
              {
                type: "bold",
              },
              {
                type: "underline",
              },
            ],
            text: t("editor.variableSymbol", { ns: "courses" }),
          },
        ],
      },
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: t("editor.variableSymbolValue", { ns: "courses" }),
          },
        ],
      },
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            marks: [
              {
                type: "bold",
              },
              {
                type: "underline",
              },
            ],
            text: t("editor.price", { ns: "courses" }),
          },
        ],
      },
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: t("editor.priceValue", { ns: "courses" }),
          },
        ],
      },
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            marks: [
              {
                type: "bold",
              },
              {
                type: "underline",
              },
            ],
            text: t("editor.syllabus", { ns: "courses" }),
          },
        ],
      },
      {
        type: "bulletList",
        attrs: {
          tight: true,
        },
        content: [
          {
            type: "listItem",
            content: [
              {
                type: "paragraph",
                content: [
                  {
                    type: "text",
                    text: "Sylabus 1",
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            marks: [
              {
                type: "bold",
              },
              {
                type: "underline",
              },
            ],
            text: t("editor.profile", { ns: "courses" }),
          },
          { type: "text", text: " Laicka verejnost" },
        ],
      },
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            marks: [
              {
                type: "bold",
              },
              {
                type: "underline",
              },
            ],
            text: t("editor.lecturers", { ns: "courses" }),
          },
        ],
      },
      {
        type: "bulletList",
        attrs: {
          tight: true,
        },
        content: [
          {
            type: "listItem",
            content: [
              {
                type: "paragraph",
                content: [
                  {
                    type: "text",
                    text: "Meno",
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  };

  return { defaultInternshipEditorContent, defaultCourseEditorContent };
}
