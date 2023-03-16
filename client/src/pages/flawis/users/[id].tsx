import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useRouter } from "next/router";
import { useContext, useEffect } from "react";
import { Grid, Header, Tab } from "semantic-ui-react";
import Dashboard from "../../../components/Dashboard";
import DeleteDialog from "../../../components/DeleteDialog";
import PersonalInfo from "../../../components/PersonalInfo";
import UserGrants from "../../../components/UserGrants";
import {
  useDeleteUserMutation,
  UsersDocument,
  useUserQuery,
} from "../../../graphql/generated/schema";
import useWidth from "../../../hooks/useWidth";
import {
  ActionTypes,
  ControlsContext,
} from "../../../providers/ControlsProvider";
import { NextPageWithLayout } from "../../_app";

const UserPage: NextPageWithLayout = () => {
  const { dispatch } = useContext(ControlsContext);
  const { t } = useTranslation(["common"]);
  const width = useWidth();
  const router = useRouter();

  const [deleteUser] = useDeleteUserMutation({
    refetchQueries: [{ query: UsersDocument }, "users"],
  });

  const { data, error, loading, refetch } = useUserQuery({
    variables: { id: router.query.id, year: router.query.year },
    notifyOnNetworkStatusChange: true,
  });

  console.log(data);

  useEffect(() => {
    dispatch({
      type: ActionTypes.SetRightPanel,
      payload: { rightPanelItems: null },
    });
  }, [dispatch, data, loading, error, refetch, t]);

  const panes = [
    {
      menuItem: t("header", { ns: "profile" }),
      render: () => (
        <Tab.Pane
          loading={loading}
          basic
          attached={false}
          style={{ padding: 0 }}
        >
          {data && <PersonalInfo user={data?.user} />}
        </Tab.Pane>
      ),
    },
    {
      menuItem: t("menu.conferences", { ns: "common" }),
      render: () => (
        <Tab.Pane
          loading={loading}
          basic
          attached={false}
          style={{ padding: 0 }}
        >
          Konferencie...
        </Tab.Pane>
      ),
    },
    {
      menuItem: t("menu.grants", { ns: "common" }),
      render: () => (
        <Tab.Pane
          basic
          attached={false}
          style={{ padding: 0 }}
          loading={loading}
        >
          <UserGrants
            onProfilePage={false}
            data={data?.user.grants}
            error={error}
            loading={loading}
            refetch={refetch}
          />
        </Tab.Pane>
      ),
    },
  ];

  const activeIndex = panes.findIndex((p) => p.menuItem === router.query.tab);

  return (
    <Grid padded={width < 400 ? "vertically" : true}>
      <Grid.Row verticalAlign="middle">
        <Grid.Column width={12}>
          <Header>{data?.user.name}</Header>
        </Grid.Column>
        <Grid.Column floated="right">
          <DeleteDialog
            buttonProps={{ floated: "right" }}
            confirmCb={async () => {
              (await deleteUser({
                variables: { id: data?.user.id },
              })) as Promise<void>;
              router.back();
            }}
            header="Zmazať používateľa"
            content={<p>Naozaj chcete zmazať vybraného používateľa?</p>}
            cancelText="Zrušiť"
            confirmText="Potvrdiť"
          />
        </Grid.Column>
      </Grid.Row>
      <Grid.Row>
        <Grid.Column>
          <Tab
            activeIndex={activeIndex > -1 ? activeIndex : 0}
            menu={{ secondary: true, pointing: true }}
            panes={panes}
            onTabChange={(e, { activeIndex, panes }) =>
              router.push({
                pathname: `/users/${router.query.id}`,
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

UserPage.getLayout = function getLayout(page) {
  return <Dashboard>{page}</Dashboard>;
};

export const getServerSideProps = async ({ locale }: { locale: string }) => ({
  props: {
    admin: true,
    ...(await serverSideTranslations(locale, ["common", "profile"])),
  },
});

export default UserPage;
