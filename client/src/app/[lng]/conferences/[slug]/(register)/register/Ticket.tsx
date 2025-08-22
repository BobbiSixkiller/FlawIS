"use client";

import { SubmissionFragment } from "@/lib/graphql/generated/graphql";
import { cn } from "@/utils/helpers";
import { Description, Label, Radio, RadioGroup } from "@headlessui/react";
import { useEffect } from "react";
import { Control, useController, useFormContext } from "react-hook-form";

export default function Ticket({
  tickets,
  setSubmission,
  submission,
  control,
}: {
  submission?: SubmissionFragment;
  tickets: {
    id: string;
    name: string;
    desc: string;
    price: number;
    withSubmission: boolean;
  }[];
  setSubmission: (visible: boolean) => void;
  control: Control<any>;
}) {
  const { field, fieldState } = useController({
    name: "ticketId",
    control,
  });

  useEffect(() => {
    if (submission) {
      const ticket = tickets.find((t) => t.withSubmission === true);
      field.onChange(ticket?.id);
      setSubmission(true);
    }
  }, []);

  return (
    <div className="flex flex-col gap-2">
      <label className="block text-sm font-medium leading-6 text-gray-900 dark:text-white">
        Forma ucasti
      </label>
      <RadioGroup
        aria-label="Conference Tickets"
        disabled={submission !== undefined}
        value={field.value}
        onChange={field.onChange}
      >
        <div className="space-y-2">
          {tickets.map((ticket) => (
            <Radio
              onClick={() => setSubmission(ticket.withSubmission)}
              key={ticket.id}
              value={ticket.id}
              className={({ checked, focus, disabled }) =>
                cn([
                  "relative flex cursor-pointer rounded-lg px-5 py-4 shadow-md focus:outline-none borde bg-white dark:bg-gray-700",
                  focus &&
                    "ring-2 ring-white/60 ring-offset-2 ring-offset-primary-300",
                  disabled &&
                    "bg-slate-50 dark:bg-slate-600 text-slate-500 cursor-default",
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
                        <Label
                          as="p"
                          className={`font-medium  ${
                            checked
                              ? "text-white"
                              : "text-gray-900 dark:text-white/85"
                          }`}
                        >
                          {ticket.name}
                        </Label>
                        <Description
                          as="span"
                          className={`inline ${
                            checked
                              ? "text-sky-100"
                              : "text-gray-500 dark:text-gray-400"
                          }`}
                        >
                          <span>{ticket.desc}</span>
                          <span aria-hidden="true">&middot;</span>
                          <span>{ticket.price} €</span>
                        </Description>
                      </div>
                    </div>
                    {checked && (
                      <div className="shrink-0 text-white">
                        <CheckIcon className="h-6 w-6" />
                      </div>
                    )}
                  </div>
                </>
              )}
            </Radio>
          ))}
        </div>
      </RadioGroup>
      {fieldState.error && (
        <p className="text-sm text-red-500">{fieldState.error.message}</p>
      )}
    </div>
  );
}

function CheckIcon(props: { className: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <circle cx={12} cy={12} r={12} fill="#fff" opacity="0.2" />
      <path
        d="M7 13l3 3 7-7"
        stroke="#fff"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
