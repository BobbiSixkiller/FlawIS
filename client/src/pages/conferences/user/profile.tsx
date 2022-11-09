import { NextPage } from "next";
import { FC, useContext, useState } from "react";
import { Grid, Menu, Segment } from "semantic-ui-react";
import Footer from "src/components/Footer";
import { ContentWrapper, Nav, PageWrapper } from "src/components/Layout";
import PersonalInfo from "src/components/PersonalInfo";
import { AuthContext } from "src/providers/Auth";

const AttendedConferences: FC = () => {
  return <Segment>ATTENDED CONFERENCES</Segment>;
};

const ProfilePage: NextPage = () => {
  const { user } = useContext(AuthContext);
  const [tab, setTab] = useState("personal");

  return (
    <Grid columns={2} container stackable>
      <Grid.Row stretched>
        <Grid.Column width={4}>
          <Menu fluid vertical style={{ flexGrow: 0 }}>
            <Menu.Item>
              <Menu.Header>{user.name}</Menu.Header>
              <Menu.Menu>
                <Menu.Item
                  as="a"
                  name="personal information"
                  active={tab === "personal"}
                  onClick={() => setTab("personal")}
                />
                <Menu.Item
                  as="a"
                  name="conferences"
                  active={tab === "conferences"}
                  onClick={() => setTab("conferences")}
                />
              </Menu.Menu>
            </Menu.Item>
          </Menu>
        </Grid.Column>
        <Grid.Column width={12}>
          {tab === "personal" && <PersonalInfo />}
          {tab === "conferences" && <AttendedConferences />}
        </Grid.Column>
      </Grid.Row>
    </Grid>
  );
};

ProfilePage.getLayout = function getLayout(page) {
  return (
    <Nav transparent={false}>
      <PageWrapper>
        <ContentWrapper>{page}</ContentWrapper>
        <Footer />
      </PageWrapper>
    </Nav>
  );
};

ProfilePage.getInitialProps = () => {
  return { protect: true };
};

export default ProfilePage;
