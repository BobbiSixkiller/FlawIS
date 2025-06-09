import { ArgumentValidationError, MiddlewareFn } from "type-graphql";
import { Context } from "../util/auth";
import Container from "typedi";
import { I18nService } from "../services/i18n.service";

export const ErrorsMiddleware: MiddlewareFn<Context> = async (
  { context: { locale } },
  next
) => {
  const i18nService = Container.get(I18nService);
  await i18nService.changeLanguage(locale);

  try {
    return await next();
  } catch (error: any) {
    // Check if it's a validation error
    console.log(error);

    if (error instanceof ArgumentValidationError) {
      error.message = i18nService.translate("400", {
        ns: "common",
      });
    }

    throw error;
  }
};
