import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Logo } from './Logo';
import { StorageService } from '../services/storageService';
import { ConfirmModal } from './ConfirmModal';
import {
  MapPin,
  AlertTriangle,
  Camera,
  Activity,
  Navigation,
  Shield,
  FileText,
  User,
  Menu,
  X,
  Bell,
  RefreshCw,
  Building2,
  Bike,
  Cpu,
  LayoutDashboard,
  Layers,
  TrendingUp,
  Settings,
  HelpCircle,
  LogOut
} from 'lucide-react';

interface NavbarProps {
  currentRole?: 'rider' | 'authority';
  onRoleChange?: (role: 'rider' | 'authority') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentRole = 'rider', onRoleChange }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const currentUser = StorageService.getCurrentUser();
  const unreadNotifs = StorageService.getNotifications().filter((n) => !n.read).length;

  const isRiderRoute = location.pathname.startsWith('/app');
  const isAdminRoute = location.pathname.startsWith('/admin');

  // Compute clean user initials
  const userInitials = (currentUser.name || 'RS')
    .split(' ')
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const handleRoleToggle = (newRole: 'rider' | 'authority') => {
    if (onRoleChange) {
      onRoleChange(newRole);
    }
    if (newRole === 'authority') {
      navigate('/admin');
    } else {
      navigate('/app');
    }
    setMobileMenuOpen(false);
  };

  const handleResetDemoConfirmed = () => {
    StorageService.resetToDemo();
    window.location.reload();
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-brand-neutral-grey/80 shadow-subtle select-none">
        {/* Top Demo Banner */}
        <div className="bg-brand-navy text-white text-[11px] py-1 px-4 text-center font-medium flex items-center justify-between sm:justify-center gap-2">
          <div className="flex items-center gap-2 truncate">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-orange animate-ping flex-shrink-0" />
            <span className="font-bold text-brand-orange hidden sm:inline">MBRDI & T-Hub Prototype:</span>
            <span className="text-slate-200 truncate">
              Bengaluru demonstration data (Hebbal, Indiranagar, Whitefield, KR Puram). Not live verified BBMP records.
            </span>
          </div>
          <button
            onClick={() => setShowResetConfirm(true)}
            className="ml-2 underline text-white/80 hover:text-white flex items-center gap-1 font-normal cursor-pointer flex-shrink-0 text-[10px]"
            title="Reset demonstration records"
          >
            <RefreshCw className="w-2.5 h-2.5" /> Reset Demo
          </button>
        </div>

        {/* Desktop & Mobile Main Header */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Left: Brand Identity Logo */}
            <Link
              to={isAdminRoute ? '/admin' : isRiderRoute ? '/app' : '/'}
              className="flex items-center group flex-shrink-0"
            >
              <Logo size="md" />
            </Link>

            {/* Center: Desktop Navigation Links (Properly Spaced & Separated) */}
            <nav className="hidden lg:flex items-center gap-1">
              {!isRiderRoute && !isAdminRoute ? (
                // Public Landing Navigation
                <>
                  <Link
                    to="/"
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                      location.pathname === '/' ? 'text-brand-orange font-bold' : 'text-brand-slate hover:text-brand-navy'
                    }`}
                  >
                    Home
                  </Link>
                  <Link
                    to="/how-it-works"
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                      location.pathname === '/how-it-works' ? 'text-brand-orange font-bold' : 'text-brand-slate hover:text-brand-navy'
                    }`}
                  >
                    How It Works
                  </Link>
                  <Link
                    to="/about"
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                      location.pathname === '/about' ? 'text-brand-orange font-bold' : 'text-brand-slate hover:text-brand-navy'
                    }`}
                  >
                    Problem & Vision
                  </Link>
                  <Link
                    to="/safety"
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                      location.pathname === '/safety' ? 'text-brand-orange font-bold' : 'text-brand-slate hover:text-brand-navy'
                    }`}
                  >
                    Safety & Privacy
                  </Link>
                </>
              ) : isRiderRoute ? (
                // Rider Experience Navigation
                <>
                  <Link
                    to="/app"
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                      location.pathname === '/app' ? 'bg-brand-soft-blue text-brand-navy' : 'text-brand-slate hover:text-brand-navy'
                    }`}
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/app/map"
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors ${
                      location.pathname === '/app/map' ? 'bg-brand-soft-blue text-brand-navy' : 'text-brand-slate hover:text-brand-navy'
                    }`}
                  >
                    <MapPin className="w-3.5 h-3.5 text-brand-orange" />
                    Live Map
                  </Link>
                  <Link
                    to="/app/roadscan"
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors ${
                      location.pathname === '/app/roadscan' ? 'bg-brand-soft-blue text-brand-navy' : 'text-brand-slate hover:text-brand-navy'
                    }`}
                  >
                    <Camera className="w-3.5 h-3.5 text-purple-600" />
                    RoadScan
                  </Link>
                  <Link
                    to="/app/ride"
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors ${
                      location.pathname === '/app/ride' ? 'bg-brand-soft-blue text-brand-navy' : 'text-brand-slate hover:text-brand-navy'
                    }`}
                  >
                    <Activity className="w-3.5 h-3.5 text-emerald-600" />
                    Ride Mode
                  </Link>
                  <Link
                    to="/app/routes"
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors ${
                      location.pathname === '/app/routes' ? 'bg-brand-soft-blue text-brand-navy' : 'text-brand-slate hover:text-brand-navy'
                    }`}
                  >
                    <Navigation className="w-3.5 h-3.5 text-blue-600" />
                    Route Warnings
                  </Link>
                  <Link
                    to="/app/my-reports"
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                      location.pathname === '/app/my-reports' ? 'bg-brand-soft-blue text-brand-navy' : 'text-brand-slate hover:text-brand-navy'
                    }`}
                  >
                    My Reports
                  </Link>
                </>
              ) : (
                // Authority Experience Navigation
                <>
                  <Link
                    to="/admin"
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                      location.pathname === '/admin' ? 'bg-brand-soft-blue text-brand-navy' : 'text-brand-slate hover:text-brand-navy'
                    }`}
                  >
                    Overview
                  </Link>
                  <Link
                    to="/admin/map"
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                      location.pathname === '/admin/map' ? 'bg-brand-soft-blue text-brand-navy' : 'text-brand-slate hover:text-brand-navy'
                    }`}
                  >
                    Geo Intelligence
                  </Link>
                  <Link
                    to="/admin/reports"
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                      location.pathname === '/admin/reports' ? 'bg-brand-soft-blue text-brand-navy' : 'text-brand-slate hover:text-brand-navy'
                    }`}
                  >
                    Hazard Dispatch
                  </Link>
                  <Link
                    to="/admin/analytics"
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                      location.pathname === '/admin/analytics' ? 'bg-brand-soft-blue text-brand-navy' : 'text-brand-slate hover:text-brand-navy'
                    }`}
                  >
                    Analytics & CSV
                  </Link>
                  <Link
                    to="/admin/automation"
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 ${
                      location.pathname === '/admin/automation' ? 'bg-brand-soft-blue text-brand-navy' : 'text-brand-slate hover:text-brand-navy'
                    }`}
                  >
                    <Cpu className="w-3.5 h-3.5 text-brand-orange" />
                    Automation (n8n)
                  </Link>
                </>
              )}
            </nav>

            {/* Right: Actions, Portal Switcher & Initials Avatar */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Primary Report CTA (Always visible on desktop and tablet) */}
              <Link
                to="/app/report"
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-brand-orange hover:bg-brand-orange-hover text-white transition-all shadow-subtle hover:scale-[1.02] cursor-pointer"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Report Hazard</span>
              </Link>

              {/* Portal Switcher Pill */}
              <div className="flex items-center bg-brand-soft-blue/80 p-0.5 sm:p-1 rounded-xl border border-brand-neutral-grey text-xs font-bold">
                <button
                  onClick={() => handleRoleToggle('rider')}
                  className={`flex items-center gap-1 px-2 py-1 rounded-lg transition-all text-xs cursor-pointer ${
                    !isAdminRoute ? 'bg-white text-brand-navy shadow-subtle' : 'text-brand-slate hover:text-brand-navy'
                  }`}
                >
                  <Bike className="w-3.5 h-3.5 text-brand-orange" />
                  <span className="hidden sm:inline">Rider</span>
                </button>
                <button
                  onClick={() => handleRoleToggle('authority')}
                  className={`flex items-center gap-1 px-2 py-1 rounded-lg transition-all text-xs cursor-pointer ${
                    isAdminRoute ? 'bg-brand-navy text-white shadow-subtle' : 'text-brand-slate hover:text-brand-navy'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5 text-brand-orange" />
                  <span className="hidden sm:inline">Authority</span>
                </button>
              </div>

              {/* Notifications Bell */}
              <Link
                to="/app/alerts"
                className="relative p-2 text-brand-slate hover:text-brand-navy rounded-lg hover:bg-brand-soft-blue transition-colors"
                title="Alert Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadNotifs > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-brand-red ring-2 ring-white" />
                )}
              </Link>

              {/* User Profile Avatar with Initials (No stock photo!) */}
              <Link
                to={isAdminRoute ? '/admin/settings' : '/app/profile'}
                className="flex items-center gap-1.5 p-0.5 rounded-full hover:ring-2 hover:ring-brand-orange/40 transition-all cursor-pointer group"
                title={`${currentUser.name} (${isAdminRoute ? 'Authority Demo' : 'Rider Demo'})`}
              >
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-brand-navy text-white text-xs font-bold flex items-center justify-center border-2 border-brand-orange/40 group-hover:border-brand-orange shadow-subtle">
                  {userInitials}
                </div>
              </Link>

              {/* Mobile Menu Button for Navigation Drawer */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-1.5 text-brand-slate hover:text-brand-navy rounded-lg hover:bg-brand-soft-blue cursor-pointer"
                aria-label="Toggle navigation drawer"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Slide-Out Drawer Navigation */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-brand-neutral-grey bg-white px-4 py-3 space-y-2 shadow-modal animate-fadeIn max-h-[80vh] overflow-y-auto">
            <div className="text-[10px] font-bold uppercase tracking-wider text-brand-slate px-2 pt-1">
              {isAdminRoute ? 'Authority Modules' : 'Rider Features'}
            </div>

            {isRiderRoute ? (
              <div className="grid grid-cols-2 gap-1.5">
                <Link
                  to="/app"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 p-2 rounded-xl text-xs font-semibold text-brand-navy hover:bg-brand-soft-blue"
                >
                  <LayoutDashboard className="w-4 h-4 text-brand-orange" />
                  Dashboard
                </Link>
                <Link
                  to="/app/map"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 p-2 rounded-xl text-xs font-semibold text-brand-navy hover:bg-brand-soft-blue"
                >
                  <MapPin className="w-4 h-4 text-brand-orange" />
                  Live Map
                </Link>
                <Link
                  to="/app/report"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 p-2 rounded-xl text-xs font-bold text-brand-orange bg-brand-orange/10"
                >
                  <AlertTriangle className="w-4 h-4" />
                  Report Hazard
                </Link>
                <Link
                  to="/app/roadscan"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 p-2 rounded-xl text-xs font-semibold text-brand-navy hover:bg-brand-soft-blue"
                >
                  <Camera className="w-4 h-4 text-purple-600" />
                  RoadScan AI
                </Link>
                <Link
                  to="/app/ride"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 p-2 rounded-xl text-xs font-semibold text-brand-navy hover:bg-brand-soft-blue"
                >
                  <Activity className="w-4 h-4 text-emerald-600" />
                  Ride Mode
                </Link>
                <Link
                  to="/app/routes"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 p-2 rounded-xl text-xs font-semibold text-brand-navy hover:bg-brand-soft-blue"
                >
                  <Navigation className="w-4 h-4 text-blue-600" />
                  Route Warnings
                </Link>
                <Link
                  to="/app/my-reports"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 p-2 rounded-xl text-xs font-semibold text-brand-navy hover:bg-brand-soft-blue"
                >
                  <FileText className="w-4 h-4 text-brand-slate" />
                  My Reports
                </Link>
                <Link
                  to="/app/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 p-2 rounded-xl text-xs font-semibold text-brand-navy hover:bg-brand-soft-blue"
                >
                  <User className="w-4 h-4 text-brand-slate" />
                  Profile ({userInitials})
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-1.5">
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 p-2 rounded-xl text-xs font-semibold text-brand-navy hover:bg-brand-soft-blue"
                >
                  <Building2 className="w-4 h-4 text-brand-orange" />
                  Overview
                </Link>
                <Link
                  to="/admin/map"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 p-2 rounded-xl text-xs font-semibold text-brand-navy hover:bg-brand-soft-blue"
                >
                  <MapPin className="w-4 h-4 text-brand-orange" />
                  Geo Map
                </Link>
                <Link
                  to="/admin/reports"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 p-2 rounded-xl text-xs font-semibold text-brand-navy hover:bg-brand-soft-blue"
                >
                  <Layers className="w-4 h-4 text-brand-slate" />
                  Dispatch Queue
                </Link>
                <Link
                  to="/admin/automation"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 p-2 rounded-xl text-xs font-semibold text-brand-navy hover:bg-brand-soft-blue"
                >
                  <Cpu className="w-4 h-4 text-brand-orange" />
                  n8n Automation
                </Link>
                <Link
                  to="/admin/analytics"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 p-2 rounded-xl text-xs font-semibold text-brand-navy hover:bg-brand-soft-blue"
                >
                  <TrendingUp className="w-4 h-4 text-brand-slate" />
                  Analytics & CSV
                </Link>
                <Link
                  to="/admin/settings"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 p-2 rounded-xl text-xs font-semibold text-brand-navy hover:bg-brand-soft-blue"
                >
                  <Settings className="w-4 h-4 text-brand-slate" />
                  Admin Settings
                </Link>
              </div>
            )}

            <div className="pt-2 border-t border-brand-neutral-grey/60 flex items-center justify-between text-xs text-brand-slate px-2">
              <Link to="/safety" onClick={() => setMobileMenuOpen(false)} className="hover:underline">
                Safety & Privacy Guidelines
              </Link>
              <span className="font-mono text-[10px]">v1.0 Demo</span>
            </div>
          </div>
        )}
      </header>

      {/* Mandatory Mobile Bottom Navigation Bar (Rider / Authority) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/98 backdrop-blur-md border-t border-brand-neutral-grey/80 shadow-elevated">
        <div className="max-w-md mx-auto grid grid-cols-5 h-16 items-center px-1">
          {isRiderRoute ? (
            <>
              {/* 1. Dashboard */}
              <Link
                to="/app"
                className={`flex flex-col items-center justify-center py-1 transition-colors ${
                  location.pathname === '/app' ? 'text-brand-orange font-bold' : 'text-brand-slate hover:text-brand-navy'
                }`}
              >
                <LayoutDashboard className="w-5 h-5" />
                <span className="text-[10px] mt-0.5">Home</span>
              </Link>

              {/* 2. Live Map */}
              <Link
                to="/app/map"
                className={`flex flex-col items-center justify-center py-1 transition-colors ${
                  location.pathname === '/app/map' ? 'text-brand-orange font-bold' : 'text-brand-slate hover:text-brand-navy'
                }`}
              >
                <MapPin className="w-5 h-5" />
                <span className="text-[10px] mt-0.5">Map</span>
              </Link>

              {/* 3. Report Hazard (Elevated Center CTA) */}
              <div className="flex items-center justify-center -mt-5">
                <Link
                  to="/app/report"
                  className="w-12 h-12 rounded-full bg-brand-orange hover:bg-brand-orange-hover text-white flex items-center justify-center shadow-lg shadow-brand-orange/30 transition-transform active:scale-95 cursor-pointer"
                  title="Report Road Hazard"
                >
                  <AlertTriangle className="w-6 h-6" />
                </Link>
              </div>

              {/* 4. Ride Mode */}
              <Link
                to="/app/ride"
                className={`flex flex-col items-center justify-center py-1 transition-colors ${
                  location.pathname === '/app/ride' ? 'text-brand-orange font-bold' : 'text-brand-slate hover:text-brand-navy'
                }`}
              >
                <Activity className="w-5 h-5 text-emerald-600" />
                <span className="text-[10px] mt-0.5">Ride</span>
              </Link>

              {/* 5. More Menu Drawer */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className={`flex flex-col items-center justify-center py-1 transition-colors cursor-pointer ${
                  mobileMenuOpen ? 'text-brand-orange font-bold' : 'text-brand-slate hover:text-brand-navy'
                }`}
              >
                <Menu className="w-5 h-5" />
                <span className="text-[10px] mt-0.5">More</span>
              </button>
            </>
          ) : (
            <>
              {/* Authority Mobile Nav */}
              <Link
                to="/admin"
                className={`flex flex-col items-center justify-center py-1 transition-colors ${
                  location.pathname === '/admin' ? 'text-brand-orange font-bold' : 'text-brand-slate hover:text-brand-navy'
                }`}
              >
                <Building2 className="w-5 h-5" />
                <span className="text-[10px] mt-0.5">Overview</span>
              </Link>
              <Link
                to="/admin/map"
                className={`flex flex-col items-center justify-center py-1 transition-colors ${
                  location.pathname === '/admin/map' ? 'text-brand-orange font-bold' : 'text-brand-slate hover:text-brand-navy'
                }`}
              >
                <MapPin className="w-5 h-5" />
                <span className="text-[10px] mt-0.5">Geo Map</span>
              </Link>
              <Link
                to="/admin/reports"
                className={`flex flex-col items-center justify-center py-1 transition-colors ${
                  location.pathname === '/admin/reports' ? 'text-brand-orange font-bold' : 'text-brand-slate hover:text-brand-navy'
                }`}
              >
                <Layers className="w-5 h-5" />
                <span className="text-[10px] mt-0.5">Triage</span>
              </Link>
              <Link
                to="/admin/automation"
                className={`flex flex-col items-center justify-center py-1 transition-colors ${
                  location.pathname === '/admin/automation' ? 'text-brand-orange font-bold' : 'text-brand-slate hover:text-brand-navy'
                }`}
              >
                <Cpu className="w-5 h-5" />
                <span className="text-[10px] mt-0.5">n8n</span>
              </Link>
              <Link
                to="/admin/analytics"
                className={`flex flex-col items-center justify-center py-1 transition-colors ${
                  location.pathname === '/admin/analytics' ? 'text-brand-orange font-bold' : 'text-brand-slate hover:text-brand-navy'
                }`}
              >
                <TrendingUp className="w-5 h-5" />
                <span className="text-[10px] mt-0.5">Data</span>
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Reset Demo Confirmation Modal (No window.confirm!) */}
      <ConfirmModal
        isOpen={showResetConfirm}
        onClose={() => setShowResetConfirm(false)}
        onConfirm={handleResetDemoConfirmed}
        title="Reset Bengaluru Demonstration Dataset?"
        description="This will restore all default Bengaluru hazard incidents (Hebbal, Indiranagar, Whitefield, KR Puram underpass) and clear session-generated mock reports."
        confirmText="Reset Demonstration State"
        cancelText="Cancel"
        variant="warning"
      />
    </>
  );
};
