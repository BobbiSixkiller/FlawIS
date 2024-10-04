"use client";

import { useFormStatus } from "react-dom";
import Spinner from "./Spinner";

export default function Button({
  children,
  loadingText,
  loading = false,
  type = "button",
  onClick,
  fluid = false,
  color,
  disabled = false,
}: {
  children: React.ReactNode;
  loadingText?: string;
  loading?: boolean;
  type?: "submit" | "button";
  onClick?: () => void;
  fluid?: boolean;
  color: "primary" | "secondary" | "red" | "green" | "basic";
  disabled?: boolean;
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
      case "secondary":
        return `${
          pending || loading || disabled
            ? "bg-gray-400 hover:bg-gray-400"
            : "bg-gray-900 hover:bg-gray-500"
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
      aria-disabled={pending || loading || disabled}
      disabled={pending || loading || disabled}
      className={`h-9 flex ${
        fluid ? "w-full" : "max-w-fit"
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
