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
import { useState } from "react";

export function Sidenav({ brandImg, brandName, routes }) {
  const [controller, dispatch] = useMaterialTailwindController();
  const { openSidenav } = controller;

  const [mini, setMini] = useState(false);

  const dashboardRoutes = routes.filter(r => r.layout === "dashboard");

  return (
    <aside
      className={`
        fixed inset-y-0 left-0 z-50 m-4
        ${mini ? "w-20" : "w-72"}
        ${openSidenav ? "translate-x-0" : "-translate-x-96"}
        transition-all duration-300 ease-in-out
        rounded-3xl

        bg-gradient-to-b from-white/10 to-white/5
        dark:from-gray-900/40 dark:to-gray-900/20
        backdrop-blur-lg
        border border-white/10
        shadow-xl

        overflow-y-auto overflow-x-hidden
        xl:translate-x-0

        [&::-webkit-scrollbar]:w-1.5
        [&::-webkit-scrollbar-thumb]:bg-white/20
        [&::-webkit-scrollbar-thumb]:rounded-full
      `}
    >

      {/* Brand */}
      <div className="flex items-center justify-between px-5 py-6">
        <Link to="/" className="flex items-center gap-3">
          <img src={brandImg} className="h-9 w-9" />

          {!mini && (
            <Typography className="font-bold text-white">
              {brandName}
            </Typography>
          )}
        </Link>

        <IconButton
          variant="text"
          size="sm"
          className="xl:hidden text-white"
          onClick={() => setOpenSidenav(dispatch, false)}
        >
          <XMarkIcon className="h-5 w-5" />
        </IconButton>
      </div>

      {/* Collapse Toggle */}
      <div className="px-4 mb-4">
        <button
          onClick={() => setMini(!mini)}
          className="text-xs text-white/70 hover:text-white transition"
        >
          {mini ? "Expand" : "Collapse"}
        </button>
      </div>

      {/* Routes */}
      <div className="px-3">
        {dashboardRoutes.map(({ title, pages }, i) => (
          <ul key={i} className="mb-6">

            {!mini && title && (
              <li className="px-4 mt-6 mb-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                {title}
              </li>
            )}

            {pages.map(({ icon, name, path, badge }) => (
              <li key={name}>
                <NavLink to={`/dashboard${path}`} end>
                  {({ isActive }) => {

                    const item = (
                      <div
                        className={`
                          relative flex items-center gap-3 px-4 py-3 mb-2
                          rounded-xl cursor-pointer
                          transition-colors duration-200

                          ${isActive
                            ? "bg-blue-500/20"
                            : "hover:bg-white/10"}
                        `}
                      >

                        {/* Active bar */}
                        {isActive && (
                          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-400 rounded-r-full" />
                        )}

                        <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/5">
                          {badge
                            ? <Badge content={badge} color="red">{icon}</Badge>
                            : icon}
                        </div>

                        {!mini && (
                          <Typography className="text-white font-medium">
                            {name}
                          </Typography>
                        )}
                      </div>
                    );

                    return mini
                      ? <Tooltip content={name} placement="right">{item}</Tooltip>
                      : item;
                  }}
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
