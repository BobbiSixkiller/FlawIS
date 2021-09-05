import React, { useCallback, useState, useEffect } from "react";
import { useField } from "formik";
import { useDropzone } from "react-dropzone";

import {
  Button,
  Col,
  FormGroup,
  Jumbotron,
  Label,
  Progress,
  Row,
} from "reactstrap";
import { Trash2Fill } from "react-bootstrap-icons";

import { useDataSend } from "../../hooks/useApi";

function FileWrapper({ file, errors, onDelete, onUpload }) {
  const { sendData } = useDataSend();
  const [progress, setProgress] = useState(0);
  const [path, setPath] = useState("");

  useEffect(() => {
    async function uploadFile() {
      let formData = new FormData();
      formData.append("file", file);

      const { success, uploadedFile } = await sendData(
        "util/upload",
        "POST",
        formData,
        {
          "Content-type": "multipart/form-data",
        },
        function (progressEvent) {
          if (progressEvent.lengthComputable) {
            setProgress((progressEvent.total / progressEvent.loaded) * 100);
          }
        }
      );

      if (success) {
        onUpload(file, uploadedFile);
        setPath(uploadedFile.path);
      }
    }

    if (errors.length === 0) {
      uploadFile();
    }
  }, [file, errors, sendData, onUpload]);

  async function removeFile() {
    if (errors.length === 0) {
      await sendData("util/file", "DELETE", { path });
      onDelete(file);
    } else onDelete(file);
  }

  return (
    <div className="my-2">
      <Row form className="mb-1 align-items-center">
        <Col>
          {errors.length === 0 ? (
            <span>{file.name}</span>
          ) : (
            <span className="text-danger">
              {file.name} - {errors.map((err) => err.code + " ")}
            </span>
          )}
        </Col>
        <Col>
          <Button
            size="sm"
            color="danger"
            className="float-right"
            onClick={removeFile}
          >
            <Trash2Fill />
          </Button>
        </Col>
      </Row>
      <Progress value={progress} />
    </div>
  );
}

export default function FileUpload({ label, name }) {
  const [_, __, helpers] = useField(name);
  const [files, setFiles] = useState([]);

  const onDrop = useCallback((acceptedFiles, fileRejections) => {
    const mappedAccFiles = acceptedFiles.map((file) => ({ file, errors: [] }));
    setFiles((files) => [...files, ...mappedAccFiles, ...fileRejections]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept:
      "application/pdf, application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  });

  const onUpload = useCallback((file, uploadedFile) => {
    function onUpload(file, uploadedFile) {
      setFiles((files) =>
        files.map((fw) => {
          if (fw.file === file) {
            return { ...fw, uploadedFile };
          }
          return fw;
        })
      );
    }

    onUpload(file, uploadedFile);
  }, []);

  function onDelete(file) {
    setFiles(files.filter((f) => f.file !== file));
  }

  useEffect(() => {
    console.log(files);
    helpers.setValue(files.map((f) => f.uploadedFile));
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
      <aside>
        {files.map(({ file, errors }) => (
          <FileWrapper
            key={file.name}
            file={file}
            errors={errors}
            onDelete={onDelete}
            onUpload={onUpload}
          />
        ))}
      </aside>
    </FormGroup>
  );
}
