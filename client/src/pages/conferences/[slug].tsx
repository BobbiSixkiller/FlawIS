import Image from "next/image";
import { useRouter } from "next/router";
import { useContext, useRef, useState } from "react";
import { Grid, Menu, Segment } from "semantic-ui-react";
import Footer from "../../components/Footer";
import { Nav } from "../../components/Layout";
import MastHead from "../../components/MastHead";
import { AuthContext } from "../../providers/Auth";

import { NextPageWithLayout } from "../_app";

const ConferencePage: NextPageWithLayout = () => {
  const { user } = useContext(AuthContext);
  const [tab, setTab] = useState("");

  const router = useRouter();
  const { slug } = router.query;

  const ref = useRef(null);

  const scrollToRef = () => ref.current.scrollIntoView({ behavior: "smooth" });

  return (
    <>
      <MastHead scrollToRef={scrollToRef}>
        <div
          style={{
            margin: "auto",
          }}
        >
          <Image
            alt="conference logo"
            src={"/images/SK-CIERNO-BIELE.png"}
            width={3219}
            height={845}
            quality={50}
            layout="responsive"
          />
        </div>
      </MastHead>
      <div ref={ref}>
        <Grid columns={2} container stackable>
          <Grid.Row stretched>
            <Grid.Column width={4}>
              <Menu fluid vertical style={{ flexGrow: 0 }}>
                <Menu.Item>
                  <Menu.Header>Conference name</Menu.Header>
                  <Menu.Menu>
                    <Menu.Item
                      as="a"
                      name="introduction"
                      active={tab === "personal"}
                      onClick={() => setTab("personal")}
                    />
                    <Menu.Item
                      as="a"
                      name="sections"
                      active={tab === "conferences"}
                      onClick={() => setTab("conferences")}
                    />
                  </Menu.Menu>
                </Menu.Item>
              </Menu>
            </Grid.Column>
            <Grid.Column width={12}>
              {tab === "personal" && <Segment />}
              {tab === "conferences" && <Segment />}
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </div>
    </>
  );
};

ConferencePage.getLayout = function getLayout(page) {
  return (
    <Nav transparent={true}>
      {page}
      <Footer />
    </Nav>
  );
};

ConferencePage.getInitialProps = () => {
  return { protect: false };
};

export default ConferencePage;
