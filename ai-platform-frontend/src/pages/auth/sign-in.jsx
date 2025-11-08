import {
  Input,
  Button,
  Typography,
  Alert,
  Spinner,
} from "@material-tailwind/react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { GoogleLogin } from "@react-oauth/google";

export function SignIn() {
  const { theme } = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [googleSubmitting, setGoogleSubmitting] = useState(false);

  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/dashboard/home";

  useEffect(() => {
    if (location.state?.success) {
      setSuccess(location.state.message);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!email.trim() || !password.trim()) {
      setError("Please enter both email and password.");
      return;
    }

    setSubmitting(true);
    const result = await login(email, password);
    setSubmitting(false);

    if (result?.success) {
      navigate(from, { replace: true });
    } else {
      setError(result?.message || "Invalid email or password.");
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setGoogleSubmitting(true);
    setError("");
    setSuccess("");
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
      {/* Left Form */}
      <div className="w-full lg:w-3/5 flex flex-col items-center justify-center h-[80vh]">
        <div className="text-center mb-6">
          <Typography variant="h2" className="font-bold mb-2 text-3xl md:text-4xl">
            Sign In
          </Typography>
          <Typography
            variant="paragraph"
            color={theme === "dark" ? "white" : "blue-gray"}
            className="text-lg font-normal"
          >
            Enter your email and password to sign in.
          </Typography>
        </div>

        <form
          onSubmit={handleSubmit}
          className="w-full max-w-[420px] flex flex-col gap-4"
        >
          {success && <Alert color="green">{success}</Alert>}
          {error && <Alert color="red">{error}</Alert>}

          <div className="flex flex-col gap-3">
            <Input
              size="lg"
              type="email"
              label="Your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              color={theme === "dark" ? "white" : "gray"}
              autoComplete="email"
            />

            <Input
              size="lg"
              type="password"
              label="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              color={theme === "dark" ? "white" : "gray"}
              autoComplete="current-password"
            />
          </div>

          <Button
            type="submit"
            className="mt-3"
            fullWidth
            disabled={submitting || googleSubmitting}
            variant={theme === "dark" ? "outlined" : "gradient"}
            color={theme === "dark" ? "white" : "blue"}
          >
            {submitting ? "Signing in..." : "Sign In"}
          </Button>

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
                text="signin_with"
              />
            )}
          </div>

          <Typography
            variant="paragraph"
            color={theme === "dark" ? "white" : "blue-gray"}
            className="text-center font-medium mt-2"
          >
            Not registered?
            <Link to="/auth/sign-up" className="text-gray-900 dark:text-blue-400 ml-1">
              Create account
            </Link>
          </Typography>
        </form>
      </div>

      {/* Right Image */}
      <div className="hidden lg:flex w-2/5 justify-center">
        <img
          src="/img/pattern.png"
          alt="Pattern"
          className="w-full h-[80vh] object-cover rounded-3xl shadow-lg"
        />
      </div>
    </section>
  );
}

export default SignIn;
