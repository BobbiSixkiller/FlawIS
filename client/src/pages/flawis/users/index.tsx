import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useContext, useEffect } from "react";
import { InView } from "react-intersection-observer";
import {
	Grid,
	Header,
	Icon,
	Message,
	Placeholder,
	Table,
} from "semantic-ui-react";
import Dashboard from "../../../components/Dashboard";
import DeleteDialog from "../../../components/DeleteDialog";
import {
	useDeleteUserMutation,
	UsersDocument,
	useUsersQuery,
} from "../../../graphql/generated/schema";
import useWidth from "../../../hooks/useWidth";
import {
	ActionTypes,
	ControlsContext,
} from "../../../providers/ControlsProvider";
import { NextPageWithLayout } from "../../_app";

const AnnouncementsPage: NextPageWithLayout = () => {
	const { dispatch } = useContext(ControlsContext);
	const width = useWidth();

	const { data, error, loading, fetchMore } = useUsersQuery({
		variables: { first: 20 },
		notifyOnNetworkStatusChange: true,
	});

	const [deleteUser] = useDeleteUserMutation({
		refetchQueries: [{ query: UsersDocument }, "users"],
	});

	useEffect(() => {
		dispatch({
			type: ActionTypes.SetRightPanel,
			payload: { rightPanelItems: null },
		});
	}, [dispatch]);

	return (
		<Grid padded={width < 400 ? "vertically" : true}>
			<Grid.Row verticalAlign="middle">
				<Grid.Column width={8}>
					<Header>Používatelia</Header>
				</Grid.Column>
			</Grid.Row>
			<Grid.Row>
				<Grid.Column>
					{error && <Message error content={error.message} />}

					<Table basic="very" celled>
						<Table.Header>
							<Table.Row>
								<Table.HeaderCell>Meno</Table.HeaderCell>
								<Table.HeaderCell>Email</Table.HeaderCell>
								<Table.HeaderCell>Rola</Table.HeaderCell>
								<Table.HeaderCell>Overený</Table.HeaderCell>
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
							{data?.users.edges.map((edge) => (
								<Table.Row key={edge?.cursor}>
									<Table.Cell>{edge?.node.name}</Table.Cell>
									<Table.Cell>{edge?.node.email}</Table.Cell>
									<Table.Cell>{edge?.node.role}</Table.Cell>
									<Table.Cell>
										{edge?.node.verified ? (
											<Icon color="green" name="checkmark" />
										) : (
											<Icon color="red" name="x" />
										)}
									</Table.Cell>
									<Table.Cell>
										<DeleteDialog
											confirmCb={async () =>
												(await deleteUser({
													variables: { id: edge?.cursor },
												})) as Promise<void>
											}
											cancelText="Zrušiť"
											confirmText="Potvrdiť"
											content={
												<p>Naozaj chcete zmazať vybraného používateľa?</p>
											}
											header="Zmazať používateľa"
										/>
									</Table.Cell>
								</Table.Row>
							))}
							{data?.users.pageInfo.hasNextPage && (
								<InView
									onChange={async (inView) => {
										if (inView) {
											await fetchMore({
												variables: {
													after: data?.users.pageInfo.endCursor,
													first: 20,
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
