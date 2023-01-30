import router from "next/router";
import { ReactNode, useContext } from "react";
import { Role } from "../graphql/generated/schema";
import { AuthContext } from "./Auth";

export default function ProtectedRouteProvider({
  children,
  protect,
  admin,
}: {
  children: ReactNode;
  protect?: boolean;
  admin?: boolean;
}) {
  const { user } = useContext(AuthContext);

  if (!protect && !admin) return <>{children}</>;

  if (!user) {
    globalThis.sessionStorage.setItem("intendedPath", router.asPath);

    router.push("/login");
    return null;
  }

  if (admin && user.role !== Role.Admin) {
    globalThis.sessionStorage.setItem("intendedPath", router.asPath);

    router.push("/login");
    return null;
  }

  globalThis.sessionStorage.removeItem("intendedPath");

  return <>{children}</>;
}
