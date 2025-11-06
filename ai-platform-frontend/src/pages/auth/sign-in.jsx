import {
  Card,
  Input,
  Button,
  Typography,
  Alert,
} from "@material-tailwind/react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext"; // 👈 --- ADD THIS IMPORT

export function SignIn() {
  const { theme } = useTheme(); // 👈 --- ADD THIS LINE
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
const from = location.state?.from?.pathname || "/dashboard/home";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
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
return (
    <section className="m-8 flex min-h-[80vh] items-center gap-6">
      {/* left – form */}
      <div className="w-full lg:w-3/5 flex flex-col items-center justify-center">
        <div className="text-center">
          <Typography variant="h2" className="font-bold mb-2">
            Sign In
          </Typography>
          {/* --- THIS IS THE FIX --- */}
          <Typography
            variant="paragraph"
            color={theme === 'dark' ? 'white' : 'blue-gray'}
            className="text-lg font-normal"
          >
            Enter your email and password to Sign In.
          </Typography>
          {/* --- END OF FIX --- */}
        </div>

        {/* --- Card component is REMOVED --- */}
        <form
          onSubmit={handleSubmit}
          className="mt-8 mb-2 mx-auto w-80 max-w-screen-lg lg:w-1/2"
        >
            {error && (
              <Alert color="red" className="mb-4">
                {error}
              </Alert>
            )}


           <div className="mb-1 flex flex-col gap-6">
              <div>
                {/* --- THIS IS THE FIX --- */}
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
                {/* --- END OF FIX --- */}
              </div>

              <div>
                {/* --- THIS IS THE FIX --- */}
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
                {/* --- END OF FIX --- */}
              </div>
            </div>

            {/* --- THIS IS THE FIX --- */}
            <Button
              type="submit"
              className="mt-6"
              fullWidth
              disabled={submitting}
              variant={theme === 'dark' ? 'outlined' : 'gradient'}
              color={theme === 'dark' ? 'white' : 'blue'}
            >
              {submitting ? "Signing in..." : "Sign In"}
            </Button>
            {/* --- END OF FIX --- */}

            {/* --- THIS IS THE FIX --- */}
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
            {/* --- END OF FIX --- */}
          </form>
        {/* --- Card component is REMOVED --- */}
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