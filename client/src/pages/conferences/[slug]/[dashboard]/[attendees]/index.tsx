import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useRouter } from "next/router";
import Dashboard from "../../../../../components/Dashboard";
import { NextPageWithLayout } from "../../../../_app";
import {
  useAttendeesToCsvExportLazyQuery,
  useConferenceAttendeesQuery,
  useRemoveAttendeeMutation,
} from "../../../../../graphql/generated/schema";
import {
  Button,
  Card,
  Form,
  Grid,
  Header,
  Message,
  Placeholder,
  Popup,
  Radio,
  Segment,
} from "semantic-ui-react";
import { InView } from "react-intersection-observer";
import DeleteDialog from "../../../../../components/DeleteDialog";
import useWidth from "../../../../../hooks/useWidth";
import { useContext, useEffect, useState } from "react";
import {
  ActionTypes,
  ControlsContext,
} from "../../../../../providers/ControlsProvider";
import AttendeeSearch from "../../../../../components/AttendeeSearch";
import ExportCSV from "../../../../../components/ExportCSV";

const AttendeesPage: NextPageWithLayout = () => {
  const { dispatch } = useContext(ControlsContext);
  const router = useRouter();
  const width = useWidth();

  const [filter, setFilter] = useState<string[]>([]);

  const { data, error, loading, fetchMore, refetch } =
    useConferenceAttendeesQuery({
      variables: {
        slug: router.query.slug as string,
      },
    });

  const [getExportData, { data: exportData, loading: exportLoading }] =
    useAttendeesToCsvExportLazyQuery();

  useEffect(() => {
    dispatch({
      type: ActionTypes.SetRightPanel,
      payload: {
        rightPanelItems: <AttendeeSearch conferenceId={data?.conference.id} />,
      },
    });
    if (data) {
      getExportData({ variables: { conferenceId: data?.conference.id } });
    }
  }, [dispatch, data, getExportData]);

  const [deleteAttednee] = useRemoveAttendeeMutation();

  useEffect(() => {
    console.log(filter);
    if (filter.length !== 0) {
      refetch({ sectionIds: filter });
    }
  }, [filter]);

  return (
    <Grid padded={width < 400 ? "vertically" : true}>
      <Grid.Row verticalAlign="middle" columns={2}>
        <Grid.Column width={4}>
          <Header>
            Účastníci
            <Header.Subheader>
              {data?.conference.attendees.edges.length} /{" "}
              {data?.conference.attendeesCount}
            </Header.Subheader>
          </Header>
        </Grid.Column>
        <Grid.Column width={12} style={{ display: "flex" }}>
          <div style={{ alignSelf: "flex-end" }}>
            {exportData && (
              <ExportCSV
                data={exportData.attendeesToCsvExport.flatMap((attendee) =>
                  attendee.submissions.map((submission) => ({
                    name: attendee.user.name,
                    email: attendee.user.email,
                    organisation: attendee.user.organisation,
                    online: attendee.ticket.online.toString(),
                    variableSymbol: attendee.invoice.issuer.variableSymbol,
                    price:
                      attendee.invoice.body.price + attendee.invoice.body.vat,
                    section: submission.section.name,
                    submission_name_sk: submission.name,
                    submission_name_en: submission.translations[0].name,
                  }))
                )}
              />
            )}
            <Popup
              wide
              trigger={
                <Button
                  className="button secondary icon"
                  icon="filter"
                  loading={loading}
                />
              }
              on="click"
              position="bottom right"
            >
              <Form>
                {data?.conference.sections.map((s) => (
                  <Form.Field key={s.id}>
                    <Radio
                      label={s.name}
                      toggle
                      onChange={(e, data) => {
                        const filterSet = new Set(filter);
                        if (data.checked) {
                          filterSet.add(s.id);
                        } else {
                          filterSet.delete(s.id);
                        }
                        setFilter(Array.from(filterSet));
                      }}
                    />
                  </Form.Field>
                ))}
              </Form>
            </Popup>
          </div>
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
            data.conference.attendees.edges.map((edge) => (
              <Card fluid key={edge?.cursor}>
                <Card.Content>
                  <Card.Header> {edge?.node.user.name}</Card.Header>
                  <Card.Meta>{edge?.node.user.email}</Card.Meta>
                  <Card.Description>
                    <p>Organizacia: {edge?.node.user.organisation}</p>
                  </Card.Description>
                </Card.Content>
                <Card.Content extra>
                  <DeleteDialog
                    confirmCb={async () =>
                      (await deleteAttednee({
                        variables: { id: edge?.cursor },
                        update(cache, { data }) {
                          cache.evict({
                            id: `Attendee:${data?.removeAttendee.id}`,
                          });
                          cache.modify({
                            id: `Conference:${data?.removeAttendee.conference.id}`,
                            fields: {
                              attendeesCount(existing) {
                                return existing - 1;
                              },
                            },
                          });
                        },
                      })) as Promise<void>
                    }
                    header="Zmazať účastníka"
                    content={<p>Naozaj chcete zmazať vybraného účastníka?</p>}
                    cancelText="Zrušiť"
                    confirmText="Potvrdiť"
                  />
                  <Button
                    primary
                    size="tiny"
                    icon="info"
                    onClick={() =>
                      router.push(
                        `/${router.query.slug}/dashboard/attendees/${edge?.node.id}`
                      )
                    }
                  />
                </Card.Content>
              </Card>
            ))}
          {data?.conference.attendees.pageInfo.hasNextPage && (
            <InView
              onChange={async (inView) => {
                if (inView) {
                  await fetchMore({
                    variables: {
                      after: data?.conference.attendees.pageInfo.endCursor,
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

AttendeesPage.getLayout = function getLayout(page) {
  return <Dashboard>{page}</Dashboard>;
};

export const getServerSideProps = async ({ locale }: { locale: string }) => ({
  props: {
    admin: true,
    ...(await serverSideTranslations(locale, ["common", "validation"])),
  },
});

export default AttendeesPage;
