export const VARIABLE_SYMBOL_PREFIX_MAX_LENGTH = 6;
export const VARIABLE_SYMBOL_PREFIX_PATTERN = /^\d{1,6}$/;

export function normalizeVariableSymbolPrefix(value: string) {
  return value
    .replace(/\D/g, "")
    .slice(0, VARIABLE_SYMBOL_PREFIX_MAX_LENGTH);
}
