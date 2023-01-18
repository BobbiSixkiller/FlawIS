import { useRouter } from "next/router";
import { useInView } from "react-intersection-observer";
import {
  Button,
  Card,
  Grid,
  Header,
  Placeholder,
  Segment,
} from "semantic-ui-react";
import { useGrantsQuery } from "../graphql/generated/schema";
import useWidth from "../hooks/useWidth";
import AddGrantDialog from "./AddGrantDialog";
import DeleteGrantDialog from "./DeleteGrantDialog";

export default function GrantsList() {
  const width = useWidth();
  const { ref, inView } = useInView({ threshold: 1, initialInView: true });

  const { data, error, loading, fetchMore } = useGrantsQuery({
    // variables: { first: 20 },
    notifyOnNetworkStatusChange: true,
  });

  console.log(error);
  console.log(data);
  console.log(loading);

  const router = useRouter();

  return (
    <Grid padded={width < 400 ? "vertically" : true}>
      <Grid.Row verticalAlign="middle">
        <Grid.Column width={8}>
          <Header>Grants</Header>
        </Grid.Column>
        <Grid.Column width={8}>
          <AddGrantDialog />
        </Grid.Column>
      </Grid.Row>
      <Grid.Row>
        <Grid.Column>
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
                  <DeleteGrantDialog id={edge?.cursor} />
                  <Button
                    size="tiny"
                    icon="info"
                    onClick={() => router.push(`/${edge?.node.id}`)}
                  />
                </Card.Content>
              </Card>
            ))}
        </Grid.Column>
      </Grid.Row>
    </Grid>
  );
}
