"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";

export default function Message({
  success,
  message,
}: {
  success: boolean;
  message: any;
}) {
  const { pending } = useFormStatus();
  if (pending) {
    return null;
  }

  return (
    <div
      className={`relative text-center p-2 rounded-md border ${
        success
          ? "border-green-500 text-green-500 bg-green-200"
          : "border-red-500 text-red-500 bg-red-200"
      }`}
    >
      {message}
    </div>
  );
}
