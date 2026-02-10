import PropTypes from "prop-types";
import { Link, NavLink } from "react-router-dom";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { IconButton, Typography } from "@material-tailwind/react";
import {
  useMaterialTailwindController,
  setOpenSidenav,
} from "../../context";

export function Sidenav({ brandImg, brandName, routes }) {
  const [controller, dispatch] = useMaterialTailwindController();
  const { sidenavColor, openSidenav } = controller;

  // Only dashboard routes
  const dashboardRoutes = routes.filter(({ layout }) => layout === "dashboard");

  // Helper to get active color classes based on the controller color
  const getActiveStyle = (color) => {
    const colors = {
      blue: "bg-gradient-to-tr from-blue-600 to-blue-400 shadow-blue-500/20",
      green: "bg-gradient-to-tr from-green-600 to-green-400 shadow-green-500/20",
      orange: "bg-gradient-to-tr from-orange-600 to-orange-400 shadow-orange-500/20",
      red: "bg-gradient-to-tr from-red-600 to-red-400 shadow-red-500/20",
      pink: "bg-gradient-to-tr from-pink-600 to-pink-400 shadow-pink-500/20",
      dark: "bg-gradient-to-tr from-gray-900 to-gray-800 shadow-gray-900/20",
    };
    return colors[color] || colors["blue"];
  };

  return (
    <>
      {/* Snappy Animation Styles */}
      <style>{`
        @keyframes slideInSnap {
          from { opacity: 0; transform: translateX(-15px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .nav-item-snap {
          opacity: 0;
          animation: slideInSnap 0.25s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
        }
      `}</style>

      <aside
        className={`
          fixed inset-y-0 left-0 z-50 
          my-4 ml-4 
          w-72 
          /* SHORTENED HEIGHT to lift bottom border up */
          h-[calc(100vh-64px)] 
          rounded-2xl 
          transition-transform duration-300 xl:translate-x-0
          ${openSidenav ? "translate-x-0" : "-translate-x-80"}
          
          /* GLASSY THEME */
          bg-white/90 dark:bg-gray-900/95
          backdrop-blur-xl 
          border border-blue-gray-100 dark:border-gray-800
          shadow-xl shadow-blue-gray-900/5
          
          overflow-y-auto overflow-x-hidden
        `}
      >
        {/* Brand + close */}
        <div className="relative border-b border-blue-gray-50 dark:border-gray-800 pb-4">
          <Link
            to="/"
            className="flex items-center gap-4 py-6 px-8"
          >
            <div className="p-1.5 bg-gradient-to-tr from-gray-900 to-gray-800 rounded-lg shadow-md">
              <img src={brandImg} alt="Brand Logo" className="h-6 w-6" />
            </div>
            <Typography
              variant="h6"
              className="font-bold tracking-tight text-blue-gray-900 dark:text-white"
            >
              {brandName}
            </Typography>
          </Link>

          <IconButton
            variant="text"
            size="sm"
            ripple={false}
            className="absolute right-4 top-4 grid rounded-full xl:hidden text-blue-gray-500 hover:bg-blue-gray-50 dark:text-white dark:hover:bg-gray-800"
            onClick={() => setOpenSidenav(dispatch, false)}
          >
            <XMarkIcon strokeWidth={2.5} className="h-5 w-5" />
          </IconButton>
        </div>

        {/* Sections */}
        <div className="m-4 pr-1">
          {dashboardRoutes.map(({ layout, title, pages }, key) => (
            <ul key={key} className="mb-4 flex flex-col gap-1">
              {title && (
                <li className="mx-3.5 mt-4 mb-2">
                  <Typography
                    variant="small"
                    className="font-bold uppercase opacity-60 text-xs text-blue-gray-500 dark:text-blue-gray-300"
                  >
                    {title}
                  </Typography>
                </li>
              )}

              {pages.map(({ icon, name, path, exact = true }, index) => (
                <li 
                  key={name}
                  className="nav-item-snap"
                  style={{ animationDelay: `${index * 40}ms` }} 
                >
                  <NavLink 
                    to={`/${layout}${path}`} 
                    end={exact}
                    className={({ isActive }) => `
                      flex items-center gap-4 px-4 py-3 capitalize
                      rounded-xl transition-all duration-200 ease-out
                      font-medium text-sm
                      ${isActive 
                        ? `${getActiveStyle(sidenavColor)} text-white shadow-lg` 
                        : "text-blue-gray-600 hover:bg-blue-gray-50 hover:text-blue-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
                      }
                    `}
                  >
                    {/* Icon */}
                    <span className="grid h-5 w-5 place-items-center opacity-100">
                      {icon}
                    </span>
                    <p className="capitalize leading-normal">
                      {name}
                    </p>
                  </NavLink>
                </li>
              ))}
            </ul>
          ))}
        </div>
      </aside>
    </>
  );
}

Sidenav.defaultProps = {
  brandImg: "/img/logo-ct.png",
  brandName: "AI Practice Platform",
};

Sidenav.propTypes = {
  brandImg: PropTypes.string,
  brandName: PropTypes.string,
  routes: PropTypes.arrayOf(PropTypes.object).isRequired,
};

Sidenav.displayName = "/src/widgets/layout/sidenav.jsx";
export default Sidenav;