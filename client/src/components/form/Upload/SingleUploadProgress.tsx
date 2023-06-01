import { useEffect, useState } from "react";
import { FileError } from "react-dropzone";
import { Button, Progress } from "semantic-ui-react";
import styled from "styled-components";
import {
  File as UploadedFile,
  FileType,
  useDeleteFileMutation,
} from "../../../graphql/generated/schema";

const UploadIndicator = styled.div`
  display: flex;
  flex-direction: column;
  padding: 8px;
  gap: 4px;
`;

const LabelContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-end;
`;

export interface SingleUploadProgressProps {
  file: File;
  fileType: FileType;
  errors: FileError[];
  uploadedFile?: Pick<UploadedFile, "id" | "name" | "path"> | undefined;
  onDelete: (file: File) => void;
  onUpload: (
    file: File,
    uploadedFile: Pick<UploadedFile, "id" | "name" | "path"> | undefined,
    errors: FileError[]
  ) => void;
}

export default function SingleUploadProgress({
  file,
  fileType,
  errors,
  uploadedFile,
  onDelete,
  onUpload,
}: SingleUploadProgressProps) {
  const [progress, setProgress] = useState(0);
  const [deleteFile, { loading }] = useDeleteFileMutation();

  useEffect(() => {
    async function upload() {
      const res = await uploadFile(file, setProgress);
      onUpload(file, res.data.uploadFile || undefined, res.errors || []);
    }

    if (errors.length === 0 && uploadedFile === undefined) {
      upload();
    }
  }, []);

  function uploadFile(file: File, onProgress: (percentage: number) => void) {
    const url =
      process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000/graphql";

    return new Promise<{
      errors?: FileError[];
      data?: any;
    }>((res, rej) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", url);

      xhr.onload = () => {
        const response = JSON.parse(xhr.responseText);
        res(response);
      };
      xhr.onerror = (evt) => rej(evt);
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentage = (event.loaded / event.total) * 100;
          onProgress(Math.round(percentage));
        }
      };

      const formData = new FormData();
      formData.append(
        "operations",
        JSON.stringify({
          query: `mutation uploadFile($file:Upload!) { uploadFile(file: $file, type: ${fileType}){id name path}}`,
        })
      );
      formData.append("map", JSON.stringify({ "0": ["variables.file"] }));
      formData.append("0", file);

      // xhr.setRequestHeader("x-apollo-operation-name", "fileUpload");
      // xhr.setRequestHeader("content-type", "application/octet-stream");.
      // xhr.setRequestHeader("content-type", "application/octet-stream");
      xhr.withCredentials = true;
      xhr.send(formData);
    });
  }

  return (
    <UploadIndicator>
      <LabelContainer>
        {file.name}
        <Button
          type="button"
          icon="trash"
          size="mini"
          loading={loading}
          onClick={async () => {
            if (uploadedFile) {
              console.log("fired", uploadedFile);
              await deleteFile({ variables: { id: uploadedFile.id } });
            }
            onDelete(file);
          }}
        />
      </LabelContainer>
      <Progress
        percent={uploadedFile ? 100 : progress}
        size="tiny"
        error={errors.length !== 0}
        autoSuccess
      >
        {errors.map((e) => e.message)}
      </Progress>
    </UploadIndicator>
  );
}
