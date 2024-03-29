import { useRouter } from "next/router";
import { InView } from "react-intersection-observer";
import {
  Button,
  Card,
  Grid,
  Header,
  Message,
  Placeholder,
  Segment,
} from "semantic-ui-react";
import {
  GrantsDocument,
  useDeleteGrantMutation,
  useGrantsQuery,
} from "../graphql/generated/schema";
import useWidth from "../hooks/useWidth";
import AddGrantDialog from "./AddGrantDialog";
import DeleteDialog from "./DeleteDialog";

export default function GrantsList() {
  const width = useWidth();

  const { data, error, loading, fetchMore } = useGrantsQuery({
    variables: { first: 20 },
    notifyOnNetworkStatusChange: true,
  });

  const [deleteGrant] = useDeleteGrantMutation({
    refetchQueries: [{ query: GrantsDocument }, "grants"],
  });

  const router = useRouter();

  return (
    <Grid padded={width < 400 ? "vertically" : true}>
      <Grid.Row verticalAlign="middle">
        <Grid.Column width={8}>
          <Header>Grants</Header>
        </Grid.Column>
        <Grid.Column width={8}>
          <AddGrantDialog />
          <Button
            floated="right"
            secondary
            icon="announcement"
            onClick={() => router.push("/announcements")}
          />
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
            data.grants.edges.map((edge) => (
              <Card fluid key={edge?.cursor}>
                <Card.Content>
                  <Card.Header> {edge?.node.name}</Card.Header>
                  <Card.Meta>{edge?.node.type}</Card.Meta>
                  <Card.Description>
                    <p>
                      Začiatok:{" "}
                      {new Date(edge?.node.start).toLocaleDateString()}
                    </p>
                    <p>
                      Koniec: {new Date(edge?.node.end).toLocaleDateString()}
                    </p>
                  </Card.Description>
                </Card.Content>
                <Card.Content extra>
                  <DeleteDialog
                    confirmCb={async () =>
                      (await deleteGrant({
                        variables: { id: edge?.cursor },
                      })) as Promise<void>
                    }
                    header="Zmazať grant"
                    content={<p>Naozaj chcete zmazať vybraný grant?</p>}
                    cancelText="Zrušiť"
                    confirmText="Potvrdiť"
                  />
                  <Button
                    primary
                    size="tiny"
                    icon="info"
                    onClick={() => router.push(`/${edge?.node.id}`)}
                  />
                </Card.Content>
              </Card>
            ))}
          {data?.grants.pageInfo.hasNextPage && (
            <InView
              onChange={async (inView) => {
                if (inView) {
                  await fetchMore({
                    variables: {
                      after: data?.grants.pageInfo.endCursor,
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
}
