/** Formats an application date in the university's timezone. */
export const formatDate = (value: string, lng: string) =>
  new Intl.DateTimeFormat(lng === "en" ? "en-GB" : "sk-SK", {
    dateStyle: "medium",
    timeZone: "Europe/Bratislava",
  }).format(new Date(value));
