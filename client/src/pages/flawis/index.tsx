import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import Link from "next/link";
import { useRouter } from "next/router";
import { useContext, useEffect } from "react";
import { Menu } from "semantic-ui-react";

import Dashboard from "../../components/Dashboard";
import GrantSearch from "../../components/GrantSearch";
import GrantsList from "../../components/GrantsList";
import MyGrants from "../../components/MyGrants";
import { Role } from "../../graphql/generated/schema";
import { AuthContext } from "../../providers/Auth";
import { ActionTypes, ControlsContext } from "../../providers/ControlsProvider";
import { NextPageWithLayout } from "../_app";

const HomePage: NextPageWithLayout = () => {
	const { user } = useContext(AuthContext);
	const { dispatch } = useContext(ControlsContext);
	const router = useRouter();
	const { t } = useTranslation(["common"]);

	useEffect(() => {
		dispatch({
			type: ActionTypes.SetRightPanel,
			payload: { rightPanelItems: <GrantSearch /> },
		});
		if (user?.role === Role.Admin) {
			dispatch({
				type: ActionTypes.SetDrawer,
				payload: {
					drawerItems: (
						<>
							<Menu.Item
								as={Link}
								href="/users"
								active={router.asPath.includes("/users")}
							>
								<b>{t("menu.users")}</b>
							</Menu.Item>
							<Menu.Item
								as={Link}
								href="/grants"
								active={router.asPath.includes("/grants")}
							>
								<b>{t("menu.grants")}</b>
							</Menu.Item>
						</>
					),
				},
			});
		}
	}, []);

	return user?.role === Role.Admin ? <GrantsList /> : <MyGrants />;
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
