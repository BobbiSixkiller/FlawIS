import { useRouter } from "next/router";
import { useState } from "react";
import {
  Button,
  Card,
  Dropdown,
  Grid,
  Header,
  Icon,
  Label,
  Message,
  Placeholder,
  Segment,
} from "semantic-ui-react";
import { useMeQuery } from "../graphql/generated/schema";
import useWidth from "../hooks/useWidth";

export default function UserGrants() {
  const width = useWidth();
  const [options, setOptions] = useState([
    { key: 0, text: "Celkovo", value: undefined },
  ]);

  const { data, error, loading, refetch } = useMeQuery({
    variables: { year: null },
    notifyOnNetworkStatusChange: true,
    onCompleted: (data) =>
      setOptions([
        { key: 0, text: "Celkovo", value: undefined },
        ...data.me.grants.availableYears.map((h, i) => ({
          key: i + 1,
          text: new Date(h).getFullYear().toString(),
          value: h,
        })),
      ]),
  });

  const router = useRouter();

  return (
    <Grid padded={width < 400 ? "vertically" : true}>
      <Grid.Row verticalAlign="middle">
        <Grid.Column>
          <Header>Moje Granty</Header>
        </Grid.Column>
      </Grid.Row>
      <Grid.Row>
        <Grid.Column>
          <Dropdown
            button
            basic
            floating
            options={options}
            placeholder="Vyberte rok"
            onChange={async (e, data) => {
              await refetch({ year: data.value });
            }}
          />
          <Label size="large" color="black">
            <Icon name="hourglass" /> {data?.me.grants.hours}
            <Label.Detail>Hodín</Label.Detail>
          </Label>
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
            data.me.grants?.grants.map((g) => (
              <Card fluid key={g?.id}>
                <Card.Content>
                  <Card.Header> {g?.name}</Card.Header>
                  <Card.Meta>{g?.type}</Card.Meta>
                  <Card.Description>
                    <p>Začiatok: {new Date(g?.start).toLocaleDateString()}</p>
                    <p>Koniec: {new Date(g?.end).toLocaleDateString()}</p>
                  </Card.Description>
                </Card.Content>
                <Card.Content extra>
                  <Button
                    primary
                    size="tiny"
                    icon="info"
                    onClick={() => router.push(`/${g?.id}`)}
                  />
                </Card.Content>
              </Card>
            ))}
        </Grid.Column>
      </Grid.Row>
    </Grid>
  );
}
