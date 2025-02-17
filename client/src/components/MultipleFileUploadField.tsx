import { PlusIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useCallback, useEffect, useState } from "react";
import {
  Accept,
  DropzoneRootProps,
  FileError,
  FileRejection,
  useDropzone,
} from "react-dropzone";

import { useController, useFormContext } from "react-hook-form";

const getColorClasses = ({
  isDragAccept,
  isDragReject,
  isFocused,
}: DropzoneRootProps) => {
  if (isDragAccept) {
    return "border-green-500";
  }
  if (isDragReject) {
    return "border-red-500";
  }
  if (isFocused) {
    return "border-primary-500";
  }
  return "border-gray-300";
};

export interface UploadableFile {
  file: File;
  uploadedFile?: string;
  errors: FileError[];
}

export default function MultipleFileUploadField({
  name,
  label,
  maxFiles,
  maxSize,
  accept,
}: {
  name: string;
  label: string;
  maxFiles?: number;
  maxSize?: number;
  accept?: Accept;
}) {
  const { field, fieldState } = useController({ name });

  const { setValue, setError } = useFormContext();
  const [files, setFiles] = useState<UploadableFile[]>([]);

  useEffect(() => {
    setFiles(field.value.map((file: File) => ({ file, errors: [] })));
  }, [field.value]);

  const onDrop = useCallback(
    (acceptedFiles: File[], fileRejections: FileRejection[]) => {
      const mappedAccepted = acceptedFiles.map((file) => ({
        file,
        errors: [],
      }));

      if (
        fileRejections.some((ref) =>
          ref.errors.some((err) => err.code === "too-many-files")
        )
      ) {
        setError(name, { message: "too-many-files" });
      }

      setFiles((curr) => [...curr, ...mappedAccepted]);
    },
    []
  );

  const { getRootProps, getInputProps, isFocused, isDragAccept, isDragReject } =
    useDropzone({ onDrop, maxFiles, maxSize, accept });

  async function onDelete(file: File, uploadedFile?: string) {
    setFiles((prev) => prev.filter((f) => f.file !== file));
    setValue(
      name,
      field.value.filter((v: File) => v !== file),
      { shouldValidate: true }
    );
  }

  function onUpload(file: File, uploadedFile: string, errors: FileError[]) {
    setFiles((prev) =>
      prev.map((f) => {
        if (f.file === file) {
          return { ...f, uploadedFile, errors };
        }
        return f;
      })
    );
    if (!field.value.some((v: File) => v === file)) {
      setValue(name, [...field.value, file], { shouldValidate: true });
    }
  }

  return (
    <div>
      <label htmlFor={name} className="text-sm/6 font-medium dark:text-white">
        {label}
      </label>
      <div
        {...getRootProps()}
        className={`mt-1 flex gap-4 flex-col items-center p-12 border-2 border-dashed rounded-lg transition-all ease-in-out ${getColorClasses(
          {
            isDragAccept,
            isDragReject: isDragReject || fieldState.error,
            isFocused,
          }
        )} bg-gray-50 dark:bg-gray-800 dark:border-gray-600 text-gray-400 outline-none`}
      >
        <input name={name} id={name} {...getInputProps()} />

        <button
          type="button"
          className="rounded-full bg-primary-500 text-sm font-semibold text-white p-2 hover:bg-primary-700"
        >
          <PlusIcon className="stroke-2 size-5" />
        </button>
        {/* <p className="text-xs text-center">Drag n drop</p> */}
      </div>

      {files.map((uploadableFile, i) => (
        <SingleUploadProgress
          key={i}
          file={uploadableFile.file}
          uploadedFile={uploadableFile.uploadedFile}
          errors={uploadableFile.errors}
          onDelete={onDelete}
          onUpload={onUpload}
        />
      ))}

      {fieldState.error && (
        <p className="mt-1 text-sm text-red-500">{fieldState.error.message}</p>
      )}
    </div>
  );
}

interface SingleUploadProgressProps {
  file: File;
  errors: FileError[];
  uploadedFile?: string;
  onDelete: (file: File) => void;
  onUpload: (file: File, uploadedFile: string, errors: FileError[]) => void;
}

function SingleUploadProgress({
  file,
  errors,
  uploadedFile,
  onDelete,
  onUpload,
}: SingleUploadProgressProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // async function upload() {
    //   const res = await uploadFile(file, setProgress);
    //   onUpload(file, res.data || undefined, res.errors || []);
    // }

    // if (errors.length === 0 && uploadedFile === undefined) {
    //   upload();
    // }
    onUpload(file, "", errors);
  }, []);

  function uploadFile(file: File, onProgress: (percentage: number) => void) {
    console.log("Uploading", file.name);

    const url =
      process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000/upload";

    return new Promise<{
      errors?: FileError[];
      data?: any;
    }>((res, rej) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", url);

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          const response = JSON.parse(xhr.responseText);
          res(response);
        } else {
          const errorMessage = `Upload failed with status: ${xhr.status} - ${xhr.statusText}`;
          console.error(errorMessage);
          res({
            errors: [{ code: "upload_failed", message: errorMessage }],
          });
        }
      };

      xhr.onerror = (evt) => {
        const errorMessage = `Network error: ${evt.type}`;
        console.error(errorMessage);
        res({
          errors: [{ code: "network_error", message: errorMessage }],
        });
      };

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentage = (event.loaded / event.total) * 100;
          onProgress(Math.round(percentage));
        }
      };

      const formData = new FormData();
      formData.append("file", file);

      xhr.withCredentials = true;
      xhr.send(formData);
    });
  }

  return (
    <div className="flex flex-col p-2 gap-1">
      <div className="flex flex-row justify-between items-center w-full gap-2">
        <a
          href={URL.createObjectURL(file)}
          download={file.name}
          className="text-primary-500 hover:underline whitespace-normal overflow-hidden truncate"
        >
          {file?.name}
        </a>
        <button
          onClick={async (e) => {
            e.preventDefault();
            onDelete(file);
          }}
          type="button"
          className="rounded-full bg-primary-100 dark:bg-primary-400 dark:hover:bg-primary-500 text-primary-700 hover:bg-primary-200 p-2"
        >
          <XMarkIcon className="stroke-2 size-5" />
        </button>
      </div>
      {/* <ProgressBar progress={progress} /> */}
      <p className="text-sm text-red-500">{errors.map((e) => e.message)}</p>
    </div>
  );
}

interface ProgressBarProps {
  progress: number;
  label?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ progress, label }) => {
  return (
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div
        className="bg-blue-500 h-2 rounded-full"
        style={{ width: `${progress}%` }}
      ></div>
      {label && (
        <div className="mt-1 text-sm text-center text-gray-700">{label}</div>
      )}
    </div>
  );
};
