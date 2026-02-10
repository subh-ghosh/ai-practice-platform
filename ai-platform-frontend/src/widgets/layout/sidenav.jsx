import PropTypes from "prop-types";
import { Link, NavLink } from "react-router-dom";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { Button, IconButton, Typography, Avatar } from "@material-tailwind/react";
import {
  useMaterialTailwindController,
  setOpenSidenav,
} from "../../context";

export function Sidenav({ brandImg, brandName, routes }) {
  const [controller, dispatch] = useMaterialTailwindController();
  const { sidenavColor, sidenavType, openSidenav } = controller;

  // Modernized container styles based on type
  const sidenavTypes = {
    dark: "bg-gradient-to-br from-gray-900 via-gray-900 to-black text-white shadow-xl shadow-blue-gray-900/5 border-r border-white/10",
    white: "bg-white text-blue-gray-800 shadow-lg border-r border-blue-gray-50",
    transparent: "bg-white/10 backdrop-blur-xl text-white shadow-lg border-r border-white/20",
  };

  const typeClass = sidenavTypes[sidenavType] || sidenavTypes.dark;

  // Only dashboard routes
  const dashboardRoutes = routes.filter(({ layout }) => layout === "dashboard");

  return (
    <>
      {/* Custom Styles for Animation & Scrollbar */}
      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .nav-item-enter {
          animation: fadeSlideUp 0.5s ease-out forwards;
          opacity: 0; 
        }
        .hide-scroll::-webkit-scrollbar {
          display: none;
        }
        .hide-scroll {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      <aside
        className={`
          ${typeClass}
          ${openSidenav ? "translate-x-0" : "-translate-x-80"}
          fixed inset-0 z-50 my-4 ml-4 h-[calc(100vh-32px)] w-72
          rounded-2xl transition-transform duration-300 xl:translate-x-0
          overflow-y-auto hide-scroll
        `}
      >
        {/* --- Header / Brand --- */}
        <div className="relative border-b border-white/10 pb-4">
          <Link
            to="/"
            className="flex items-center gap-4 py-6 px-8 rounded-t-2xl transition-opacity hover:opacity-80"
          >
            {/* Brand Logo with a subtle glow */}
            <div className="relative flex items-center justify-center p-1 rounded-lg bg-white/10 shadow-inner">
               <img src={brandImg} alt="Brand" className="h-8 w-8 object-contain" />
            </div>
            
            <Typography
              variant="h6"
              className={`font-bold tracking-wide ${
                sidenavType === "white" ? "text-blue-gray-900" : "text-white"
              }`}
            >
              {brandName}
            </Typography>
          </Link>

          {/* Mobile Close Button */}
          <IconButton
            variant="text"
            color="white"
            size="sm"
            ripple={false}
            className="absolute right-4 top-4 grid rounded-full xl:hidden hover:bg-white/10 active:bg-white/20"
            onClick={() => setOpenSidenav(dispatch, false)}
          >
            <XMarkIcon strokeWidth={2.5} className="h-5 w-5 text-white" />
          </IconButton>
        </div>

        {/* --- Navigation --- */}
        <div className="m-4">
          {dashboardRoutes.map(({ layout, title, pages }, sectionIndex) => (
            <ul key={sectionIndex} className="mb-4 flex flex-col gap-1">
              
              {/* Section Title */}
              {title && (
                <li className="mx-3.5 mt-4 mb-2">
                  <Typography
                    variant="small"
                    className={`font-bold uppercase text-[11px] tracking-wider opacity-60 ${
                      sidenavType === "white" ? "text-blue-gray-500" : "text-blue-gray-200"
                    }`}
                  >
                    {title}
                  </Typography>
                </li>
              )}

              {/* Pages */}
              {pages.map(({ icon, name, path, exact = true }, pageIndex) => (
                <li 
                  key={name} 
                  className="nav-item-enter"
                  style={{ animationDelay: `${(sectionIndex * 2 + pageIndex) * 50}ms` }} // Staggered Animation
                >
                  <NavLink to={`/${layout}${path}`} end={exact}>
                    {({ isActive }) => (
                      <Button
                        variant={isActive ? "gradient" : "text"}
                        color={
                          isActive
                            ? sidenavColor // Context color (e.g., "blue")
                            : sidenavType === "white" ? "blue-gray" : "white"
                        }
                        className={`
                          group flex items-center gap-4 px-4 py-3 capitalize
                          rounded-xl transition-all duration-300 ease-in-out
                          ${isActive 
                            ? "shadow-lg shadow-blue-500/30 scale-[1.02]" // Active: Glow & Scale
                            : "hover:bg-white/10 hover:text-white"         // Inactive: Glass hover
                          }
                        `}
                        fullWidth
                      >
                        {/* Icon Wrapper */}
                        <div className={`
                          grid place-items-center transition-transform duration-300 group-hover:scale-110
                          ${isActive ? "opacity-100" : "opacity-75 group-hover:opacity-100"}
                        `}>
                          {icon}
                        </div>

                        <Typography
                          color="inherit"
                          className="font-medium capitalize tracking-wide text-sm"
                        >
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