import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useRouter } from "next/router";
import Dashboard from "../../../components/Dashboard";
import { useUserQuery } from "../../../graphql/generated/schema";
import { NextPageWithLayout } from "../../_app";

const UserPage: NextPageWithLayout = () => {
  const router = useRouter();

  const { data, error, loading } = useUserQuery({
    variables: { id: router.query.id },
  });

  return <div>{router.query.id}</div>;
};

UserPage.getLayout = function getLayout(page) {
  return <Dashboard>{page}</Dashboard>;
};

export const getServerSideProps = async ({ locale }: { locale: string }) => ({
  props: {
    admin: true,
    ...(await serverSideTranslations(locale, ["common"])),
  },
});

export default UserPage;
