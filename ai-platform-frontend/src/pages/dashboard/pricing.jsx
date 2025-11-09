import React, { useState } from "react";
import {
  Card,
  CardBody,
  Typography,
  Button,
  Spinner,
  Alert,
} from "@material-tailwind/react";
import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/solid";
import api from "@/api";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";

const PREMIUM_MONTHLY_PLAN_ID = "premium_monthly";

export function Pricing() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const displayRazorpay = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (!window.Razorpay) {
      setError("Razorpay SDK failed to load. Please check your internet connection.");
      setLoading(false);
      return;
    }

    try {
      const { data: orderResponse } = await api.post("/api/payments/create-order", {
        productId: PREMIUM_MONTHLY_PLAN_ID,
      });

      const options = {
        key: orderResponse.keyId,
        amount: orderResponse.amount,
        currency: orderResponse.currency,
        name: "AI Practice Platform",
        description: "Premium Monthly Plan",
        order_id: orderResponse.orderId,
        handler: async function (response) {
          setLoading(true);
          try {
            const { data: updatedUserDto } = await api.post("/api/payments/verify-payment", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            updateUser(updatedUserDto);
            setSuccess("Payment successful! Your account has been upgraded.");
            setTimeout(() => navigate("/dashboard/home"), 2000);
          } catch (verifyErr) {
            console.error("Payment verification failed:", verifyErr);
            setError("Payment verification failed. Please contact support.");
            setLoading(false);
          }
        },
        prefill: {
          name: orderResponse.studentName,
          email: orderResponse.studentEmail,
        },
        theme: { color: "#3B82F6" }, // blue-500
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
      rzp.on("payment.failed", function (response) {
        console.error("Razorpay payment failed:", response.error);
        setError(`Payment failed: ${response.error.description || response.error.reason}`);
        setLoading(false);
      });
    } catch (err) {
      console.error("Error creating order:", err);
      setError("Could not initiate payment. Please try again.");
      setLoading(false);
    }
  };

  return (
    <section
      className="
        relative isolate overflow-x-hidden
        -mx-4 md:-mx-6 lg:-mx-8 px-4 md:px-6 lg:px-8
        min-h-[calc(100vh-4rem)] pb-12  /* fills at least one screen */
        flex
      "
    >
      {/* Background: bluish gradient + soft glows */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-blue-50 via-sky-100 to-blue-200 dark:from-gray-900 dark:via-blue-950 dark:to-gray-900 transition-all duration-700" />
      <div className="pointer-events-none absolute -top-10 right-[8%] h-72 w-72 rounded-full bg-sky-300/30 dark:bg-sky-600/30 blur-3xl" />
      <div className="pointer-events-none absolute top-36 -left-10 h-80 w-80 rounded-full bg-blue-300/25 dark:bg-blue-700/25 blur-3xl" />

      {/* Centered column that expands to fill height */}
      <div className="mt-8 page w-full flex flex-col items-center">
        {/* Header */}
        <div className="w-full max-w-5xl text-center">
          <Typography variant="h4" color="blue-gray" className="mb-3 font-bold dark:text-gray-100">
            Choose Your Plan
          </Typography>
          <Typography
            variant="paragraph"
            color="blue-gray"
            className="text-base mb-6 dark:text-gray-300"
          >
            Pick a plan that fits your learning goals. Upgrade anytime to unlock unlimited access.
          </Typography>
        </div>

        {/* Alerts */}
        <div className="w-full max-w-5xl">
          {error && <Alert color="red" className="mb-4">{error}</Alert>}
          {success && <Alert color="green" className="mb-4">{success}</Alert>}
        </div>

        {/* Plans */}
        <div className="w-full max-w-5xl grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Free */}
          <Card className="rounded-3xl border border-blue-100/60 dark:border-gray-700 bg-white/90 dark:bg-gray-800/80 backdrop-blur-md shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
            <CardBody className="p-6 md:p-8 text-center">
              <Typography variant="h6" color="blue" className="mb-1 font-semibold">
                Free Plan
              </Typography>
              <Typography variant="h3" color="blue-gray" className="mb-3 dark:text-gray-100">
                ₹0 <span className="text-base font-normal">/ month</span>
              </Typography>
              <ul className="flex flex-col gap-2 my-5 text-blue-gray-700 dark:text-gray-300">
                <li className="flex items-center justify-center gap-2">
                  <CheckCircleIcon className="w-5 h-5 text-green-500" />
                  10 Free Generations
                </li>
                <li className="flex items-center justify-center gap-2">
                  <CheckCircleIcon className="w-5 h-5 text-green-500" />
                  10 Free Evaluations
                </li>
                <li className="flex items-center justify-center gap-2">
                  <XCircleIcon className="w-5 h-5 text-red-500" />
                  <span className="line-through opacity-60">Unlimited Access</span>
                </li>
              </ul>
              <Button
                variant="outlined"
                color="blue"
                className="w-full md:w-auto rounded-full"
                disabled={user?.subscriptionStatus === "FREE"}
              >
                {user?.subscriptionStatus === "FREE" ? "Your Current Plan" : "Select Plan"}
              </Button>
            </CardBody>
          </Card>

          {/* Premium */}
          <Card className="relative overflow-hidden rounded-3xl border border-blue-200/70 dark:border-blue-700 bg-gradient-to-br from-blue-100 via-sky-200 to-blue-300 dark:from-gray-800 dark:via-blue-900/70 dark:to-gray-800 backdrop-blur-lg shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-tr from-sky-300/40 to-blue-500/10 dark:from-sky-400/20 dark:to-blue-600/20 blur-2xl rounded-3xl -z-10" />
            <CardBody className="p-6 md:p-8 text-center">
              <Typography variant="h6" color="blue" className="mb-1 font-semibold">
                Premium Plan
              </Typography>
              <Typography variant="h3" color="blue-gray" className="mb-3 dark:text-gray-100">
                ₹199 <span className="text-base font-normal">/ month</span>
              </Typography>
              <ul className="flex flex-col gap-2 my-5 text-blue-gray-700 dark:text-gray-300">
                <li className="flex items-center justify-center gap-2">
                  <CheckCircleIcon className="w-5 h-5 text-green-500" />
                  Unlimited Generations
                </li>
                <li className="flex items-center justify-center gap-2">
                  <CheckCircleIcon className="w-5 h-5 text-green-500" />
                  Unlimited Evaluations
                </li>
                <li className="flex items-center justify-center gap-2">
                  <CheckCircleIcon className="w-5 h-5 text-green-500" />
                  Unlimited Access
                </li>
              </ul>
              <Button
                variant="gradient"
                color="blue"
                className="w-full md:w-auto rounded-full"
                onClick={displayRazorpay}
                disabled={loading || user?.subscriptionStatus === "PREMIUM"}
              >
                {loading ? (
                  <Spinner className="h-4 w-4" />
                ) : user?.subscriptionStatus === "PREMIUM" ? (
                  "Your Current Plan"
                ) : (
                  "Upgrade Now"
                )}
              </Button>
            </CardBody>
          </Card>
        </div>
      </div>
    </section>
  );
}

export default Pricing;
