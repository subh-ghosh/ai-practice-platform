import {
  Card,
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
      // --- THIS IS THE CHANGE ---
      // Navigate to sign-in and pass a success message
      navigate("/auth/sign-in", {
        state: {
          success: true,
          message: "Registration successful. Sign in to continue."
        }
      });
      // --- END OF CHANGE ---
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
    <section className="m-8 flex">
      <div className="w-2/5 h-full hidden lg:block">
        <img
          src="/img/pattern.png"
          className="h-full w-full object-cover rounded-3xl"
        />
      </div>
      <div className="w-full lg:w-3/5 flex flex-col items-center justify-center">
        <div className="text-center">

          <Typography variant="h2" className="font-bold mb-4">
            {isGoogleRegister ? "Complete Your Registration" : "Join Us Today"}
          </Typography>
          <Typography variant="paragraph" color={theme === 'dark' ? 'white' : 'blue-gray'} className="text-lg font-normal">
            {isGoogleRegister ? "Please set a password for your account." : "Enter your details to register."}
          </Typography>
        </div>

        <form className="mt-8 mb-2 mx-auto w-80 max-w-screen-lg lg:w-1/2" onSubmit={handleSubmit}>

          {error && (
            <Alert color="red" className="mb-4">{error}</Alert>
          )}

          {isGoogleRegister && (
            <Alert color="blue" className="mb-4">
              We've pre-filled your details from Google. Just set a password!
            </Alert>
          )}

          <div className="mb-1 flex flex-col gap-6">
            <Typography variant="small" color={theme === 'dark' ? 'white' : 'blue-gray'} className="-mb-3 font-medium">
              First Name
            </Typography>
            <Input
              size="lg"
              placeholder="John"
              labelProps={{ className: "before:content-none after:content-none" }}
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              color={theme === 'dark' ? 'white' : 'gray'}
              disabled={isGoogleRegister}
            />

            <Typography variant="small" color={theme === 'dark' ? 'white' : 'blue-gray'} className="-mb-3 font-medium">
              Last Name
            </Typography>
            <Input
              size="lg"
              placeholder="Doe"
              labelProps={{ className: "before:content-none after:content-none" }}
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              color={theme === 'dark' ? 'white' : 'gray'}
              disabled={isGoogleRegister}
            />

            <Typography variant="small" color={theme === 'dark' ? 'white' : 'blue-gray'} className="-mb-3 font-medium">
              Your email
            </Typography>
            <Input
              size="lg"
              placeholder="name@mail.com"
              labelProps={{ className: "before:content-none after:content-none" }}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              color={theme === 'dark' ? 'white' : 'gray'}
              disabled={isGoogleRegister}
            />

            <Typography variant="small" color={theme === 'dark' ? 'white' : 'blue-gray'} className="-mb-3 font-medium">
              Password
            </Typography>
            <Input
              type="password"
              size="lg"
              placeholder="********"
              labelProps={{ className: "before:content-none after:content-none" }}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              color={theme === 'dark' ? 'white' : 'gray'}
            />
          </div>

          <Button
            type="submit"
            className="mt-6"
            fullWidth
            variant={theme === 'dark' ? 'outlined' : 'gradient'}
            color={theme === 'dark' ? 'white' : 'blue'}
            disabled={submitting || googleSubmitting}
          >
            {isGoogleRegister ? (submitting ? "Completing..." : "Complete Registration") : (submitting ? "Registering..." : "Register Now")}
          </Button>

          {!isGoogleRegister && (
            <>
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
                    text="signup_with"
                  />
                )}
              </div>

              <Typography variant="paragraph" color={theme === 'dark' ? 'white' : 'blue-gray'} className="text-center font-medium mt-4">
                Already have an account?
                <Link to="/auth/sign-in" className="text-gray-900 dark:text-blue-400 ml-1">Sign in</Link>
              </Typography>
            </>
          )}
        </form>

      </div>
    </section>
  );
}

export default SignUp;