import { parsePhoneNumberFromString } from "libphonenumber-js/core";
import metadata from "libphonenumber-js/metadata.min.json";

export function parsePhone(value: string) {
  return parsePhoneNumberFromString(value, metadata);
}
