import { useCallback, useContext, useEffect } from "react";
import { AuthContext } from "../providers/Auth";
import { DialogContext } from "../providers/Dialog";

export default function UserVerifiedDialog() {
  const { user } = useContext(AuthContext);
  const { handleOpen } = useContext(DialogContext);

  const triggerDialog = useCallback(() => {
    handleOpen({ content: "USER NOT VERIFIED", size: "tiny" });
  }, []);

  useEffect(() => {
    if (user && !user?.verified) triggerDialog();
  }, [user, triggerDialog]);

  return <div />;
}
