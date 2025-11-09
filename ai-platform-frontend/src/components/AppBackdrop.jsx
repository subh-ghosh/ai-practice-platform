// src/components/AppBackdrop.jsx
import React from "react";
import clsx from "clsx";

export default function AppBackdrop({ className, children }) {
  return (
    <div className={clsx("relative isolate min-h-screen overflow-x-hidden", className)}>
      {/* Page gradient */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b
                      from-blue-50 via-sky-100 to-blue-100
                      dark:from-gray-900 dark:via-blue-950 dark:to-gray-900
                      transition-all duration-700" />
      {/* Soft glows */}
      <div className="pointer-events-none absolute -top-10 right-[8%] h-64 w-64 rounded-full bg-sky-300/30 dark:bg-sky-600/30 blur-3xl" />
      <div className="pointer-events-none absolute top-36 -left-10 h-72 w-72 rounded-full bg-blue-300/25 dark:bg-blue-700/25 blur-3xl" />
      {children}
    </div>
  );
}
