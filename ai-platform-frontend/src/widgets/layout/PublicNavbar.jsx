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
// import { ThemeToggle } from "./ThemeToggle";

export function PublicNavbar() {
  const [openNav, setOpenNav] = React.useState(false);
  const { theme } = useTheme();
  const navigate = useNavigate();

  React.useEffect(() => {
    window.addEventListener("resize", () => window.innerWidth >= 960 && setOpenNav(false));
  }, []);

  const navList = (
    <ul className="mt-2 mb-4 flex flex-col gap-2 lg:mb-0 lg:mt-0 lg:flex-row lg:items-center lg:gap-6">
      <Typography
        as="li"
        variant="small"
        className="p-1 font-medium text-gray-700 dark:text-gray-200"
      >
        <Link to="/" className="flex items-center hover:text-blue-500 transition-colors">
          Home
        </Link>
      </Typography>
      <Typography
        as="li"
        variant="small"
        className="p-1 font-medium text-gray-700 dark:text-gray-200"
      >
        <Link to="/about" className="flex items-center hover:text-blue-500 transition-colors">
          About Us
        </Link>
      </Typography>
      <Typography
        as="li"
        variant="small"
        className="p-1 font-medium text-gray-700 dark:text-gray-200"
      >
        <Link to="/contact" className="flex items-center hover:text-blue-500 transition-colors">
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
            AI Practice Platform
          </Typography>
        </Link>

        <div className="hidden lg:block">{navList}</div>

        <div className="flex items-center gap-4">
          <div className="hidden lg:flex gap-2">
            <Button
              variant="text"
              size="sm"
              onClick={() => navigate("/auth/sign-in")}
              className="text-gray-900 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10"
            >
              Sign In
            </Button>

            <Button
              variant="gradient"
              color="blue"
              size="sm"
              className="hidden lg:inline-block rounded-full"
              onClick={() => navigate("/auth/sign-up")}
            >
              Sign Up
            </Button>

            {/* ThemeToggle removed */}
          </div>

          <IconButton
            variant="text"
            className="ml-auto h-6 w-6 text-gray-900 dark:text-white hover:bg-transparent focus:bg-transparent active:bg-transparent lg:hidden"
            ripple={false}
            onClick={() => setOpenNav(!openNav)}
          >
            {openNav ? (
              <XMarkIcon className="h-6 w-6" strokeWidth={2} />
            ) : (
              <Bars3Icon className="h-6 w-6" strokeWidth={2} />
            )}
          </IconButton>

          <div className="lg:hidden">
            {/* ThemeToggle removed */}
          </div>

        </div>
      </div>

      {/* Mobile Menu */}
      <Collapse open={openNav}>
        <div className="container mx-auto mt-3 border-t border-gray-200 dark:border-gray-800 pt-4">
          {navList}
          <div className="flex flex-col gap-2 mt-4">
            <Button
              variant="text"
              size="sm"
              fullWidth
              onClick={() => navigate("/auth/sign-in")}
              className="text-gray-900 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10"
            >
              Sign In
            </Button>

            <Button
              variant="gradient"
              color="blue"
              size="sm"
              fullWidth
              className="rounded-lg"
              onClick={() => navigate("/auth/sign-up")}
            >
              Sign Up
            </Button>
          </div>
        </div>
      </Collapse>
    </Navbar>
  );
}

export default PublicNavbar;