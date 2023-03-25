import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useRouter } from "next/router";
import { Grid, Segment } from "semantic-ui-react";
import Dashboard from "../../../../components/Dashboard";

import { NextPageWithLayout } from "../../../_app";

const DashboardPage: NextPageWithLayout = () => {
	const router = useRouter();

	return <div>Dashboard</div>;
};

DashboardPage.getLayout = function getLayout(page) {
	return <Dashboard>{page}</Dashboard>;
};

export const getStaticProps = async ({ locale }: { locale: string }) => ({
	props: {
		protect: true,
		...(await serverSideTranslations(locale, ["common", "validation"])),
	},
});

export default DashboardPage;
