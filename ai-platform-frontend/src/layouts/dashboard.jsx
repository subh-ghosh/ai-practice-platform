import { Routes, Route } from "react-router-dom";
import {
  Sidenav,
  DashboardNavbar,
  Footer,
} from "@/widgets/layout";
import routes from "@/routes";
import { useMaterialTailwindController, setSidenavType } from "@/context"; // 👈 --- IMPORT setSidenavType
import { useTheme } from "@/context/ThemeContext"; // 👈 --- IMPORT useTheme
import React from "react"; // 👈 --- IMPORT React

export function Dashboard() {
  const [controller, dispatch] = useMaterialTailwindController(); // 👈 --- GET dispatch
  const { sidenavType } = controller;
  const { theme } = useTheme(); // 👈 --- GET theme

  // --- THIS IS THE FIX ---
  // Syncs the sidenav's visual style (light/dark) with the global theme
  React.useEffect(() => {
    if (theme === "dark") {
      setSidenavType(dispatch, "dark");
    } else {
      setSidenavType(dispatch, "white");
    }
  }, [theme, dispatch]);
  // --- END OF FIX ---

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <Sidenav
        routes={routes}
        brandImg={
          sidenavType === "dark" ? "/img/logo-ct.png" : "/img/logo-ct-dark.png"
        }
      />
      <div className="p-4 xl:ml-80 dashboard-content">
        <DashboardNavbar />

        <Routes>
          {routes.map(
            ({ layout, pages }) =>
              layout === "dashboard" &&
              pages.map(({ path, element }) => (
                <Route exact path={path} element={element} />
              ))
          )}
        </Routes>
        <div className="text-blue-gray-600">
          <Footer />
        </div>
      </div>
    </div>
  );
}

Dashboard.displayName = "/src/layout/dashboard.jsx";

export default Dashboard;