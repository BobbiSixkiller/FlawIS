import { Formik, FormikProps } from "formik";
import { useContext } from "react";
import { Button, Form, Input, Select, TextArea } from "semantic-ui-react";
import { InferType, object, string, array, mixed } from "yup";
import {
	FileType,
	GrantType,
	useCreateAnnouncementMutation,
	useUploadFileMutation,
} from "../graphql/generated/schema";
import { DialogContext } from "../providers/Dialog";
import parseErrors from "../util/parseErrors";
import {
	checkIfFilesAreCorrectType,
	checkIfFilesAreTooBig,
} from "../util/validation";
import FileUpload from "./form/FileUpload";
import { InputField } from "./form/InputField";

const budgetInputSchema = object({
	name: string().required(),
	text: string().required(),
	files: array().of(
		mixed()
			.test(
				"is-correct-file",
				"VALIDATION_FIELD_FILE_BIG",
				checkIfFilesAreTooBig
			)
			.test(
				"is-big-file",
				"VALIDATION_FIELD_FILE_WRONG_TYPE",
				checkIfFilesAreCorrectType
			)
	),
});

type Values = InferType<typeof budgetInputSchema>;

export default function AddAnnouncementDialog({
	grantId,
}: {
	grantId?: string;
}) {
	const { handleOpen, handleClose } = useContext(DialogContext);

	const [addAnnouncement] = useCreateAnnouncementMutation({
		onCompleted: () => handleClose(),
		update(cache, { data }) {
			if (grantId) {
				cache.modify({
					id: cache.identify({ __typename: "Grant", id: grantId }),
					fields: {
						announcements(existing) {
							return [...existing, data?.createAnnouncement];
						},
					},
				});
			}
		},
	});
	const [upload] = useUploadFileMutation();

	return (
		<Button
			positive
			floated="right"
			icon="plus"
			size="tiny"
			onClick={() =>
				handleOpen({
					size: "tiny",
					header: "Pridať oznam",
					content: (
						<Formik
							initialValues={
								{
									name: "",
									text: "",
									files: [],
									grantType: grantId ? undefined : "",
								} as Values
							}
							validationSchema={
								grantId
									? budgetInputSchema
									: budgetInputSchema.concat(
											object({ grantType: string().required() })
									  )
							}
							onSubmit={async (values, formik) => {
								console.log(values);
								try {
									const urls: string[] = [];
									for await (const file of values.files as File[]) {
										const { data } = await upload({
											variables: { file, type: FileType.Grant },
										});
										if (data) {
											urls.push(data?.uploadFile);
										}
									}
									console.log(urls);
									await addAnnouncement({
										variables: {
											data: {
												...values,
												grantId,
												files: urls,
											},
										},
									});
								} catch (error: any) {
									formik.setStatus(
										parseErrors(
											error.graphQLErrors[0].extensions.exception
												.validationErrors
										)
									);
								}
							}}
						>
							{({ handleSubmit, isSubmitting }: FormikProps<Values>) => (
								<Form loading={isSubmitting} onSubmit={handleSubmit}>
									{!grantId && (
										<InputField
											fluid
											placeholder="Typ grantu..."
											label="Typ grantu"
											name="grantType"
											control={Select}
											options={[
												{ key: "0", text: "APVV", value: "APVV" },
												{ key: "1", text: "VEGA", value: "VEGA" },
												{ key: "2", text: "KEGA", value: "KEGA" },
											]}
										/>
									)}
									<InputField
										fluid
										placeholder="Názov oznamu..."
										label="Názov"
										name="name"
										control={Input}
									/>
									<InputField
										fluid
										placeholder="Text oznamu..."
										label="Text"
										name="text"
										control={TextArea}
									/>
									<FileUpload
										name="files"
										label="Súbory"
										type={FileType.Grant}
									/>

									<Button secondary onClick={() => handleClose()} type="button">
										Zrušiť
									</Button>
									<Button positive type="submit">
										Pridať
									</Button>
								</Form>
							)}
						</Formik>
					),
				})
			}
		/>
	);
}
