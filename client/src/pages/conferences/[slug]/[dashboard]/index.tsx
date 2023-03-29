import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useRouter } from "next/router";
import { useContext } from "react";
import { Grid, Header, Message } from "semantic-ui-react";
import AddTicketDialog from "../../../../components/AddTicketDialog";
import Attendee from "../../../../components/Attendee";
import Dashboard from "../../../../components/Dashboard";
import { Role, useConferenceQuery } from "../../../../graphql/generated/schema";
import useWidth from "../../../../hooks/useWidth";
import { AuthContext } from "../../../../providers/Auth";
import { NextPageWithLayout } from "../../../_app";

const DashboardPage: NextPageWithLayout = () => {
  const { user } = useContext(AuthContext);
  const router = useRouter();
  const width = useWidth();

  const { data, error, loading } = useConferenceQuery({
    variables: { slug: router.query.slug as string },
    onCompleted: ({ conference }) => {
      if (!conference.attending && user?.role !== Role.Admin) {
        router.push(`/${router.query.slug}/register`);
      }
    },
  });

  console.log(data, error, loading);

  if (loading) return <div>Loading...</div>;

  if (error) return <Message negative content={error.message} />;

  return user?.role === Role.Basic ? (
    <Attendee />
  ) : (
    <Grid padded={width < 400 ? "vertically" : true}>
      <Grid.Row>
        <Grid.Column>
          <Header>{data?.conference.name}</Header>
        </Grid.Column>
      </Grid.Row>
      <Grid.Row>
        <Grid.Column>info</Grid.Column>
      </Grid.Row>
      <Grid.Row columns={2}>
        <Grid.Column>
          <Header>Lístky</Header>
        </Grid.Column>
        <Grid.Column>
          <AddTicketDialog />
        </Grid.Column>
      </Grid.Row>
      <Grid.Row>
        <Grid.Column>listky...</Grid.Column>
      </Grid.Row>
    </Grid>
  );
};

DashboardPage.getLayout = function getLayout(page) {
  return <Dashboard>{page}</Dashboard>;
};

export const getServerSideProps = async ({ locale }: { locale: string }) => ({
  props: {
    protect: true,
    ...(await serverSideTranslations(locale, ["common", "validation"])),
  },
});

export default DashboardPage;
