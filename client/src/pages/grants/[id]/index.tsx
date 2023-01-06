import { useRouter } from "next/router";
import { Grid } from "semantic-ui-react";

import { array, boolean, InferType, number, object, string } from "yup";
import Dashboard from "../../../components/Dashboard";
import { NextPageWithLayout } from "../../_app";

const conferenceInputSchema = object({
	name: string().required(),
	description: string().required(),
	logoUrl: string().required(),
	variableSymbol: string().required(),
	regEnd: string(),
	start: string(),
	end: string(),
	host: object({
		logoUrl: string().required(),
		stampUrl: string().required(),
		billing: object({
			name: string().required(),
			address: object({
				street: string().required(),
				city: string().required(),
				postal: string().required(),
				country: string().required(),
			}),
			DIC: string().required(),
			ICO: string().required(),
			ICDPH: string().required(),
			IBAN: string().required(),
			SWIFT: string().required(),
		}),
	}),
	venue: object({
		name: string().required(),
		address: object({
			street: string().required(),
			city: string().required(),
			postal: string().required(),
			country: string().required(),
		}),
	}),
	tickets: array().of(
		object({
			name: string().required(),
			description: string().required(),
			online: boolean(),
			withSubmission: boolean(),
			price: number().required().positive(),
		})
	),
	translations: array().of(
		object({
			language: string().required(),
			name: string().required(),
			description: string().required(),
			logoUrl: string().required(),
			tickets: array().of(
				object({
					language: string().required(),
					name: string().required(),
					description: string().required(),
				})
			),
		})
	),
});

type Values = InferType<typeof conferenceInputSchema>;

const GrantPage: NextPageWithLayout = () => {
	const router = useRouter();

	console.log(router);

	return (
		<Grid columns={2} container stackable>
			<Grid.Row stretched>
				<Grid.Column width={4}></Grid.Column>
				<Grid.Column width={12}></Grid.Column>
			</Grid.Row>
		</Grid>
	);
};

GrantPage.getLayout = function getLayout(page) {
	return <Dashboard>{page}</Dashboard>;
};

GrantPage.getInitialProps = () => {
	return { protect: true };
};

export default GrantPage;
