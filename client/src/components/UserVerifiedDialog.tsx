import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import { useContext, useEffect, useState } from "react";
import { Button, Grid, Header, Message } from "semantic-ui-react";
import { useResendActivationLinkMutation } from "../graphql/generated/schema";
import { AuthContext } from "../providers/Auth";
import { DialogContext } from "../providers/Dialog";

export default function UserVerifiedDialog() {
  const { t, i18n } = useTranslation("activation");
  const [msg, setMsg] = useState("");

  const { pathname } = useRouter();
  const { user } = useContext(AuthContext);
  const { handleOpen } = useContext(DialogContext);

  const [resendActivationLink, { error }] = useResendActivationLinkMutation();
  /* eslint-disable */
  useEffect(() => {
    if (
      user &&
      !user?.verified &&
      !pathname.includes("/activate") &&
      i18n.hasLoadedNamespace("activation")
    ) {
      const content = (
        <Grid.Column>
          <Header>{t("dialog.header")}</Header>
          <p>{t("dialog.body")}</p>
          <Button
            primary
            onClick={() => {
              resendActivationLink();
              setMsg(t("dialog.msg"));
            }}
          >
            {t("dialog.button")}
          </Button>
          {msg && (
            <Message
              positive
              compact
              content={msg}
              onDismiss={() => setMsg("")}
            />
          )}
          {error && <Message error compact content={error.message} />}
        </Grid.Column>
      );

      handleOpen({ content, size: "tiny" });
    }
  }, [user, i18n, msg, error]);

  return <div />;
}
