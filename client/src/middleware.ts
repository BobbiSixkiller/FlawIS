import { chain } from "./middlewares/chainMiddleware";
import { withAuth } from "./middlewares/authMiddleware";
import { withLocalization } from "./middlewares/i18nMiddleware";
import { withTenant } from "./middlewares/tenantMiddleware";

export const config = {
  // do not localize next.js paths and public folder
  matcher: [
    "/((?!api|_next|favicon.ico|images|UKsans|site.webmanifest|browserconfig.xml|sw.js|.pdf).*)",
  ],
};

export default chain([withTenant, withAuth, withLocalization]);
