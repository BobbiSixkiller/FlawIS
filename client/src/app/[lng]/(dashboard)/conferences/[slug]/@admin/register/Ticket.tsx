"use client";

import { SubmissionFragment } from "@/lib/graphql/generated/graphql";
import { RadioGroup } from "@headlessui/react";
import { useEffect } from "react";
import { useFormContext } from "react-hook-form";

export default function Ticket({
  tickets,
  setSubmission,
  submission,
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
}) {
  const { watch, setValue, getFieldState } = useFormContext();
  const { error } = getFieldState("ticketId");

  useEffect(() => {
    if (submission) {
      const ticket = tickets.find((t) => t.withSubmission === true);
      setValue("ticketId", ticket?.id);
      setSubmission(true);
    }
  }, []);

  return (
    <div className="flex flex-col gap-2">
      <label className="block text-sm font-medium leading-6 text-gray-900">
        Forma ucasti
      </label>
      <RadioGroup
        disabled={submission !== undefined}
        value={watch("ticketId")}
        onChange={(value) => setValue("ticketId", value)}
      >
        <RadioGroup.Label className="sr-only">
          Conference Tickete
        </RadioGroup.Label>
        <div className="space-y-2">
          {tickets.map((ticket) => (
            <RadioGroup.Option
              onClick={() => setSubmission(ticket.withSubmission)}
              key={ticket.id}
              value={ticket.id}
              className={({ active, checked }) =>
                `${
                  active
                    ? "ring-2 ring-white/60 ring-offset-2 ring-offset-primary-300"
                    : ""
                }
                  ${
                    checked
                      ? "bg-primary-500 text-white border-none"
                      : "bg-white"
                  }
                    relative flex cursor-pointer rounded-lg px-5 py-4 shadow-md focus:outline-none border`
              }
            >
              {({ checked }) => (
                <>
                  <div className="flex w-full items-center justify-between">
                    <div className="flex items-center">
                      <div className="text-sm">
                        <RadioGroup.Label
                          as="p"
                          className={`font-medium  ${
                            checked ? "text-white" : "text-gray-900"
                          }`}
                        >
                          {ticket.name}
                        </RadioGroup.Label>
                        <RadioGroup.Description
                          as="span"
                          className={`inline ${
                            checked ? "text-sky-100" : "text-gray-500"
                          }`}
                        >
                          <span>{ticket.desc}</span>{" "}
                          <span aria-hidden="true">&middot;</span>{" "}
                          <span>{ticket.price} €</span>
                        </RadioGroup.Description>
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
            </RadioGroup.Option>
          ))}
        </div>
      </RadioGroup>
      {error && <p className="text-sm text-red-500">{error.message}</p>}
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
