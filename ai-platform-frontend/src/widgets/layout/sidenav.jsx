import PropTypes from "prop-types";
import { Link, NavLink } from "react-router-dom";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { Button, IconButton, Typography } from "@material-tailwind/react";
import {
  useMaterialTailwindController,
  setOpenSidenav,
} from "../../context";

export function Sidenav({ brandImg, brandName, routes }) {
  const [controller, dispatch] = useMaterialTailwindController();
  const { sidenavColor, openSidenav } = controller;

  // Only dashboard routes
  const dashboardRoutes = routes.filter(({ layout }) => layout === "dashboard");

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
          animation: slideInSnap 0.3s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
        }
      `}</style>

      <aside
        className={`
          fixed inset-0 z-50 my-4 ml-4 h-[calc(100vh-32px)] w-72 rounded-2xl
          transition-transform duration-300 xl:translate-x-0
          ${openSidenav ? "translate-x-0" : "-translate-x-80"}
          
          /* GLASSY BLUISH THEME */
          bg-white/80 dark:bg-gray-900/90 
          backdrop-blur-xl 
          border border-blue-100/60 dark:border-gray-700
          shadow-xl shadow-blue-gray-900/5
          
          overflow-y-auto overflow-x-hidden
        `}
      >
        {/* Brand + close */}
        <div className="relative border-b border-blue-50 dark:border-gray-800 pb-4">
          <Link
            to="/"
            className="flex items-center gap-4 py-6 px-8 rounded-t-2xl"
          >
            <div className="p-1.5 bg-gradient-to-tr from-blue-50 to-blue-100 rounded-lg dark:from-gray-800 dark:to-gray-900">
                <img src={brandImg} alt="Brand Logo" className="h-7 w-7" />
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
                  style={{ animationDelay: `${index * 50}ms` }} // Very fast stagger (50ms)
                >
                  <NavLink to={`/${layout}${path}`} end={exact}>
                    {({ isActive }) => (
                      <Button
                        variant={isActive ? "gradient" : "text"}
                        color={isActive ? (sidenavColor || "blue") : "blue-gray"}
                        className={`
                          flex items-center gap-4 px-4 py-3 capitalize justify-start
                          rounded-xl transition-all duration-200 ease-out
                          ${isActive 
                            ? "shadow-lg shadow-blue-500/20" 
                            : "text-blue-gray-700 hover:bg-blue-50 hover:text-blue-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
                          }
                        `}
                        fullWidth
                      >
                        {/* Icon */}
                        <span className={`grid h-5 w-5 place-items-center transition-colors ${isActive ? "opacity-100" : "opacity-70 group-hover:opacity-100"}`}>
                            {icon}
                        </span>

                        <Typography color="inherit" className="font-medium capitalize text-sm">
                          {name}
                        </Typography>
                      </Button>
                    )}
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