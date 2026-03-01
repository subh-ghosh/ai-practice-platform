import React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Navbar,
  Typography,
  Button,
  IconButton,
  Collapse,
} from "@material-tailwind/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import { MagneticButton } from "@/components/ui/PremiumEffects";
// import { ThemeToggle } from "./ThemeToggle";

export function PublicNavbar() {
  const [openNav, setOpenNav] = React.useState(false);
  const { theme } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();
  const loginTarget = user ? "/dashboard/home" : "/auth/sign-in";

  React.useEffect(() => {
    window.addEventListener("resize", () => window.innerWidth >= 960 && setOpenNav(false));
  }, []);

  const closeNav = () => setOpenNav(false);

  const navList = (
    <ul className="no-cursor-effects mt-2 mb-4 flex flex-col gap-1 lg:mb-0 lg:mt-0 lg:flex-row lg:items-center lg:gap-6">
      <Typography
        as="li"
        variant="small"
        className="font-medium text-gray-700 dark:text-gray-200"
      >
        <Link to="/" onClick={closeNav} className="flex items-center py-3 px-2 hover:text-blue-500 transition-colors rounded-lg hover:bg-white/5">
          Home
        </Link>
      </Typography>
      <Typography
        as="li"
        variant="small"
        className="font-medium text-gray-700 dark:text-gray-200"
      >
        <Link to="/about" onClick={closeNav} className="flex items-center py-3 px-2 hover:text-blue-500 transition-colors rounded-lg hover:bg-white/5">
          About Us
        </Link>
      </Typography>
      <Typography
        as="li"
        variant="small"
        className="font-medium text-gray-700 dark:text-gray-200"
      >
        <Link to="/contact" onClick={closeNav} className="flex items-center py-3 px-2 hover:text-blue-500 transition-colors rounded-lg hover:bg-white/5">
          Contact
        </Link>
      </Typography>
    </ul>
  );

  return (
    <Navbar
      color="transparent"
      className="sticky top-0 z-50 h-max max-w-full rounded-none px-4 py-2 lg:px-8 lg:py-4
                 backdrop-blur-xl bg-white/70 dark:bg-gray-900/60 border-b border-white/40 dark:border-white/5 shadow-sm"
      fullWidth
    >
      <div className="flex items-center justify-between">

        <Link to="/" className="flex items-center gap-3 group">
          {/* Logo with subtle hover glow */}
          <div className="relative transition-transform duration-300 group-hover:scale-105">
            <img
              src={theme === 'dark' ? "/img/logo-ct.png" : "/img/logo-ct-dark.png"}
              alt="Logo"
              className="h-8 w-8"
            />
          </div>
          <Typography
            variant="h6"
            className="mr-4 cursor-pointer py-1.5 text-gray-900 dark:text-white font-bold tracking-tight"
          >
            Asphalt Prep
          </Typography>
        </Link>

        <div className="hidden lg:block">{navList}</div>

        <div className="flex items-center gap-2">
          <div className="hidden lg:flex gap-2">
            <MagneticButton className="rounded-full">
              <Button
                variant="text"
                size="sm"
                onClick={() => navigate(loginTarget)}
                className="text-gray-900 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full"
              >
                {user ? "Dashboard" : "Sign In"}
              </Button>
            </MagneticButton>

            <MagneticButton className="rounded-full">
              <Button
                variant="gradient"
                color="blue"
                size="sm"
                className="hidden lg:inline-block rounded-full"
                onClick={() => navigate("/auth/sign-up")}
              >
                Sign Up
              </Button>
            </MagneticButton>

            {/* ThemeToggle removed */}
          </div>

          {/* Mobile: compact Sign In text link visible without opening menu */}
          <button
            onClick={() => navigate(loginTarget)}
            className="lg:hidden text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-blue-500 transition-colors px-2 py-1"
          >
            {user ? "Dashboard" : "Sign In"}
          </button>

          {/* Hamburger — bigger touch target */}
          <IconButton
            variant="text"
            className="h-10 w-10 text-gray-900 dark:text-white hover:bg-gray-100/10 dark:hover:bg-white/10 focus:bg-transparent active:bg-transparent lg:hidden rounded-lg"
            ripple={false}
            onClick={() => setOpenNav(!openNav)}
          >
            {openNav ? (
              <XMarkIcon className="h-6 w-6" strokeWidth={2} />
            ) : (
              <Bars3Icon className="h-6 w-6" strokeWidth={2} />
            )}
          </IconButton>

        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <Collapse open={openNav}>
        <div className="mt-2 border-t border-gray-200 dark:border-white/10 pt-2 pb-4 bg-white dark:bg-[#050505]/95 rounded-xl px-2">
          {navList}
          <div className="flex flex-col gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-white/5">
            <Button
              variant="text"
              size="sm"
              fullWidth
              onClick={() => { navigate(loginTarget); closeNav(); }}
              className="text-gray-900 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10 py-3 text-sm font-semibold"
            >
              {user ? "Dashboard" : "Sign In"}
            </Button>

            <Button
              variant="gradient"
              color="blue"
              size="sm"
              fullWidth
              className="rounded-xl py-3 text-sm font-bold"
              onClick={() => { navigate("/auth/sign-up"); closeNav(); }}
            >
              Sign Up Free →
            </Button>
          </div>
        </div>
      </Collapse>
    </Navbar>
  );
}

export default PublicNavbar;
