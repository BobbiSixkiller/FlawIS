import { NextPageContext } from "next";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import Image from "next/image";
import { useRouter } from "next/router";
import { useContext, useRef, useState } from "react";
import {
  Accordion,
  Button,
  Grid,
  Header,
  Icon,
  Segment,
} from "semantic-ui-react";
import Footer from "../../../components/Footer";
import MastHead from "../../../components/MastHead";
import Nav from "../../../components/MobileNav";
import SectionDialog from "../../../components/SectionDialog";
import {
  ConferenceDocument,
  useConferenceQuery,
} from "../../../graphql/generated/schema";
import useWith from "../../../hooks/useWidth";
import { addApolloState, initializeApollo } from "../../../lib/apollo";
import { AuthContext } from "../../../providers/Auth";

import { NextPageWithLayout } from "../../_app";

const ConferencePage: NextPageWithLayout = () => {
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
            overflow: "hidden",
            height: "180px",
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
              quality={50}
              style={{ objectFit: "contain" }}
              fill
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
                  onClick={() => {
                    router.push(`/${slug}/dashboard`);
                  }}
                  size="massive"
                  id="register"
                  primary
                  circular
                >
                  {data?.conference.attending
                    ? t("dashboard.button")
                    : t("registration.header")}
                </Button>
              </Grid.Column>
            </Grid.Row>

            <Grid.Row centered id="sections">
              <Grid.Column computer={10} tablet={12} mobile={16}>
                <SectionDialog id={data?.conference.id} />
                <Header textAlign="center" as="h3" style={{ fontSize: "2em" }}>
                  {t("headings.sections")}
                </Header>
                {data?.conference.sections.length !== 0 && (
                  <Accordion styled fluid>
                    {data?.conference.sections.map((section) => (
                      <div key={section.id}>
                        <Accordion.Title
                          active={active === section.id}
                          index={section.id}
                          onClick={(e, { index }) => setActive(index)}
                        >
                          <Icon name="dropdown" />
                          {section.name}
                        </Accordion.Title>
                        <Accordion.Content active={active === section.id}>
                          <p>{section.description}</p>
                        </Accordion.Content>
                      </div>
                    ))}
                  </Accordion>
                )}
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
          "activation",
        ])),
      },
    });
  } catch (error) {
    return {
      props: {
        ...(await serverSideTranslations(locale || "sk", [
          "common",
          "conference",
          "activation",
        ])),
      },
    };
  }
};

export default ConferencePage;
