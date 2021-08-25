import React, { useCallback, useState, useEffect } from "react";
import { useField } from "formik";
import { useDropzone } from "react-dropzone";

import {
  FormFeedback,
  Button,
  FormGroup,
  Label,
  Jumbotron,
  ListGroup,
  ListGroupItem,
} from "reactstrap";

function FileWrapper({ file, errors, remove }) {
  const invFileType = errors.some((err) => err.code === "file-invalid-type");

  return (
    <ListGroupItem color={invFileType && "danger"} key={file.name}>
      {file.name}
      {invFileType && " - podporovane dokumenty: PDF, Word!"}
      <Button close onClick={() => remove(file)} />
    </ListGroupItem>
  );
}

export default function FileUpload({ label, name }) {
  const [field, meta, helpers] = useField(name);
  const [files, setFiles] = useState([]);

  const onDrop = useCallback((acceptedFiles, fileRejections) => {
    const mappedAccFiles = acceptedFiles.map((file) => ({ file, errors: [] }));
    setFiles((files) => [...files, ...mappedAccFiles, ...fileRejections]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 5,
    accept:
      "application/pdf, application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  });

  function removeFile(file) {
    setFiles(files.filter((f) => f.file !== file));
  }

  useEffect(() => {
    helpers.setValue(files);

    helpers.setError("Maximalne je mozne nahrat 5 dokumentov!");
    console.log(meta.touched && meta.error);
  }, [files]);

  return (
    <FormGroup>
      {label && <Label>{label}:</Label>}
      <div {...getRootProps()}>
        <Jumbotron>
          <input {...getInputProps()} />
          <p className="text-muted text-center">
            {isDragActive
              ? "Drop files here!"
              : "Drag n drop/click to add files..."}
          </p>
        </Jumbotron>
      </div>
      <FormFeedback invalid="true">{meta.touched && meta.error}</FormFeedback>

      <aside>
        <ListGroup>
          {files.map(({ file, errors }) => (
            <FileWrapper
              file={file}
              errors={errors}
              remove={removeFile}
              setError={helpers.setError}
            />
          ))}
        </ListGroup>
      </aside>
    </FormGroup>
  );
}
