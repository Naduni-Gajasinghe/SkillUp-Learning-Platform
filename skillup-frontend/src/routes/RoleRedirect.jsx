import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

export default function RoleRedirect() {
  const { accessToken, user } = useSelector((state) => state.auth);

  if (!accessToken || !user) {
    return <Navigate to="/login" replace />;
  }

  const roles = user.roles || [];
  if (roles.includes('ADMIN')) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  if (roles.includes('TUTOR')) {
    return <Navigate to="/tutor/dashboard" replace />;
  }

  return <Navigate to="/learner/dashboard" replace />;
}
