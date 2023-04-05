import {
  Segment,
  Grid,
  Header,
  Button,
  Label,
  Message,
} from "semantic-ui-react";
import Link from "next/link";
import useWidth from "../../hooks/useWidth";
import { useContext, useRef } from "react";
import MastHead from "../../components/MastHead";
import Footer from "../../components/Footer";
import { NextPageWithLayout } from "../_app";
import Nav from "../../components/MobileNav";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { AuthContext } from "../../providers/Auth";
import {
  ConferencesDocument,
  Role,
  useConferencesQuery,
} from "../../graphql/generated/schema";
import AddConference from "../../components/AddConferenceDialog";
import { addApolloState, initializeApollo } from "../../lib/apollo";
import { NetworkStatus } from "@apollo/client";
import { NextPageContext } from "next";
import styled from "styled-components";
import { useTranslation } from "next-i18next";

const Timeline = styled(Grid)`
  width: 100%;
  margin: 0 !important;
  position: relative;
  &:before {
    content: "";
    position: absolute;
    left: 50%;
    width: 2px;
    height: 100%;
    background: #c5c5c5;
  }
  @media (max-width: 767px) {
    &:before {
      left: 20px;
    }
  }
`;
const Container = styled(Grid.Row)`
  padding: 25px 0 20px 0 !important;
  &:nth-child(even) {
    flex-direction: row-reverse !important;
  }
  &:before {
    content: "";
    position: absolute;
    width: 10px;
    height: 10px;
    top: 30px;
    left: calc(50% - 4px);
    background: #b46b7a;
    border-radius: 50%;
    box-shadow: 0 0 0 3px rgba(233, 33, 99, 0.2);
  }
  @media (max-width: 767px) {
    padding-left: 40px !important;
    flex-direction: column-reverse !important;
    &:nth-child(even) {
      flex-direction: column-reverse !important;
    }
    &:before {
      top: 43px;
      left: 16px;
    }
  }
`;
const Item = styled(Grid.Column)<{ index: number }>`
  &:nth-child(odd) {
    text-align: ${(p) => (p.index % 2 == 0 ? "right" : "left")};
    padding: ${(p) =>
      p.index % 2 == 0 ? "0 40px 0 0 !important" : "0 0 0 40px !important"};
    @media (max-width: 767px) {
      text-align: left;
      padding: 0;
    }
  }
  &:nth-child(even) {
    text-align: ${(p) => (p.index % 2 == 0 ? "left" : "right")};
    padding: ${(p) =>
      p.index % 2 == 0 ? "0 0 0 40px !important" : "0 40px 0 0 !important"};
  }
  @media (max-width: 767px) {
    text-align: left !important;
    padding: 0;
  }
`;

const HomePage: NextPageWithLayout = ({}) => {
  const { user } = useContext(AuthContext);
  const width = useWidth();
  const ref = useRef<HTMLDivElement>(null);

  const scrollToRef = () => ref.current?.scrollIntoView({ behavior: "smooth" });

  const { data, error, loading, networkStatus, fetchMore } =
    useConferencesQuery({
      variables: { year: new Date().getFullYear() },
      notifyOnNetworkStatusChange: true,
      onError: (err) => console.log(err.message),
    });

  const loadingMoreConferences = networkStatus === NetworkStatus.fetchMore;

  const { t } = useTranslation();

  return (
    <>
      <MastHead isHomePage={true} scrollToRef={scrollToRef}>
        <Label
          color="black"
          style={{ marginRight: 0 }}
          as="a"
          href="https://github.com/BobbiSixkiller/FlawIS"
          target="_blank"
        >
          1.0.0
        </Label>
        <Header
          as="h1"
          content="Conferences"
          inverted
          style={{ fontSize: width > 992 ? "4em" : "2em" }}
        />
        <Header
          as="h2"
          content="Faculty of Law, Comenius university in Bratislava"
          inverted
          style={{
            fontSize: width > 992 ? "1.7em" : "1.5em",
            fontWeight: "normal",
          }}
        />
      </MastHead>
      <div ref={ref}>
        <Segment
          style={{ padding: width > 992 ? "8em 0em" : "4em 0em" }}
          vertical
        >
          <Grid container verticalAlign="middle">
            {user?.role === Role.Admin && (
              <Grid.Row>
                <Grid.Column textAlign="center">
                  <AddConference />
                </Grid.Column>
              </Grid.Row>
            )}
            {error && (
              <Grid.Row>
                <Grid.Column>
                  <Message error content={error.message} />
                </Grid.Column>
              </Grid.Row>
            )}

            {data && (
              <Grid.Row>
                <Grid.Column>
                  <Timeline stackable>
                    {data?.conferences.edges.map((edge, i) => (
                      <Container
                        key={edge?.cursor}
                        columns={2}
                        verticalAlign="top"
                      >
                        <Item index={i}>
                          <Header>{edge?.node.name}</Header>
                          <p>{edge?.node.description}</p>
                          <Button
                            as={Link}
                            href={`/${edge?.node.slug}`}
                            circular
                            primary
                            size="huge"
                          >
                            {t("actions.more")}
                          </Button>
                        </Item>
                        <Item index={i}>
                          <h4>
                            {new Date(
                              edge?.node.dates.start
                            ).toLocaleDateString() +
                              " - " +
                              new Date(
                                edge?.node.dates.end
                              ).toLocaleDateString()}
                          </h4>
                        </Item>
                      </Container>
                    ))}
                  </Timeline>
                </Grid.Column>
              </Grid.Row>
            )}

            {data?.conferences.pageInfo.hasNextPage && (
              <Grid.Row>
                <Grid.Column textAlign="center">
                  <Button
                    circular
                    loading={loadingMoreConferences}
                    size="huge"
                    secondary
                    onClick={async () =>
                      await fetchMore({
                        variables: {
                          year: data.conferences.year - 1,
                        },
                      })
                    }
                  >
                    {t("actions.previous")}
                  </Button>
                </Grid.Column>
              </Grid.Row>
            )}
          </Grid>
        </Segment>
      </div>
    </>
  );
};

HomePage.getLayout = function getLayout(page) {
  return (
    <Nav transparent={true} locales={true}>
      {page}
      <Footer />
    </Nav>
  );
};

export const getServerSideProps = async ({ locale, req }: NextPageContext) => {
  const client = initializeApollo({ headers: { ...req?.headers } });

  try {
    await client.query({
      query: ConferencesDocument,
      variables: { year: new Date().getFullYear() },
    });

    return addApolloState(client, {
      props: {
        ...(await serverSideTranslations(locale || "sk", [
          "common",
          "validation",
          "activation",
        ])),
      },
    });
  } catch (error) {
    return {
      props: {
        ...(await serverSideTranslations(locale || "sk", [
          "common",
          "validation",
          "activation",
        ])),
      },
    };
  }
};

export default HomePage;
