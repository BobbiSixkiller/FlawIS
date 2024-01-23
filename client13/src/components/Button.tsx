"use client";

import { useFormStatus } from "react-dom";
import Spinner from "./Spinner";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";

export function Back() {
  const router = useRouter();

  return (
    <button
      className="rounded-md focus:outline-primary-500"
      onClick={() => {
        router.back();
      }}
    >
      <ChevronLeftIcon className="h-5 w-5" />
    </button>
  );
}

export default function Button({
  children,
  loadingText,
  loading = false,
  type = "button",
  onClick,
  fluid = false,
  color,
}: {
  children: React.ReactNode;
  loadingText?: string;
  loading?: boolean;
  type?: "submit" | "button";
  onClick?: () => void;
  fluid?: boolean;
  color: "primary" | "red" | "green" | "basic";
}) {
  const { pending } = useFormStatus();

  const btnColor = (color: string) => {
    switch (color) {
      case "basic":
        return `focus-visible:outline-primary-500 text-gray-900 hover:text-gray-500`;
      case "primary":
        return `${
          pending || loading
            ? "bg-primary-400 hover:bg-primary-400"
            : "bg-primary-500 hover:bg-primary-700"
        } focus-visible:outline-primary-500 text-white shadow-sm`;
      case "red":
        return `${
          pending || loading
            ? "bg-red-400 hover:bg-red-400"
            : "bg-red-500 hover:bg-red-700"
        } focus-visible:outline-primary-500 text-white shadow-sm`;
      case "green":
        return `${
          pending || loading
            ? "bg-green-400 hover:bg-green-400"
            : "bg-green-500 hover:bg-green-700"
        } focus-visible:outline-primary-500 text-white shadow-sm`;

      default:
        throw Error("Unhandled color!");
    }
  };

  return (
    <button
      onClick={onClick}
      type={type}
      aria-disabled={pending || loading}
      className={`h-9 flex ${
        fluid ? "w-full" : ""
      } justify-center items-center rounded-md ${btnColor(
        color
      )} px-3 py-1.5 text-sm font-semibold leading-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 `}
    >
      {pending || loading ? (
        <span className={`flex items-center gap-3`}>
          <Spinner inverted />
          {loadingText}
        </span>
      ) : (
        children
      )}
    </button>
  );
}
