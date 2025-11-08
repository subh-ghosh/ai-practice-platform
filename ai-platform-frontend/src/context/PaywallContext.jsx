import React, { createContext, useContext, useState } from "react";
import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Button,
  Typography
} from "@material-tailwind/react";
import { CreditCardIcon, XCircleIcon } from "@heroicons/react/24/solid";
import { useNavigate } from "react-router-dom";
import { useTheme } from "./ThemeContext"; // Import theme context

const PaywallContext = createContext();

export const PaywallProvider = ({ children }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { theme } = useTheme(); // Get current theme
  const navigate = useNavigate();

  const showPaywall = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleUpgrade = () => {
    closeModal();
    navigate("/dashboard/pricing");
  };

  return (
    <PaywallContext.Provider value={{ showPaywall }}>
      {children}

      {/* This is the Modal. It's hidden until `showPaywall()` is called.
        We add dark mode classes directly here.
      */}
      <Dialog
        open={isModalOpen}
        handler={closeModal}
        size="sm"
        className={theme === 'dark' ? "dark:bg-gray-800" : ""}
      >
        <DialogHeader className="justify-center">
          <Typography variant="h5" color="blue-gray" className="dark:text-gray-200">
            Free Limit Reached
          </Typography>
        </DialogHeader>
        <DialogBody divider className="text-center dark:border-gray-700">
          <XCircleIcon className="w-20 h-20 text-red-500 mx-auto mb-4" />
          <Typography variant="lead" color="blue-gray" className="font-normal mb-2 dark:text-gray-300">
            You have used all 10 of your free actions.
          </Typography>
          <Typography color="blue-gray" className="font-normal dark:text-gray-400">
            Please upgrade to a Premium Plan to continue generating and evaluating questions.
          </Typography>
        </DialogBody>
        <DialogFooter className="gap-2 dark:border-t dark:border-gray-700">
          <Button
            variant="text"
            color="blue-gray"
            onClick={closeModal}
            className="dark:text-gray-300"
          >
            <span>Maybe Later</span>
          </Button>
          <Button
            variant="gradient"
            color="blue"
            className="flex items-center gap-2"
            onClick={handleUpgrade}
          >
            <CreditCardIcon className="w-5 h-5" />
            Upgrade Now
          </Button>
        </DialogFooter>
      </Dialog>
    </PaywallContext.Provider>
  );
};

export const usePaywall = () => useContext(PaywallContext);