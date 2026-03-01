import React from "react";
import { Outlet } from "react-router-dom";
import { PublicNavbar } from "@/widgets/layout"; // Import from the main widget index

export function Public() {
  return (
    // A simple wrapper for public pages
    <div className="public-layout min-h-screen bg-white dark:bg-[#050505]">
      <style>{`
        @media (min-width: 768px) {
          .public-layout,
          .public-layout * {
            cursor: none !important;
          }
        }
      `}</style>
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
