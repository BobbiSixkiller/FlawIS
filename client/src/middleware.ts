import { chain } from "./middlewares/chainMiddleware";
import { withAuth } from "./middlewares/authMiddleware";
import { withLocalization } from "./middlewares/i18nMiddleware";
import { withSubdomain } from "./middlewares/subdomainMiddleware";

export const config = {
  matcher: [
    "/((?!api|_next|favicon.ico|apple-icon|images|UKsans|manifest.webmanifest|sw.js|.pdf).*)",
  ],
};

export default chain([withAuth, withLocalization, withSubdomain]);
