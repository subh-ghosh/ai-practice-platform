import React from "react";
import {
  Card,
  CardBody,
  Typography,
} from "@material-tailwind/react";
import { PhoneIcon, EnvelopeIcon } from "@heroicons/react/24/solid";

export function Contact() {
  return (
    <div className="bg-white dark:bg-gray-800 py-12 px-4">
      <div className="container mx-auto max-w-lg">
        <div className="mb-12 text-center">
          <Typography variant="h2" color="blue-gray" className="mb-4 dark:text-gray-100">
            Contact Me
          </Typography>
          <Typography variant="lead" color="blue-gray" className="dark:text-gray-300">
            You can reach me directly via email or phone.
          </Typography>
        </div>

        <Card className="dark:bg-gray-900 shadow-none">
          <CardBody>
            <div className="flex flex-col gap-6">
              {/* Email Link */}
              <a href="mailto:subartaghosh6@gmail.com" className="flex items-center gap-4 p-4 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <div className="grid h-12 w-12 place-items-center rounded-full bg-blue-500 text-white">
                  <EnvelopeIcon className="w-6 h-6" />
                </div>
                <div>
                  <Typography variant="h6" color="blue-gray" className="dark:text-gray-200">
                    Email
                  </Typography>
                  <Typography color="blue-gray" className="font-normal dark:text-gray-400">
                    subartaghosh6@gmail.com
                  </Typography>
                </div>
              </a>

              {/* Phone Link */}
              <a href="tel:+917319591361" className="flex items-center gap-4 p-4 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <div className="grid h-12 w-12 place-items-center rounded-full bg-blue-500 text-white">
                  <PhoneIcon className="w-6 h-6" />
                </div>
                <div>
                  <Typography variant="h6" color="blue-gray" className="dark:text-gray-200">
                    Phone
                  </Typography>
                  <Typography color="blue-gray" className="font-normal dark:text-gray-400">
                    +91 73195 91361
                  </Typography>
                </div>
              </a>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

export default Contact;