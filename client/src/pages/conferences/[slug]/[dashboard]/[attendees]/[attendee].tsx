import { NextPageContext } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useRouter } from "next/router";
import { Grid, Loader, Message } from "semantic-ui-react";
import AttendeeComponent from "../../../../../components/AttendeeComponent";
import Dashboard from "../../../../../components/Dashboard";
import { useAttendeeQuery } from "../../../../../graphql/generated/schema";
import { NextPageWithLayout } from "../../../../_app";

const AttendeePage: NextPageWithLayout = () => {
	const router = useRouter();

	const { data, error, loading } = useAttendeeQuery({
		variables: { id: router.query.attendee as string },
	});

	if (loading) {
		return (
			<Grid.Column style={{ height: "400px" }}>
				<Loader active />
			</Grid.Column>
		);
	}

	if (error) {
		return <Message negative content={error.message} />;
	}

	return (
		<AttendeeComponent title={data?.attendee.user.name} data={data?.attendee} />
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
