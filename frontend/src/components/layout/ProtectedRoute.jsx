import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export default function ProtectedRoute({ children, requiredType }) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  // If a specific type is required and user doesn't match, redirect appropriately
  if (requiredType && user?.type !== requiredType) {
    // Admin trying to access buyer/artisan dashboard → send to /admin
    if (user?.type === 'Admin') return <Navigate to="/admin" replace />;
    // Non-admin trying to access admin routes → send to /dashboard
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
