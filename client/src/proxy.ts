import type { NextProxy } from "next/server";
import { chain } from "./middlewares/chainMiddleware";
import { withAuth } from "./middlewares/authMiddleware";
import { withLocalization } from "./middlewares/i18nMiddleware";
import { withSubdomain } from "./middlewares/subdomainMiddleware";

export const config = {
  matcher: [
    "/((?!api|_next|favicon.ico|apple-icon|images|UKsans|manifest.webmanifest|sw.js|.pdf|.png|.well-known).*)",
  ],
};

export const proxy: NextProxy = chain([
  withLocalization,
  withAuth,
  withSubdomain,
]);
