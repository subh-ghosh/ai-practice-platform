import React from "react";
import { Outlet } from "react-router-dom";
import { PublicNavbar } from "@/widgets/layout"; // Import from the main widget index

export function Public() {
  return (
    // A simple wrapper for public pages
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <PublicNavbar />

      {/* This is where the child page (like the landing page) will be rendered */}
      <main>
        <Outlet />
      </main>

      {/* We can add a public footer here later if you want */}
    </div>
  );
}

export default Public;