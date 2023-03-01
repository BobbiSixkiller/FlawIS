import { useRouter } from "next/router";
import { Grid, Segment } from "semantic-ui-react";
import Footer from "../../../components/Footer";
import Nav, {
  ContentWrapper,
  PageWrapper,
} from "../../../components/MobileNav";

import { NextPageWithLayout } from "../../_app";

const Dashboard: NextPageWithLayout = () => {
  const router = useRouter();

  return (
    <Segment vertical>
      <Grid divided="vertically" container>
        <Grid.Row>
          <Grid.Column>obkec</Grid.Column>
        </Grid.Row>

        <Grid.Row>
          <Grid.Column>obkec</Grid.Column>
        </Grid.Row>
      </Grid>
    </Segment>
  );
};

Dashboard.getLayout = function getLayout(page) {
  return (
    <Nav transparent={false}>
      <PageWrapper>
        <ContentWrapper>{page}</ContentWrapper>
        <Footer />
      </PageWrapper>
    </Nav>
  );
};

Dashboard.getInitialProps = () => {
  return { protect: true };
};

export default Dashboard;
