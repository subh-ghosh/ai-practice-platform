import { Routes, Route } from "react-router-dom";
import routes from "@/routes";
import { PublicNavbar } from "@/widgets/layout";

export function Auth() {
  return (
    // --- 👇 THIS IS THE CHANGE --- 👇
    // Removed all flexbox classes
    <div className="relative min-h-screen w-full dark:bg-gray-900">
      <PublicNavbar />

      {/* This main section is now just a simple wrapper */}
      <main>
        <Routes>
          {routes.map(
            ({ layout, pages }) =>
              layout === "auth" &&
              pages.map(({ path, element }) => (
                <Route exact path={path} element={element} />
              ))
          )}
        </Routes>
      </main>
      {/* --- 👆 END OF CHANGE --- 👆 */}
    </div>
  );
}

Auth.displayName = "/src/layout/Auth.jsx";

export default Auth;