import { useRouter } from "next/router";
import { Grid, Segment } from "semantic-ui-react";
import Footer from "../../../components/Footer";
import { ContentWrapper, Nav, PageWrapper } from "../../../components/Layout";

import { NextPageWithLayout } from "../../_app";

const AttendeesPage: NextPageWithLayout = () => {
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

AttendeesPage.getLayout = function getLayout(page) {
  return (
    <Nav transparent={false}>
      <PageWrapper>
        <ContentWrapper>{page}</ContentWrapper>
        <Footer />
      </PageWrapper>
    </Nav>
  );
};

AttendeesPage.getInitialProps = () => {
  return { admin: true };
};

export default AttendeesPage;
