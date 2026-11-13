import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
  timingSafeEqual,
} from "crypto";

function key() {
  const secret = process.env.NOTIFICATION_SECRET || process.env.SECRET;
  if (!secret)
    throw new Error("NOTIFICATION_SECRET or SECRET must be configured.");
  return createHash("sha256").update(secret).digest();
}
export function seal(value: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key(), iv);
  const content = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  return [iv, cipher.getAuthTag(), content]
    .map((b) => b.toString("base64url"))
    .join(".");
}
export function unseal(value: string) {
  const [iv, tag, content] = value
    .split(".")
    .map((v) => Buffer.from(v, "base64url"));
  const cipher = createDecipheriv("aes-256-gcm", key(), iv);
  cipher.setAuthTag(tag);
  return Buffer.concat([cipher.update(content), cipher.final()]).toString(
    "utf8",
  );
}
export function internalSecretValid(value: unknown) {
  const expected = process.env.NOTIFICATION_SECRET || process.env.SECRET;
  if (!expected || typeof value !== "string") return false;
  const a = Buffer.from(value),
    b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}
