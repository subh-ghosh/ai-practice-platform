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
import { useNavigate } from "react-router-dom"; // Import useNavigate for redirection

// ⚠️ --- IMPORTANT --- ⚠️
// This ID must match the key in your backend's "PLANS" map
const PREMIUM_MONTHLY_PLAN_ID = "premium_monthly";

export function Pricing() {
  const { user, updateUser } = useAuth(); // 👈 --- GET THE updateUser FUNCTION ---
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
      // 1. Create an order on your backend
      const { data: orderResponse } = await api.post("/api/payments/create-order", {
        productId: PREMIUM_MONTHLY_PLAN_ID,
      });

      // 2. Configure Razorpay options
      const options = {
        key: orderResponse.keyId,
        amount: orderResponse.amount,
        currency: orderResponse.currency,
        name: "AI Practice Platform",
        description: "Premium Monthly Plan",
        order_id: orderResponse.orderId,

        // --- 👇 THIS IS THE UPDATED HANDLER ---
        handler: async function (response) {
          setLoading(true);
          try {
            // 3. Verify the payment, the backend returns the *updated StudentDto*
            const { data: updatedUserDto } = await api.post("/api/payments/verify-payment", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            // 4. Payment verified! Update the user context immediately.
            updateUser(updatedUserDto);

            setSuccess("Payment successful! Your account has been upgraded.");

            // 5. Redirect to home
            setTimeout(() => {
              navigate("/dashboard/home");
            }, 2000);

          } catch (verifyErr) {
            console.error("Payment verification failed:", verifyErr);
            setError("Payment verification failed. Please contact support.");
            setLoading(false);
          }
          // Note: setLoading(false) is handled inside the success/error paths
        },
        // --- 👆 END OF UPDATED HANDLER ---

        prefill: {
          name: orderResponse.studentName,
          email: orderResponse.studentEmail,
        },
        theme: {
          color: "#3B82F6",
        },
      };

      // 4. Open the Razorpay payment modal
      const rzp = new window.Razorpay(options);
      rzp.open();

      rzp.on("payment.failed", function (response) {
        console.error("Razorpay payment failed:", response.error);
        setError(`Payment failed: ${response.error.description || response.error.reason}`);
        setLoading(false); // Stop loading on failure
      });

    } catch (err) {
      console.error("Error creating order:", err);
      setError("Could not initiate payment. Please try again.");
      setLoading(false); // Stop loading on failure
    }

    // Don't set loading to false here, as the modal is now open
  };

  return (
    <div className="mt-12">
      <Typography variant="h3" color="blue-gray" className="mb-8 text-center">
        Choose Your Plan
      </Typography>

      {error && <Alert color="red" className="mb-6 max-w-4xl mx-auto">{error}</Alert>}
      {success && <Alert color="green" className="mb-6 max-w-4xl mx-auto">{success}</Alert>}

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 max-w-4xl mx-auto">
        {/* --- FREE PLAN CARD --- */}
        <Card className="border border-blue-gray-100 shadow-sm dark:bg-gray-800 dark:border-gray-700">
          <CardBody className="p-8 text-center">
            <Typography variant="h5" color="blue-gray" className="mb-2">
              Free Plan
            </Typography>
            <Typography variant="h2" color="blue-gray" className="mb-4">
              ₹0
              <span className="text-lg font-normal">/ month</span>
            </Typography>
            <ul className="flex flex-col gap-3 my-6">
              <li className="flex items-center justify-center gap-2">
                <CheckCircleIcon className="w-5 h-5 text-green-500" />
                <span className="text-blue-gray-700 dark:text-gray-300">10 Free Generations</span>
              </li>
              <li className="flex items-center justify-center gap-2">
                <CheckCircleIcon className="w-5 h-5 text-green-500" />
                <span className="text-blue-gray-700 dark:text-gray-300">10 Free Evaluations</span>
              </li>
              <li className="flex items-center justify-center gap-2">
                <XCircleIcon className="w-5 h-5 text-red-500" />
                <span className="text-blue-gray-700 dark:text-gray-300 line-through">Unlimited Access</span>
              </li>
            </ul>
            {/* --- 👇 UPDATE THIS BUTTON --- */}
            <Button
              variant="outlined"
              color="blue-gray"
              disabled={user?.subscriptionStatus === "FREE"}
            >
              {user?.subscriptionStatus === "FREE" ? "Your Current Plan" : "Select Plan"}
            </Button>
            {/* --- 👆 END OF UPDATE --- */}
          </CardBody>
        </Card>

        {/* --- PREMIUM PLAN CARD --- */}
        <Card className="border-2 border-blue-500 shadow-lg dark:bg-gray-800 dark:border-blue-400">
          <CardBody className="p-8 text-center">
            <Typography variant="h5" color="blue" className="mb-2">
              Premium Plan
            </Typography>
            <Typography variant="h2" color="blue-gray" className="mb-4">
              ₹199
              <span className="text-lg font-normal">/ month</span>
            </Typography>
            <ul className="flex flex-col gap-3 my-6">
              <li className="flex items-center justify-center gap-2">
                <CheckCircleIcon className="w-5 h-5 text-green-500" />
                <span className="text-blue-gray-700 dark:text-gray-300">Unlimited Generations</span>
              </li>
              <li className="flex items-center justify-center gap-2">
                <CheckCircleIcon className="w-5 h-5 text-green-500" />
                <span className="text-blue-gray-700 dark:text-gray-300">Unlimited Evaluations</span>
              </li>
              <li className="flex items-center justify-center gap-2">
                <CheckCircleIcon className="w-5 h-5 text-green-500" />
                <span className="text-blue-gray-700 dark:text-gray-300">Unlimited Access</span>
              </li>
            </ul>
            {/* --- 👇 UPDATE THIS BUTTON --- */}
            <Button
              variant="gradient"
              color={user?.subscriptionStatus === "PREMIUM" ? "green" : "blue"}
              onClick={displayRazorpay}
              disabled={loading || user?.subscriptionStatus === "PREMIUM"}
            >
              {loading ? <Spinner className="h-4 w-4" /> : (user?.subscriptionStatus === "PREMIUM" ? "Your Current Plan" : "Upgrade Now")}
            </Button>
            {/* --- 👆 END OF UPDATE --- */}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

export default Pricing;