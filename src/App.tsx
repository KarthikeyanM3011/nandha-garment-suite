
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";

// Authentication Context
import { AuthProvider } from "./contexts/AuthContext";

// Layout
import DashboardLayout from "./components/layout/DashboardLayout";

// Auth Pages
import LandingPage from "./pages/auth/LandingPage";
import LoginPage from "./pages/auth/LoginPage";
import SignupPage from "./pages/auth/SignupPage";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";
import UnauthorizedPage from "./pages/unauthorized/UnauthorizedPage";

// Super Admin Pages
import SuperAdminDashboard from "./pages/superadmin/Dashboard";

// Organization Admin Pages
import OrgAdminDashboard from "./pages/orgadmin/Dashboard";

// Individual User Pages
import IndividualDashboard from "./pages/individual/Dashboard";

// Shared and Other Pages
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/auth/ProtectedRoute";

// Create React Query client
const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Navigate to="/" replace />} />
            <Route path="/login/:userType" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />
            
            {/* Protected Routes */}
            <Route 
              path="/reset-password" 
              element={
                <ProtectedRoute>
                  <ResetPasswordPage />
                </ProtectedRoute>
              } 
            />

            {/* Super Admin Routes */}
            <Route path="/super-admin" element={
              <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
                <DashboardLayout />
              </ProtectedRoute>
            }>
              <Route path="dashboard" element={<SuperAdminDashboard />} />
              <Route path="organizations" element={<div>Organizations Management</div>} />
              <Route path="products" element={<div>Products Management</div>} />
              <Route path="orders" element={<div>Orders Management</div>} />
              <Route path="profile" element={<div>Profile Settings</div>} />
              <Route index element={<Navigate to="dashboard" replace />} />
            </Route>

            {/* Organization Admin Routes */}
            <Route path="/org-admin" element={
              <ProtectedRoute allowedRoles={['ORG_ADMIN']}>
                <DashboardLayout />
              </ProtectedRoute>
            }>
              <Route path="dashboard" element={<OrgAdminDashboard />} />
              <Route path="users" element={<div>User Management</div>} />
              <Route path="measurements" element={<div>Measurement Management</div>} />
              <Route path="products" element={<div>Product Catalog</div>} />
              <Route path="orders" element={<div>Orders Management</div>} />
              <Route path="profile" element={<div>Profile Settings</div>} />
              <Route index element={<Navigate to="dashboard" replace />} />
            </Route>

            {/* Individual Routes */}
            <Route path="/individual" element={
              <ProtectedRoute allowedRoles={['INDIVIDUAL']}>
                <DashboardLayout />
              </ProtectedRoute>
            }>
              <Route path="dashboard" element={<IndividualDashboard />} />
              <Route path="measurements" element={<div>My Measurements</div>} />
              <Route path="products" element={<div>Product Catalog</div>} />
              <Route path="products/:productId" element={<div>Product Details</div>} />
              <Route path="orders" element={<div>My Orders</div>} />
              <Route path="profile" element={<div>Profile Settings</div>} />
              <Route index element={<Navigate to="dashboard" replace />} />
            </Route>

            {/* Catch all route for 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          
          {/* Toast Notifications */}
          <Toaster />
          <Sonner position="bottom-right" />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
