import { Routes, Route, Navigate } from "react-router-dom";
import { Dashboard, Auth, Public } from "@/layouts"; // 👈 --- ADD Public
import { ProtectedRoute } from "@/widgets/layout/ProtectedRoute";
import { Landing, About, Contact } from "@/pages/public"; // 👈 --- ADD Landing, About, Contact

export default function App() {
  return (
    <Routes>
      {/* --- 👇 ADD THIS NEW PUBLIC LAYOUT ROUTE --- */}
      <Route path="/" element={<Public />}>
        <Route index element={<Landing />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
      </Route>

      {/* This is your existing protected dashboard */}
      <Route
        path="/dashboard/*"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      {/* This is your existing auth layout */}
      <Route path="/auth/*" element={<Auth />} />

      {/* --- 👇 UPDATE THIS CATCH-ALL ROUTE --- */}
      {/* This now redirects any unknown URL to your new landing page */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}