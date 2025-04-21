import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import SignIn from "./pages/SignIn";
import UserManagement from "./pages/UserManagement";
import SignUp from "./pages/SignUp";
import Contact from "./pages/Contact";
import { hasPermission } from "./services/permissions";

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/signin"
        element={
          <Layout>
            <SignIn />
          </Layout>
        }
      />

      <Route
        path="/signup"
        element={
          <Layout>
            <SignUp />
          </Layout>
        }
      />

      <Route
        path="/contact"
        element={
          <Layout>
            <Contact />
          </Layout>
        }
      />

      <Route
        path="/"
        element={
          <ProtectedRoute isAuthenticated={!!user}>
            <Layout>
              <Home />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/user-management"
        element={
          <ProtectedRoute
            isAuthenticated={!!user && hasPermission(user, ["ADMIN"])}
          >
            <Layout>
              <UserManagement />
            </Layout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

// Protected route component
function ProtectedRoute({
  isAuthenticated,
  children,
  redirectPath = "/signup",
}) {
  if (!isAuthenticated) {
    console.log("not logged in");
    return <Navigate to={redirectPath} replace />;
  }

  return children;
}

export default AppRoutes;
