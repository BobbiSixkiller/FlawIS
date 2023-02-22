import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import Link from "next/link";
import { useRouter } from "next/router";
import { useContext } from "react";
import {
	Divider,
	Feed,
	Grid,
	Header,
	Icon,
	Label,
	Loader,
	Message,
	Tab,
	Table,
} from "semantic-ui-react";
import AddAnnouncementDialog from "../../../components/AddAnnouncementDialog";

import AddBudgetDialog from "../../../components/AddBudgetDialog";
import AddMemberDialog from "../../../components/AddMemberDIalog";
import Dashboard from "../../../components/Dashboard";
import DeleteDialog from "../../../components/DeleteDialog";
import {
	Role,
	useDeleteBudgetMutation,
	useDeleteMemberMutation,
	useGrantQuery,
} from "../../../graphql/generated/schema";
import useWidth from "../../../hooks/useWidth";
import { AuthContext } from "../../../providers/Auth";
import { NextPageWithLayout } from "../../_app";

const GrantPage: NextPageWithLayout = () => {
	const { user } = useContext(AuthContext);
	const router = useRouter();
	const width = useWidth();

	const { data, loading, error } = useGrantQuery({
		variables: { id: router.query.id },
	});
	const [deleteBudget] = useDeleteBudgetMutation();
	const [deleteMember] = useDeleteMemberMutation();

	if (loading) {
		return <Loader active />;
	}

	if (error) {
		return <Message error content={error.message} />;
	}

	const currentBudgetIndex =
		data?.grant.budgets.findIndex(
			(b) => new Date(b?.year).getFullYear().toString() === router.query.year
		) || 0;

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
								{user?.role === Role.Admin && (
									<AddAnnouncementDialog
										grantId={router.query.id?.toString()}
									/>
								)}
							</Grid.Column>
						</Grid.Row>
						<Grid.Row>
							<Grid.Column>
								{data?.grant.announcements.length === 0 ? (
									<Message warning content="Žiadne oznamy" />
								) : (
									<Feed>
										{data?.grant.announcements.map((a) => (
											<Feed.Event key={a?.id}>
												<Feed.Label icon="announcement" />
												<Feed.Content>
													<Feed.Summary>
														{a?.name}
														<Feed.Date>
															{new Date(a?.updatedAt).toLocaleDateString()}
														</Feed.Date>
													</Feed.Summary>
													<Feed.Extra text>{a?.text}</Feed.Extra>
													{a?.files?.length !== 0 && (
														<Feed.Meta>
															{a?.files?.map((f, i) => (
																<Link key={i} href={f}>
																	<Icon name="file" />
																	{f.split("-")[5]}
																</Link>
															))}
														</Feed.Meta>
													)}
												</Feed.Content>
											</Feed.Event>
										))}
									</Feed>
								)}
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
										defaultActiveIndex={
											currentBudgetIndex !== -1 ? currentBudgetIndex : 0
										}
										onTabChange={(e, { activeIndex, panes }) =>
											router.push({
												pathname: `/${router.query.id}`,
												query: {
													year: panes?.find((p, i) => i === activeIndex)
														?.menuItem,
												},
											})
										}
										menu={{ secondary: true, pointing: true }}
										panes={data?.grant.budgets.map((b) => ({
											menuItem: new Date(b?.year).getFullYear().toString(),
											render: () => (
												<Tab.Pane attached={false}>
													<Grid padded>
														<Grid.Row>
															<Grid.Column>
																{user?.role === Role.Admin && (
																	<>
																		<DeleteDialog
																			confirmCb={async () =>
																				(await deleteBudget({
																					variables: {
																						id: data.grant.id,
																						year: b?.year,
																					},
																				})) as Promise<void>
																			}
																			content={
																				<p>
																					Naozaj chcete zmazať vybraný rozpočet?
																				</p>
																			}
																			header="Zmazať rozpočet"
																			cancelText="Zrušiť"
																			confirmText="Potvrdiť"
																		/>
																		{!b?.spent && (
																			<AddBudgetDialog year={b?.year} />
																		)}
																	</>
																)}
															</Grid.Column>
														</Grid.Row>
														<Grid.Row divided columns={2}>
															<Grid.Column>
																<Header size="tiny">Schválené</Header>
																<p>Cestovné: {b?.approved.travel} €</p>
																<p>Materiál: {b?.approved.material} €</p>
																<p>Služby: {b?.approved.services} €</p>
																<p>Mzdy: {b?.approved.salaries} €</p>
																<p>Nepriame: {b?.approved.indirect} €</p>
															</Grid.Column>
															<Grid.Column>
																<Header size="tiny">Zostatok</Header>
																{b?.spent && (
																	<>
																		<p>Cestovné: {b?.spent.travel} €</p>
																		<p>Materiál: {b?.spent.material} €</p>
																		<p>Služby: {b?.spent.services} €</p>
																		<p>Mzdy: {b?.spent.salaries} €</p>
																		<p>Nepriame: {b?.spent.indirect} €</p>
																	</>
																)}
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
														<Grid.Row>
															<Grid.Column>
																{b?.members.length !== 0 && (
																	<Table basic="very" celled>
																		<Table.Header>
																			<Table.Row>
																				<Table.HeaderCell>
																					Meno
																				</Table.HeaderCell>
																				<Table.HeaderCell>
																					Hodiny
																				</Table.HeaderCell>
																				{user?.role === Role.Admin && (
																					<Table.HeaderCell>
																						Akcia
																					</Table.HeaderCell>
																				)}
																			</Table.Row>
																		</Table.Header>
																		<Table.Body>
																			{b?.members.map((m, i) => (
																				<Table.Row key={i}>
																					<Table.Cell>
																						{m?.isMain && (
																							<Label ribbon>Hlavný</Label>
																						)}{" "}
																						{m?.user.name}
																					</Table.Cell>
																					<Table.Cell>{m?.hours}</Table.Cell>
																					{user?.role === Role.Admin && (
																						<Table.Cell>
																							<DeleteDialog
																								content={
																									<p>
																										Naozaj chcete zmazať
																										riešiteľa?
																									</p>
																								}
																								header="Zmazať riešiteľa"
																								cancelText="Zrušiť"
																								confirmText="Potvrdiť"
																								confirmCb={async () =>
																									(await deleteMember({
																										variables: {
																											id: data.grant.id,
																											year: b.year,
																											user: m?.user.id,
																										},
																									})) as Promise<void>
																								}
																							/>
																						</Table.Cell>
																					)}
																				</Table.Row>
																			))}
																		</Table.Body>
																	</Table>
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
