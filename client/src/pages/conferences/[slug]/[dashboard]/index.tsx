import { NextPageContext } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useRouter } from "next/router";
import { useContext, useEffect } from "react";
import { Card, Grid, Header, Loader, Message } from "semantic-ui-react";
import AddTicketDialog from "../../../../components/AddTicketDialog";
import Attendee from "../../../../components/AttendeeComponent";
import Dashboard from "../../../../components/Dashboard";
import DeleteDialog from "../../../../components/DeleteDialog";
import ExportCSV from "../../../../components/ExportCSV";
import SectionDialog from "../../../../components/SectionDialog";
import {
  ConferenceDocument,
  Role,
  useConferenceQuery,
  useDeleteSectionMutation,
  useRemoveTicketMutation,
} from "../../../../graphql/generated/schema";
import useWidth from "../../../../hooks/useWidth";
import { addApolloState, initializeApollo } from "../../../../lib/apollo";
import { AuthContext } from "../../../../providers/Auth";
import {
  ActionTypes,
  ControlsContext,
} from "../../../../providers/ControlsProvider";
import { NextPageWithLayout } from "../../../_app";

const DashboardPage: NextPageWithLayout = () => {
  const { user } = useContext(AuthContext);
  const { dispatch } = useContext(ControlsContext);
  const router = useRouter();
  const width = useWidth();

  useEffect(() => {
    dispatch({
      type: ActionTypes.SetRightPanel,
      payload: {
        rightPanelItems: null,
      },
    });
  }, [dispatch]);

  const { data, error, loading } = useConferenceQuery({
    variables: { slug: router.query.slug as string },
  });

  const [removeTicket] = useRemoveTicketMutation();
  const [deleteSection] = useDeleteSectionMutation();

  if (loading) {
    return (
      <Grid.Column style={{ height: "400px" }}>
        <Loader active />
      </Grid.Column>
    );
  }
  if (error) return <Message negative content={error.message} />;

  return user?.role === Role.Basic ? (
    <Attendee title={data?.conference.name} data={data?.conference.attending} />
  ) : (
    <Grid padded={width < 400 ? "vertically" : true}>
      <Grid.Row>
        <Grid.Column>
          <Header>{data?.conference.name}</Header>
        </Grid.Column>
      </Grid.Row>
      <Grid.Row columns={2}>
        <Grid.Column>
          <Header>Lístky</Header>
        </Grid.Column>
        <Grid.Column>
          <AddTicketDialog id={data?.conference.id} />
        </Grid.Column>
      </Grid.Row>
      <Grid.Row>
        <Grid.Column>
          {data?.conference.tickets.map((ticket) => (
            <Card fluid key={ticket.id}>
              <Card.Content>
                <Card.Header>
                  {ticket.name}, {ticket.price / 100} €
                </Card.Header>
                <Card.Meta>
                  {ticket.online && "Online účasť"}{" "}
                  {ticket.withSubmission && "S príspevkom"}
                </Card.Meta>
                <Card.Description>
                  <p>{ticket.description}</p>
                </Card.Description>
              </Card.Content>
              <Card.Content extra>
                <DeleteDialog
                  confirmCb={async () =>
                    (await removeTicket({
                      variables: {
                        id: data.conference.id,
                        ticketId: ticket.id,
                      },
                      update(cache, { data }) {
                        cache.modify({
                          id: cache.identify({
                            __ref: `Conference:${data?.removeTicket.id}`,
                          }),
                          fields: {
                            tickets(existing) {
                              const tickets = [...existing];

                              return tickets.filter((t) => t.id !== ticket.id);
                            },
                          },
                        });
                      },
                    })) as Promise<void>
                  }
                  header="Zmazať grant"
                  content={<p>Naozaj chcete zmazať vybraný grant?</p>}
                  cancelText="Zrušiť"
                  confirmText="Potvrdiť"
                />
              </Card.Content>
            </Card>
          ))}
        </Grid.Column>
      </Grid.Row>
      <Grid.Row columns={2}>
        <Grid.Column>
          <Header>Sekcie</Header>
        </Grid.Column>
        <Grid.Column>
          <SectionDialog id={data?.conference.id} />
        </Grid.Column>
      </Grid.Row>
      <Grid.Row>
        <Grid.Column>
          {data?.conference.sections.map((section) => (
            <Card fluid key={section.id}>
              <Card.Content>
                <Card.Header>{section.name}</Card.Header>
                <Card.Meta></Card.Meta>
                <Card.Description>
                  Prispevky: {section.submissions.length} <br />
                  Subory prispevkov:{" "}
                  {section.submissions.reduce((prev, sub): number => {
                    if (sub.file) {
                      return prev + 1;
                    }
                    return prev;
                  }, 0)}
                </Card.Description>
              </Card.Content>
              <Card.Content extra>
                <DeleteDialog
                  confirmCb={async () =>
                    (await deleteSection({
                      variables: {
                        id: section.id,
                      },
                      update(cache) {
                        cache.evict({ id: `Section:${section.id}` });
                      },
                    })) as Promise<void>
                  }
                  header="Zmazať sekciu"
                  content={<p>Naozaj chcete zmazať vybranú sekciu?</p>}
                  cancelText="Zrušiť"
                  confirmText="Potvrdiť"
                />
                <SectionDialog id={section.id} data={section} />
              </Card.Content>
            </Card>
          ))}
        </Grid.Column>
      </Grid.Row>
    </Grid>
  );
};

DashboardPage.getLayout = function getLayout(page) {
  return <Dashboard>{page}</Dashboard>;
};

export const getServerSideProps = async ({
  locale,
  req,
  query,
}: NextPageContext) => {
  const client = initializeApollo({ headers: { ...req?.headers } });

  try {
    const { data } = await client.query({
      query: ConferenceDocument,
      variables: { slug: query.slug?.toString() || "" },
    });

    if (data && !data.conference.attending && !data.conference.isAdmin) {
      return {
        redirect: {
          permanent: false,
          destination: `/${locale}/${data.conference.slug}/register`,
        },
      };
    }

    return addApolloState(client, {
      props: {
        protect: true,
        ...(await serverSideTranslations(locale || "sk", [
          "common",
          "validation",
          "conference",
          "activation",
          "invoice",
        ])),
      },
    });
  } catch (error) {
    return {
      props: {
        protect: true,
        ...(await serverSideTranslations(locale || "sk", [
          "common",
          "validation",
          "conference",
          "activation",
          "invoice",
        ])),
      },
    };
  }
};

export default DashboardPage;
