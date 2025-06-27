import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Spinner from '../ui/Spinner';

const AdminRoute = () => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'traffic_admin') {
    return <Navigate to="/dashboard" />;
  }

  return <Outlet />;
};

export default AdminRoute;