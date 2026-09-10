"use client";

import Icon from "@/components/Icon";
import { cn } from "@/lib/utilsClient";
import { SubmissionFragment } from "@/lib/graphql/generated/graphql";
import { Radio, RadioGroup } from "@headlessui/react";
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
  return (
    <div className="flex flex-col gap-2">
      <RadioGroup
        aria-label="Conference Tickets"
        {...props}
        value={value}
        onChange={(value) => {
          onChange(value);
          setSubmission(
            Boolean(
              tickets.find((ticket) => ticket.id === value)?.withSubmission,
            ),
          );
        }}
      >
        <div className="space-y-2">
          {tickets.map((ticket) => (
            <Radio
              disabled={!!submission && !ticket.withSubmission}
              ref={
                ticket ===
                tickets.find((ticket) => !submission || ticket.withSubmission)
                  ? ref
                  : undefined
              }
              key={ticket.id}
              value={ticket.id}
              aria-label={ticket.name}
              className={({ checked, focus, disabled }) =>
                cn([
                  "relative flex cursor-pointer rounded-lg px-5 py-4 shadow-md focus:outline-hidden borde bg-white dark:bg-gray-900",
                  focus &&
                    "ring-2 ring-white/60 ring-offset-2 ring-offset-primary-300",
                  disabled &&
                    "bg-slate-50 dark:bg-slate-300 text-slate-500 cursor-default",
                  checked &&
                    "bg-primary-500 dark:bg-primary-500 text-white border-none",
                ])
              }
            >
              {({ checked }) => (
                <>
                  <div className="flex w-full items-center justify-between">
                    <div className="flex items-center">
                      <div className="text-sm">
                        <p
                          className={`font-medium  ${
                            checked
                              ? "text-white"
                              : "text-gray-900 dark:text-white/85"
                          }`}
                        >
                          {ticket.name}
                        </p>
                        <span
                          className={`inline ${
                            checked
                              ? "text-sky-100"
                              : "text-gray-500 dark:text-gray-400"
                          }`}
                        >
                          <span>{ticket.desc}</span>
                          <span aria-hidden="true">&middot;</span>
                          <span>{ticket.price} €</span>
                        </span>
                      </div>
                    </div>
                    {checked && (
                      <div className="shrink-0 text-white">
                        <Icon name="check-circle" className="h-6 w-6" />
                      </div>
                    )}
                  </div>
                </>
              )}
            </Radio>
          ))}
        </div>
      </RadioGroup>
    </div>
  );
}
