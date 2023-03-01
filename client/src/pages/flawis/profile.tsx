import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { NextPageWithLayout } from "../_app";
import { Grid, Header } from "semantic-ui-react";

import Dashboard from "../../components/Dashboard";
import { useTranslation } from "next-i18next";
import useWidth from "../../hooks/useWidth";

import PersonalInfo from "../../components/PersonalInfo";
import { useContext, useEffect } from "react";
import { ActionTypes, ControlsContext } from "../../providers/ControlsProvider";

const ProfilePage: NextPageWithLayout = () => {
  const { t } = useTranslation(["common", "profile"]);
  const { dispatch } = useContext(ControlsContext);
  const width = useWidth();

  useEffect(() => {
    dispatch({
      type: ActionTypes.SetRightPanel,
      payload: { rightPanelItems: null },
    });
  }, [dispatch]);

  return (
    <Grid padded={width < 400 ? "vertically" : true}>
      <Grid.Row>
        <Grid.Column>
          <Header>{t("menu.profile")}</Header>
        </Grid.Column>
      </Grid.Row>
      <Grid.Row>
        <Grid.Column>
          <PersonalInfo />
        </Grid.Column>
      </Grid.Row>
    </Grid>
  );
};

ProfilePage.getLayout = function getLayout(page) {
  return <Dashboard>{page}</Dashboard>;
};

export const getStaticProps = async ({ locale }: { locale: string }) => ({
  props: {
    protect: true,
    ...(await serverSideTranslations(locale, ["profile", "common"])),
  },
});

export default ProfilePage;
