// src/widgets/cards/profile-info-card.jsx
import React from "react";
import PropTypes from "prop-types";
import { Card, CardHeader, CardBody, Typography } from "@material-tailwind/react";

export function ProfileInfoCard({ title, description, details, action }) {
  const hasDescription = Boolean(description);
  const hasDetails = details && Object.keys(details || {}).length > 0;

  return (
    <Card
      shadow={false}
      className="
        overflow-hidden rounded-2xl
        ring-1 ring-black/5 dark:ring-white/5
        bg-white/90 dark:bg-gray-800/80
        backdrop-blur-md
      "
    >
      <CardHeader
        color="transparent"
        shadow={false}
        floated={false}
        className="mx-0 mt-0 mb-1 flex items-center justify-between gap-4 px-6 md:px-8 py-3"
      >
        <Typography
          variant="h6"
          color="blue-gray"
          className="dark:text-gray-100 text-base md:text-lg font-semibold"
        >
          {title}
        </Typography>
        {action}
      </CardHeader>

      {/* tighter padding and closer spacing */}
      <CardBody className="px-6 md:px-8 py-5 md:py-6 space-y-4">
        {hasDescription && (
          <Typography
            variant="small"
            className="font-normal text-blue-gray-600 dark:text-gray-300 leading-relaxed text-sm"
          >
            {description}
          </Typography>
        )}

        {hasDetails && (
          <ul className={`flex flex-col gap-3 ${hasDescription ? "mt-3" : "mt-1"}`}>
            {Object.keys(details).map((label) => (
              <li
                key={label}
                className="flex flex-col sm:flex-row sm:items-start sm:gap-6 text-[13px] md:text-sm"
              >
                {/* lighter label (no bold), slightly smaller, muted color */}
                <Typography
                  variant="small"
                  color="blue-gray"
                  className="min-w-[110px] shrink-0 font-medium text-blue-gray-600 dark:text-gray-300 capitalize"
                >
                  {label}:
                </Typography>

                {typeof details[label] === "string" ? (
                  <Typography
                    variant="small"
                    className="font-normal text-blue-gray-700 dark:text-gray-100 text-[13px] md:text-sm"
                  >
                    {details[label] || "—"}
                  </Typography>
                ) : (
                  details[label]
                )}
              </li>
            ))}
          </ul>
        )}
      </CardBody>
    </Card>
  );
}

ProfileInfoCard.defaultProps = {
  action: null,
  description: null,
  details: {},
};

ProfileInfoCard.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.node,
  details: PropTypes.object,
  action: PropTypes.node,
};

ProfileInfoCard.displayName = "/src/widgets/cards/profile-info-card.jsx";

export default ProfileInfoCard;
