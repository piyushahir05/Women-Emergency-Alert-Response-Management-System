import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Wraps a route so only authenticated users with the correct role can access it.
 * redirectTo defaults to /login for user routes, /vigilance/login for officer routes.
 */
export default function ProtectedRoute({ children, allowedRoles = ['user'] }) {
  const { isAuthenticated, role } = useAuth();
  const expectsVigilanceRole = allowedRoles.includes('officer') || allowedRoles.includes('admin');

  if (!isAuthenticated) {
    const dest = expectsVigilanceRole ? '/vigilance/login' : '/login';
    return <Navigate to={dest} replace />;
  }

  if (!allowedRoles.includes(role)) {
    const dest = expectsVigilanceRole ? '/vigilance/login' : '/login';
    return <Navigate to={dest} replace />;
  }

  return children;
}
