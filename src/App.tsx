
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";

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
import Organizations from "./pages/superadmin/Organizations";
import OrganizationDetails from "./pages/superadmin/OrganizationDetails";
import Orders from "./pages/superadmin/Orders";
import Products from "./pages/superadmin/Products";
import IndividualUsers from "./pages/superadmin/IndividualUsers";

// Organization Admin Pages
import OrgAdminDashboard from "./pages/orgadmin/Dashboard";
import OrgAdminUsers from "./pages/orgadmin/Users";
import OrgAdminMeasurements from "./pages/orgadmin/Measurements";
import OrgAdminProducts from "./pages/orgadmin/Products";
import OrgAdminOrders from "./pages/orgadmin/Orders";
import OrgAdminNewOrder from "./pages/orgadmin/NewOrder";

// Individual User Pages
import IndividualDashboard from "./pages/individual/Dashboard";
import IndividualMeasurements from "./pages/individual/Measurements";
import IndividualProducts from "./pages/individual/Products";
import IndividualOrders from "./pages/individual/Orders";
import IndividualNewOrder from "./pages/individual/NewOrder";

// Shared and Other Pages
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/auth/ProtectedRoute";

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

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
              <Route path="organizations" element={<Organizations />} />
              <Route path="organizations/:orgId" element={<OrganizationDetails />} />
              <Route path="organizations/new" element={<Organizations />} />
              <Route path="products" element={<Products />} />
              <Route path="products/:productId" element={<Products />} />
              <Route path="products/new" element={<Products />} />
              <Route path="orders" element={<Orders />} />
              <Route path="orders/:orderId" element={<Orders />} />
              <Route path="individual-users" element={<IndividualUsers />} />
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
              <Route path="users" element={<OrgAdminUsers />} />
              <Route path="users/new" element={<OrgAdminUsers />} />
              <Route path="users/:userId" element={<OrgAdminUsers />} />
              <Route path="measurements" element={<OrgAdminMeasurements />} />
              <Route path="measurements/new" element={<OrgAdminMeasurements />} />
              <Route path="measurements/:measurementId" element={<OrgAdminMeasurements />} />
              <Route path="products" element={<OrgAdminProducts />} />
              <Route path="products/:productId" element={<OrgAdminProducts />} />
              <Route path="orders" element={<OrgAdminOrders />} />
              <Route path="orders/new" element={<OrgAdminNewOrder />} />
              <Route path="orders/:orderId" element={<OrgAdminOrders />} />
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
              <Route path="measurements" element={<IndividualMeasurements />} />
              <Route path="measurements/new" element={<IndividualMeasurements />} />
              <Route path="measurements/:measurementId" element={<IndividualMeasurements />} />
              <Route path="products" element={<IndividualProducts />} />
              <Route path="products/:productId" element={<IndividualProducts />} />
              <Route path="orders" element={<IndividualOrders />} />
              <Route path="orders/new" element={<IndividualNewOrder />} />
              <Route path="orders/:orderId" element={<IndividualOrders />} />
              <Route path="profile" element={<div>Profile Settings</div>} />
              <Route index element={<Navigate to="dashboard" replace />} />
            </Route>

            {/* Catch all route for 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          
          {/* Toast Notifications */}
          <Toaster position="top-right" />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
