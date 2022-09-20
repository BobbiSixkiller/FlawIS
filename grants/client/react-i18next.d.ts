// import the original type declarations
import "react-i18next";
import common from "../public/locales/en/common.json";

interface MyResources {
  common: typeof common;
}

declare module "react-i18next" {
  // and extend them!
  // eslint-disable-next-line no-unused-vars
  interface Resources extends MyResources {}
}
