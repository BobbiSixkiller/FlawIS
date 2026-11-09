"use client";

import Icon from "@/components/icon";
import { type AriaAttributes, type Ref } from "react";
import { useDropzone, type Accept } from "react-dropzone";
import { Button } from "@/components/ui/button";
import Spinner from "./spinner";
import { useFileSource, type FileSources } from "./use-file-source";
import { useObjectURL } from "./use-object-url";
import { cn } from "@/lib/utils";

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
  /** Files already stored remotely also count towards the limit. */
  existingCount?: number;
  lng?: string;
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
  existingCount = 0,
  lng = "en",
  ...props
}: MultipleFileUploadProps) {
  const t = (sk: string, en: string) => (lng === "sk" ? sk : en);
  const limitError = t(
    `Najviac ${maxFiles} súborov.`,
    `Maximum ${maxFiles} files.`,
  );
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
            [
              ...new Set(
                rejected.flatMap(({ errors }) =>
                  errors.map((error) =>
                    error.code === "too-many-files"
                      ? limitError
                      : error.code === "file-too-large"
                        ? t(
                            `Najviac ${Math.round((maxSize || 0) / 1024 / 1024)} MiB na súbor.`,
                            `Maximum ${Math.round((maxSize || 0) / 1024 / 1024)} MiB per file.`,
                          )
                        : error.code === "file-invalid-type"
                          ? t(
                              "Nepodporovaný typ súboru.",
                              "Unsupported file type.",
                            )
                          : error.message,
                  ),
                ),
              ),
            ].join(" "),
          );
          return;
        }
        if (
          maxFiles != null &&
          existingCount + (value?.length ?? 0) + accepted.length > maxFiles
        ) {
          onError?.(limitError);
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
        className={cn(
          "flex flex-col items-center gap-2 rounded-lg border-2 border-dashed border-border bg-muted p-6 text-muted-foreground outline-hidden",
          (isDragAccept || isFocused) && "border-primary",
          (isDragReject || props["aria-invalid"]) && "border-destructive",
          (disabled || loading) && "cursor-not-allowed opacity-50",
        )}
      >
        <input
          {...getInputProps({
            name: props.name,
            "aria-labelledby": props["aria-labelledby"],
          })}
        />
        {loading ? (
          <Spinner />
        ) : (
          <span className="rounded-full p-2">
            <Icon name="plus" className="stroke-2 size-5" />
          </span>
        )}
        <span>
          {t(
            "Presuňte súbory sem alebo ich vyberte",
            "Drop files here or choose files",
          )}
        </span>
      </div>
      {(value ?? []).map((file, index) => (
        <FileRow
          key={`${file.name}-${index}`}
          file={file}
          disabled={disabled}
          removeLabel={t(`Odobrať ${file.name}`, `Remove ${file.name}`)}
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
  removeLabel,
}: {
  file: File;
  disabled?: boolean;
  onDelete: () => void;
  removeLabel: string;
}) {
  const url = useObjectURL(file);
  return (
    <div className="flex flex-col p-2 gap-1">
      <div className="flex flex-row justify-between items-center w-full gap-2">
        <a
          href={url}
          download={file.name}
          className="text-primary dark:text-primary hover:underline whitespace-normal overflow-hidden truncate"
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
          aria-label={removeLabel}
        >
          <Icon name="x-mark" className="stroke-2 size-5" />
        </Button>
      </div>
    </div>
  );
}
