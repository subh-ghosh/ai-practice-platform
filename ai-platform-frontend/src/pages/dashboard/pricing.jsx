import React, { useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "@/config";
import {
  Typography,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Button,
  Tabs,
  TabsHeader,
  Tab,
  Chip,
  Spinner,
  Alert,
} from "@material-tailwind/react";
import {
  CheckIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/solid";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";

// --- Constants & Helpers ---

const PREMIUM_MONTHLY_PLAN_ID = "premium_monthly";
const BASE_URL = API_BASE_URL.replace(/\/api$/, "");

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

// --- Animation Variants ---

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 300, damping: 24 },
  },
};

// --- Main Component ---

export function Pricing() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  const [billingCycle, setBillingCycle] = useState("monthly");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // --- Payment Logic ---

  const displayRazorpay = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    // 1. Ensure Script is Loaded
    const res = await loadRazorpayScript();
    if (!res) {
      setError("Razorpay SDK failed to load. Check your internet connection.");
      setLoading(false);
      return;
    }

    // 2. Get Token
    const token = localStorage.getItem("token");
    if (!token) {
      setError("You must be logged in to upgrade.");
      setLoading(false);
      return;
    }

    const config = {
      headers: { Authorization: `Bearer ${token}` },
    };

    try {
      // 3. Create Order
      const orderRes = await axios.post(
        `${BASE_URL}/api/payments/create-order`,
        { productId: PREMIUM_MONTHLY_PLAN_ID },
        config
      );

      const orderData = orderRes.data;

      // 4. Open Razorpay
      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "AI Practice Platform",
        description: "Premium Plan Upgrade",
        order_id: orderData.orderId,

        // --- Success Handler ---
        handler: async function (response) {
          // Keep loading true while we verify backend
          try {
            const verifyRes = await axios.post(
              `${BASE_URL}/api/payments/verify-payment`,
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              },
              config
            );

            if (updateUser) {
              updateUser(verifyRes.data);
            }

            setSuccess("Payment successful! Your account has been upgraded.");
            setLoading(false); // Stop loading on success
            setTimeout(() => navigate("/dashboard/home"), 2000);
          } catch (verifyErr) {
            console.error("Payment verification failed:", verifyErr);
            setError("Payment verification failed. Please contact support.");
            setLoading(false); // Stop loading on error
          }
        },

        // --- User Close Handler ---
        modal: {
          ondismiss: function () {
            console.log("Payment modal closed by user");
            setLoading(false);
          },
        },

        prefill: {
          name: orderData.studentName,
          email: orderData.studentEmail,
        },
        theme: { color: "#3B82F6" },
      };

      const rzp = new window.Razorpay(options);

      // --- Failure Handler ---
      rzp.on("payment.failed", function (response) {
        console.error("Razorpay payment failed:", response.error);
        setError(
          `Payment failed: ${response.error.description || "Unknown error"}`
        );
        setLoading(false); // Stop loading on failure
      });

      rzp.open();
    } catch (err) {
      console.error("Error creating order:", err);
      setError("Could not initiate payment. Please try again.");
      setLoading(false);
    }
  };

  // --- Plan Definitions ---

  const PLANS = [
    {
      id: "free",
      name: "Starter",
      price: { monthly: 0, yearly: 0 },
      description: "Essential tools for casual learners.",
      features: [
        { text: "10 Free Generations", included: true },
        { text: "10 Free Evaluations", included: true },
        { text: "Basic Analytics", included: true },
        { text: "Unlimited Access", included: false },
      ],
      popular: false,
      isPremium: false,
    },
    {
      id: "premium",
      name: "Pro Scholar",
      price: { monthly: 199, yearly: 1999 },
      description: "Advanced AI tools for serious prep.",
      features: [
        { text: "Unlimited Generations", included: true },
        { text: "Unlimited Evaluations", included: true },
        { text: "Advanced Analytics", included: true },
        { text: "Unlimited Access", included: true },
      ],
      popular: true,
      isPremium: true,
    },
  ];

  // --- Render ---

  return (
    // Updated container height to h-[calc(100vh-140px)] and added flex-col
    <div className="relative mt-6 mb-8 w-full h-[calc(100vh-140px)] flex flex-col overflow-hidden rounded-xl border border-blue-gray-50 dark:border-gray-800 shadow-sm bg-white dark:bg-gray-900">

      {/* Animated Background Gradient */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{ x: [0, 30, 0], y: [0, -30, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 15, repeat: Infinity, repeatType: "reverse" }}
          className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-400/5 blur-[100px]"
        />
        <motion.div
          animate={{ x: [0, -30, 0], y: [0, 30, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 18, repeat: Infinity, repeatType: "reverse" }}
          className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-400/5 blur-[100px]"
        />
      </div>

      {/* Main Content Wrapper */}
      <div className="relative z-10 p-6 flex flex-col gap-5 h-full">

        {/* Header & Controls */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 shrink-0">
          <div>
            <Typography
              variant="h5"
              color="blue-gray"
              className="dark:text-white font-bold tracking-tight"
            >
              Subscription Plans
            </Typography>
            <Typography
              variant="small"
              className="text-gray-500 dark:text-gray-400 font-normal mt-1"
            >
              Pick a plan that fits your learning goals.
            </Typography>
          </div>

          <div className="w-full md:w-64">
            <Tabs value={billingCycle} className="w-full">
              <TabsHeader
                className="bg-gray-100/50 dark:bg-gray-800/70 p-1 border border-gray-200 dark:border-gray-700"
                indicatorProps={{
                  className: "bg-white dark:bg-gray-700 shadow-sm",
                }}
              >
                <Tab
                  value="monthly"
                  onClick={() => setBillingCycle("monthly")}
                  className="text-xs font-bold py-2"
                >
                  Monthly
                </Tab>
                <Tab
                  value="yearly"
                  onClick={() => setBillingCycle("yearly")}
                  className="text-xs font-bold py-2"
                >
                  Yearly <span className="text-[9px] text-green-500 ml-1">(-15%)</span>
                </Tab>
              </TabsHeader>
            </Tabs>
          </div>
        </div>

        {/* Alerts Area */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <Alert color="red" icon={<ExclamationTriangleIcon className="h-5 w-5" />}>
                {error}
              </Alert>
            </motion.div>
          )}
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <Alert color="green" icon={<CheckCircleIcon className="h-5 w-5" />}>
                {success}
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto pr-2 pb-6 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&::-webkit-scrollbar-thumb]:bg-gray-800 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-gray-400">

          {/* Plans Grid */}
          <motion.div
            key={billingCycle}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 pt-2 max-w-4xl mx-auto"
          >
            {PLANS.map((plan) => {
              const isCurrentPlan =
                (plan.id === "free" && user?.subscriptionStatus === "FREE") ||
                (plan.id === "premium" && user?.subscriptionStatus === "PREMIUM");

              const isUpgradable = !isCurrentPlan && plan.isPremium;

              return (
                <motion.div key={plan.id} variants={itemVariants} layout>
                  <Card
                    className={`h-full border transition-all duration-300 ${plan.popular
                        ? "border-blue-500 shadow-blue-100 dark:shadow-none dark:border-blue-600 bg-white dark:bg-gray-800 relative"
                        : "border-blue-gray-50 dark:border-gray-800 bg-white/60 dark:bg-gray-900/40 backdrop-blur-sm hover:border-blue-200"
                      }`}
                  >
                    {plan.popular && (
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                        <Chip
                          value="Recommended"
                          size="sm"
                          color="blue"
                          className="rounded-full shadow-sm"
                        />
                      </div>
                    )}

                    <CardHeader
                      floated={false}
                      shadow={false}
                      color="transparent"
                      className="m-0 p-6 pb-2 text-center border-b border-blue-gray-50 dark:border-gray-700/50"
                    >
                      <Typography
                        variant="h6"
                        color="blue-gray"
                        className="font-bold uppercase dark:text-gray-100"
                      >
                        {plan.name}
                      </Typography>
                      <Typography
                        variant="h1"
                        color="blue-gray"
                        className="mt-4 flex justify-center gap-1 text-4xl font-normal dark:text-white"
                      >
                        <span className="mt-2 text-xl">₹</span>
                        {plan.price[billingCycle]}
                        <span className="self-end text-xl text-gray-500 dark:text-gray-400">
                          /{billingCycle === "monthly" ? "mo" : "yr"}
                        </span>
                      </Typography>
                      <Typography className="font-normal text-gray-500 dark:text-gray-400 mt-2 text-sm">
                        {plan.description}
                      </Typography>
                    </CardHeader>

                    <CardBody className="p-6">
                      <ul className="flex flex-col gap-3">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-center gap-3">
                            <span
                              className={`p-1 rounded-full ${feature.included
                                  ? "bg-green-50 text-green-500 dark:bg-green-900/20"
                                  : "bg-red-50 text-red-500 dark:bg-red-900/20"
                                }`}
                            >
                              {feature.included ? (
                                <CheckIcon strokeWidth={3} className="h-3 w-3" />
                              ) : (
                                <XMarkIcon strokeWidth={3} className="h-3 w-3" />
                              )}
                            </span>
                            <Typography
                              className={`text-sm font-normal ${feature.included
                                  ? "text-blue-gray-600 dark:text-gray-300"
                                  : "text-gray-400 decoration-line-through"
                                }`}
                            >
                              {feature.text}
                            </Typography>
                          </li>
                        ))}
                      </ul>
                    </CardBody>

                    <CardFooter className="mt-auto p-6 pt-0">
                      <Button
                        size="lg"
                        fullWidth={true}
                        variant={plan.popular ? "gradient" : "outlined"}
                        color={plan.popular ? "blue" : "gray"}
                        className={`hover:scale-[1.02] active:scale-[0.98] transition-transform ${!plan.popular
                            ? "focus:ring-blue-gray-200 dark:border-gray-600 dark:text-white"
                            : ""
                          }`}
                        onClick={isUpgradable ? displayRazorpay : undefined}
                        disabled={isCurrentPlan || (plan.isPremium && loading)}
                      >
                        {loading && plan.isPremium ? (
                          <div className="flex items-center justify-center gap-2">
                            <Spinner className="h-4 w-4" /> Processing...
                          </div>
                        ) : isCurrentPlan ? (
                          "Current Plan"
                        ) : (
                          "Upgrade Now"
                        )}
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default Pricing;