import PropTypes from "prop-types";
import { Link, NavLink } from "react-router-dom";
import { XMarkIcon } from "@heroicons/react/24/outline";
import {
  IconButton,
  Typography,
  Tooltip,
  Badge,
} from "@material-tailwind/react";
import {
  useMaterialTailwindController,
  setOpenSidenav,
} from "../../context";
import { useEffect, useState } from "react";

export function Sidenav({ brandImg, brandName, routes }) {
  const [controller, dispatch] = useMaterialTailwindController();
  const { openSidenav } = controller;

  // Detect mobile
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1280);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1280);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const dashboardRoutes = routes.filter(r => r.layout === "dashboard");

  return (
    <aside
      className={`
        fixed inset-y-0 left-0 z-50 m-4
        w-72
        ${openSidenav ? "translate-x-0" : "-translate-x-96"}
        transition-transform duration-300 ease-in-out
        rounded-3xl

        bg-gradient-to-b from-white/10 to-white/5
        dark:from-gray-900/40 dark:to-gray-900/20
        backdrop-blur-lg
        border border-white/10
        shadow-xl

        overflow-y-auto overflow-x-hidden

        // Desktop always visible
        xl:translate-x-0

        [&::-webkit-scrollbar]:w-1.5
        [&::-webkit-scrollbar-thumb]:bg-white/20
        [&::-webkit-scrollbar-thumb]:rounded-full
      `}
    >

      {/* BRAND */}
      <div className="flex items-center justify-between px-5 py-6">
        <Link to="/" className="flex items-center gap-3">
          <img src={brandImg} className="h-9 w-9" />

          <Typography className="font-bold text-white">
            {brandName}
          </Typography>
        </Link>

        {/* Close button only on mobile */}
        {isMobile && (
          <IconButton
            variant="text"
            size="sm"
            className="text-white"
            onClick={() => setOpenSidenav(dispatch, false)}
          >
            <XMarkIcon className="h-5 w-5" />
          </IconButton>
        )}
      </div>

      {/* ROUTES */}
      <div className="px-3">
        {dashboardRoutes.map(({ title, pages }, i) => (
          <ul key={i} className="mb-6">

            {/* Section Title */}
            {title && (
              <li className="px-4 mt-6 mb-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                {title}
              </li>
            )}

            {pages.map(({ icon, name, path, badge }) => (
              <li key={name}>
                <NavLink to={`/dashboard${path}`} end>
                  {({ isActive }) => (

                    <div
                      className={`
                        relative flex items-center gap-3 px-4 py-3 mb-2
                        rounded-xl cursor-pointer
                        transition-all duration-200

                        ${isActive
                          ? "bg-blue-500/20"
                          : "hover:bg-white/10"}
                      `}
                    >

                      {/* Active bar */}
                      {isActive && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-400 rounded-r-full" />
                      )}

                      {/* Icon */}
                      <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/5 shrink-0">
                        {badge
                          ? <Badge content={badge} color="red">{icon}</Badge>
                          : icon}
                      </div>

                      <Typography className="text-white font-medium">
                        {name}
                      </Typography>

                    </div>

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
  routes: PropTypes.array.isRequired,
};

export default Sidenav;
