import {
  Input,
  Button,
  Typography,
  Alert,
  Spinner,
} from "@material-tailwind/react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "@/api";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import { GoogleLogin } from "@react-oauth/google";

export function SignUp() {
  const { theme } = useTheme();

  const location = useLocation();
  const googleData = location.state?.googleData;

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [isGoogleRegister, setIsGoogleRegister] = useState(false);
  const [googleSubmitting, setGoogleSubmitting] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();
  const { loginWithGoogle } = useAuth();
  const from = location.state?.from?.pathname || "/dashboard/home";

  useEffect(() => {
    if (googleData) {
      setFirstName(googleData.firstName || "");
      setLastName(googleData.lastName || "");
      setEmail(googleData.email || "");
      setIsGoogleRegister(true);
    }
  }, [googleData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!firstName || !lastName || !email || !password) {
      setError("All fields are required.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setSubmitting(true);

    try {
      await api.post("/api/students/register", {
        firstName,
        lastName,
        email,
        password,
      });
      navigate("/auth/sign-in", {
        state: {
          success: true,
          message: "Registration successful. Sign in to continue.",
        },
      });
    } catch (err) {
      if (err.response && err.response.status === 409) {
        setError("An account with this email already exists.");
      } else {
        console.error("Registration failed:", err);
        setError("Registration failed. Please try again.");
      }
    }
    setSubmitting(false);
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setGoogleSubmitting(true);
    setError("");
    const idToken = credentialResponse.credential;

    if (!idToken) {
      handleGoogleError();
      return;
    }

    const result = await loginWithGoogle(idToken);
    setGoogleSubmitting(false);

    if (result.success) {
      if (result.status === "LOGIN_SUCCESS") {
        navigate(from, { replace: true });
      } else if (result.status === "NEEDS_REGISTRATION") {
        navigate("/auth/sign-up", {
          replace: true,
          state: { googleData: result.registrationData },
        });
      }
    } else {
      if (typeof result.message === "object" && result.message !== null) {
        console.error("Backend error:", result.message);
        setError("An internal server error occurred. Please try again later.");
      } else {
        setError(result.message || "Google login failed.");
      }
    }
  };

  const handleGoogleError = () => {
    console.error("Google login error");
    setError("Google login failed. Please try again.");
    setGoogleSubmitting(false);
  };

  return (
    <section className="min-h-[calc(100vh-80px)] flex items-center justify-center gap-6 px-8">
      {/* Left Image */}
      <div className="hidden lg:flex w-2/5 justify-center">
        <img
          src="/img/pattern.png"
          className="w-full h-[80vh] object-cover rounded-3xl shadow-lg"
          alt="Pattern"
        />
      </div>

      {/* Right Form */}
      <div className="w-full lg:w-3/5 flex flex-col items-center justify-center h-[80vh]">
        <div className="text-center mb-6">
          <Typography variant="h2" className="font-bold mb-2 text-3xl md:text-4xl">
            {isGoogleRegister ? "Complete Your Registration" : "Join Us Today"}
          </Typography>
          <Typography
            variant="paragraph"
            color={theme === "dark" ? "white" : "blue-gray"}
            className="text-lg font-normal"
          >
            {isGoogleRegister
              ? "Please set a password for your account."
              : "Enter your details to register."}
          </Typography>
        </div>

        <form
          className="w-full max-w-[420px] flex flex-col gap-4"
          onSubmit={handleSubmit}
        >
          {error && <Alert color="red">{error}</Alert>}

          {isGoogleRegister && (
            <Alert color="blue">
              We've pre-filled your details from Google. Just set a password!
            </Alert>
          )}

          <div className="flex flex-col gap-3">
            <Input
              size="lg"
              label="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              color={theme === "dark" ? "white" : "gray"}
              disabled={isGoogleRegister}
            />

            <Input
              size="lg"
              label="Last Name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              color={theme === "dark" ? "white" : "gray"}
              disabled={isGoogleRegister}
            />

            <Input
              size="lg"
              type="email"
              label="Your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              color={theme === "dark" ? "white" : "gray"}
              disabled={isGoogleRegister}
            />

            <Input
              type="password"
              size="lg"
              label="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              color={theme === "dark" ? "white" : "gray"}
            />
          </div>

          <Button
            type="submit"
            className="mt-3"
            fullWidth
            variant={theme === "dark" ? "outlined" : "gradient"}
            color={theme === "dark" ? "white" : "blue"}
            disabled={submitting || googleSubmitting}
          >
            {isGoogleRegister
              ? submitting
                ? "Completing..."
                : "Complete Registration"
              : submitting
              ? "Registering..."
              : "Register Now"}
          </Button>

          {!isGoogleRegister && (
            <>
              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-gray-400"></div>
                <span className="flex-shrink mx-4 text-gray-400">OR</span>
                <div className="flex-grow border-t border-gray-400"></div>
              </div>

              <div className="flex justify-center">
                {googleSubmitting ? (
                  <Spinner className="h-8 w-8" />
                ) : (
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={handleGoogleError}
                    theme={theme === "dark" ? "filled_black" : "outline"}
                    shape="pill"
                    width="280px"
                    text="signup_with"
                  />
                )}
              </div>

              <Typography
                variant="paragraph"
                color={theme === "dark" ? "white" : "blue-gray"}
                className="text-center font-medium mt-2"
              >
                Already have an account?
                <Link
                  to="/auth/sign-in"
                  className="text-gray-900 dark:text-blue-400 ml-1"
                >
                  Sign in
                </Link>
              </Typography>
            </>
          )}
        </form>
      </div>
    </section>
  );
}

export default SignUp;
