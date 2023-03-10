import { useEffect, useState } from "react";
import { FileError } from "react-dropzone";
import { Button, Progress } from "semantic-ui-react";
import styled from "styled-components";
import {
  UploadFileMutationResult,
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
  errors: FileError[];
  url?: string;
  onDelete: (file: File) => void;
  onUpload: (file: File, url: string) => void;
}

export default function SingleUploadProgress({
  file,
  errors,
  url,
  onDelete,
  onUpload,
}: SingleUploadProgressProps) {
  const [progress, setProgress] = useState(0);
  const [deleteFile, { loading }] = useDeleteFileMutation();

  useEffect(() => {
    async function upload() {
      const url = await uploadFile(file, setProgress);
      onUpload(file, url);
    }

    if (errors.length === 0) {
      upload();
    }
  }, []);

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
            if (url) {
              await deleteFile({ variables: { url } });
            }
            onDelete(file);
          }}
        />
      </LabelContainer>
      <Progress
        percent={progress}
        size="tiny"
        error={errors.length !== 0}
        autoSuccess
      />
    </UploadIndicator>
  );
}

function uploadFile(file: File, onProgress: (percentage: number) => void) {
  const url = "http://localhost:5000/graphql";

  return new Promise<string>((res, rej) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", url);

    xhr.onload = () => {
      const response: UploadFileMutationResult = JSON.parse(xhr.responseText);
      res(response.data?.uploadFile || "");
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
        query:
          "mutation uploadFile($file:Upload!) {\n  uploadFile(file: $file, type: GRANT)\n}",
      })
    );
    formData.append("map", JSON.stringify({ "0": ["variables.file"] }));
    formData.append("0", file);

    xhr.withCredentials = true;
    xhr.send(formData);
  });
}
