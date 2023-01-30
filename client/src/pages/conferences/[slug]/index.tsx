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
import Nav from "../../../components/Nav";
import { Role } from "../../../graphql/generated/schema";
import useWith from "../../../hooks/useWidth";
import { AuthContext } from "../../../providers/Auth";
// import { MenuItemsContext } from "../../../providers/ControlsProvider";

import { NextPageWithLayout } from "../../_app";

const ConferencePage: NextPageWithLayout = () => {
  const { user } = useContext(AuthContext);
  // const { setMenuItems } = useContext(MenuItemsContext);
  const [active, setActive] = useState<string | number | undefined>();
  const router = useRouter();
  const width = useWith();
  const { slug } = router.query;

  // useEffect(() => {
  //   setMenuItems(
  //     <Menu.Item>
  //       <Menu.Header>Conference</Menu.Header>
  //       <Menu vertical inverted>
  //         <Link href="#register" scroll={false}>
  //           <Menu.Item as="a" name="register" />
  //         </Link>
  //         {user && user.role === Role.Admin && (
  //           <Link href={`/${slug}/attendees`}>
  //             <Menu.Item
  //               as="a"
  //               name="Attendees"
  //               active={router.asPath === `/${slug}/attendees`}
  //             />
  //           </Link>
  //         )}
  //         <Link href="#intro" scroll={false}>
  //           <Menu.Item
  //             as="a"
  //             name="Introduction"
  //             active={router.asPath === `/${slug}#intro`}
  //           />
  //         </Link>
  //         <Link href="#sections">
  //           <Menu.Item
  //             as="a"
  //             name="Sections"
  //             active={router.asPath === `/${slug}#sections`}
  //           />
  //         </Link>
  //         <Link href="#programme">
  //           <Menu.Item
  //             as="a"
  //             name="Programme"
  //             active={router.asPath === `/${slug}#programme`}
  //           />
  //         </Link>
  //         <Link href="#fees">
  //           <Menu.Item
  //             as="a"
  //             name="Fees"
  //             active={router.asPath === `/${slug}#fees`}
  //           />
  //         </Link>
  //         <Link href="#dates">
  //           <Menu.Item
  //             as="a"
  //             name="Important Dates"
  //             active={router.asPath === `/${slug}#dates`}
  //           />
  //         </Link>
  //         <Link href="#guidelines">
  //           <Menu.Item
  //             as="a"
  //             name="Submission guidelines"
  //             active={router.asPath === `/${slug}#guidelines`}
  //           />
  //         </Link>
  //       </Menu>
  //     </Menu.Item>
  //   );

  //   return () => setMenuItems(null);
  // }, []);

  const ref = useRef<HTMLDivElement>(null);

  const scrollToRef = () => ref.current?.scrollIntoView({ behavior: "smooth" });

  return (
    <>
      <MastHead isHomePage={false} scrollToRef={scrollToRef}>
        <div
          style={{
            margin: "auto",
          }}
        >
          <Header
            as="h1"
            content="Míľniky práva v stredoeurópskom priestore 2022"
            inverted
            style={{ fontSize: width > 992 ? "4em" : "2em" }}
          />
          {/* <Image
            alt="conference logo"
            src={"/images/SK-CIERNO-BIELE.png"}
            width={3219}
            height={845}
            quality={50}
            layout="responsive"
          /> */}
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
            <Grid.Row textAlign="center" id="intro">
              <Grid.Column>
                <Header as="h3" style={{ fontSize: "2em" }}>
                  Introduction
                </Header>
                <p style={{ fontSize: "1.33em" }}>
                  Univerzita Komenského v Bratislave, Právnická fakulta
                  organizuje 16. ročník medzinárodnej vedeckej konferencie
                  doktorandov a mladých vedeckých pracovníkov „Míľniky práva v
                  stredoeurópskom priestore 2022“. Konferencia sa bude konať pod
                  záštitou dekana Právnickej fakulty Univerzity Komenského v
                  Bratislave, doc. JUDr. Eduarda Burdu, PhD. dňa 24. júna 2022 a
                  uskutoční sa hybridnou formou, t. j. prezenčne v priestoroch
                  Právnickej fakulty UK v Bratislave a súčasne aj audiovizuálnou
                  online formou prostredníctvom aplikácie Microsoft TEAMS.
                  Konferencia je určená všetkým doktorandom, vedeckým a
                  vedecko-pedagogickým pracovníkom v odbore právo, ktorí
                  doposiaľ nezískali vedecko-pedagogický titul docent.
                </p>
                <Button
                  onClick={() => router.push(`/${slug}/dashboard`)}
                  size="massive"
                  id="register"
                >
                  Register
                </Button>
              </Grid.Column>
            </Grid.Row>

            <Grid.Row centered id="sections">
              <Grid.Column computer={10} tablet={12} mobile={16}>
                <Header textAlign="center" as="h3" style={{ fontSize: "2em" }}>
                  Sections
                </Header>
                <Accordion styled>
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
              <Grid.Column>Program</Grid.Column>
            </Grid.Row>
            <Grid.Row id="fees">
              <Grid.Column>Fees</Grid.Column>
            </Grid.Row>
            <Grid.Row id="dates">
              <Grid.Column>Important Dates</Grid.Column>
            </Grid.Row>
            <Grid.Row id="guildelines">
              <Grid.Column>Guidelines</Grid.Column>
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

ConferencePage.getInitialProps = () => {
  return { protect: false };
};

export default ConferencePage;
