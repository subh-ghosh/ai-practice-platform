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
import { ThemeToggle } from "./ThemeToggle";

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
        color="blue-gray"
        className="p-1 font-normal dark:text-gray-200"
      >
        <Link to="/" className="flex items-center">
          Home
        </Link>
      </Typography>
      {/* --- 👇 THIS IS THE CHANGE --- 👇 */}
      <Typography
        as="li"
        variant="small"
        color="blue-gray"
        className="p-1 font-normal dark:text-gray-200"
      >
        <Link to="/about" className="flex items-center">
          About Us
        </Link>
      </Typography>
      <Typography
        as="li"
        variant="small"
        color="blue-gray"
        className="p-1 font-normal dark:text-gray-200"
      >
        <Link to="/contact" className="flex items-center">
          Contact
        </Link>
      </Typography>
      {/* --- 👆 END OF CHANGE --- 👆 */}
    </ul>
  );

  return (
    <Navbar
      color="white"
      className="sticky top-0 z-50 h-max max-w-full rounded-none px-4 py-2 lg:px-8 lg:py-4
                 dark:bg-gray-900 shadow-none border-0"
      fullWidth
      shadow={false} // Explicitly set shadow to false
    >
      <div className="flex items-center justify-between">

        <Link to="/" className="flex items-center gap-3">
          <img
            src={theme === 'dark' ? "/img/logo-ct.png" : "/img/logo-ct-dark.png"}
            alt="Logo"
            className="h-8 w-8"
          />
          <Typography
            variant="h6"
            className="mr-4 cursor-pointer py-1.5 text-blue-gray-900 dark:text-gray-200"
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
              className="text-blue-gray-900 dark:text-gray-200"
            >
              Sign In
            </Button>

            <Button
              variant="gradient"
              size="sm"
              onClick={() => navigate("/auth/sign-up")}
            >
              Sign Up
            </Button>

            <ThemeToggle />
          </div>

          <IconButton
            variant="text"
            className="ml-auto h-6 w-6 text-inherit hover:bg-transparent focus:bg-transparent active:bg-transparent lg:hidden"
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
            <ThemeToggle />
          </div>

        </div>
      </div>
      <Collapse open={openNav}>
        {navList} {/* This now correctly passes down the updated links */}
        <div className="flex flex-col gap-2">

          <Button
            variant="text"
            size="sm"
            fullWidth
            onClick={() => navigate("/auth/sign-in")}
            className="text-blue-gray-900 dark:text-gray-200"
          >
            Sign In
          </Button>

          <Button
            variant="gradient"
            size="sm"
            fullWidth
            onClick={() => navigate("/auth/sign-up")}
          >
            Sign Up
          </Button>
        </div>
      </Collapse>
    </Navbar>
  );
}

export default PublicNavbar;