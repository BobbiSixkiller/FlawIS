"use client";

import { useFormStatus } from "react-dom";

export default function Button({
  children,
  loadingText,
  loading = false,
  type = "button",
}: {
  children: React.ReactNode;
  loadingText?: string;
  loading?: boolean;
  type?: "submit" | "button";
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type={type}
      aria-disabled={pending}
      className={`h-9 flex w-full justify-center items-center rounded-md ${
        pending
          ? "bg-primary-400 hover:bg-primary-400"
          : "bg-primary-500 hover:bg-primary-700"
      } px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500`}
    >
      {pending || loading ? (
        <span className="flex items-center">
          <div
            className={`flex items-center justify-center animate-spin ${
              loadingText ? "mr-3" : ""
            } rounded-full w-5 h-5 bg-gradient-to-tr from-primary-700 to-white`}
          >
            <div className="h-4 w-4 rounded-full bg-primary-400"></div>
          </div>
          {loadingText}
        </span>
      ) : (
        children
      )}
    </button>
  );
}
