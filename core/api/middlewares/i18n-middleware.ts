import { MiddlewareFn } from "type-graphql";
import { Context } from "../util/auth";
import Container from "typedi";
import { I18nService } from "../services/i18n.service";

export const I18nMiddleware: MiddlewareFn<Context> = async (
  { context: { locale } },
  next
) => {
  await Container.get(I18nService).changeLanguage(locale);

  return next();
};
