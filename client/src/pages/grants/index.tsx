import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useRouter } from "next/router";
import { useContext } from "react";
import { Button, Grid, Header, Placeholder, Segment } from "semantic-ui-react";
import AddGrantDialog from "../../components/AddGrantDialog";

import Dashboard from "../../components/Dashboard";
import { Role } from "../../graphql/generated/schema";
import { AuthContext } from "../../providers/Auth";
import { NextPageWithLayout } from "../_app";

const HomePage: NextPageWithLayout = () => {
	const router = useRouter();
	const { user } = useContext(AuthContext);

	return (
		<Grid padded>
			<Grid.Row verticalAlign="middle">
				<Grid.Column width={8}>
					<Header>Grants</Header>
				</Grid.Column>
				<Grid.Column width={8}>
					{user?.role === Role.Admin && <AddGrantDialog />}
				</Grid.Column>
			</Grid.Row>
			<Grid.Row>
				<Grid.Column>
					<Segment>
						<Placeholder>
							<Placeholder.Header image>
								<Placeholder.Line length="medium" />
								<Placeholder.Line length="full" />
							</Placeholder.Header>
							<Placeholder.Paragraph>
								<Placeholder.Line length="full" />
								<Placeholder.Line length="medium" />
							</Placeholder.Paragraph>
						</Placeholder>
					</Segment>
					<Segment>
						<Placeholder>
							<Placeholder.Header image>
								<Placeholder.Line length="medium" />
								<Placeholder.Line length="full" />
							</Placeholder.Header>
							<Placeholder.Paragraph>
								<Placeholder.Line length="full" />
								<Placeholder.Line length="medium" />
							</Placeholder.Paragraph>
						</Placeholder>
					</Segment>
					<Segment>
						<Placeholder>
							<Placeholder.Header image>
								<Placeholder.Line length="medium" />
								<Placeholder.Line length="full" />
							</Placeholder.Header>
							<Placeholder.Paragraph>
								<Placeholder.Line length="full" />
								<Placeholder.Line length="medium" />
							</Placeholder.Paragraph>
						</Placeholder>
					</Segment>
					<Segment>
						<Placeholder>
							<Placeholder.Header image>
								<Placeholder.Line length="medium" />
								<Placeholder.Line length="full" />
							</Placeholder.Header>
							<Placeholder.Paragraph>
								<Placeholder.Line length="full" />
								<Placeholder.Line length="medium" />
							</Placeholder.Paragraph>
						</Placeholder>
					</Segment>
					<Segment>
						<Placeholder>
							<Placeholder.Header image>
								<Placeholder.Line length="medium" />
								<Placeholder.Line length="full" />
							</Placeholder.Header>
							<Placeholder.Paragraph>
								<Placeholder.Line length="full" />
								<Placeholder.Line length="medium" />
							</Placeholder.Paragraph>
						</Placeholder>
					</Segment>
					<Segment>
						<Placeholder>
							<Placeholder.Header image>
								<Placeholder.Line length="medium" />
								<Placeholder.Line length="full" />
							</Placeholder.Header>
							<Placeholder.Paragraph>
								<Placeholder.Line length="full" />
								<Placeholder.Line length="medium" />
							</Placeholder.Paragraph>
						</Placeholder>
					</Segment>
					<Segment>
						<Placeholder>
							<Placeholder.Header image>
								<Placeholder.Line length="medium" />
								<Placeholder.Line length="full" />
							</Placeholder.Header>
							<Placeholder.Paragraph>
								<Placeholder.Line length="full" />
								<Placeholder.Line length="medium" />
							</Placeholder.Paragraph>
						</Placeholder>
					</Segment>
					<Segment>
						<Placeholder>
							<Placeholder.Header image>
								<Placeholder.Line length="medium" />
								<Placeholder.Line length="full" />
							</Placeholder.Header>
							<Placeholder.Paragraph>
								<Placeholder.Line length="full" />
								<Placeholder.Line length="medium" />
							</Placeholder.Paragraph>
						</Placeholder>
					</Segment>
					<Segment>
						<Placeholder>
							<Placeholder.Header image>
								<Placeholder.Line length="medium" />
								<Placeholder.Line length="full" />
							</Placeholder.Header>
							<Placeholder.Paragraph>
								<Placeholder.Line length="full" />
								<Placeholder.Line length="medium" />
							</Placeholder.Paragraph>
						</Placeholder>
					</Segment>
					<Segment>
						<Placeholder>
							<Placeholder.Header image>
								<Placeholder.Line length="medium" />
								<Placeholder.Line length="full" />
							</Placeholder.Header>
							<Placeholder.Paragraph>
								<Placeholder.Line length="full" />
								<Placeholder.Line length="medium" />
							</Placeholder.Paragraph>
						</Placeholder>
					</Segment>
					<Segment>
						<Placeholder>
							<Placeholder.Header image>
								<Placeholder.Line length="medium" />
								<Placeholder.Line length="full" />
							</Placeholder.Header>
							<Placeholder.Paragraph>
								<Placeholder.Line length="full" />
								<Placeholder.Line length="medium" />
							</Placeholder.Paragraph>
						</Placeholder>
					</Segment>
				</Grid.Column>
			</Grid.Row>
		</Grid>
	);
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
