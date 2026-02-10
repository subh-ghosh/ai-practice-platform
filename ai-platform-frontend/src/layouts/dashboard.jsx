import React, { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import {
  Sidenav,
  DashboardNavbar,
  Footer,
} from "@/widgets/layout";
import routes from "@/routes";
import { 
  useMaterialTailwindController, 
  setSidenavType 
} from "@/context";
import { useTheme } from "@/context/ThemeContext";

export function Dashboard() {
  const [controller, dispatch] = useMaterialTailwindController();
  const { sidenavType } = controller;
  const { theme } = useTheme();

  // --- THEME SYNC LOGIC ---
  // Syncs the sidenav's visual style (light/dark) with the global theme.
  // We added a check to ensure we only dispatch if the value is actually different.
  useEffect(() => {
    const targetType = theme === "dark" ? "dark" : "white";
    
    if (sidenavType !== targetType) {
      setSidenavType(dispatch, targetType);
    }
  }, [theme, dispatch, sidenavType]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <Sidenav
        routes={routes}
        brandImg={
          sidenavType === "dark" ? "/img/logo-ct.png" : "/img/logo-ct-dark.png"
        }
      />
      
      <div className="p-4 xl:ml-80">
        <DashboardNavbar />
        
        <Routes>
          {routes.map(({ layout, pages }) =>
            layout === "dashboard" &&
            pages.map(({ path, element }) => (
              <Route 
                exact 
                path={path} 
                element={element} 
                key={path} // <--- FIXED: Added unique key
              />
            ))
          )}
        </Routes>
        
        <div className="text-blue-gray-600 mt-8">
          <Footer />
        </div>
      </div>
    </div>
  );
}

Dashboard.displayName = "/src/layout/dashboard.jsx";

export default Dashboard;