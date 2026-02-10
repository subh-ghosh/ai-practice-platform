import PropTypes from "prop-types";
import { Link, NavLink } from "react-router-dom";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { Button, IconButton, Typography } from "@material-tailwind/react";
import {
  useMaterialTailwindController,
  setOpenSidenav,
} from "../../context"; // fixed import path

export function Sidenav({ brandImg, brandName, routes }) {
  const [controller, dispatch] = useMaterialTailwindController();
  const { sidenavColor, sidenavType, openSidenav } = controller;

  const typeClass =
    {
      dark:
        // deep gradient + soft ring
        "bg-gradient-to-br from-gray-800 to-gray-900 text-white ring-1 ring-white/10",
      white:
        // clean surface
        "bg-white text-blue-gray-800 shadow-sm ring-1 ring-black/5",
      transparent:
        // glass panel
        "bg-white/10 backdrop-blur-md text-white ring-1 ring-white/10",
    }[sidenavType] || "bg-white text-blue-gray-800 ring-1 ring-black/5";

  // Only dashboard routes
  const dashboardRoutes = routes.filter(({ layout }) => layout === "dashboard");

  return (
    <aside
      className={`
        ${typeClass}
        ${openSidenav ? "translate-x-0" : "-translate-x-80"}
        fixed inset-0 z-50 my-4 ml-4 h-[calc(100vh-32px)] w-72
        rounded-xl transition-transform duration-300 xl:translate-x-0
        overflow-y-auto overflow-x-hidden overscroll-contain
      `}
    >
      {/* Animation Styles */}
      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .nav-item-animate {
          opacity: 0;
          animation: fadeSlideUp 0.5s ease-out forwards;
        }
      `}</style>

      {/* Brand + close */}
      <div className="relative">
        <Link
          to="/"
          className="flex items-center gap-4 py-6 px-8 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 rounded-t-xl"
          aria-label="Go to home"
        >
          <img src={brandImg} alt="Brand Logo" className="h-8 w-8" />
          <Typography
            variant="h6"
            color={sidenavType === "white" ? "blue-gray" : "white"}
            className="font-semibold"
          >
            {brandName}
          </Typography>
        </Link>

        <IconButton
          variant="text"
          color={sidenavType === "white" ? "blue-gray" : "white"}
          size="sm"
          ripple={false}
          className="absolute right-0 top-0 grid rounded-br-none rounded-tl-none xl:hidden focus-visible:ring-2 focus-visible:ring-white/40"
          onClick={() => setOpenSidenav(dispatch, false)}
          aria-label="Close sidebar"
        >
          <XMarkIcon
            strokeWidth={2.5}
            className={`h-5 w-5 ${
              sidenavType === "white" ? "text-blue-gray-700" : "text-white"
            }`}
          />
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
                  className={`font-black uppercase opacity-75 ${
                    sidenavType === "white" ? "text-blue-gray-600" : "text-white"
                  }`}
                >
                  {title}
                </Typography>
              </li>
            )}

            {pages.map(({ icon, name, path, exact = true }, index) => (
              <li 
                key={name}
                className="nav-item-animate"
                style={{ animationDelay: `${(key * 3 + index) * 100}ms` }}
              >
                <NavLink to={`/${layout}${path}`} end={exact} title={name}>
                  {({ isActive }) => (
                    <Button
                      variant={isActive ? "gradient" : "text"}
                      color={
                        isActive
                          ? // active: use configured accent (fallback "blue")
                            (sidenavColor || "blue")
                          : // inactive: readable contrast for current type
                            sidenavType === "white" ? "blue-gray" : "white"
                      }
                      className={`flex items-center gap-4 px-4 py-3 capitalize justify-start
                        focus:outline-none focus-visible:ring-2
                        ${
                          sidenavType === "white"
                            ? "focus-visible:ring-black/10"
                            : "focus-visible:ring-white/30"
                        }
                        ${isActive ? "" : "opacity-90 hover:opacity-100"}
                      `}
                      fullWidth
                      aria-current={isActive ? "page" : undefined}
                    >
                      {/* icon inherits color */}
                      <span className="grid h-5 w-5 place-items-center">{icon}</span>

                      <Typography color="inherit" className="font-medium capitalize">
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