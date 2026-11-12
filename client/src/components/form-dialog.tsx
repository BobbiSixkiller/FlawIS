"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  FormProvider,
  useForm,
  useFormContext,
  type DefaultValues,
  type FieldValues,
  type Path,
  type Resolver,
  type UseFormReturn,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
  FieldGroup,
} from "@/components/ui/field";
import { ErrorAlert, SelectControl } from "@/components/field-controls";
import { toast } from "@/components/ui/toast";
import { errorMessage } from "@/lib/i18n/text";
import { localizedText as tr } from "@/lib/i18n/text";

export function useUnsavedChanges(dirty: boolean, lng = "sk") {
  useEffect(() => {
    if (!dirty) return;
    const listener = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", listener);
    const navigate = (e: MouseEvent) => {
      const link = (e.target as Element).closest?.(
        "a[href]",
      ) as HTMLAnchorElement | null;
      if (
        !link ||
        link.target === "_blank" ||
        link.hasAttribute("download") ||
        link.href === window.location.href ||
        e.metaKey ||
        e.ctrlKey ||
        e.shiftKey ||
        e.altKey
      )
        return;
      if (
        !window.confirm(
          tr(lng)(
            "Odísť a zahodiť neuložené zmeny?",
            "Leave and discard unsaved changes?",
          ),
        )
      ) {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    document.addEventListener("click", navigate, true);
    return () => {
      window.removeEventListener("beforeunload", listener);
      document.removeEventListener("click", navigate, true);
    };
  }, [dirty, lng]);
}
/** Validates and retains a draft on failure, guards dirty dismissal, and restores trigger focus.
 * The caller owns persistence and optional domain error translation.
 */
export function FormDialog<T extends FieldValues>({
  title,
  description,
  lng,
  defaultValues,
  schema,
  children,
  onSubmit,
  onClose,
  submitLabel,
  wide = false,
  disabled = false,
  busy = false,
  dirty: externalDirty = false,
  successMessage,
  keepOpen = false,
  onInvalid,
  formatError,
  readOnly = false,
}: {
  title: string;
  description?: string;
  lng: string;
  defaultValues: DefaultValues<T>;
  schema: z.ZodType<T>;
  children: (form: UseFormReturn<T>) => ReactNode;
  onSubmit: (values: T) => Promise<unknown>;
  onClose: () => void;
  submitLabel?: string;
  wide?: boolean;
  disabled?: boolean;
  busy?: boolean;
  dirty?: boolean;
  successMessage?: string;
  keepOpen?: boolean;
  onInvalid?: () => void;
  formatError?: (error: unknown) => string;
  readOnly?: boolean;
}) {
  const t = tr(lng);
  const form = useForm<T>({
    defaultValues,
    resolver: zodResolver(schema as never) as unknown as Resolver<T>,
  });
  const [error, setError] = useState("");
  const [discard, setDiscard] = useState(false);
  const submitting = form.formState.isSubmitting;
  const dirty = form.formState.isDirty || externalDirty;
  const returnFocus = useRef<HTMLElement | null>(
    typeof document === "undefined"
      ? null
      : (document.activeElement as HTMLElement),
  );
  useUnsavedChanges(dirty, lng);
  const close = () => {
    if (submitting || busy) return;
    if (dirty) setDiscard(true);
    else onClose();
  };
  return (
    <>
      <Dialog
        open
        onOpenChange={(open) => {
          if (!open) close();
        }}
        disablePointerDismissal={submitting || busy}
      >
        <DialogContent
          finalFocus={returnFocus}
          showCloseButton={false}
          className={
            wide
              ? "flex h-dvh max-h-dvh max-w-full flex-col rounded-none sm:h-auto sm:max-h-[calc(100dvh-2rem)] sm:max-w-5xl sm:rounded-xl"
              : "flex max-h-[calc(100dvh-2rem)] flex-col sm:max-w-xl"
          }
        >
          <DialogHeader className="shrink-0">
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>
              {description ||
                t(
                  "Skontrolujte údaje pred uložením.",
                  "Check the details before saving.",
                )}
            </DialogDescription>
          </DialogHeader>
          <FormProvider {...form}>
            <form
              noValidate
              className="flex min-h-0 flex-1 flex-col gap-4"
              onSubmit={form.handleSubmit(async (values) => {
                setError("");
                try {
                  await onSubmit(values);
                  form.reset(values);
                  toast.add({
                    title:
                      successMessage ||
                      t("Zmeny boli uložené.", "Changes saved."),
                    type: "success",
                  });
                  if (!keepOpen) onClose();
                } catch (e) {
                  setError(formatError ? formatError(e) : errorMessage(e, lng));
                  const fields = (e as { fields?: Record<string, string> })
                    .fields;
                  if (fields)
                    Object.entries(fields).forEach(([key, message], i) =>
                      form.setError(
                        key as Path<T>,
                        { message },
                        { shouldFocus: i === 0 },
                      ),
                    );
                }
              }, onInvalid)}
            >
              <div className="min-h-0 flex-1 overflow-y-auto px-1 pb-1">
                <fieldset disabled={submitting || busy} className="min-w-0">
                  <FieldGroup>
                    <ErrorAlert message={error} />
                    {children(form)}
                  </FieldGroup>
                </fieldset>
              </div>
              <DialogFooter className="shrink-0">
                <Button
                  variant="outline"
                  type="button"
                  disabled={submitting || busy}
                  onClick={close}
                >
                  {readOnly ? t("Zavrieť", "Close") : t("Zrušiť", "Cancel")}
                </Button>
                {!readOnly && (
                  <Button
                    type="submit"
                    disabled={submitting || busy || disabled}
                  >
                    {submitting
                      ? t("Ukladá sa…", "Saving…")
                      : submitLabel || t("Uložiť zmeny", "Save changes")}
                  </Button>
                )}
              </DialogFooter>
            </form>
          </FormProvider>
        </DialogContent>
      </Dialog>
      <AlertDialog open={discard} onOpenChange={setDiscard}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("Zahodiť neuložené zmeny?", "Discard unsaved changes?")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t(
                "Zadané údaje sa neuložia.",
                "Your changes will not be saved.",
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              {t("Pokračovať v úpravách", "Keep editing")}
            </AlertDialogCancel>
            <AlertDialogAction onClick={onClose}>
              {t("Zahodiť zmeny", "Discard changes")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
export function TextField({
  name,
  label,
  hint,
  type = "text",
  multiline = false,
  ...props
}: {
  name: string;
  label: string;
  hint?: string;
  multiline?: boolean;
  type?: string;
  min?: number;
  max?: number;
  disabled?: boolean;
}) {
  const {
    register,
    formState: { errors },
  } = useFormContext();
  const error = errors[name]?.message as string | undefined;
  const id = `review-${name}`;
  return (
    <Field data-invalid={Boolean(error)}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      {multiline ? (
        <Textarea
          id={id}
          {...register(name)}
          aria-invalid={Boolean(error)}
          aria-describedby={
            error ? `${id}-error` : hint ? `${id}-hint` : undefined
          }
          {...props}
        />
      ) : (
        <Input
          id={id}
          type={type}
          {...register(name)}
          aria-invalid={Boolean(error)}
          aria-describedby={
            error ? `${id}-error` : hint ? `${id}-hint` : undefined
          }
          {...props}
        />
      )}
      {hint && <FieldDescription id={`${id}-hint`}>{hint}</FieldDescription>}
      {error && <FieldError id={`${id}-error`}>{error}</FieldError>}
    </Field>
  );
}
export function SelectField({
  name,
  label,
  options,
  empty,
}: {
  name: string;
  label: string;
  options: { value: string; label: string }[];
  empty?: string;
}) {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext();
  const error = errors[name]?.message as string | undefined;
  return (
    <Field data-invalid={Boolean(error)}>
      <FieldLabel htmlFor={`review-${name}`}>{label}</FieldLabel>
      <SelectControl
        {...register(name)}
        id={`review-${name}`}
        value={watch(name) || ""}
        options={options}
        empty={empty}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `review-${name}-error` : undefined}
        onChange={(v) =>
          setValue(name, v, { shouldDirty: true, shouldValidate: true })
        }
      />
      {error && <FieldError id={`review-${name}-error`}>{error}</FieldError>}
    </Field>
  );
}
export function ConfirmDialog({
  title,
  description,
  lng,
  onConfirm,
  formatError,
  onClose,
}: {
  title: string;
  description: string;
  lng: string;
  onConfirm: () => Promise<unknown>;
  formatError?: (error: unknown) => string;
  onClose: () => void;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const t = tr(lng);
  return (
    <AlertDialog
      open
      onOpenChange={(v) => {
        if (!v && !pending) onClose();
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <ErrorAlert message={error} />
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>
            {t("Zrušiť", "Cancel")}
          </AlertDialogCancel>
          <Button
            disabled={pending}
            onClick={async () => {
              setPending(true);
              setError("");
              try {
                await onConfirm();
                onClose();
                toast.add({ title: t("Hotovo.", "Done."), type: "success" });
              } catch (e) {
                setError(formatError ? formatError(e) : errorMessage(e, lng));
              } finally {
                setPending(false);
              }
            }}
          >
            {pending ? t("Spracúva sa…", "Working…") : title}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
export function ViewDialog({
  title,
  lng,
  onClose,
  children,
  wide = false,
}: {
  title: string;
  lng: string;
  onClose: () => void;
  children: ReactNode;
  wide?: boolean;
}) {
  const focus = useRef<HTMLElement | null>(
    typeof document === "undefined"
      ? null
      : (document.activeElement as HTMLElement),
  );
  return (
    <Dialog
      open
      onOpenChange={(v) => {
        if (!v) onClose();
      }}
    >
      <DialogContent
        finalFocus={focus}
        showCloseButton={false}
        className={
          wide
            ? "flex max-h-[calc(100dvh-2rem)] flex-col sm:max-w-4xl"
            : "flex max-h-[calc(100dvh-2rem)] flex-col sm:max-w-xl"
        }
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="min-h-0 overflow-y-auto">{children}</div>
        <DialogFooter>
          <Button onClick={onClose}>{tr(lng)("Zavrieť", "Close")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
