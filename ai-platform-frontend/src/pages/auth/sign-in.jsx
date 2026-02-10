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
import { motion } from "framer-motion";

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
    <section className="relative min-h-[calc(100vh-80px)] flex items-center justify-center gap-6 px-6 md:px-10 overflow-hidden">
      
      {/* === Autofill Fix Style Block === */}
      {/* Forces the autofill background to match the gray-900 theme shade (#111827) */}
      <style>{`
        input:-webkit-autofill,
        input:-webkit-autofill:hover, 
        input:-webkit-autofill:focus, 
        input:-webkit-autofill:active {
          -webkit-box-shadow: 0 0 0 1000px ${theme === 'dark' ? '#111827' : '#ffffff'} inset !important;
          -webkit-text-fill-color: ${theme === 'dark' ? '#ffffff' : '#000000'} !important;
          transition: background-color 5000s ease-in-out 0s;
        }
      `}</style>

      {/* === Background Gradient & Animated Glow === */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-blue-50 via-indigo-100 to-purple-100 dark:from-gray-900 dark:via-gray-900/95 dark:to-gray-900" />
      <motion.div 
        animate={{ y: [0, -20, 0], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 6, repeat: Infinity, repeatType: "reverse" }}
        className="pointer-events-none absolute top-[-10%] right-[-5%] h-96 w-96 bg-blue-500/25 blur-[140px] rounded-full" 
      />
      <motion.div 
        animate={{ y: [0, 20, 0], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 8, repeat: Infinity, repeatType: "reverse" }}
        className="pointer-events-none absolute bottom-[-15%] left-[-10%] h-96 w-96 bg-purple-500/20 blur-[140px] rounded-full" 
      />
      <div className="pointer-events-none absolute top-1/3 left-[30%] h-64 w-64 bg-indigo-500/20 blur-[100px] rounded-full" />

      {/* Left Form */}
      <div className="w-full lg:w-3/5 flex flex-col items-center justify-center h-[80vh] z-10">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-6"
        >
          <Typography
            variant="h2"
            className="font-bold mb-2 text-3xl md:text-4xl text-gray-900 dark:text-gray-100"
          >
            Sign In
          </Typography>
          <Typography
            variant="paragraph"
            color={theme === "dark" ? "white" : "blue-gray"}
            className="text-lg font-normal opacity-90"
          >
            Enter your email and password to sign in.
          </Typography>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          onSubmit={handleSubmit}
          className="w-full max-w-[420px] flex flex-col gap-4 backdrop-blur-xl bg-white/70 dark:bg-gray-900/40 border border-white/40 dark:border-gray-700 rounded-2xl p-6 shadow-lg"
        >
          {success && <Alert color="green">{success}</Alert>}
          {error && <Alert color="red">{error}</Alert>}

          <div className="flex flex-col gap-4">
            <Input
              size="lg"
              type="email"
              label="Your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              color={theme === "dark" ? "white" : "gray"}
              autoComplete="email"
              // Ensure transparent background to let the style tag handle the fill
              className="!bg-transparent"
            />

            <Input
              size="lg"
              type="password"
              label="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              color={theme === "dark" ? "white" : "gray"}
              autoComplete="current-password"
              className="!bg-transparent"
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
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  theme={theme === "dark" ? "filled_black" : "outline"}
                  shape="pill"
                  width="280px"
                  text="signin_with"
                />
              </motion.div>
            )}
          </div>

          <Typography
            variant="paragraph"
            color={theme === "dark" ? "white" : "blue-gray"}
            className="text-center font-medium mt-2"
          >
            Not registered?
            <Link
              to="/auth/sign-up"
              className="text-gray-900 dark:text-blue-400 ml-1"
            >
              Create account
            </Link>
          </Typography>
        </motion.form>
      </div>

      {/* Right Image */}
      <motion.div 
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
        className="hidden lg:flex w-2/5 justify-center"
      >
        <div className="relative w-full h-[80vh] rounded-3xl overflow-hidden shadow-2xl">
          <img
            src="/img/pattern.png"
            alt="Pattern"
            className="w-full h-full object-cover opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/40 to-transparent" />
        </div>
      </motion.div>
    </section>
  );
}

export default SignIn;