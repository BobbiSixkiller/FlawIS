"use client";

import { cn } from "@/lib/utilsClient";
import { SubmissionFragment } from "@/lib/graphql/generated/graphql";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { AriaAttributes, Ref } from "react";

export default function ConferenceTicket({
  tickets,
  setSubmission,
  submission,
  value,
  onChange,
  ref,
  ...props
}: AriaAttributes & {
  submission?: SubmissionFragment;
  tickets: {
    id: string;
    name: string;
    desc: string;
    price: number;
    withSubmission: boolean;
  }[];
  setSubmission: (visible: boolean) => void;
  value?: string;
  onChange: (value: string) => void;
  ref?: Ref<HTMLElement>;
  id?: string;
  onBlur?: () => void;
}) {
  return <RadioGroup aria-label="Conference Tickets" {...props} value={value ?? ""}
    onValueChange={next => {
      onChange(String(next));
      setSubmission(Boolean(tickets.find(ticket => ticket.id === next)?.withSubmission));
    }} className="gap-3">
    {tickets.map(ticket => <label key={ticket.id} className={cn(
      "flex cursor-pointer items-start gap-3 rounded-xl border bg-card p-4 transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring",
      value === ticket.id && "border-primary bg-accent",
      submission && !ticket.withSubmission && "cursor-not-allowed opacity-50",
    )}>
      <RadioGroupItem disabled={Boolean(submission && !ticket.withSubmission)}
        ref={ticket === tickets.find(item => !submission || item.withSubmission) ? ref : undefined}
        value={ticket.id} aria-label={ticket.name} className="mt-1" />
      <span className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="text-sm font-medium">{ticket.name}</span>
        <span className="text-sm text-muted-foreground">{ticket.desc}</span>
      </span>
      <span className="text-sm font-medium tabular-nums">{ticket.price} €</span>
    </label>)}
  </RadioGroup>;
}
