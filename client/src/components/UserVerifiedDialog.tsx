import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import { useContext, useEffect, useState } from "react";
import { Button, Grid, Header, Message } from "semantic-ui-react";
import { useResendActivationLinkMutation } from "../graphql/generated/schema";
import { AuthContext } from "../providers/Auth";
import { DialogContext } from "../providers/Dialog";

export default function UserVerifiedDialog() {
  const { t, i18n } = useTranslation();
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
      i18n.exists("dialog.header", { ns: "activation" })
    ) {
      const content = (
        <Grid.Column>
          <Header>{t("dialog.header", { ns: "activation" })}</Header>
          <p>{t("dialog.body", { ns: "activation" })}</p>
          <Button
            primary
            onClick={() => {
              resendActivationLink();
              setMsg(t("dialog.msg", { ns: "activation" }));
            }}
          >
            {t("dialog.button", { ns: "activation" })}
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

  console.log(
    i18n.hasLoadedNamespace("activation"),
    i18n.exists("dialog.header", { ns: "activation" })
  );

  return <div />;
}
