import { chain } from "./middlewares/chainMiddleware";
import { withAuth } from "./middlewares/authMiddleware";
import { withLocalization } from "./middlewares/i18nMiddleware";
import { withSubdomain } from "./middlewares/subdomainMiddleware";

export const config = {
  // do not localize next.js paths and public folder
  matcher: [
    "/((?!api|_next|favicon.ico|apple-icon|images|UKsans|manifest.webmanifest|browserconfig.xml|sw.js|.pdf).*)",
  ],
};

export default chain([withAuth, withLocalization, withSubdomain]);
