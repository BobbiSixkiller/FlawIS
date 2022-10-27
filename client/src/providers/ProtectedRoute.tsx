import router from "next/router";
import { ReactNode, useContext } from "react";
import { Role } from "src/graphql/generated/schema";
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
    router.push("/login");
    return null;
  }

  if (admin && user.role !== Role.Admin) {
    router.push("/login");
    return null;
  }

  return <>{children}</>;
}
