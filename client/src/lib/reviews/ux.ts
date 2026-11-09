import { reviewMutation } from "./actions";
export const tr = (lng: string) => (sk: string, en: string) =>
  lng === "en" ? en : sk;
export async function mutate<T = unknown>(
  operation: string,
  args: Record<string, unknown>,
): Promise<T> {
  const result = await reviewMutation(operation, args);
  if (!result.ok)
    throw Object.assign(new Error(result.error.message), result.error);
  return result.value as T;
}
export const messages: Record<string, [string, string]> = {
  REVIEWS_DISABLED: [
    "Najskôr povoľte recenzovanie v nastaveniach.",
    "Enable reviews in settings first.",
  ],
  PAPER_CLOSED: [
    "Príspevok je uzavretý. Najskôr ho znova otvorte.",
    "This submission is closed. Reopen it first.",
  ],
  INACTIVE_PARTICIPANT: [
    "Recenzovanie vyžaduje aktívneho účastníka.",
    "Reviewing requires an active participant.",
  ],
  ORIGINAL_REQUIRED: [
    "Najskôr nahrajte originál rukopisu.",
    "Upload the original manuscript first.",
  ],
  ANONYMOUS_REQUIRED: [
    "Najskôr nahrajte anonymizovanú kópiu.",
    "Upload an anonymized copy first.",
  ],
  APPROVAL_REQUIRED: [
    "Najskôr potvrďte formálnu kontrolu a anonymizáciu.",
    "Approve formal checks and anonymity first.",
  ],
  ROUND_FROZEN: [
    "Odoslaná verzia je uzamknutá. Zmeny vyžadujú nový rukopis.",
    "The sent version is locked. Changes require a new manuscript.",
  ],
  QUESTIONNAIRE_REQUIRED: [
    "Najskôr nastavte dotazník.",
    "Configure a questionnaire first.",
  ],
  SLOTS_FULL: [
    "Všetci recenzenti sú priradení. Pred výmenou zrušte priradenie.",
    "All slots are filled. Cancel an assignment before replacing it.",
  ],
  ROUND_INCOMPLETE: [
    "Najskôr dokončite alebo zrušte aktuálne priradenia.",
    "Complete or cancel current assignments first.",
  ],
  REVISION_OPEN: [
    "Výzva na opravu už čaká na vybavenie.",
    "A revision request is already open.",
  ],
  ACCEPTANCE_BLOCKED: [
    "Vyžadujú sa všetky posudky a overenie opráv.",
    "All required reports and verified corrections are needed.",
  ],
  REVIEWER_INACTIVE: [
    "Vyberte aktívneho recenzenta.",
    "Select an active reviewer.",
  ],
  SELF_REVIEW: [
    "Autor nemôže recenzovať vlastný príspevok.",
    "Authors cannot review their own submission.",
  ],
  AFFILIATION_INCOMPLETE: [
    "Neúplné informácie o pracovisku alebo spôsobilosti.",
    "Affiliation or eligibility information is incomplete.",
  ],
  DEPARTMENT_MATCH: [
    "Zhodné pracovisko s autorom.",
    "Affiliation matches an author.",
  ],
  SECTION_PARTICIPANT: [
    "Recenzent sa zúčastnil tejto sekcie.",
    "Reviewer participated in this section.",
  ],
  SECTION_GUARANTOR: [
    "Recenzent je garantom tejto sekcie.",
    "Reviewer is a section guarantor.",
  ],
  DECLARED_CONFLICT: [
    "Evidovaný konflikt pri tomto príspevku.",
    "A conflict is declared for this submission.",
  ],
  CONFLICT: [
    "Údaje zmenil iný používateľ. Obnovte údaje a skontrolujte svoj návrh.",
    "Another user changed this record. Refresh and check your draft before retrying.",
  ],
};
export const explain = (code: string, lng: string) =>
  messages[code]?.[lng === "en" ? 1 : 0] || code;
export const errorText = (error: unknown, lng: string) => {
  const e = error as { code?: string; message?: string };
  return e.code && messages[e.code]
    ? explain(e.code, lng)
    : e.message ||
        tr(lng)(
          "Požiadavka zlyhala. Skúste znova.",
          "Request failed. Try again.",
        );
};
export function bratislavaDeadline(date: string) {
  const offset =
    new Intl.DateTimeFormat("en", {
      timeZone: "Europe/Bratislava",
      timeZoneName: "longOffset",
    })
      .formatToParts(new Date(`${date}T12:00:00Z`))
      .find((p) => p.type === "timeZoneName")
      ?.value.replace("GMT", "") || "+00:00";
  return new Date(`${date}T23:59:59${offset}`).toISOString();
}
