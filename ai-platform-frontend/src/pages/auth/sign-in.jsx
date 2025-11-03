import {
  Card,
  Input,
  Button,
  Typography,
  Alert, // Import Alert for error messages
} from "@material-tailwind/react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext"; // Import our new Auth hook
import api from "@/api"; // Import our api client

export function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null); // To store login errors

  const { login } = useAuth(); // Get the login function from our context
  const navigate = useNavigate(); // We won't use this directly, as context handles redirect

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission
    setError(null); // Clear previous errors

    try {
      // Call the backend /login endpoint
      const response = await api.post("/api/students/login", { email, password });

      // If login is successful, call our context's login function
      // This will save the user data and redirect to the dashboard
      login(response.data);

    } catch (err) {
      // If login fails (e.g., 401 Unauthorized)
      console.error("Login failed:", err);
      setError("Invalid email or password. Please try again.");
    }
  };

  return (
    <section className="m-8 flex gap-4">
      <div className="w-full lg:w-3/IT mt-24">
        <div className="text-center">
          <Typography variant="h2" className="font-bold mb-4">Sign In</Typography>
          <Typography variant="paragraph" color="blue-gray" className="text-lg font-normal">
            Enter your email and password to Sign In.
          </Typography>
        </div>

        {/* We replace the <form> tag with an onSubmit handler */}
        <form className="mt-8 mb-2 mx-auto w-80 max-w-screen-lg lg:w-1/2" onSubmit={handleSubmit}>

          {/* Display error message if login fails */}
          {error && (
            <Alert color="red" className="mb-4">{error}</Alert>
          )}

          <div className="mb-1 flex flex-col gap-6">
            <Typography variant="small" color="blue-gray" className="-mb-3 font-medium">
              Your email
            </Typography>
            <Input
              size="lg"
              placeholder="name@mail.com"
              className=" !border-t-blue-gray-200 focus:!border-t-gray-900"
              labelProps={{
                className: "before:content-none after:content-none",
              }}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Typography variant="small" color="blue-gray" className="-mb-3 font-medium">
              Password
            </Typography>
            <Input
              type="password"
              size="lg"
              placeholder="********"
              className=" !border-t-blue-gray-200 focus:!border-t-gray-900"
              labelProps={{
                className: "before:content-none after:content-none",
              }}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* We remove the "I agree to Terms" checkbox as it's not needed for login */}

          <Button type="submit" className="mt-6" fullWidth>
            Sign In
          </Button>

          {/* We can remove the "Subscribe" and "Forgot Password" sections for simplicity */}
          {/* <div className="flex items-center justify-between gap-2 mt-6"> ... </div> */}

          {/* We can remove the "Sign in with Google/Twitter" buttons for simplicity */}
          {/* <div className="space-y-4 mt-8"> ... </div> */}

          <Typography variant="paragraph" className="text-center text-blue-gray-500 font-medium mt-4">
            Not registered?
            <Link to="/auth/sign-up" className="text-gray-900 ml-1">Create account</Link>
          </Typography>
        </form>
      </div>
      <div className="w-2/5 h-full hidden lg:block">
        <img
          src="/img/pattern.png"
          className="h-full w-full object-cover rounded-3xl"
        />
      </div>
    </section>
  );
}

export default SignIn;

