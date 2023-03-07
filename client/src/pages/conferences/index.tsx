import { Segment, Grid, Header, Button, Label } from "semantic-ui-react";
import Link from "next/link";
import Image from "next/image";
import useWith from "../../hooks/useWidth";
import { useContext, useRef } from "react";
import MastHead from "../../components/MastHead";
import Footer from "../../components/Footer";
import { NextPageWithLayout } from "../_app";
import Nav from "../../components/MobileNav";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { AuthContext } from "../../providers/Auth";
import { Role } from "../../graphql/generated/schema";
import AddConference from "../../components/AddConference";

const Home: NextPageWithLayout = () => {
  const { user } = useContext(AuthContext);
  const width = useWith();
  const ref = useRef<HTMLDivElement>(null);

  const scrollToRef = () => ref.current?.scrollIntoView({ behavior: "smooth" });

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
          <Grid stackable container verticalAlign="middle" divided="vertically">
            {user?.role === Role.Admin && (
              <Grid.Row>
                <Grid.Column textAlign="center">
                  <AddConference />
                </Grid.Column>
              </Grid.Row>
            )}
            <Grid.Row>
              <Grid.Column floated="right" width={6} only="mobile">
                <div style={{ position: "relative", height: "150px" }}>
                  <Image
                    src="/images/SK-CIERNO-BIELE.png"
                    alt="Picture of the author"
                    fill={true}
                    style={{ objectFit: "contain" }}
                  />
                </div>
              </Grid.Column>
              <Grid.Column width={8}>
                <Header as="h3" style={{ fontSize: "2em" }}>
                  We Help Companies and Companions
                </Header>
                <p style={{ fontSize: "1.33em" }}>
                  We can give your company superpowers to do things that they
                  never thought possible. Let us delight your customers and
                  empower your needs... through pure data analytics. Yes thats
                  right, you thought it was the stuff of dreams, but even
                  bananas can be bioengineered.
                </p>
                <Link href="/1">
                  <Button size="huge" primary>
                    More
                  </Button>
                </Link>
              </Grid.Column>
              <Grid.Column floated="right" width={6} only="tablet computer">
                <div style={{ position: "relative", height: "250px" }}>
                  <Image
                    src="/images/SK-CIERNO-BIELE.png"
                    alt="Picture of the author"
                    fill={true}
                    style={{ objectFit: "contain" }}
                  />
                </div>
              </Grid.Column>
            </Grid.Row>
            <Grid.Row>
              <Grid.Column floated="right" width={6} only="mobile">
                <div style={{ position: "relative", height: "250px" }}>
                  <Image
                    src="/images/SK-CIERNO-BIELE.png"
                    alt="Picture of the author"
                    fill={true}
                    style={{ objectFit: "contain" }}
                  />
                </div>
              </Grid.Column>
              <Grid.Column width={8}>
                <Header as="h3" style={{ fontSize: "2em" }}>
                  We Help Companies and Companions
                </Header>
                <p style={{ fontSize: "1.33em" }}>
                  We can give your company superpowers to do things that they
                  never thought possible. Let us delight your customers and
                  empower your needs... through pure data analytics. Yes thats
                  right, you thought it was the stuff of dreams, but even
                  bananas can be bioengineered.
                </p>
                <Link href="/2">
                  <Button size="huge">More</Button>
                </Link>
              </Grid.Column>
              <Grid.Column floated="right" width={6} only="tablet computer">
                <div style={{ position: "relative", height: "250px" }}>
                  <Image
                    src="/images/SK-CIERNO-BIELE.png"
                    alt="Picture of the author"
                    fill={true}
                    style={{ objectFit: "contain" }}
                  />
                </div>
              </Grid.Column>
            </Grid.Row>
            <Grid.Row>
              <Grid.Column textAlign="center">
                <Button size="huge" secondary>
                  Previous...
                </Button>
              </Grid.Column>
            </Grid.Row>
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

export const getStaticProps = async ({ locale }: { locale: string }) => ({
  props: {
    ...(await serverSideTranslations(locale, ["common"])),
  },
});

export default Home;
