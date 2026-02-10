import PropTypes from "prop-types";
import { Link, NavLink } from "react-router-dom";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { Button, IconButton, Typography } from "@material-tailwind/react";
import {
  useMaterialTailwindController,
  setOpenSidenav,
} from "../../context";
import { useState } from "react";

export function Sidenav({ brandImg, brandName, routes }) {
  const [controller, dispatch] = useMaterialTailwindController();
  const { sidenavType, openSidenav } = controller;

  const [mini, setMini] = useState(false);

  // Glass style variants
  const typeClass = {
    dark: `
      bg-gradient-to-b from-gray-900 to-black
      text-white border border-white/10
      shadow-xl shadow-blue-500/10
    `,
    white: `
      bg-white/80 backdrop-blur-xl
      text-blue-gray-900
      border border-black/5
      shadow-lg
    `,
    transparent: `
      bg-gradient-to-b from-white/10 to-white/5
      dark:from-gray-900/40 dark:to-gray-900/20
      backdrop-blur-xl
      border border-white/10
      shadow-xl shadow-blue-500/5
      text-white
    `,
  }[sidenavType];

  const dashboardRoutes = routes.filter(({ layout }) => layout === "dashboard");

  return (
    <aside
      className={`
        ${typeClass}
        ${openSidenav ? "translate-x-0" : "-translate-x-80"}
        fixed inset-y-0 left-0 z-50 m-4
        ${mini ? "w-20" : "w-72"}
        rounded-2xl
        transition-all duration-300
        xl:translate-x-0
        overflow-y-auto overflow-x-hidden
        
        [&::-webkit-scrollbar]:w-1.5
        [&::-webkit-scrollbar-thumb]:bg-white/20
        [&::-webkit-scrollbar-thumb]:rounded-full
        hover:[&::-webkit-scrollbar-thumb]:bg-white/40
      `}
    >
      {/* 🌌 Glow Background */}
      <div className="absolute inset-0 -z-10 pointer-events-none overflow-hidden">
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-0 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
      </div>

      {/* 🔷 Brand */}
      <div className="relative flex items-center justify-between px-6 py-6">
        <Link to="/" className="flex items-center gap-3">
          <img src={brandImg} alt="logo" className="h-8 w-8" />

          {!mini && (
            <Typography variant="h6" className="font-bold">
              {brandName}
            </Typography>
          )}
        </Link>

        {/* Close */}
        <IconButton
          variant="text"
          size="sm"
          className="xl:hidden"
          onClick={() => setOpenSidenav(dispatch, false)}
        >
          <XMarkIcon className="h-5 w-5" />
        </IconButton>
      </div>

      {/* 🔘 Collapse Toggle */}
      <div className="px-4 mb-2 hidden xl:block">
        <Button
          size="sm"
          variant="text"
          onClick={() => setMini(!mini)}
          className="w-full text-xs opacity-70 hover:opacity-100"
        >
          {mini ? "Expand" : "Collapse"}
        </Button>
      </div>

      {/* 📌 Routes */}
      <div className="px-3">
        {dashboardRoutes.map(({ title, pages }, key) => (
          <ul key={key} className="mb-6">
            {/* Section Title */}
            {!mini && title && (
              <li className="px-4 mt-6 mb-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                {title}
              </li>
            )}

            {pages.map(({ icon, name, path }) => (
              <li key={name}>
                <NavLink to={`/dashboard${path}`} end>
                  {({ isActive }) => (
                    <Button
                      variant="text"
                      fullWidth
                      className={`
                        relative group flex items-center gap-3 px-4 py-3 mb-1
                        rounded-xl transition-all duration-200
                        hover:bg-white/10
                        hover:translate-x-1
                        hover:scale-[1.02]
                        ${isActive ? "bg-white/10" : ""}
                      `}
                    >
                      {/* Active Glow Bar */}
                      {isActive && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-500 rounded-r-full shadow-[0_0_10px] shadow-blue-500" />
                      )}

                      {/* Icon */}
                      <span className="grid h-9 w-9 place-items-center rounded-lg bg-white/5 group-hover:bg-white/10 transition">
                        {icon}
                      </span>

                      {/* Text */}
                      {!mini && (
                        <Typography className="font-medium capitalize">
                          {name}
                        </Typography>
                      )}
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

export default Sidenav;
