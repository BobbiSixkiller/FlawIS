import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useRouter } from "next/router";
import { useContext, useEffect } from "react";
import { InView } from "react-intersection-observer";
import {
  Button,
  Card,
  Grid,
  Header,
  Icon,
  Message,
  Placeholder,
  Segment,
} from "semantic-ui-react";
import Dashboard from "../../../components/Dashboard";
import DeleteDialog from "../../../components/DeleteDialog";
import UserSearch from "../../../components/UserSearch";
import {
  useDeleteUserMutation,
  UsersDocument,
  useUsersQuery,
} from "../../../graphql/generated/schema";
import useWidth from "../../../hooks/useWidth";
import {
  ActionTypes,
  ControlsContext,
} from "../../../providers/ControlsProvider";
import { NextPageWithLayout } from "../../_app";

const AnnouncementsPage: NextPageWithLayout = () => {
  const { dispatch } = useContext(ControlsContext);
  const width = useWidth();
  const router = useRouter();

  const { data, error, loading, fetchMore } = useUsersQuery({
    variables: { first: 20 },
    notifyOnNetworkStatusChange: true,
  });

  const [deleteUser] = useDeleteUserMutation({
    refetchQueries: [{ query: UsersDocument }, "users"],
  });

  useEffect(() => {
    dispatch({
      type: ActionTypes.SetRightPanel,
      payload: { rightPanelItems: <UserSearch /> },
    });
  }, [dispatch]);

  return (
    <Grid padded={width < 400 ? "vertically" : true}>
      <Grid.Row verticalAlign="middle">
        <Grid.Column width={8}>
          <Header>Používatelia</Header>
        </Grid.Column>
      </Grid.Row>
      <Grid.Row>
        <Grid.Column>
          {error && <Message error content={error.message} />}
          {loading && (
            <>
              <Segment>
                <Placeholder>
                  <Placeholder.Header image>
                    <Placeholder.Line length="medium" />
                    <Placeholder.Line length="full" />
                  </Placeholder.Header>
                  <Placeholder.Paragraph>
                    <Placeholder.Line length="full" />
                    <Placeholder.Line length="medium" />
                  </Placeholder.Paragraph>
                </Placeholder>
              </Segment>
              <Segment>
                <Placeholder>
                  <Placeholder.Header image>
                    <Placeholder.Line length="medium" />
                    <Placeholder.Line length="full" />
                  </Placeholder.Header>
                  <Placeholder.Paragraph>
                    <Placeholder.Line length="full" />
                    <Placeholder.Line length="medium" />
                  </Placeholder.Paragraph>
                </Placeholder>
              </Segment>
              <Segment>
                <Placeholder>
                  <Placeholder.Header image>
                    <Placeholder.Line length="medium" />
                    <Placeholder.Line length="full" />
                  </Placeholder.Header>
                  <Placeholder.Paragraph>
                    <Placeholder.Line length="full" />
                    <Placeholder.Line length="medium" />
                  </Placeholder.Paragraph>
                </Placeholder>
              </Segment>
              <Segment>
                <Placeholder>
                  <Placeholder.Header image>
                    <Placeholder.Line length="medium" />
                    <Placeholder.Line length="full" />
                  </Placeholder.Header>
                  <Placeholder.Paragraph>
                    <Placeholder.Line length="full" />
                    <Placeholder.Line length="medium" />
                  </Placeholder.Paragraph>
                </Placeholder>
              </Segment>
            </>
          )}
          {data &&
            data.users.edges.map((edge) => (
              <Card fluid key={edge?.cursor}>
                <Card.Content>
                  <Card.Header> {edge?.node.name}</Card.Header>
                  <Card.Meta>{edge?.node.organisation}</Card.Meta>
                  <Card.Description>
                    <p>Email: {edge?.node.email}</p>
                    <p>Rola: {edge?.node.role}</p>
                    <p>
                      Overený používateľ:{" "}
                      {edge?.node.verified ? (
                        <Icon name="check" size="small" color="green" />
                      ) : (
                        <Icon name="x" size="small" color="red" />
                      )}
                    </p>
                  </Card.Description>
                </Card.Content>
                <Card.Content extra>
                  <DeleteDialog
                    confirmCb={async () =>
                      (await deleteUser({
                        variables: { id: edge?.cursor },
                      })) as Promise<void>
                    }
                    header="Zmazať grant"
                    content={<p>Naozaj chcete zmazať vybraného používateľa?</p>}
                    cancelText="Zrušiť"
                    confirmText="Potvrdiť"
                  />
                  <Button
                    primary
                    size="tiny"
                    icon="info"
                    onClick={() => router.push(`/users/${edge?.node.id}`)}
                  />
                </Card.Content>
              </Card>
            ))}
          {data?.users.pageInfo.hasNextPage && (
            <InView
              onChange={async (inView) => {
                if (inView) {
                  await fetchMore({
                    variables: {
                      after: data?.users.pageInfo.endCursor,
                      first: 20,
                    },
                  });
                }
              }}
            >
              <Segment>
                <Placeholder>
                  <Placeholder.Header image>
                    <Placeholder.Line length="medium" />
                    <Placeholder.Line length="full" />
                  </Placeholder.Header>
                  <Placeholder.Paragraph>
                    <Placeholder.Line length="full" />
                    <Placeholder.Line length="medium" />
                  </Placeholder.Paragraph>
                </Placeholder>
              </Segment>
            </InView>
          )}
        </Grid.Column>
      </Grid.Row>
    </Grid>
  );
};

AnnouncementsPage.getLayout = function getLayout(page) {
  return <Dashboard>{page}</Dashboard>;
};

export const getStaticProps = async ({ locale }: { locale: string }) => ({
  props: {
    admin: true,
    ...(await serverSideTranslations(locale, ["common"])),
  },
});

export default AnnouncementsPage;
