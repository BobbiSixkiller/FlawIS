import { Segment, Grid, Header, Image, Button, Label } from "semantic-ui-react";
import Link from "next/link";
import Footer from "src/components/Footer";
import { NextPage } from "next";
import { Nav } from "src/components/Layout";
import MastHead, { Arrow, ArrowWrapper } from "src/components/MastHead";
import { useContext, useRef } from "react";
import useWith from "src/hooks/useWidth";
import { AuthContext } from "src/providers/Auth";

const Home: NextPage = () => {
  const width = useWith();
  const ref = useRef(null);

  const scrollToRef = () => ref.current.scrollIntoView({ behavior: "smooth" });

  return (
    <>
      <MastHead scrollToRef={scrollToRef}>
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
        <Segment style={{ padding: "8em 0em" }} vertical>
          <Grid stackable container verticalAlign="middle" divided="vertically">
            <Grid.Row>
              <Grid.Column floated="right" width={6} only="mobile">
                <Image
                  bordered
                  rounded
                  size="large"
                  src="/images/wireframe/white-image.png"
                />
              </Grid.Column>
              <Grid.Column width={8}>
                <Header as="h3" style={{ fontSize: "2em" }}>
                  We Help Companies and Companions
                </Header>
                <p style={{ fontSize: "1.33em" }}>
                  We can give your company superpowers to do things that they
                  never thought possible. Let us delight your customers and
                  empower your needs... through pure data analytics. Yes that's
                  right, you thought it was the stuff of dreams, but even
                  bananas can be bioengineered.
                </p>
                <Link href="/1">
                  <Button size="huge">More</Button>
                </Link>
              </Grid.Column>
              <Grid.Column floated="right" width={6} only="tablet computer">
                <Image
                  bordered
                  rounded
                  size="large"
                  src="/images/wireframe/white-image.png"
                />
              </Grid.Column>
            </Grid.Row>

            <Grid.Row>
              <Grid.Column floated="right" width={6} only="mobile">
                <Image
                  bordered
                  rounded
                  size="large"
                  src="/images/wireframe/white-image.png"
                />
              </Grid.Column>
              <Grid.Column width={8}>
                <Header as="h3" style={{ fontSize: "2em" }}>
                  We Help Companies and Companions
                </Header>
                <p style={{ fontSize: "1.33em" }}>
                  We can give your company superpowers to do things that they
                  never thought possible. Let us delight your customers and
                  empower your needs... through pure data analytics. Yes that's
                  right, you thought it was the stuff of dreams, but even
                  bananas can be bioengineered.
                </p>
                <Link href="/2">
                  <Button size="huge">More</Button>
                </Link>
              </Grid.Column>
              <Grid.Column floated="right" width={6} only="tablet computer">
                <Image
                  bordered
                  rounded
                  size="large"
                  src="/images/wireframe/white-image.png"
                />
              </Grid.Column>
            </Grid.Row>

            <Grid.Row>
              <Grid.Column textAlign="center">
                <Button size="huge">Previous...</Button>
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
    <Nav transparent={true}>
      {page}
      <Footer />
    </Nav>
  );
};

export default Home;
