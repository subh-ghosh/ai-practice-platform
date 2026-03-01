import PropTypes from "prop-types";
import { Typography } from "@material-tailwind/react";
import { Link } from "react-router-dom";

export function Footer({ brandName, brandLink }) {
  const year = new Date().getFullYear();

  const footerRoutes = [
    { name: "Home", path: "/" },
    { name: "About Us", path: "/about" },
    { name: "Contact", path: "/contact" },
  ];

  return (
    <footer className="w-full py-8 px-5 md:px-8 bg-white dark:bg-[#030303] border-t border-gray-200 dark:border-white/5">
      <div className="container mx-auto flex flex-col items-center gap-5 md:flex-row md:justify-between">

        {/* Copyright Section */}
        <Typography variant="small" className="font-normal text-gray-500 dark:text-slate-500 text-center md:text-left text-xs">
          &copy; {year}, made by{" "}
          <a
            href={brandLink}
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-blue-500 font-bold text-gray-700 dark:text-slate-400"
          >
            {brandName}
          </a>
        </Typography>

        {/* Links Section */}
        <ul className="flex flex-row items-center gap-6 md:gap-8">
          {footerRoutes.map(({ name, path }) => (
            <li key={name}>
              <Link
                to={path}
                className="block py-2 font-medium text-sm text-gray-500 transition-colors hover:text-blue-500 dark:text-slate-500 dark:hover:text-blue-400"
              >
                {name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}

Footer.defaultProps = {
  brandName: "Subarta Ghosh",
  brandLink: "https://github.com/subh-ghosh",
};

Footer.propTypes = {
  brandName: PropTypes.string,
  brandLink: PropTypes.string,
};

Footer.displayName = "/src/widgets/layout/footer.jsx";

export default Footer;