const objectIdRegex = /^\/[0-9a-fA-F]{24}$/;

type SubdomainType = "courses" | "flawis" | "conferences" | "internships";

function getSubdomainType(host: string): SubdomainType {
  const first = host.split(".")[0];

  if (first.includes("courses")) return "courses";
  if (first.includes("flawis")) return "flawis";
  if (first.includes("conferences")) return "conferences";
  if (first.includes("intern")) return "internships";

  // Local development defaults to the courses tenant.
  return "courses";
}

const subdomainExtraPublic: Record<SubdomainType, (path: string) => boolean> = {
  flawis: () => false,
  conferences: (path) => path === "/" || objectIdRegex.test(path),
  internships: () => false,
  courses: (path) => path === "/" || objectIdRegex.test(path),
};

export function isSubdomainPublicPath(host: string, path: string) {
  return subdomainExtraPublic[getSubdomainType(host)](path);
}
