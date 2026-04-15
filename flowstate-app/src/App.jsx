import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import './App.css';

import { AuthProvider } from './context/AuthContext';
import Navbar        from './components/Navbar/Navbar';
import Footer        from './components/Footer/Footer';

import HomePage      from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';
import TrackerPage   from './pages/TrackerPage';
import LoginPage     from './pages/LoginPage';
import RegisterPage  from './pages/RegisterPage';

const AUTH_ROUTES = ['/login', '/register'];

function AppInner() {
  const { pathname } = useLocation();
  const isAuth = AUTH_ROUTES.includes(pathname);

  return (
    <>
      {!isAuth && <Navbar />}
      <main>
        <Routes>
          <Route path="/"          element={<HomePage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/tracker"   element={<TrackerPage />} />
          <Route path="/login"     element={<LoginPage />} />
          <Route path="/register"  element={<RegisterPage />} />
        </Routes>
      </main>
      {!isAuth && <Footer />}
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppInner />
      </BrowserRouter>
    </AuthProvider>
  );
}
