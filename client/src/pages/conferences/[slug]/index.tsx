import { NextPageContext } from "next";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useContext, useEffect, useRef, useState } from "react";
import {
  Accordion,
  Button,
  Grid,
  Header,
  Icon,
  Menu,
  Segment,
} from "semantic-ui-react";
import Footer from "../../../components/Footer";
import MastHead from "../../../components/MastHead";
import Nav from "../../../components/MobileNav";
import {
  ConferenceDocument,
  useConferenceQuery,
} from "../../../graphql/generated/schema";
import useWith from "../../../hooks/useWidth";
import { addApolloState, initializeApollo } from "../../../lib/apollo";
import { AuthContext } from "../../../providers/Auth";

import { NextPageWithLayout } from "../../_app";

const ConferencePage: NextPageWithLayout = () => {
  const { user } = useContext(AuthContext);
  const [active, setActive] = useState<string | number | undefined>();
  const router = useRouter();
  const width = useWith();
  const { t } = useTranslation(["conference"]);
  const { slug } = router.query;

  const ref = useRef<HTMLDivElement>(null);

  const scrollToRef = () => ref.current?.scrollIntoView({ behavior: "smooth" });

  const { data, error, loading } = useConferenceQuery({
    variables: { slug: router.query.slug?.toString() || "" },
  });

  return (
    <>
      <MastHead isHomePage={false} scrollToRef={scrollToRef}>
        <div
          style={{
            margin: "auto",
            position: "relative",
            width: "100%",
            maxHeight: "845px",
          }}
        >
          {/* <Header
            as="h1"
            content="Míľniky práva v stredoeurópskom priestore 2022"
            inverted
            style={{ fontSize: width > 992 ? "4em" : "2em" }}
          /> */}
          {data?.conference.logoUrl && (
            <Image
              alt="conference logo"
              src={data.conference.logoUrl}
              width={3219}
              height={845}
              quality={50}
              layout="responsive"
            />
          )}
        </div>
      </MastHead>
      <div ref={ref}>
        <Segment
          style={{
            padding: width > 992 ? "8em 0em" : "4em 0em",
          }}
          vertical
        >
          <Grid divided="vertically" container>
            <Grid.Row id="intro">
              <Grid.Column textAlign="center">
                <Header as="h3" textAlign="center" style={{ fontSize: "2em" }}>
                  {t("headings.introduction")}
                </Header>
                <p style={{ fontSize: "1.33em", textAlign: "justify" }}>
                  {data?.conference.description}
                </p>
                <Button
                  onClick={() => router.push(`/${slug}/dashboard`)}
                  size="massive"
                  id="register"
                  primary
                >
                  {data?.conference.attending ? "To dashboard" : "Register"}
                </Button>
              </Grid.Column>
            </Grid.Row>

            <Grid.Row centered id="sections">
              <Grid.Column computer={10} tablet={12} mobile={16}>
                <Header textAlign="center" as="h3" style={{ fontSize: "2em" }}>
                  {t("headings.sections")}
                </Header>
                <Accordion styled fluid>
                  <Accordion.Title
                    active={active === 0}
                    index={0}
                    onClick={(e, { index }) => setActive(index)}
                  >
                    <Icon name="dropdown" />
                    What is a dog?
                  </Accordion.Title>
                  <Accordion.Content active={active === 0}>
                    <p>
                      A dog is a type of domesticated animal. Known for its
                      loyalty and faithfulness, it can be found as a welcome
                      guest in many households across the world.
                    </p>
                  </Accordion.Content>

                  <Accordion.Title
                    active={active === 1}
                    index={1}
                    onClick={(e, { index }) => setActive(index)}
                  >
                    <Icon name="dropdown" />
                    What kinds of dogs are there?
                  </Accordion.Title>
                  <Accordion.Content active={active === 1}>
                    <p>
                      There are many breeds of dogs. Each breed varies in size
                      and temperament. Owners often select a breed of dog that
                      they find to be compatible with their own lifestyle and
                      desires from a companion.
                    </p>
                  </Accordion.Content>

                  <Accordion.Title
                    active={active === 2}
                    index={2}
                    onClick={(e, { index }) => setActive(index)}
                  >
                    <Icon name="dropdown" />
                    How do you acquire a dog?
                  </Accordion.Title>
                  <Accordion.Content active={active === 2}>
                    <p>
                      Three common ways for a prospective owner to acquire a dog
                      is from pet shops, private owners, or shelters.
                    </p>
                    <p>
                      A pet shop may be the most convenient way to buy a dog.
                      Buying a dog from a private owner allows you to assess the
                      pedigree and upbringing of your dog before choosing to
                      take it home. Lastly, finding your dog from a shelter,
                      helps give a good home to a dog who may not find one so
                      readily.
                    </p>
                  </Accordion.Content>
                </Accordion>
              </Grid.Column>
            </Grid.Row>
            <Grid.Row id="programme">
              <Grid.Column>
                <Header textAlign="center" as="h3" style={{ fontSize: "2em" }}>
                  {t("headings.programme")}
                </Header>
              </Grid.Column>
            </Grid.Row>
            <Grid.Row id="fees">
              <Grid.Column>
                <Header textAlign="center" as="h3" style={{ fontSize: "2em" }}>
                  {t("headings.fees")}
                </Header>
              </Grid.Column>
            </Grid.Row>
            <Grid.Row id="dates">
              <Grid.Column>
                <Header textAlign="center" as="h3" style={{ fontSize: "2em" }}>
                  {t("headings.dates")}
                </Header>
              </Grid.Column>
            </Grid.Row>
            <Grid.Row id="guidelines">
              <Grid.Column>
                <Header textAlign="center" as="h3" style={{ fontSize: "2em" }}>
                  {t("headings.guidelines")}
                </Header>
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </Segment>
      </div>
    </>
  );
};

ConferencePage.getLayout = function getLayout(page) {
  return (
    <Nav transparent={true} locales={true}>
      {page}
      <Footer />
    </Nav>
  );
};

export const getServerSideProps = async ({
  locale,
  req,
  query,
}: NextPageContext) => {
  const client = initializeApollo({ headers: { ...req?.headers } });

  try {
    await client.query({
      query: ConferenceDocument,
      variables: { slug: query.slug?.toString() || "" },
    });

    return addApolloState(client, {
      props: {
        ...(await serverSideTranslations(locale || "sk", [
          "common",
          "conference",
        ])),
      },
    });
  } catch (error) {
    return {
      props: {
        ...(await serverSideTranslations(locale || "sk", [
          "common",
          "conference",
        ])),
      },
    };
  }
};

export default ConferencePage;
