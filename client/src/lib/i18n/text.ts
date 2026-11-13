/** Selects short bilingual UI copy without importing feature actions. */
export const localizedText = (lng: string) => (sk: string, en: string) =>
  lng === "en" ? en : sk;

/** Generic error fallback; callers translate domain error codes themselves. */
export function errorMessage(error: unknown, lng: string) {
  const message = (error as { message?: string } | null)?.message;
  return (
    message ||
    localizedText(lng)(
      "Operácia zlyhala. Skúste to znova.",
      "The operation failed. Try again.",
    )
  );
}
