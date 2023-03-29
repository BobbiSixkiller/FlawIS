import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useRouter } from "next/router";
import Dashboard from "../../../../components/Dashboard";
import { NextPageWithLayout } from "../../../_app";

const AttendeesPage: NextPageWithLayout = () => {
  const router = useRouter();

  return <div>attendees</div>;
};

AttendeesPage.getLayout = function getLayout(page) {
  return <Dashboard>{page}</Dashboard>;
};

export const getServerSideProps = async ({ locale }: { locale: string }) => ({
  props: {
    protect: true,
    ...(await serverSideTranslations(locale, ["common", "validation"])),
  },
});

export default AttendeesPage;
