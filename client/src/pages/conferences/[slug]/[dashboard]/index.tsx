import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useRouter } from "next/router";
import { useContext } from "react";
import { Card, Grid, Header, Message } from "semantic-ui-react";
import AddTicketDialog from "../../../../components/AddTicketDialog";
import Attendee from "../../../../components/Attendee";
import Dashboard from "../../../../components/Dashboard";
import DeleteDialog from "../../../../components/DeleteDialog";
import {
	Role,
	Ticket,
	useConferenceDashboardQuery,
	useRemoveTicketMutation,
} from "../../../../graphql/generated/schema";
import useWidth from "../../../../hooks/useWidth";
import { AuthContext } from "../../../../providers/Auth";
import { NextPageWithLayout } from "../../../_app";

const DashboardPage: NextPageWithLayout = () => {
	const { user } = useContext(AuthContext);
	const router = useRouter();
	const width = useWidth();

	const { data, error, loading } = useConferenceDashboardQuery({
		variables: { slug: router.query.slug as string },
		onCompleted: ({ conference }) => {
			if (!conference.attending && user?.role !== Role.Admin) {
				router.push(`/${router.query.slug}/register`);
			}
		},
	});

	const [removeTicket] = useRemoveTicketMutation();

	console.log(data, error, loading);

	if (loading) return <div>Loading...</div>;

	if (error) return <Message negative content={error.message} />;

	return user?.role === Role.Basic ? (
		<Attendee />
	) : (
		<Grid padded={width < 400 ? "vertically" : true}>
			<Grid.Row>
				<Grid.Column>
					<Header>{data?.conference.name}</Header>
				</Grid.Column>
			</Grid.Row>
			<Grid.Row>
				<Grid.Column>info</Grid.Column>
			</Grid.Row>
			<Grid.Row columns={2}>
				<Grid.Column>
					<Header>Lístky</Header>
				</Grid.Column>
				<Grid.Column>
					<AddTicketDialog id={data?.conference.id} />
				</Grid.Column>
			</Grid.Row>
			<Grid.Row>
				<Grid.Column>
					{data?.conference.tickets.map((ticket: Ticket) => (
						<Card fluid key={ticket.id}>
							<Card.Content>
								<Card.Header>
									{ticket.name}, {ticket.price / 100} €
								</Card.Header>
								<Card.Meta>
									{ticket.online && "Online účasť"}{" "}
									{ticket.withSubmission && "S príspevkom"}
								</Card.Meta>
								<Card.Description>
									<p>{ticket.description}</p>
								</Card.Description>
							</Card.Content>
							<Card.Content extra>
								<DeleteDialog
									confirmCb={async () =>
										(await removeTicket({
											variables: {
												id: data.conference.id,
												ticketId: ticket.id,
											},
											update(cache, { data }) {
												cache.modify({
													id: cache.identify({
														__ref: `Conference:${data?.removeTicket.id}`,
													}),
													fields: {
														tickets(existing) {
															const tickets = [...existing];

															return tickets.filter((t) => t.id !== ticket.id);
														},
													},
												});
											},
										})) as Promise<void>
									}
									header="Zmazať grant"
									content={<p>Naozaj chcete zmazať vybraný grant?</p>}
									cancelText="Zrušiť"
									confirmText="Potvrdiť"
								/>
							</Card.Content>
						</Card>
					))}
				</Grid.Column>
			</Grid.Row>
		</Grid>
	);
};

DashboardPage.getLayout = function getLayout(page) {
	return <Dashboard>{page}</Dashboard>;
};

export const getServerSideProps = async ({ locale }: { locale: string }) => ({
	props: {
		protect: true,
		...(await serverSideTranslations(locale, [
			"common",
			"validation",
			"activation",
		])),
	},
});

export default DashboardPage;
