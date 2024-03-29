import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { InView } from "react-intersection-observer";
import { Grid, Header, Message, Placeholder, Table } from "semantic-ui-react";
import AddAnnouncementDialog from "../../components/AddAnnouncementDialog";

import Dashboard from "../../components/Dashboard";
import DeleteDialog from "../../components/DeleteDialog";
import {
	AnnouncementEdge,
	useAnnouncementsQuery,
	useDeleteAnnouncementMutation,
} from "../../graphql/generated/schema";
import useWidth from "../../hooks/useWidth";
import { NextPageWithLayout } from "../_app";

const AnnouncementsPage: NextPageWithLayout = () => {
	const width = useWidth();

	const { data, error, loading, fetchMore } = useAnnouncementsQuery({
		variables: { first: 20 },
		notifyOnNetworkStatusChange: true,
	});

	const [deleteAnnouncement] = useDeleteAnnouncementMutation({
		update(cache, { data }) {
			cache.modify({
				fields: {
					announcements(existing) {
						return {
							...existing,
							edges: existing.edges.filter(
								(n: AnnouncementEdge) =>
									n.cursor !== data?.deleteAnnouncement.id
							),
						};
					},
				},
			});
		},
	});

	return (
		<Grid padded={width < 400 ? "vertically" : true}>
			<Grid.Row verticalAlign="middle">
				<Grid.Column width={8}>
					<Header>Oznamy</Header>
				</Grid.Column>
				<Grid.Column width={8}>
					<AddAnnouncementDialog />
				</Grid.Column>
			</Grid.Row>
			<Grid.Row>
				<Grid.Column>
					{error && <Message error content={error.message} />}
					{data && (
						<Table basic="very" celled>
							<Table.Header>
								<Table.Row>
									<Table.HeaderCell>Názov</Table.HeaderCell>
									<Table.HeaderCell>Text</Table.HeaderCell>
									<Table.HeaderCell>Súbory</Table.HeaderCell>
									<Table.HeaderCell>Akcia</Table.HeaderCell>
								</Table.Row>
							</Table.Header>
							<Table.Body>
								{loading &&
									[...Array(3)].map((i, key) => (
										<Table.Row key={key}>
											<Table.Cell>
												<Placeholder.Line />
											</Table.Cell>
										</Table.Row>
									))}
								{data?.announcements.edges.map((edge) => (
									<Table.Row key={edge?.cursor}>
										<Table.Cell>{edge?.node.name}</Table.Cell>
										<Table.Cell>{edge?.node.text}</Table.Cell>
										<Table.Cell>{edge?.node.files?.length || 0}</Table.Cell>
										<Table.Cell>
											<DeleteDialog
												confirmCb={async () =>
													(await deleteAnnouncement({
														variables: { id: edge?.cursor },
													})) as Promise<void>
												}
												header="Zmazať oznam"
												content={<p>Naozaj chcete zmazať oznam?</p>}
												cancelText="Zrušiť"
												confirmText="Potvrdiť"
											/>
										</Table.Cell>
									</Table.Row>
								))}
								{data?.announcements.pageInfo.hasNextPage && (
									<InView
										onChange={async (inView) => {
											if (inView) {
												await fetchMore({
													variables: {
														after: data?.announcements.pageInfo.endCursor,
														first: 5,
													},
												});
											}
										}}
									>
										<Table.Row key={4}>
											<Table.Cell>
												<Placeholder.Line />
											</Table.Cell>
										</Table.Row>
									</InView>
								)}
							</Table.Body>
						</Table>
					)}
				</Grid.Column>
			</Grid.Row>
		</Grid>
	);
};

AnnouncementsPage.getLayout = function getLayout(page) {
	return <Dashboard>{page}</Dashboard>;
};

export const getStaticProps = async ({ locale }: { locale: string }) => ({
	props: {
		admin: true,
		...(await serverSideTranslations(locale, ["common"])),
	},
});

export default AnnouncementsPage;
