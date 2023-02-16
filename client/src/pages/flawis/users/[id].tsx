import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import Dashboard from "../../../components/Dashboard";
import UserGrants from "../../../components/UserGrants";
import { NextPageWithLayout } from "../../_app";

const UserPage: NextPageWithLayout = () => {
  return <UserGrants />;
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
