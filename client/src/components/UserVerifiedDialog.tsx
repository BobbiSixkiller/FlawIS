import { useRouter } from "next/router";
import { useContext, useEffect } from "react";
import { AuthContext } from "../providers/Auth";
import { DialogContext } from "../providers/Dialog";

export default function UserVerifiedDialog() {
  const { pathname } = useRouter();
  const { user } = useContext(AuthContext);
  const { handleOpen } = useContext(DialogContext);

  useEffect(() => {
    if (user && !user?.verified && !pathname.includes("/activate")) {
      handleOpen({ content: "USER NOT VERIFIED", size: "tiny" });
    }
  }, []);

  return <div />;
}
