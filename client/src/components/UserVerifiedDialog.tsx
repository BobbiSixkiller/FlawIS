import { useContext, useEffect } from "react";
import { AuthContext } from "../providers/Auth";
import { DialogContext } from "../providers/Dialog";

export default function UserVerifiedDialog() {
  const { user } = useContext(AuthContext);
  const { handleOpen } = useContext(DialogContext);

  useEffect(() => {
    if (user && !user?.verified)
      handleOpen({ content: "USER NOT VERIFIED", size: "tiny" });
  }, []);

  return <div />;
}
