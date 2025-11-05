import {
  Card,
  Input,
  // 👇 --- REMOVED Checkbox ---
  Button,
  Typography,
  Alert,
} from "@material-tailwind/react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import api from "@/api";

export function SignUp() {
  const [firstName, setFirstName] = useState("");
const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
const navigate = useNavigate();

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

    try {
      await api.post("/api/students/register", {
        firstName,
        lastName,
        email,
        password,
      });
navigate("/auth/sign-in");
} catch (err) {
      if (err.response && err.response.status === 409) {
        setError("An account with this email already exists.");
} else {
        console.error("Registration failed:", err);
        setError("Registration failed. Please try again.");
}
    }
  };

  return (
    <section className="m-8 flex">
      <div className="w-2/5 h-full hidden lg:block">
        <img
          src="/img/pattern.png"
          className="h-full w-full object-cover rounded-3xl"
        />
      </div>
      <div className="w-full lg:w-3/S5 flex flex-col items-center justify-center">
        <div className="text-center">

<Typography variant="h2" className="font-bold mb-4">Join Us Today</Typography>
          <Typography variant="paragraph" color="blue-gray" className="text-lg font-normal">
            Enter your details to register.
          </Typography>
        </div>

        <form className="mt-8 mb-2 mx-auto w-80 max-w-screen-lg lg:w-1/2" onSubmit={handleSubmit}>

          {error && (

         <Alert color="red" className="mb-4">{error}</Alert>
          )}

          <div className="mb-1 flex flex-col gap-6">
            <Typography variant="small" color="blue-gray" className="-mb-3 font-medium">
              First Name
            </Typography>
            <Input

    size="lg"
              placeholder="John"
              // 👇 --- REMOVED className ---
              labelProps={{ className: "before:content-none after:content-none" }}
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />


      <Typography variant="small" color="blue-gray" className="-mb-3 font-medium">
              Last Name
            </Typography>
            <Input
              size="lg"
              placeholder="Doe"
              // 👇 --- REMOVED className ---
              labelProps={{ className: "before:content-none after:content-none" }}
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />

            <Typography variant="small" color="blue-gray" className="-mb-3 font-medium">
              Your email
            </Typography>

        <Input
              size="lg"
              placeholder="name@mail.com"
              // 👇 --- REMOVED className ---
              labelProps={{ className: "before:content-none after:content-none" }}
              value={email}
              onChange={(e) =>
setEmail(e.target.value)}
            />

            <Typography variant="small" color="blue-gray" className="-mb-3 font-medium">
              Password
            </Typography>
            <Input
              type="password"
              size="lg"

        placeholder="********"
              // 👇 --- REMOVED className ---
              labelProps={{ className: "before:content-none after:content-none" }}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <Button type="submit" className="mt-6" fullWidth>
            Register Now
          </Button>

          <Typography variant="paragraph" className="text-center text-blue-gray-500 font-medium mt-4">
            Already have an account?
<Link to="/auth/sign-in" className="text-gray-900 ml-1">Sign in</Link>
          </Typography>
        </form>

      </div>
    </section>
  );
}

export default SignUp;