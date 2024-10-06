export function capitalizeFirstLetter(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export function displayDate(utc?: string) {
  if (!utc) return "N/A";

  const date = new Date(utc);

  return date.toLocaleString("sk-SK", {
    weekday: "long", // Display the full name of the day
    year: "numeric",
    month: "long", // Full month name
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false, // Use 24-hour format
    timeZoneName: "short", // Include time zone abbreviation (e.g., CET or CEST)
    timeZone: "Europe/Bratislava", // Explicit time zone for Slovakia
  });
}
