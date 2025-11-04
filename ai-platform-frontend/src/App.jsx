import { Routes, Route, Navigate } from "react-router-dom";
import { Dashboard, Auth } from "@/layouts";
import { ProtectedRoute } from "@/widgets/layout/ProtectedRoute"; // Import our bouncer

function App() {
  return (
    <Routes>
      {/* Here's the magic:
        We wrap the entire Dashboard element in our ProtectedRoute.
        This secures all nested dashboard routes (like /home, /profile) at once.
      */}
      <Route
        path="/dashboard/*"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route path="/auth/*" element={<Auth />} />
      <Route path="*" element={<Navigate to="/dashboard/home" replace />} />
    </Routes>
  );
}

export default App;