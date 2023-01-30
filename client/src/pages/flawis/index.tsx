import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useContext } from "react";

import Dashboard from "../../components/Dashboard";
import GrantsList from "../../components/GrantsList";
import UserGrants from "../../components/UserGrants";
import { Role } from "../../graphql/generated/schema";
import { AuthContext } from "../../providers/Auth";
import { NextPageWithLayout } from "../_app";

const HomePage: NextPageWithLayout = () => {
	const { user } = useContext(AuthContext);

	return user?.role === Role.Admin ? <GrantsList /> : <UserGrants />;
};

HomePage.getLayout = function getLayout(page) {
	return <Dashboard>{page}</Dashboard>;
};

export const getStaticProps = async ({ locale }: { locale: string }) => ({
	props: {
		protect: true,
		...(await serverSideTranslations(locale, ["activation", "common"])),
	},
});

export default HomePage;
