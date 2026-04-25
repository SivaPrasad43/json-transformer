"use client";

import { Toaster as Sonner } from "sonner";

export function Toaster() {
  return (
    <Sonner
      theme="dark"
      position="bottom-center"
      toastOptions={{
        classNames: {
          toast: "bg-zinc-900 border-zinc-800 text-white",
          description: "text-zinc-400",
          actionButton: "bg-indigo-500 text-white",
          cancelButton: "bg-zinc-800 text-zinc-300",
          error: "bg-red-950 border-red-900 text-red-200",
          success: "bg-green-950 border-green-900 text-green-200",
          warning: "bg-yellow-950 border-yellow-900 text-yellow-200",
          info: "bg-blue-950 border-blue-900 text-blue-200",
        },
      }}
    />
  );
}
