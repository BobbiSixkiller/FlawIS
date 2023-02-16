import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import {
  Button,
  Card,
  Dropdown,
  DropdownItemProps,
  Grid,
  Header,
  Icon,
  Label,
  Message,
  Placeholder,
  Segment,
} from "semantic-ui-react";
import {
  useDeleteUserMutation,
  UsersDocument,
  useUserQuery,
} from "../graphql/generated/schema";
import useWidth from "../hooks/useWidth";
import DeleteDialog from "./DeleteDialog";

export default function UserGrants() {
  const router = useRouter();
  const width = useWidth();
  const [options, setOptions] = useState<DropdownItemProps[]>([]);

  const [deleteUser] = useDeleteUserMutation({
    refetchQueries: [{ query: UsersDocument }, "users"],
  });

  const { data, error, loading, refetch } = useUserQuery({
    variables: { id: router.query.id, year: router.query.year },
    notifyOnNetworkStatusChange: true,
  });

  useEffect(() => {
    setOptions([{ key: 0, text: "Celkovo", value: "*" }]);
    if (data) {
      setOptions((prev) => [
        ...prev,
        ...data.user.grants.availableYears.map((y, i) => ({
          key: i + 1,
          text: new Date(y).getFullYear().toString(),
          value: y,
        })),
      ]);
    }
  }, [data]);

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
          <Dropdown
            button
            basic
            floating
            options={options}
            value={
              options.find((o) => o.text === router.query.year)?.value || "*"
            }
            onChange={async (e, { value }) => {
              const year = new Date(value?.toString() || "")
                .getFullYear()
                .toString();
              if (year !== "NaN") {
                router.replace({
                  pathname: `/users/${router.query.id}`,
                  query: { year },
                });
              } else {
                router.replace({
                  pathname: `/users/${router.query.id}`,
                  query: {},
                });
              }
              await refetch({ year: value === "*" ? null : value });
            }}
          />
          <Label size="large" color="black">
            <Icon name="hourglass" /> {data?.user.grants.hours}
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
            </>
          )}
          {data &&
            data.user.grants?.grants.map((g) => (
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
                    onClick={() =>
                      router.push({
                        pathname: `/${g?.id}`,
                        query: router.query.year
                          ? { year: router.query.year }
                          : null,
                      })
                    }
                  />
                </Card.Content>
              </Card>
            ))}
        </Grid.Column>
      </Grid.Row>
    </Grid>
  );
}
