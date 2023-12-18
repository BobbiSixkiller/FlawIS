import i18next, { i18n } from "i18next";
import ResourcesBackend from "i18next-resources-to-backend";
import { Service } from "typedi";

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
            import(`../util/locales/${language}/${namespace}.json`)
        )
      )
      .init(
        {
          debug: false,
          lng: "en",
          supportedLngs: ["en", "sk"],
          defaultNS: "translations",
          ns: "translations",
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

  translate(key: string): string {
    return this.i18nInstance.t(key);
  }
}
