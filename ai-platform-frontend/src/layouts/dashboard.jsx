import { Routes, Route } from "react-router-dom";
// 👇 --- REMOVED Cog6ToothIcon ---
import {
  Sidenav,
  DashboardNavbar,
  Footer,
} from "@/widgets/layout";
// 👇 --- REMOVED Configurator ---
import routes from "@/routes";
// 👇 --- REMOVED setOpenConfigurator ---
import { useMaterialTailwindController } from "@/context";

export function Dashboard() {
  const [controller] = useMaterialTailwindController(); // 👈 --- MODIFIED (removed dispatch)
  const { sidenavType } = controller;

  return (
    // 👇 --- MODIFIED: Added dark:bg-gray-950
    <div className="min-h-screen bg-blue-gray-50/50 dark:bg-gray-950">
      <Sidenav
        routes={routes}
        brandImg={
          sidenavType === "dark" ? "/img/logo-ct.png" : "/img/logo-ct-dark.png"
        }
      />
      <div className="p-4 xl:ml-80">
        <DashboardNavbar />

        {/* 👇 --- REMOVED CONFIGURATOR AND ITS BUTTON --- */}

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