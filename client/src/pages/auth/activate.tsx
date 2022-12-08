import { NextPage } from "next";
import { useTranslation } from "next-i18next";
import Image from "next/image";
import NextLink from "next/link";
import { Button, Grid, Header, Message } from "semantic-ui-react";
import logo from "public/images/Flaw-logo-notext.png";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useActivateUserMutation } from "../../graphql/generated/schema";
import { useRouter } from "next/router";
import { useEffect } from "react";

const ActivateUserAccount: NextPage = () => {
  const { query } = useRouter();
  const { t } = useTranslation("activation");

  const [activateAccount, { error }] = useActivateUserMutation();

  useEffect(() => {
    async function activateUserAcc() {
      return await activateAccount({
        variables: { token: query.token as string },
      });
    }

    activateAccount();
  }, []);

  return (
    <Grid container centered>
      <Grid.Row>
        <Grid.Column style={{ maxWidth: 340 }} textAlign="center">
          <div
            style={{
              width: "100%",
              display: "flex",
              flexDirection: "row",
              justifyContent: "center",
              paddingTop: "32px",
              cursor: "pointer",
            }}
          >
            <NextLink href="/">
              <Image
                alt="flaw-logo-notext"
                src={logo}
                height={48}
                width={48}
                priority={true}
              />
            </NextLink>
          </div>

          {error && (
            <Message error icon="warning">
              {error.message}
            </Message>
          )}

          <Header as="h2" textAlign="center">
            {t("header")}
          </Header>

          <Button primary as={NextLink} href="/">
            {t("link")}
          </Button>
        </Grid.Column>
      </Grid.Row>
    </Grid>
  );
};

export const getStaticProps = async ({ locale }: { locale: string }) => ({
  props: {
    ...(await serverSideTranslations(locale, ["activation"])),
  },
});

export default ActivateUserAccount;
