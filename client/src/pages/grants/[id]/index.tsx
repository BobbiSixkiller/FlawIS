import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useRouter } from "next/router";
import { useContext } from "react";
import {
  Button,
  Divider,
  Grid,
  Header,
  Label,
  Loader,
  Message,
  Tab,
  Table,
} from "semantic-ui-react";

import AddBudgetDialog from "../../../components/AddBudgetDialog";
import AddMemberDialog from "../../../components/AddMemberDIalog";
import Dashboard from "../../../components/Dashboard";
import DeleteBudgetDialog from "../../../components/DeleteBudgetDialog";
import DeleteMemberDialog from "../../../components/DeleteMemberDialog";
import { Role, useGrantQuery } from "../../../graphql/generated/schema";
import useWidth from "../../../hooks/useWidth";
import { AuthContext } from "../../../providers/Auth";
import { NextPageWithLayout } from "../../_app";

const GrantPage: NextPageWithLayout = () => {
  const { user } = useContext(AuthContext);
  const { query } = useRouter();
  const width = useWidth();

  const { data, loading, error } = useGrantQuery({
    variables: { id: query.id },
  });

  if (loading) {
    return <Loader active />;
  }

  if (error) {
    return <Message error content={error.message} />;
  }

  return (
    <Grid padded={width < 400 ? "vertically" : true}>
      <Grid.Row verticalAlign="middle">
        <Grid.Column>
          <Header>
            {data?.grant.name}
            <Header.Subheader>{data?.grant.type}</Header.Subheader>
          </Header>
          <p>
            Trvanie: {new Date(data?.grant.start).toLocaleDateString()} -{" "}
            {new Date(data?.grant.end).toLocaleDateString()}
          </p>
        </Grid.Column>
      </Grid.Row>
      <Divider />
      <Grid.Row>
        <Grid.Column>
          <Grid>
            <Grid.Row columns={2} verticalAlign="middle">
              <Grid.Column>
                <Header>Oznamy</Header>
              </Grid.Column>
              <Grid.Column>
                {user?.role === Role.Admin && (
                  <Button icon="plus" size="tiny" positive floated="right" />
                )}
              </Grid.Column>
            </Grid.Row>
            <Grid.Row>
              <Grid.Column>
                {data?.grant.announcements.length === 0 && (
                  <Message warning content="Žiadne oznamy" />
                )}
                {data?.grant.announcements.map((a) => (
                  <div key={a?.id}>{a?.name}</div>
                ))}
              </Grid.Column>
            </Grid.Row>
            <Grid.Row columns={2} verticalAlign="middle">
              <Grid.Column>
                <Header>Rozpočet</Header>
              </Grid.Column>
              <Grid.Column>
                {user?.role === Role.Admin && (
                  <AddBudgetDialog approved={true} />
                )}
              </Grid.Column>
            </Grid.Row>
            <Grid.Row>
              <Grid.Column>
                {data?.grant.budgets.length !== 0 && (
                  <Tab
                    menu={{ secondary: true, pointing: true }}
                    panes={data?.grant.budgets.map((b) => ({
                      menuItem: new Date(b?.year).getFullYear().toString(),
                      render: () => (
                        <Tab.Pane attached={false}>
                          <Grid padded>
                            <Grid.Row>
                              <Grid.Column>
                                {user?.role === Role.Admin && (
                                  <>
                                    <DeleteBudgetDialog
                                      id={data.grant.id}
                                      year={b?.year}
                                    />
                                    {!b?.spent && (
                                      <AddBudgetDialog approved={false} />
                                    )}
                                  </>
                                )}
                              </Grid.Column>
                            </Grid.Row>
                            <Grid.Row divided columns={2}>
                              <Grid.Column>
                                <Header size="tiny">Schválené</Header>
                                <p>Cestovné: {b?.approved.travel} €</p>
                                <p>Materiál: {b?.approved.material} €</p>
                                <p>Služby: {b?.approved.services} €</p>
                                <p>Mzdy: {b?.approved.salaries} €</p>
                                <p>Nepriame: {b?.approved.indirect} €</p>
                              </Grid.Column>
                              <Grid.Column>
                                <Header size="tiny">Zostatok</Header>
                                {b?.spent && (
                                  <>
                                    <p>Cestovné: {b?.spent.travel} €</p>
                                    <p>Materiál: {b?.spent.material} €</p>
                                    <p>Služby: {b?.spent.services} €</p>
                                    <p>Mzdy: {b?.spent.salaries} €</p>
                                    <p>Nepriame: {b?.spent.indirect} €</p>
                                  </>
                                )}
                              </Grid.Column>
                            </Grid.Row>
                            <Grid.Row columns={2} verticalAlign="middle">
                              <Grid.Column>
                                <Header size="tiny">Riešitelia</Header>
                              </Grid.Column>
                              <Grid.Column>
                                {user?.role === Role.Admin && (
                                  <AddMemberDialog year={b?.year} />
                                )}
                              </Grid.Column>
                            </Grid.Row>
                            <Grid.Row>
                              <Grid.Column>
                                {b?.members.length !== 0 && (
                                  <Table basic="very" celled>
                                    <Table.Header>
                                      <Table.Row>
                                        <Table.HeaderCell>
                                          Meno
                                        </Table.HeaderCell>
                                        <Table.HeaderCell>
                                          Hodiny
                                        </Table.HeaderCell>
                                        <Table.HeaderCell>
                                          Akcia
                                        </Table.HeaderCell>
                                      </Table.Row>
                                    </Table.Header>
                                    <Table.Body>
                                      {b?.members.map((m, i) => (
                                        <Table.Row key={i}>
                                          <Table.Cell>
                                            {m?.isMain && (
                                              <Label ribbon>Hlavný</Label>
                                            )}{" "}
                                            {m?.user.name}
                                          </Table.Cell>
                                          <Table.Cell>{m?.hours}</Table.Cell>
                                          <Table.Cell>
                                            <DeleteMemberDialog
                                              key={i}
                                              id={data.grant.id}
                                              user={m?.user.id!}
                                              year={b.year}
                                            />
                                          </Table.Cell>
                                        </Table.Row>
                                      ))}
                                    </Table.Body>
                                  </Table>
                                )}
                              </Grid.Column>
                            </Grid.Row>
                          </Grid>
                        </Tab.Pane>
                      ),
                    }))}
                  />
                )}
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </Grid.Column>
      </Grid.Row>
    </Grid>
  );
};

GrantPage.getLayout = function getLayout(page) {
  return <Dashboard>{page}</Dashboard>;
};

export const getServerSideProps = async ({ locale }: { locale: string }) => ({
  props: {
    protect: true,
    ...(await serverSideTranslations(locale, ["common", "validation"])),
  },
});

export default GrantPage;
