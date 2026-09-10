"use client";

import Icon from "@/components/Icon";
import { type AriaAttributes, type Ref } from "react";
import { useDropzone, type Accept } from "react-dropzone";
import Button from "./Button";
import Spinner from "./Spinner";
import { useFileSource, type FileSources } from "./useFileSource";
import { useObjectURL } from "./useObjectURL";

export interface MultipleFileUploadProps extends AriaAttributes {
  name?: string;
  id?: string;
  ref?: Ref<HTMLDivElement>;
  onBlur?: () => void;
  value?: File[];
  onChange: (files: File[]) => void;
  onLoad?: (files: File[]) => void;
  onError?: (message: string) => void;
  disabled?: boolean;
  maxFiles?: number;
  maxSize?: number;
  accept?: Accept;
  fileSources?: FileSources;
}
export default function MultipleFileUploadField({
  value,
  onChange,
  onLoad = onChange,
  onError,
  maxFiles,
  maxSize,
  accept,
  fileSources,
  disabled,
  ref,
  ...props
}: MultipleFileUploadProps) {
  const loading = useFileSource({
    value,
    sources: fileSources,
    onLoad,
    onError,
    convert: (files) => files,
  });
  const { getRootProps, getInputProps, isFocused, isDragAccept, isDragReject } =
    useDropzone({
      maxFiles,
      maxSize,
      accept,
      disabled: disabled || loading,
      multiple: true,
      onDrop: (accepted, rejected) => {
        if (rejected.length) {
          onError?.(
            rejected
              .flatMap((file) => file.errors.map((error) => error.message))
              .join(" "),
          );
          return;
        }
        if (maxFiles && (value?.length ?? 0) + accepted.length > maxFiles) {
          onError?.(`Maximum number of files: ${maxFiles}`);
          return;
        }
        onChange([...(value ?? []), ...accepted]);
      },
    });
  return (
    <div>
      <div
        {...getRootProps({
          ...props,
          role: "button",
          "aria-disabled": disabled || loading,
        })}
        ref={(element) => {
          const rootRef = getRootProps().ref;
          if (rootRef) rootRef.current = element;
          if (typeof ref === "function") ref(element);
          else if (ref) ref.current = element;
        }}
        className={`mt-1 flex gap-4 flex-col items-center p-12 border-2 border-dashed rounded-lg transition-all ease-in-out ${isDragAccept ? "border-green-500" : isDragReject || props["aria-invalid"] ? "border-red-500" : isFocused ? "border-primary-500" : "border-gray-300"} bg-gray-50 dark:bg-gray-800 dark:border-gray-600 text-gray-400 outline-hidden`}
      >
        <input {...getInputProps({ name: props.name })} />
        {loading ? (
          <Spinner />
        ) : (
          <span className="rounded-full p-2">
            <Icon name="plus" className="stroke-2 size-5" />
          </span>
        )}
      </div>
      {(value ?? []).map((file, index) => (
        <FileRow
          key={`${file.name}-${index}`}
          file={file}
          disabled={disabled}
          onDelete={() => onChange((value ?? []).filter((_, i) => i !== index))}
        />
      ))}
    </div>
  );
}
function FileRow({
  file,
  disabled,
  onDelete,
}: {
  file: File;
  disabled?: boolean;
  onDelete: () => void;
}) {
  const url = useObjectURL(file);
  return (
    <div className="flex flex-col p-2 gap-1">
      <div className="flex flex-row justify-between items-center w-full gap-2">
        <a
          href={url}
          download={file.name}
          className="text-primary-500 dark:text-primary-300 hover:underline whitespace-normal overflow-hidden truncate"
        >
          {file.name}
        </a>
        <Button
          type="button"
          disabled={disabled}
          onClick={onDelete}
          size="icon"
          variant="ghost"
          className="rounded-full"
          aria-label={`Remove ${file.name}`}
        >
          <Icon name="x-mark" className="stroke-2 size-5" />
        </Button>
      </div>
    </div>
  );
}
