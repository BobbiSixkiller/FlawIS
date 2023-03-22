import {
  Segment,
  Grid,
  Header,
  Button,
  Label,
  Message,
  Item,
  Icon,
} from "semantic-ui-react";
import Link from "next/link";
import Image from "next/image";
import useWidth from "../../hooks/useWidth";
import { useContext, useRef, useState } from "react";
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
import AddConference from "../../components/AddConference";
import { addApolloState, initializeApollo } from "../../lib/apollo";
import { NetworkStatus } from "@apollo/client";
import { useRouter } from "next/router";
import { NextPageContext } from "next";
import TimelineCard from "../../components/Timeline";

const Home: NextPageWithLayout = ({}) => {
  const { user } = useContext(AuthContext);
  const router = useRouter();
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
  console.log(data?.conferences.year);
  console.log(error);
  console.log(loading);

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
          2.0.0
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
          <Grid stackable container verticalAlign="middle">
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
              <div className="timeline">
                <ul>
                  {data?.conferences.edges.map((edge) => (
                    <li key={edge?.cursor}>
                      <div className="content">
                        <h3>{edge?.node.name}</h3>
                        <p>{edge?.node.description}</p>
                      </div>
                      <div className="time">
                        <h4>January 2018</h4>
                      </div>
                      {/* <div style={{ position: "relative", height: "150px" }}>
                        <Image
                          src={edge?.node.logoUrl || ""}
                          alt="Conference Logo"
                          fill={true}
                          style={{ objectFit: "contain" }}
                        />
                      </div> */}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* {data?.conferences.edges.map((edge) => (
              <Grid.Row key={edge?.cursor} columns={2} style={{}}>
                <Grid.Column textAlign="right">1</Grid.Column>
                <Grid.Column>2</Grid.Column>
              </Grid.Row>
            ))} */}

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
                    Previous...
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

Home.getLayout = function getLayout(page) {
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
        ])),
      },
    });
  } catch (error) {
    return {
      props: {
        ...(await serverSideTranslations(locale || "sk", [
          "common",
          "validation",
        ])),
      },
    };
  }
};

export default Home;
