// src/pages/auth/sign-in.jsx
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

export function SignIn() {
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

    // 🔒 Manual validation (since we removed native `required`)
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
          <Typography
            variant="paragraph"
            color="blue-gray"
            className="text-lg font-normal"
          >
            Enter your email and password to Sign In.
          </Typography>
        </div>

        <Card
          shadow={false}
          className="mt-8 mb-2 w-full max-w-screen-sm p-6 border border-blue-gray-100"
        >
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {error && (
              <Alert color="red" className="mt-[-4px]">
                {error}
              </Alert>
            )}

            <div className="flex flex-col gap-6">
              <div>
                <Typography
                  variant="small"
                  color="blue-gray"
                  className="mb-1 font-medium"
                >
                  Your email
                </Typography>

                <Input
                  size="lg"
                  type="email"
                  placeholder="name@mail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="!border-t-blue-gray-200 focus:!border-t-gray-900"
                  // Make absolutely sure MT doesn't add adornments:
                  labelProps={{ className: "!before:content-none !after:content-none" }}
                  containerProps={{
                    className:
                      "[&>label]:!before:content-none [&>label]:!after:content-none",
                  }}
                />
              </div>

              <div>
                <Typography
                  variant="small"
                  color="blue-gray"
                  className="mb-1 font-medium"
                >
                  Password
                </Typography>

                <Input
                  size="lg"
                  type="password"
                  placeholder="********"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="!border-t-blue-gray-200 focus:!border-t-gray-900"
                  labelProps={{ className: "!before:content-none !after:content-none" }}
                  containerProps={{
                    className:
                      "[&>label]:!before:content-none [&>label]:!after:content-none",
                  }}
                  // ⛔ no `required`
                />
              </div>
            </div>

            <Button type="submit" className="mt-2" fullWidth disabled={submitting}>
              {submitting ? "Signing in..." : "Sign In"}
            </Button>

            <Typography
              variant="paragraph"
              className="text-center text-blue-gray-500 font-medium"
            >
              Not registered?
              <Link to="/auth/sign-up" className="text-gray-900 ml-1">
                Create account
              </Link>
            </Typography>
          </form>
        </Card>
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
