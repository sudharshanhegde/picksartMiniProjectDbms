import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';

interface PrivateRouteProps {
  children: React.ReactNode;
}

function PrivateRoute({ children }: PrivateRouteProps) {
  const { user } = useSelector((state: RootState) => state.auth);

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (user.role !== 'artist' && window.location.pathname === '/artist-dashboard') {
    return <Navigate to="/" />;
  }

  return <>{children}</>;
}

export default PrivateRoute; 