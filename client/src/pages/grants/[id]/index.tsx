import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useRouter } from "next/router";
import { useContext, useEffect, useState } from "react";
import {
	Button,
	Divider,
	Grid,
	GridColumn,
	Header,
	Loader,
	Message,
	Tab,
} from "semantic-ui-react";

import AddBudgetDialog from "../../../components/AddBudgetDialog";
import AddMemberDialog from "../../../components/AddMemberDIalog";
import Dashboard from "../../../components/Dashboard";
import { Role, useGrantQuery } from "../../../graphql/generated/schema";
import useWidth from "../../../hooks/useWidth";
import { AuthContext } from "../../../providers/Auth";
import { NextPageWithLayout } from "../../_app";

const GrantPage: NextPageWithLayout = () => {
	const { user } = useContext(AuthContext);
	const { query } = useRouter();
	const width = useWidth();

	const { data, loading, error } = useGrantQuery({
		variables: { id: query.id },
	});

	if (loading) {
		return <Loader active />;
	}

	if (error) {
		return <Message error content={error.message} />;
	}

	return (
		<Grid padded={width < 400 ? "vertically" : true}>
			<Grid.Row verticalAlign="middle">
				<Grid.Column>
					<Header>
						{data?.grant.name}
						<Header.Subheader>{data?.grant.type}</Header.Subheader>
					</Header>
					<p>
						Trvanie: {new Date(data?.grant.start).toLocaleDateString()} -{" "}
						{new Date(data?.grant.end).toLocaleDateString()}
					</p>
				</Grid.Column>
			</Grid.Row>
			<Divider />
			<Grid.Row>
				<Grid.Column>
					<Grid>
						<Grid.Row columns={2} verticalAlign="middle">
							<Grid.Column>
								<Header>Oznamy</Header>
							</Grid.Column>
							<Grid.Column>
								{user?.role === Role.Admin && <AddBudgetDialog />}
							</Grid.Column>
						</Grid.Row>
						<Grid.Row>
							<Grid.Column>
								{data?.grant.announcements.length === 0 && (
									<Message warning content="Žiadne oznamy" />
								)}
								{data?.grant.announcements.map((a) => (
									<div key={a?.id}>{a?.name}</div>
								))}
							</Grid.Column>
						</Grid.Row>
						<Grid.Row columns={2} verticalAlign="middle">
							<Grid.Column>
								<Header>Rozpočet</Header>
							</Grid.Column>
							<Grid.Column>
								{user?.role === Role.Admin && <AddBudgetDialog />}
							</Grid.Column>
						</Grid.Row>
						<Grid.Row>
							<Grid.Column>
								{data?.grant.budgets.length !== 0 && (
									<Tab
										menu={{ secondary: true, pointing: true }}
										panes={data?.grant.budgets.map((b) => ({
											menuItem: new Date(b?.year).getFullYear(),
											render: () => (
												<Tab.Pane attached={false}>
													<Grid padded>
														<Grid.Row divided columns={2}>
															<Grid.Column>
																<Header size="tiny">Schválené</Header>
																<p>Cestovné: {b?.travel} €</p>
																<p>Materiál: {b?.material} €</p>
																<p>Služby: {b?.services} €</p>
																<p>Mzdy: {b?.salaries} €</p>
																<p>Nepriame: {b?.indirect} €</p>
															</Grid.Column>
															<Grid.Column>
																<Header size="tiny">Prečerpané</Header>
																<p>Cestovné: {b?.travel} €</p>
																<p>Materiál: {b?.material} €</p>
																<p>Služby: {b?.services} €</p>
																<p>Mzdy: {b?.salaries} €</p>
																<p>Nepriame: {b?.indirect} €</p>
															</Grid.Column>
														</Grid.Row>
														<Grid.Row columns={2} verticalAlign="middle">
															<Grid.Column>
																<Header size="tiny">Riešitelia</Header>
															</Grid.Column>
															<Grid.Column>
																{user?.role === Role.Admin && (
																	<AddMemberDialog year={b?.year} />
																)}
															</Grid.Column>
														</Grid.Row>
													</Grid>
												</Tab.Pane>
											),
										}))}
									/>
								)}
							</Grid.Column>
						</Grid.Row>
					</Grid>
				</Grid.Column>
			</Grid.Row>
		</Grid>
	);
};

GrantPage.getLayout = function getLayout(page) {
	return <Dashboard>{page}</Dashboard>;
};

export const getServerSideProps = async ({ locale }: { locale: string }) => ({
	props: {
		protect: true,
		...(await serverSideTranslations(locale, ["common", "validation"])),
	},
});

export default GrantPage;
