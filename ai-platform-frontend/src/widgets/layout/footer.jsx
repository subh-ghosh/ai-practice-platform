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
    // 👇 REMOVED 'mt-auto' to fix the gap issue
    <footer className="w-full py-6 px-4 md:px-8 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
      <div className="container mx-auto flex flex-col items-center justify-center gap-6 md:flex-row md:justify-between">
        
        {/* Copyright Section */}
        <Typography variant="small" className="font-normal text-gray-600 dark:text-gray-400 text-center md:text-left">
          &copy; {year}, made by{" "}
          <a
            href={brandLink}
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-blue-500 font-bold text-gray-800 dark:text-gray-200"
          >
            {brandName}
          </a>
        </Typography>

        {/* Links Section */}
        {/* 👇 MOBILE FIX: 'flex-col' for vertical stack on mobile, 'md:flex-row' for desktop */}
        <ul className="flex flex-col items-center gap-2 md:flex-row md:gap-8">
          {footerRoutes.map(({ name, path }) => (
            <li key={name}>
              <Link
                to={path}
                // 👇 MOBILE FIX: Added 'py-2' for easier clicking on mobile
                className="block py-2 md:py-0 font-medium text-sm text-gray-600 transition-colors hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400"
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