import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useContext, useEffect } from "react";
import Dashboard from "../../../components/Dashboard";
import GrantSearch from "../../../components/GrantSearch";
import GrantsList from "../../../components/GrantsList";
import {
	ActionTypes,
	ControlsContext,
} from "../../../providers/ControlsProvider";
import { NextPageWithLayout } from "../../_app";

const GrantsPage: NextPageWithLayout = () => {
	const { dispatch } = useContext(ControlsContext);

	useEffect(() => {
		dispatch({
			type: ActionTypes.SetRightPanel,
			payload: { rightPanelItems: <GrantSearch /> },
		});
	}, [dispatch]);

	return <GrantsList />;
};

GrantsPage.getLayout = function getLayout(page) {
	return <Dashboard>{page}</Dashboard>;
};

export const getStaticProps = async ({ locale }: { locale: string }) => ({
	props: {
		admin: true,
		...(await serverSideTranslations(locale, ["common"])),
	},
});

export default GrantsPage;
