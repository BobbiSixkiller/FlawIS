import { useField } from "formik";
import { useCallback, useEffect, useState } from "react";
import { Accept, FileError, FileRejection, useDropzone } from "react-dropzone";
import { Form, Label } from "semantic-ui-react";
import styled from "styled-components";
import { FileType } from "../../../graphql/generated/schema";
import SingleUploadProgress from "./SingleUploadProgress";

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
    return "#9f3a38";
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

export interface UploadableFile {
  file: File;
  url?: string;
  errors: FileError[];
}

export default function MultipleFileUploadField({
  name,
  label,
  filetype,
  maxFiles,
  maxSize,
  accept,
}: {
  name: string;
  label: string;
  filetype: FileType;
  maxFiles?: number;
  maxSize?: number;
  accept?: Accept;
}) {
  const [field, meta, helpers] = useField(name);
  const [files, setFiles] = useState<UploadableFile[]>(field.value);

  useEffect(() => {
    helpers.setValue(files.filter((fw) => fw.url !== undefined));
  }, [files]);

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
      const mappedAccepted = acceptedFiles.map((file) => ({
        file,
        errors: [],
      }));
      setFiles((curr) => [...curr, ...mappedAccepted, ...rejectedFiles]);
    },
    []
  );

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isFocused,
    isDragAccept,
    isDragReject,
  } = useDropzone({ onDrop, maxFiles, maxSize, accept });

  async function onDelete(file: File) {
    setFiles((prev) => prev.filter((f) => f.file !== file));
  }

  function onUpload(file: File, url: string, errors: FileError[]) {
    setFiles((prev) =>
      prev.map((f) => {
        if (f.file === file) {
          return { ...f, url, errors };
        }
        return f;
      })
    );
  }

  return (
    <Form.Field error={meta.touched && meta.error}>
      <label>{label}</label>
      <Container
        {...getRootProps({
          isFocused,
          isDragAccept,
          isDragReject:
            isDragReject || (meta.touched && meta.error !== undefined),
        })}
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>Drop the files here ...</p>
        ) : (
          <p>Drag & drop some files here, or click to select files</p>
        )}
      </Container>

      {files.map((uploadableFile, i) => (
        <SingleUploadProgress
          key={i}
          file={uploadableFile.file}
          fileType={filetype}
          url={uploadableFile.url}
          errors={uploadableFile.errors}
          onDelete={onDelete}
          onUpload={onUpload}
        />
      ))}

      {meta.touched && meta.error && (
        <Label prompt pointing>
          {meta.error}
        </Label>
      )}
    </Form.Field>
  );
}
