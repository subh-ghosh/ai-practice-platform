import { Navigate, useLocation } from "react-router-dom"; // Import useLocation
import { useAuth } from "@/context/AuthContext";

/**
 * This component acts as a "bouncer" for your dashboard.
 * It checks if the user is authenticated from our AuthContext.
 * If YES: It renders the `children` (which will be the Dashboard layout).
 * If NO: It redirects the user back to the sign-in page.
 */
export function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation(); // Get the current location

  if (!isAuthenticated) {
    // If not authenticated, redirect to the sign-in page
    // --- FIX: Pass the current location in state ---
    return <Navigate to="/auth/sign-in" state={{ from: location }} replace />;
  }

  // If authenticated, render the children (e.g., the Dashboard layout)
  return children;
}

export default ProtectedRoute;

