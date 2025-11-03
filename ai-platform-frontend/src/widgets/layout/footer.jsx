import PropTypes from "prop-types";
import { Typography } from "@material-tailwind/react";
// Removed HeartIcon import as it's no longer used

export function Footer({ brandName, brandLink, routes }) {
  const year = new Date().getFullYear();

  return (
    <footer className="py-2">
      <div className="flex w-full flex-wrap items-center justify-center gap-6 px-2 md:justify-between">
        <Typography variant="small" className="font-normal text-inherit">
          &copy; {year}, made by{" "}
          <a
            href={brandLink}
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-blue-500 font-bold"
          >
            {brandName}
          </a>
        </Typography>
        {/* The list of routes has been removed */}
      </div>
    </footer>
  );
}

Footer.defaultProps = {
  brandName: "Subarta Ghosh", // <-- UPDATED
  brandLink: "https://github.com/subh-ghosh",
  routes: [],
};

Footer.propTypes = {
  brandName: PropTypes.string,
  brandLink: PropTypes.string,
  routes: PropTypes.arrayOf(PropTypes.object),
};

Footer.displayName = "/src/widgets/layout/footer.jsx";
export default Footer;

