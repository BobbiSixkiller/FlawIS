import { useContext } from "react";
import { ControlsContext } from "../providers/ControlsProvider";
import { Card, Grid, Header, List, Message } from "semantic-ui-react";
import { useTranslation } from "next-i18next";
import {
	AttendeeFragmentFragment,
	Section,
	useDeleteSubmissionMutation,
} from "../graphql/generated/schema";
import { useRouter } from "next/router";
import useWidth from "../hooks/useWidth";
import DeleteDialog from "./DeleteDialog";
import AddSubmissionDialog from "./AddSubmissionDialog";
import UpdateSubmissionDialog from "./UpdateSubmissionDialog";
import AddSubmissionFileDialog from "./AddSubmissionFileDialog";

export default function AttendeeComponent({
	title,
	conferenceId,
	data,
	error,
	loading,
}: {
	title?: string;
	conferenceId?: string;
	data?: AttendeeFragmentFragment | null;
	error?: any;
	loading: boolean;
}) {
	const { dispatch } = useContext(ControlsContext);
	const { t, i18n } = useTranslation("conference");
	const router = useRouter();
	const width = useWidth();

	// useEffect(() => {
	// 	dispatch({
	// 		type: ActionTypes.SetRightPanel,
	// 		payload: {
	// 			rightPanelItems: (
	// 				<Button
	// 					icon="inbox"
	// 					fluid
	// 					positive
	// 					content={t("dashboard.attendee.upload")}
	// 				/>
	// 			),
	// 		},
	// 	});
	// }, []);

	const [deleteSubmission] = useDeleteSubmissionMutation();

	if (loading) {
		return <div>Loading...</div>;
	}

	if (error) {
		return <Message negative content={error.message} />;
	}

	return (
		<Grid padded={width < 400 ? "vertically" : true}>
			<Grid.Row columns={2}>
				<Grid.Column>
					<Header>{title}</Header>
				</Grid.Column>
				<Grid.Column>
					<AddSubmissionDialog />
				</Grid.Column>
			</Grid.Row>
			{/* <Grid.Row>
				<Grid.Column>Fakturka</Grid.Column>
			</Grid.Row> */}
			{data?.submissions?.length !== 0 && (
				<Grid.Row>
					<Grid.Column>
						<Header>{t("dashboard.attendee.submission")}</Header>
						{data?.submissions?.map((submission) => (
							<Card fluid key={submission.id}>
								<Card.Content>
									<Card.Header> {submission.name}</Card.Header>
									<Card.Meta>{submission.section.name}</Card.Meta>
									<Card.Description>
										<List bulleted horizontal>
											{submission.authors.map((a) => (
												<List.Item key={a.id}>{a.name}</List.Item>
											))}
										</List>
										<p>{submission.abstract}</p>
										<List bulleted horizontal>
											{submission.keywords.map((k, i) => (
												<List.Item key={i}>{k}</List.Item>
											))}
										</List>
									</Card.Description>
								</Card.Content>
								<Card.Content extra>
									<DeleteDialog
										confirmCb={async () =>
											(await deleteSubmission({
												variables: { id: submission.id },
												update(cache) {
													cache.evict({ id: `Submission:${submission.id}` });
												},
											})) as Promise<void>
										}
										header="Zmazať príspevok"
										content={<p>Naozaj chcete zmazať vybraný príspevok?</p>}
										cancelText="Zrušiť"
										confirmText="Potvrdiť"
									/>
									<UpdateSubmissionDialog
										id={submission.id}
										input={{
											conferenceId,
											authors: [],
											abstract: submission.abstract,
											keywords: submission.keywords,
											name: submission.name,
											sectionId: submission.section.id,
											translations: submission.translations.map((t) => ({
												language: t.language,
												name: t.name,
												abstract: t.abstract,
												keywords: t.keywords,
											})),
										}}
									/>
									<AddSubmissionFileDialog
										id={submission.id}
										input={{
											conferenceId,
											authors: [],
											abstract: submission.abstract,
											keywords: submission.keywords,
											name: submission.name,
											sectionId: submission.section.id,
											translations: submission.translations.map((t) => ({
												language: t.language,
												name: t.name,
												abstract: t.abstract,
												keywords: t.keywords,
											})),
										}}
									/>
								</Card.Content>
							</Card>
						))}
					</Grid.Column>
				</Grid.Row>
			)}
		</Grid>
	);
}
