import { NextPageContext } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useRouter } from "next/router";
import AttendeeComponent from "../../../../../components/AttendeeComponent";
import Dashboard from "../../../../../components/Dashboard";
import { useAttendeeQuery } from "../../../../../graphql/generated/schema";
import useWidth from "../../../../../hooks/useWidth";
import { NextPageWithLayout } from "../../../../_app";

const AttendeePage: NextPageWithLayout = () => {
  const router = useRouter();
  const width = useWidth();

  const { data, error, loading } = useAttendeeQuery({
    variables: { id: router.query.attendee as string },
  });

  console.log(data, error, loading);

  return (
    <AttendeeComponent
      loading={loading}
      title={data?.attendee.user.name}
      data={data?.attendee}
    />
  );
};

AttendeePage.getLayout = function getLayout(page) {
  return <Dashboard>{page}</Dashboard>;
};

export const getServerSideProps = async ({ locale }: NextPageContext) => {
  return {
    props: {
      protect: true,
      ...(await serverSideTranslations(locale || "sk", [
        "common",
        "validation",
        "conference",
        "activation",
      ])),
    },
  };
};

export default AttendeePage;
