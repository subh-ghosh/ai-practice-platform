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
import { GoogleLogin } from "@react-oauth/google";
import { motion } from "framer-motion";

export function SignIn() {
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
    <section className="relative min-h-screen flex items-center justify-center gap-6 px-6 md:px-10 overflow-hidden bg-[#050505] -mt-24 pt-32">

      {/* === Autofill Fix Style Block === */}
      <style>{`
        input:-webkit-autofill,
        input:-webkit-autofill:hover, 
        input:-webkit-autofill:focus, 
        input:-webkit-autofill:active {
          -webkit-box-shadow: 0 0 0 1000px #18181b inset !important;
          -webkit-text-fill-color: #ffffff !important;
          transition: background-color 5000s ease-in-out 0s;
        }
      `}</style>

      {/* === Background Gradients & Grid === */}
      <div className="absolute inset-0 w-full h-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none z-0"></div>
      <div className="absolute top-0 z-0 h-screen w-screen bg-transparent bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(0,163,255,0.15),transparent)] pointer-events-none" />

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
            className="font-bold mb-2 text-3xl md:text-4xl text-white tracking-tight"
          >
            Sign In
          </Typography>
          <Typography
            variant="paragraph"
            className="text-lg font-medium text-slate-400 opacity-90"
          >
            Enter your email and password to sign in.
          </Typography>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          onSubmit={handleSubmit}
          className="w-full max-w-[420px] flex flex-col gap-4 backdrop-blur-xl bg-[#0a0a0c]/80 border border-white/5 rounded-2xl p-6 shadow-2xl"
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
              color="white"
              autoComplete="email"
              className="!bg-transparent focus:!border-white/20 !text-white"
              labelProps={{
                className: "text-slate-400 peer-placeholder-shown:text-slate-400 peer-focus:text-white"
              }}
            />

            <Input
              size="lg"
              type="password"
              label="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              color="white"
              autoComplete="current-password"
              className="!bg-transparent focus:!border-white/20 !text-white"
              labelProps={{
                className: "text-slate-400 peer-placeholder-shown:text-slate-400 peer-focus:text-white"
              }}
            />
          </div>

          <Button
            type="submit"
            className="mt-3 bg-white text-black hover:scale-[1.02] shadow-none hover:shadow-lg transition-all"
            fullWidth
            disabled={submitting || googleSubmitting}
          >
            {submitting ? "Signing in..." : "Sign In"}
          </Button>

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-white/10"></div>
            <span className="flex-shrink mx-4 text-slate-500 text-sm">OR</span>
            <div className="flex-grow border-t border-white/10"></div>
          </div>

          <div className="flex justify-center">
            {googleSubmitting ? (
              <Spinner className="h-8 w-8 text-white" />
            ) : (
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  theme="filled_black"
                  shape="pill"
                  width="280px"
                  text="signin_with"
                />
              </motion.div>
            )}
          </div>

          <Typography
            variant="paragraph"
            className="text-center font-medium mt-2 text-slate-400"
          >
            Not registered?
            <Link
              to="/auth/sign-up"
              className="text-blue-400 hover:text-blue-300 ml-1 transition-colors"
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
        <div className="relative w-full h-[80vh] rounded-[2rem] overflow-hidden shadow-2xl border border-white/5">
          <img
            src="/img/pattern.png"
            alt="Pattern"
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] to-transparent/10" />
        </div>
      </motion.div>
    </section>
  );
}

export default SignIn;