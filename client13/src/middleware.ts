import { chain } from "./utils/chainMiddleware";
import { withLocalization } from "./lib/i18n/middleware";
import { withAuth } from "./utils/auth";

export const config = {
  // do not localize next.js paths and public folder
  matcher: [
    "/((?!api|_next/static|_next/image|images|UKsans|site.webmanifest|browserconfig.xml|sw.js|.pdf).*)",
  ],
};

export default chain([withAuth, withLocalization]);
