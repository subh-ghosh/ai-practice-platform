import PropTypes from "prop-types";
import { Link, NavLink } from "react-router-dom";
import { XMarkIcon } from "@heroicons/react/24/outline";
import {
  IconButton,
  Typography,
} from "@material-tailwind/react";
import {
  useMaterialTailwindController,
  setOpenSidenav,
} from "@/context";

export function Sidenav({ brandImg, brandName, routes }) {
  const [controller, dispatch] = useMaterialTailwindController();
  const { openSidenav } = controller;

  // GLASS STYLES
  const glassClasses = "bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-white/40 dark:border-white/10 shadow-2xl shadow-blue-gray-900/10";

  return (
    <aside
      className={`
        ${glassClasses}
        fixed inset-y-0 left-0 z-50 m-4 w-72 rounded-2xl 
        transition-transform duration-300 ease-in-out
        ${openSidenav ? "translate-x-0" : "-translate-x-[120%]"} 
        xl:translate-x-0
        /* Prevent scrolling on the main container */
        overflow-hidden
      `}
    >
      {/* BRAND HEADER */}
      <div className="relative border-b border-blue-gray-50 dark:border-white/10 p-6">
        <Link to="/" className="flex items-center gap-4 py-2 px-1">
          <img src={brandImg} alt="Brand" className="h-9 w-9" />
          <Typography
            variant="h6"
            className="text-blue-gray-900 dark:text-white tracking-wide font-bold"
          >
            {brandName}
          </Typography>
        </Link>
        
        {/* Close button for mobile */}
        <IconButton
          variant="text"
          color="white"
          size="sm"
          ripple={false}
          className="absolute right-2 top-2 grid rounded-br-none rounded-tl-none xl:hidden text-blue-gray-500 hover:text-blue-gray-900 dark:text-white/70 dark:hover:text-white"
          onClick={() => setOpenSidenav(dispatch, false)}
        >
          <XMarkIcon strokeWidth={2.5} className="h-5 w-5" />
        </IconButton>
      </div>

      {/* NAV LINKS */}
      <div className="m-4 h-[calc(100vh-140px)] overflow-hidden">
        {routes.map(({ layout, title, pages }, key) => {
          
          // 🛑 FILTER: Skip the "auth" section entirely
          if (layout === "auth") return null;

          return (
            <ul key={key} className="mb-4 flex flex-col gap-1">
              {title && (
                <li className="mx-3.5 mt-4 mb-2">
                  <Typography
                    variant="small"
                    className="font-bold uppercase opacity-75 text-blue-gray-500 dark:text-white/60 text-[11px] tracking-wider"
                  >
                    {title}
                  </Typography>
                </li>
              )}

              {pages.map(({ icon, name, path }) => (
                <li key={name}>
                  <NavLink to={`/${layout}${path}`}>
                    {({ isActive }) => (
                      <div
                        className={`
                          flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300
                          ${isActive
                            ? "bg-gradient-to-r from-blue-600 to-blue-400 text-white shadow-lg shadow-blue-500/30" // Removed translate-x-1 here
                            : "text-blue-gray-500 dark:text-blue-gray-300 hover:bg-blue-gray-50 dark:hover:bg-white/5 hover:text-blue-gray-900 dark:hover:text-white"
                          }
                        `}
                      >
                        {/* Icon */}
                        <div className={`grid place-items-center mr-2 ${isActive ? "opacity-100" : "opacity-70"}`}>
                           {icon}
                        </div>

                        <Typography color="inherit" className="font-medium capitalize">
                          {name}
                        </Typography>
                      </div>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          );
        })}
      </div>
    </aside>
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

export default Sidenav;