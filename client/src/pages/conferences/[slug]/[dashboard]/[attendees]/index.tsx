import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useRouter } from "next/router";
import Dashboard from "../../../../../components/Dashboard";
import { NextPageWithLayout } from "../../../../_app";
import { useConferenceAttendeesQuery } from "../../../../../graphql/generated/schema";

const AttendeesPage: NextPageWithLayout = () => {
	const router = useRouter();

	const { data, error, loading, refetch } = useConferenceAttendeesQuery({
		variables: { slug: router.query.slug as string },
	});

	console.log(data, error, loading);

	return <div>attendees</div>;
};

AttendeesPage.getLayout = function getLayout(page) {
	return <Dashboard>{page}</Dashboard>;
};

export const getServerSideProps = async ({ locale }: { locale: string }) => ({
	props: {
		admin: true,
		...(await serverSideTranslations(locale, ["common", "validation"])),
	},
});

export default AttendeesPage;
