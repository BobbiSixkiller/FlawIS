import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { NextPageWithLayout } from "../_app";
import { Grid, Header, Tab } from "semantic-ui-react";
import { useContext, useEffect } from "react";

import Dashboard from "../../components/Dashboard";
import { useMeQuery } from "../../graphql/generated/schema";
import { useTranslation } from "next-i18next";
import useWidth from "../../hooks/useWidth";
import {
  ActionTypes as ControlsActionTypes,
  ControlsContext,
} from "../../providers/ControlsProvider";
import PersonalInfo from "../../components/PersonalInfo";
import { useRouter } from "next/router";

const ProfilePage: NextPageWithLayout = () => {
  const { dispatch } = useContext(ControlsContext);
  const { t } = useTranslation(["common", "profile"]);
  const width = useWidth();
  const router = useRouter();

  const { data } = useMeQuery({
    variables: { year: null },
    notifyOnNetworkStatusChange: true,
  });

  const panes = [
    {
      menuItem: t("header", { ns: "profile" }),
      render: () => (
        <Tab.Pane basic attached={false} style={{ padding: 0 }}>
          <PersonalInfo />
        </Tab.Pane>
      ),
    },
    {
      menuItem: t("menu.conferences", { ns: "common" }),
      render: () => (
        <Tab.Pane basic attached={false} style={{ padding: 0 }}>
          Konferencie...
        </Tab.Pane>
      ),
    },
  ];

  useEffect(() => {
    dispatch({
      type: ControlsActionTypes.SetRightPanel,
      payload: { rightPanelItems: null },
    });
  }, [dispatch]);

  const activeIndex = panes.findIndex((p) => p.menuItem === router.query.tab);

  return (
    <Grid padded={width < 400 ? "vertically" : true}>
      <Grid.Row>
        <Grid.Column>
          <Header>{data?.me.name}</Header>
        </Grid.Column>
      </Grid.Row>
      <Grid.Row>
        <Grid.Column>
          <Tab
            menu={{ secondary: true, pointing: true }}
            activeIndex={activeIndex > -1 ? activeIndex : 0}
            panes={panes}
            onTabChange={(e, { activeIndex, panes }) =>
              router.push({
                pathname: `/profile`,
                query: {
                  tab: panes?.find((p, i) => i === activeIndex)?.menuItem,
                },
              })
            }
          />
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
