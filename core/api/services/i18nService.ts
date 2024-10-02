import i18next, { i18n } from "i18next";
import ResourcesBackend from "i18next-resources-to-backend";
import { $Dictionary } from "i18next/typescript/helpers";
import { TOptionsBase } from "i18next/typescript/options";
import { InterpolationMap } from "i18next/typescript/t.v4";
import { Service } from "typedi";
import path from "path"; // Import the path module

@Service()
export class I18nService {
  private i18nInstance: i18n;

  constructor() {
    this.initI18n();
  }

  private initI18n() {
    i18next
      .use(
        ResourcesBackend(
          (language: string, namespace: string) =>
            import(
              path.resolve(
                `/usr/app/api/util/locales/${language}/${namespace}.json`
              )
            )
        )
      )
      .init(
        {
          debug: false,
          lng: "en",
          fallbackLng: "en",
          supportedLngs: ["en", "sk"],
          defaultNS: "user",
          ns: [
            "user",
            "conference",
            "section",
            "ticket",
            "submission",
            "validation",
          ],
        },
        async (err, t) => {
          if (err) {
            console.error("Error initializing i18next:", err);
          }
        }
      );

    this.i18nInstance = i18next;
  }

  async changeLanguage(lang: string): Promise<void> {
    await this.i18nInstance.changeLanguage(lang);
  }

  translate(
    key: string,
    options?: TOptionsBase & $Dictionary & InterpolationMap<string>
  ): string {
    return this.i18nInstance.t(key, options);
  }

  language() {
    return i18next.language;
  }
}
