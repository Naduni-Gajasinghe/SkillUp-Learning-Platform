import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

export default function ProtectedRoute({ allowedRoles = [] }) {
  const { accessToken, user } = useSelector((state) => state.auth);
  const location = useLocation();

  if (!accessToken) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (allowedRoles.length > 0) {
    const roles = user?.roles || [];
    const hasAllowedRole = allowedRoles.some((role) => roles.includes(role));

    if (!hasAllowedRole) {
      return <Navigate to="/" replace />;
    }
  }

  return <Outlet />;
}
