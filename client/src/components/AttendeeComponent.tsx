import { useContext, useEffect } from "react";
import { ActionTypes, ControlsContext } from "../providers/ControlsProvider";
import {
	Button,
	Card,
	Grid,
	Header,
	List,
	Message,
	Tab,
} from "semantic-ui-react";
import { useTranslation } from "next-i18next";
import {
	Attendee,
	AttendeeFragmentFragment,
	Section,
} from "../graphql/generated/schema";
import { useRouter } from "next/router";
import useWidth from "../hooks/useWidth";
import { Formik } from "formik";
import SubmissionComponent from "./SubmissionComponent";
import DeleteDialog from "./DeleteDialog";
import AddSubmissionDialog from "./AddSubmissionDialog";

export default function AttendeeComponent({
	title,
	data,
	sections,
	error,
	loading,
}: {
	title?: string;
	data?: AttendeeFragmentFragment | null;
	sections?: Pick<Section, "id" | "name" | "description" | "languages">[];
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
						<Header>Prispevky</Header>
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
										confirmCb={
											async () => console.log("DELETE")
											// (await deleteGrant({
											// 	variables: { id: edge?.cursor },
											// })) as Promise<void>
										}
										header="Zmazať príspevok"
										content={<p>Naozaj chcete zmazať vybraný príspevok?</p>}
										cancelText="Zrušiť"
										confirmText="Potvrdiť"
									/>
									<Button
										primary
										size="tiny"
										icon="pencil alternate"
										onClick={() => console.log("edit")}
									/>
									<Button
										icon="inbox"
										size="tiny"
										positive
										content={t("dashboard.attendee.upload")}
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
