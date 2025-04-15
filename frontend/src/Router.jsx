import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import UserManagement from './pages/UserManagement';
import Signup from './pages/Signup';
import { hasPermission } from './services/permissions';

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      
      <Route path="/" element={
        <ProtectedRoute isAuthenticated={!!user}>
          <Layout>
            <Home />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/user-management" element={
        <ProtectedRoute isAuthenticated={!!user && hasPermission(user, ['ADMIN'])}>
          <Layout>
            <UserManagement />
          </Layout>
        </ProtectedRoute>
      } />
    </Routes>
  );
}

// Protected route component
function ProtectedRoute({ isAuthenticated, children, redirectPath = '/login' }) {
  if (!isAuthenticated) {
    return <Navigate to={redirectPath} replace />;
  }
  
  return children;
}

export default AppRoutes;
