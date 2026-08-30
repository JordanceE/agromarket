import { useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import Footer from './components/Footer';
import Navbar from './components/Navbar';
import { AdminRoute, ProtectedRoute } from './components/ProtectedRoute';
import AdminDashboardPage from './pages/AdminDashboardPage';
import HomePage from './pages/HomePage';
import ListingDetailPage from './pages/ListingDetailPage';
import ListingFormPage from './pages/ListingFormPage';
import LoginPage from './pages/LoginPage';
import NotFoundPage from './pages/NotFoundPage';
import ProfilePage from './pages/ProfilePage';
import RegisterPage from './pages/RegisterPage';
import SellerProfilePage from './pages/SellerProfilePage';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  const location = useLocation();
  const compactLayout = ['/najava', '/registracija'].includes(location.pathname);

  return (
    <div className="app-shell">
      <ScrollToTop />
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/oglasi/:id" element={<ListingDetailPage />} />
        <Route path="/prodavaci/:id" element={<SellerProfilePage />} />
        <Route path="/najava" element={<LoginPage />} />
        <Route path="/registracija" element={<RegisterPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/profil" element={<ProfilePage />} />
          <Route path="/oglas/nov" element={<ListingFormPage />} />
          <Route path="/oglasi/:id/uredi" element={<ListingFormPage />} />
        </Route>
        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<AdminDashboardPage />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      {!compactLayout && <Footer />}
    </div>
  );
}
