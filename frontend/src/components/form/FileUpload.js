import React from "react";
import { useField } from "formik";
import { useDropzone } from "react-dropzone";

import { FormGroup, Label, Jumbotron } from "reactstrap";

export default function FileUpload({ label, ...props }) {
	const [field, meta, helpers] = useField(props);
	const { acceptedFiles, getRootProps, getInputProps } = useDropzone();

	const files = acceptedFiles.map((file) => (
		<li key={file.path}>
			{file.path} - {file.size} bytes
		</li>
	));

	console.log(acceptedFiles);

	return (
		<FormGroup>
			{label && <Label>{label}:</Label>}
			<Jumbotron {...getRootProps()}>
				<input {...getInputProps()} />
				<p className="text-muted text-center">Drag n drop files</p>
			</Jumbotron>

			<aside>
				<h4>Files</h4>
				<ul>{files}</ul>
			</aside>
		</FormGroup>
	);
}
