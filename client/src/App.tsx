import { lazy, Suspense, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Navbar } from '@/components/layout/Navbar';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string;

const Landing = lazy(() => import('@/routes/Landing'));
const Login = lazy(() => import('@/routes/Auth/Login'));
const Signup = lazy(() => import('@/routes/Auth/Signup'));
const GuruProfile = lazy(() => import('@/routes/GuruProfile'));
const StudentDashboard = lazy(() => import('@/routes/Dashboard/Student'));
const GuruDashboard = lazy(() => import('@/routes/Dashboard/Guru'));
const AdminPanel = lazy(() => import('@/routes/Admin'));
const Shop = lazy(() => import('@/routes/Shop'));
const ProductDetail = lazy(() => import('@/routes/Shop/ProductDetail'));
const GuruProducts = lazy(() => import('@/routes/Dashboard/Guru/Products'));

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } },
});

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full" />
    </div>
  );
}

export default function App() {
  const { i18n } = useTranslation();

  useEffect(() => {
    document.documentElement.lang = i18n.language;
    const handler = (lang: string) => {
      document.documentElement.lang = lang;
    };
    i18n.on('languageChanged', handler);
    return () => {
      i18n.off('languageChanged', handler);
    };
  }, [i18n]);

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <div className="min-h-screen bg-gray-50">
            <Navbar />
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/guru/:id" element={<GuruProfile />} />
                <Route path="/shop" element={<Shop />} />
                <Route path="/shop/:id" element={<ProductDetail />} />

                <Route element={<ProtectedRoute />}>
                  <Route element={<ProtectedRoute role="student" />}>
                    <Route path="/dashboard/student" element={<StudentDashboard />} />
                  </Route>
                  <Route element={<ProtectedRoute role="guru" />}>
                    <Route path="/dashboard/guru" element={<GuruDashboard />} />
                    <Route path="/dashboard/guru/products" element={<GuruProducts />} />
                  </Route>
                  <Route element={<ProtectedRoute role="admin" />}>
                    <Route path="/admin" element={<AdminPanel />} />
                  </Route>
                </Route>
              </Routes>
            </Suspense>
          </div>
        </BrowserRouter>
      </QueryClientProvider>
    </GoogleOAuthProvider>
  );
}
