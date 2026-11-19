import { ObjectId } from "mongodb";
import { FieldType } from "../../entitites/Form";
export const REVIEW_CRITERIA = [
  {
    label: "Topic",
    options: [
      "Original choice",
      "Partial originality",
      "Low originality of the topic, but original form.",
      "Insufficient originality",
    ],
  },
  {
    label: "Contents point of view",
    options: [
      "Excellent – The paper is a\u00a0quality contribution to the professional discussion on the topic",
      "Good - The paper complements the professional discussion on the topic",
      "Sufficient - the paper provides a general view of the research outcome with regard to the topic",
      "Insufficient - the paper does not meet the basic requirements of the content of the scientific research.",
    ],
  },
  {
    label: "Professional level",
    options: [
      "High – The paper does not contain material deficiencies and the author demonstrates understanding of the chosen issue.",
      "Good – The paper does not contain material deficiencies and the author demonstrates knowledge in the chosen issue.",
      "Sufficient – The paper does not contain any substantial deficiencies. Even though the paper contains controversial statements, the author is able to make up for them using his own argumentation",
      "Insufficient – The paper contains material deficiencies and does not correspond with the current state of positive law or the state of scientific research in the issue",
    ],
  },
  {
    label: "Formal level (language, stylization, work with literature)",
    options: ["Excellent", "Good", "Sufficient", "Insufficient"],
  },
] as const;

// IDs are scoped to each immutable form version. Reusing the BPF conditions ID
// preserves its meaning when a coordinator publishes another version of the form.
export const conditionsId = "00000000000000000000bf26";

export function bpfQuestionnaire() {
  const ratings = REVIEW_CRITERIA.flatMap((criterion) => [
    {
      id: new ObjectId(),
      type: FieldType.RadioGroup,
      required: true,
      label: criterion.label,
      selectOptions: criterion.options.map((text, i) => ({
        value: String(i + 1),
        text,
      })),
    },
    {
      id: new ObjectId(),
      type: FieldType.Textarea,
      required: false,
      label: criterion.label + " — comments and suggestions",
    },
  ]);

  const recommendation = {
    id: new ObjectId(),
    type: FieldType.RadioGroup,
    label: "Overall recommendation",
    required: true,
    selectOptions: [
      { value: "PUBLISH", text: "I recommend publishing" },
      { value: "CONDITIONAL", text: "I recommend publishing conditionally" },
      { value: "REJECT", text: "I do not recommend publishing" },
    ],
  };
  return {
    fields: [
      ...ratings,
      recommendation,
      {
        id: new ObjectId(conditionsId),
        type: FieldType.Textarea,
        label: "Changes required for conditional publication",
        required: false,
      },
    ],
    recommendation,
  };
}

export function bpfFormalChecks(raw: Record<string, unknown>) {
  const words = Number(raw.abstractWords),
    keywords = Number(raw.keywordCount);

  if (
    raw.language !== "EN" ||
    raw.pageSize !== "B5" ||
    !Number.isInteger(words) ||
    words < 150 ||
    words > 200 ||
    !Number.isInteger(keywords) ||
    keywords < 4 ||
    keywords > 6 ||
    raw.bibliography !== "yes" ||
    raw.contacts !== "yes"
  )
    throw new Error(
      "Confirm English, B5, an abstract of 150–200 words, 4–6 keywords, bibliography and author contacts.",
    );
  return {
    language: "EN",
    pageSize: "B5",
    abstractWords: words,
    keywordCount: keywords,
    bibliography: "yes",
    contacts: "yes",
  };
}
