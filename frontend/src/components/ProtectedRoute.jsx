import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LoadingState } from './PageState';

export function ProtectedRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <main className="page-shell"><LoadingState label="Ја проверуваме вашата најава…" /></main>;
  if (!user) return <Navigate to="/najava" replace state={{ from: location }} />;
  return <Outlet />;
}

export function AdminRoute() {
  const { user, loading, isAdmin } = useAuth();
  if (loading) return <main className="page-shell"><LoadingState /></main>;
  if (!user) return <Navigate to="/najava" replace />;
  if (!isAdmin) return <Navigate to="/profil" replace />;
  return <Outlet />;
}
