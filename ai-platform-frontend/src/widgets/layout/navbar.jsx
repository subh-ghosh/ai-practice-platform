import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import {
  Navbar as MTNavbar,
  Collapse,
  Typography,
  Button,
  IconButton,
} from "@material-tailwind/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";

export function Navbar({ brandName, routes, action }) {
  const [openNav, setOpenNav] = React.useState(false);

  React.useEffect(() => {
    window.addEventListener(
      "resize",
      () => window.innerWidth >= 960 && setOpenNav(false)
    );
  }, []);

  const navList = (
    <ul className="mb-4 mt-2 flex flex-col gap-2 lg:mb-0 lg:mt-0 lg:flex-row lg:items-center lg:gap-6">
      {routes.map(({ name, path, icon }) => (
        <Typography
          key={name}
          as="li"
          variant="small"
          color="blue-gray"
          className="capitalize font-medium"
        >
          <Link 
            to={path} 
            className="flex items-center gap-1 p-1 transition-colors hover:text-blue-500 dark:text-gray-200 dark:hover:text-blue-400"
          >
            {icon &&
              React.createElement(icon, {
                className: "w-[18px] h-[18px] opacity-75 mr-1",
              })}
            {name}
          </Link>
        </Typography>
      ))}
    </ul>
  );

  return (
    <MTNavbar 
      color="transparent"
      className="p-3 sticky top-0 z-50 max-w-full rounded-none border-b border-white/10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-sm"
    >
      <div className="container mx-auto flex items-center justify-between text-blue-gray-900 dark:text-white">
        <Link to="/">
          <Typography
            variant="small"
            className="mr-4 ml-2 cursor-pointer py-1.5 font-bold tracking-wide"
          >
            {brandName}
          </Typography>
        </Link>
        
        <div className="hidden lg:block">{navList}</div>
        
        {/* Desktop Action Button */}
        <div className="hidden lg:inline-block">
          {action}
        </div>

        {/* Mobile Toggle */}
        <IconButton
          variant="text"
          size="sm"
          className="ml-auto text-inherit hover:bg-transparent focus:bg-transparent active:bg-transparent lg:hidden"
          onClick={() => setOpenNav(!openNav)}
        >
          {openNav ? (
            <XMarkIcon strokeWidth={2} className="h-6 w-6" />
          ) : (
            <Bars3Icon strokeWidth={2} className="h-6 w-6" />
          )}
        </IconButton>
      </div>
      
      <Collapse open={openNav}>
        <div className="container mx-auto mt-3 border-t border-white/10 pt-2">
          {navList}
          <div className="mt-4 mb-2">
             {React.cloneElement(action, {
                className: "w-full block lg:hidden",
             })}
          </div>
        </div>
      </Collapse>
    </MTNavbar>
  );
}

Navbar.defaultProps = {
  brandName: "AI Practice Platform",
  action: (
    <Link to="/auth/sign-in">
      <Button variant="gradient" size="sm" fullWidth className="from-blue-600 to-blue-400 shadow-blue-500/20">
        Sign In
      </Button>
    </Link>
  ),
};

Navbar.propTypes = {
  brandName: PropTypes.string,
  routes: PropTypes.arrayOf(PropTypes.object).isRequired,
  action: PropTypes.node,
};

Navbar.displayName = "/src/widgets/layout/navbar.jsx";

export default Navbar;