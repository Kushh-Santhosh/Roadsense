import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { StorageService } from './services/storageService';

// Public Pages
import { LandingPage } from './pages/LandingPage';
import { AboutPage } from './pages/AboutPage';
import { HowItWorksPage } from './pages/HowItWorksPage';
import { SafetyPage } from './pages/SafetyPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';

// Rider Pages
import { RiderDashboard } from './pages/RiderDashboard';
import { LiveMapPage } from './pages/LiveMapPage';
import { ReportHazardPage } from './pages/ReportHazardPage';
import { RoadScanAIPage } from './pages/RoadScanAIPage';
import { RideModePage } from './pages/RideModePage';
import { RouteWarningsPage } from './pages/RouteWarningsPage';
import { AlertsHistoryPage } from './pages/AlertsHistoryPage';
import { MyReportsPage } from './pages/MyReportsPage';
import { ProfilePage } from './pages/ProfilePage';
import { SettingsPage } from './pages/SettingsPage';

// Authority Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminMapPage } from './pages/admin/AdminMapPage';
import { AdminReportsPage } from './pages/admin/AdminReportsPage';
import { AdminHazardDetailPage } from './pages/admin/AdminHazardDetailPage';
import { AdminAnalyticsPage } from './pages/admin/AdminAnalyticsPage';
import { AdminAutomationPage } from './pages/admin/AdminAutomationPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';

// Scroll to top helper on navigation
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export function App() {
  const [currentRole, setCurrentRole] = useState<'rider' | 'authority'>('rider');

  useEffect(() => {
    StorageService.init();
    const user = StorageService.getCurrentUser();
    if (user.role === 'authority' || user.role === 'admin') {
      setCurrentRole('authority');
    }
  }, []);

  return (
    <BrowserRouter>
      <ScrollToTop />
      <div className="flex flex-col min-h-screen bg-brand-warm-white text-brand-navy">
        <Navbar currentRole={currentRole} onRoleChange={(r) => setCurrentRole(r)} />

        <main className="flex-1">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/how-it-works" element={<HowItWorksPage />} />
            <Route path="/safety" element={<SafetyPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />

            {/* Rider Routes */}
            <Route path="/app" element={<RiderDashboard />} />
            <Route path="/app/map" element={<LiveMapPage />} />
            <Route path="/app/report" element={<ReportHazardPage />} />
            <Route path="/app/roadscan" element={<RoadScanAIPage />} />
            <Route path="/app/ride" element={<RideModePage />} />
            <Route path="/app/routes" element={<RouteWarningsPage />} />
            <Route path="/app/alerts" element={<AlertsHistoryPage />} />
            <Route path="/app/my-reports" element={<MyReportsPage />} />
            <Route path="/app/profile" element={<ProfilePage />} />
            <Route path="/app/settings" element={<SettingsPage />} />

            {/* Authority & Fleet Routes */}
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/map" element={<AdminMapPage />} />
            <Route path="/admin/reports" element={<AdminReportsPage />} />
            <Route path="/admin/hazards/:id" element={<AdminHazardDetailPage />} />
            <Route path="/admin/analytics" element={<AdminAnalyticsPage />} />
            <Route path="/admin/automation" element={<AdminAutomationPage />} />
            <Route path="/admin/users" element={<AdminUsersPage />} />
            <Route path="/admin/settings" element={<AdminSettingsPage />} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;

