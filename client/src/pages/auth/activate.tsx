import { NextPage } from "next";
import { useTranslation } from "next-i18next";
import Image from "next/image";
import NextLink from "next/link";
import { Grid, Header, Loader } from "semantic-ui-react";
import logo from "public/images/Flaw-logo-notext.png";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useActivateUserMutation } from "../../graphql/generated/schema";
import { useRouter } from "next/router";
import { useEffect, useRef } from "react";

const ActivateUserAccount: NextPage = () => {
  const { query, push, reload } = useRouter();
  const { t } = useTranslation("activation");
  const mount = useRef(false);

  const [activateAccount, { loading }] = useActivateUserMutation({
    onCompleted: (data) => {
      if (!data.activateUser) push("/");
      window.location.reload();
    },
    onError: () => push("/"),
  });

  useEffect(() => {
    async function activateUserAcc() {
      return await activateAccount({
        variables: { token: query.token as string },
      });
    }
    if (mount.current) return;
    mount.current = true;

    activateUserAcc();
  }, []);

  if (loading) return <Loader active />;

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

          <Header as="h2" textAlign="center">
            {t("header")}
          </Header>
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
