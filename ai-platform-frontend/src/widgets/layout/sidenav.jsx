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
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

export function Sidenav({ brandImg, brandName, routes }) {
  const [controller, dispatch] = useMaterialTailwindController();
  const { openSidenav } = controller;

  const [mini, setMini] = useState(false);
  const [hovered, setHovered] = useState(false);

  const expanded = !mini || hovered;

  // Auto responsive
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1280) setMini(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const dashboardRoutes = routes.filter(r => r.layout === "dashboard");

  return (
    <motion.aside
      initial={{ x: -120, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`
        fixed inset-y-0 left-0 z-50 m-4
        ${expanded ? "w-72" : "w-20"}
        ${openSidenav ? "translate-x-0" : "-translate-x-96"}
        transition-all duration-300
        rounded-3xl

        bg-gradient-to-b from-white/10 to-white/5
        dark:from-gray-900/40 dark:to-gray-900/20
        backdrop-blur-xl
        border border-white/10
        shadow-2xl shadow-blue-500/10

        overflow-y-auto overflow-x-hidden
        xl:translate-x-0

        [&::-webkit-scrollbar]:w-1.5
        [&::-webkit-scrollbar-thumb]:bg-white/20
        [&::-webkit-scrollbar-thumb]:rounded-full
      `}
    >

      {/* Glow */}
      <div className="absolute inset-0 -z-10 pointer-events-none overflow-hidden">
        <div className="absolute -top-12 -left-12 w-48 h-48 bg-blue-500/20 blur-3xl rounded-full animate-pulse" />
        <div className="absolute bottom-0 right-0 w-48 h-48 bg-purple-500/20 blur-3xl rounded-full animate-pulse" />
      </div>

      {/* Brand */}
      <div className="flex items-center justify-between px-5 py-6">
        <Link to="/" className="flex items-center gap-3">
          <motion.img
            whileHover={{ rotate: 10, scale: 1.1 }}
            src={brandImg}
            className="h-9 w-9"
          />

          {expanded && (
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

      {/* Routes */}
      <div className="px-3">
        {dashboardRoutes.map(({ title, pages }, i) => (
          <ul key={i} className="mb-6">

            {expanded && title && (
              <li className="px-4 mt-6 mb-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                {title}
              </li>
            )}

            {pages.map(({ icon, name, path, badge }) => (
              <li key={name}>
                <NavLink to={`/dashboard${path}`} end>
                  {({ isActive }) => {

                    const item = (
                      <motion.div
                        whileHover={{ scale: 1.08, x: 6 }}
                        whileTap={{ scale: 0.95 }}
                        className={`
                          relative flex items-center gap-3 px-4 py-3 mb-2
                          rounded-xl cursor-pointer
                          transition-all duration-200

                          ${isActive
                            ? "bg-gradient-to-r from-blue-500/20 to-purple-500/20 shadow-lg shadow-blue-500/20"
                            : "hover:bg-white/10"}
                        `}
                      >

                        {/* Active bar */}
                        {isActive && (
                          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-7 bg-blue-400 rounded-r-full shadow-[0_0_15px] shadow-blue-400" />
                        )}

                        {/* Icon */}
                        <motion.div
                          whileHover={{ y: -4 }}
                          className="grid h-10 w-10 place-items-center rounded-xl bg-white/5"
                        >
                          {badge
                            ? <Badge content={badge} color="red">{icon}</Badge>
                            : icon}
                        </motion.div>

                        {expanded && (
                          <Typography className="text-white font-medium">
                            {name}
                          </Typography>
                        )}
                      </motion.div>
                    );

                    return !expanded
                      ? <Tooltip content={name} placement="right">{item}</Tooltip>
                      : item;
                  }}
                </NavLink>
              </li>
            ))}
          </ul>
        ))}
      </div>
    </motion.aside>
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
