import {
  Card,
  Input,
  Button,
  Typography,
  Alert,
  Spinner,
} from "@material-tailwind/react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react"; // 👈 --- ADD useEffect
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { GoogleLogin } from "@react-oauth/google";

export function SignIn() {
  const { theme } = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(""); // 👈 --- ADD THIS
  const [submitting, setSubmitting] = useState(false);
  const [googleSubmitting, setGoogleSubmitting] = useState(false);

  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/dashboard/home";

  // 👇 --- ADD THIS useEffect TO READ THE SUCCESS MESSAGE ---
  useEffect(() => {
    if (location.state?.success) {
      setSuccess(location.state.message);
      // Clear the state from history so it doesn't reappear on back/forward
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(""); // 👈 --- Clear success message on new submit
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
    setSuccess(""); // 👈 --- Clear success message on new submit
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
          state: { googleData: result.registrationData }
        });
      }
    } else {
      if (typeof result.message === 'object' && result.message !== null) {
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
    <section className="m-8 flex min-h-[80vh] items-center gap-6">
      {/* left – form */}
      <div className="w-full lg:w-3/5 flex flex-col items-center justify-center">
        <div className="text-center">
          <Typography variant="h2" className="font-bold mb-2">
            Sign In
          </Typography>
          <Typography
            variant="paragraph"
            color={theme === 'dark' ? 'white' : 'blue-gray'}
            className="text-lg font-normal"
          >
            Enter your email and password to Sign In.
          </Typography>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-8 mb-2 mx-auto w-80 max-w-screen-lg lg:w-1/2"
        >
          {/* 👇 --- ADD THIS SUCCESS ALERT --- */}
          {success && (
            <Alert color="green" className="mb-4">
              {success}
            </Alert>
          )}

          {error && (
            <Alert color="red" className="mb-4">
              {error}
            </Alert>
          )}

          <div className="mb-1 flex flex-col gap-6">
            <div>
              <Typography
                variant="small"
                color={theme === 'dark' ? 'white' : 'blue-gray'}
                className="-mb-3 font-medium"
              >
                Your email
              </Typography>
              <Input
                size="lg"
                placeholder="name@mail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                labelProps={{ className: "before:content-none after:content-none" }}
                color={theme === 'dark' ? 'white' : 'gray'}
              />
            </div>

            <div>
              <Typography
                variant="small"
                color={theme === 'dark' ? 'white' : 'blue-gray'}
                className="-mb-3 font-medium"
              >
                Password
              </Typography>
              <Input
                size="lg"
                type="password"
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                labelProps={{ className: "before:content-none after:content-none" }}
                color={theme === 'dark' ? 'white' : 'gray'}
              />
            </div>
          </div>

          <Button
            type="submit"
            className="mt-6"
            fullWidth
            disabled={submitting || googleSubmitting}
            variant={theme === 'dark' ? 'outlined' : 'gradient'}
            color={theme === 'dark' ? 'white' : 'blue'}
          >
            {submitting ? "Signing in..." : "Sign In"}
          </Button>

          {/* ... (rest of the file) ... */}
          <div className="relative flex py-5 items-center">
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
                theme={theme === 'dark' ? 'filled_black' : 'outline'}
                shape="pill"
                width="280px"
              />
            )}
          </div>

          <Typography
            variant="paragraph"
            color={theme === 'dark' ? 'white' : 'blue-gray'}
            className="text-center font-medium mt-4"
          >
            Not registered?
            <Link to="/auth/sign-up" className="text-gray-900 dark:text-blue-400 ml-1">
              Create account
            </Link>
          </Typography>
        </form>
      </div>

      {/* right – image */}
      <div className="hidden lg:block w-2/5">
        <img
          src="/img/pattern.png"
          alt="Pattern"
          className="h-full w-full object-cover rounded-3xl"
        />
      </div>
    </section>
  );
}

export default SignIn;