import { useEffect, useState } from "react";
import { useField, useFormikContext } from "formik";
import { useDropzone } from "react-dropzone";
import styled from "styled-components";
import { Button, Form, List } from "semantic-ui-react";
import { FileType } from "../../graphql/generated/schema";

interface ColorProps {
	isDragAccept: boolean;
	isDragReject: boolean;
	isFocused: boolean;
}

const getColor = (props: ColorProps) => {
	if (props.isDragAccept) {
		return "#00e676";
	}
	if (props.isDragReject) {
		return "#ff1744";
	}
	if (props.isFocused) {
		return "#2196f3";
	}
	return "#eeeeee";
};

const Container = styled.div<ColorProps>`
	flex: 1;
	display: flex;
	flex-direction: column;
	align-items: center;
	padding: 20px;
	border-width: 2px;
	border-radius: 2px;
	border-color: ${(props) => getColor(props)};
	border-style: dashed;
	background-color: #fafafa;
	color: #bdbdbd;
	outline: none;
	transition: border 0.24s ease-in-out;
`;

export default function FileUpload(props: {
	name: string;
	label: string;
	type: FileType;
}) {
	const {
		getRootProps,
		getInputProps,
		isFocused,
		isDragAccept,
		isDragReject,
		acceptedFiles,
	} = useDropzone({
		accept:
			props.type === FileType.Image
				? { "image/*": [] }
				: {
						"application/vnd.openxmlformats-officedocument.wordprocessingml.document":
							[],
						"application/pdf": [],
				  },
	});

	const [files, setFiles] = useState<File[]>([]);
	const [field, meta, helpers] = useField(props);

	const error = meta.touched && meta.error;

	useEffect(() => {
		setFiles(acceptedFiles);
	}, [acceptedFiles]);

	useEffect(() => {
		console.log(files);
		helpers.setValue(files);
	}, [files]);

	return (
		<Form.Field error={error}>
			<label>{props.label}</label>
			<Container {...getRootProps({ isFocused, isDragAccept, isDragReject })}>
				<input {...getInputProps()} name={field.name} />
				<p>Drag & drop some files here, or click to select files</p>
			</Container>
			<List>
				{files.map((file) => (
					<List.Item key={file.name}>
						<List.Content floated="right">
							<Button
								type="button"
								size="tiny"
								icon="x"
								onClick={() =>
									setFiles((prev) => prev.filter((f) => f !== file))
								}
							/>
						</List.Content>
						<List.Content>{file.name}</List.Content>
					</List.Item>
				))}
			</List>
		</Form.Field>
	);
}
