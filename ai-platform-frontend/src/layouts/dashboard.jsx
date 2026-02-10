import { Routes, Route } from "react-router-dom";
import { Sidenav, DashboardNavbar, Footer } from "@/widgets/layout";
import routes from "@/routes";
import { useMaterialTailwindController, setSidenavType } from "@/context";
import { useTheme } from "@/context/ThemeContext";
import React from "react";

export function Dashboard() {
  const [controller, dispatch] = useMaterialTailwindController();
  const { sidenavType } = controller;
  const { theme } = useTheme();

  // Sync sidenav type with theme
  React.useEffect(() => {
    if (theme === "dark") {
      setSidenavType(dispatch, "dark");
    } else {
      // Force 'transparent' instead of 'white' to allow the glass effect to work
      setSidenavType(dispatch, "transparent"); 
    }
  }, [theme, dispatch]);

  return (
    // 1. MAIN WRAPPER: Relative positioning to hold the background blobs
    <div className="min-h-screen relative overflow-x-hidden bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      
      {/* 2. AMBIENT BACKGROUND BLOBS (The "Glow" behind the Glass) */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Top Left Blob */}
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-400/20 dark:bg-blue-600/10 rounded-full blur-[100px] animate-float" />
        {/* Bottom Right Blob */}
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-400/20 dark:bg-purple-600/10 rounded-full blur-[100px] animate-float" style={{ animationDelay: '3s' }} />
      </div>

      {/* 3. CONTENT WRAPPER: z-index ensures content sits ABOVE the blobs */}
      <div className="relative z-10">
        <Sidenav
          routes={routes}
          brandImg={
            sidenavType === "dark" ? "/img/logo-ct.png" : "/img/logo-ct-dark.png"
          }
        />
        
        <div className="p-4 xl:ml-80 dashboard-content">
          <DashboardNavbar />

          {/* Added a fade-in animation container for route transitions */}
          <div className="animate-fade-in-up mt-4">
            <Routes>
              {routes.map(
                ({ layout, pages }) =>
                  layout === "dashboard" &&
                  pages.map(({ path, element }) => (
                    <Route exact path={path} element={element} />
                  ))
              )}
            </Routes>
          </div>
          
          <div className="text-blue-gray-600 mt-8">
            <Footer />
          </div>
        </div>
      </div>
    </div>
  );
}

Dashboard.displayName = "/src/layout/dashboard.jsx";

export default Dashboard;