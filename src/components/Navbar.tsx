import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Logo } from './Logo';
import { StorageService } from '../services/storageService';
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
  Cpu
} from 'lucide-react';

interface NavbarProps {
  currentRole?: 'rider' | 'authority';
  onRoleChange?: (role: 'rider' | 'authority') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentRole = 'rider', onRoleChange }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const currentUser = StorageService.getCurrentUser();
  const unreadNotifs = StorageService.getNotifications().filter((n) => !n.read).length;

  const isRiderRoute = location.pathname.startsWith('/app');
  const isAdminRoute = location.pathname.startsWith('/admin');

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

  const handleResetDemo = () => {
    if (window.confirm('Reset all demo data back to default Bengaluru incidents?')) {
      StorageService.resetToDemo();
      window.location.reload();
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-brand-neutral-grey/80 shadow-subtle">
      {/* Top Demo Banner */}
      <div className="bg-brand-navy text-white text-[11px] py-1 px-4 text-center font-medium flex items-center justify-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-brand-orange animate-ping" />
        <span className="font-semibold text-brand-orange">MBRDI & T-Hub Prototype:</span>
        <span className="text-slate-200">Demonstration data in Bengaluru region (Hebbal, Indiranagar, Whitefield, KR Puram). Not live verified BBMP incidents.</span>
        <button
          onClick={handleResetDemo}
          className="ml-2 underline text-white/80 hover:text-white flex items-center gap-1 font-normal cursor-pointer"
          title="Reset demonstration records"
        >
          <RefreshCw className="w-2.5 h-2.5" /> Reset Demo
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link to={isAdminRoute ? '/admin' : isRiderRoute ? '/app' : '/'} className="flex items-center">
            <Logo size="md" />
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {!isRiderRoute && !isAdminRoute ? (
              // Public Landing Navigation
              <>
                <Link
                  to="/"
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    location.pathname === '/' ? 'text-brand-orange font-semibold' : 'text-brand-slate hover:text-brand-navy'
                  }`}
                >
                  Home
                </Link>
                <Link
                  to="/how-it-works"
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    location.pathname === '/how-it-works' ? 'text-brand-orange font-semibold' : 'text-brand-slate hover:text-brand-navy'
                  }`}
                >
                  How It Works
                </Link>
                <Link
                  to="/about"
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    location.pathname === '/about' ? 'text-brand-orange font-semibold' : 'text-brand-slate hover:text-brand-navy'
                  }`}
                >
                  Problem & Vision
                </Link>
                <Link
                  to="/safety"
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    location.pathname === '/safety' ? 'text-brand-orange font-semibold' : 'text-brand-slate hover:text-brand-navy'
                  }`}
                >
                  Safety & Privacy
                </Link>
              </>
            ) : isRiderRoute ? (
              // Rider Experience Links
              <>
                <Link
                  to="/app"
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    location.pathname === '/app' ? 'bg-brand-soft-blue text-brand-navy font-semibold' : 'text-brand-slate hover:text-brand-navy'
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/app/map"
                  className={`px-3 py-2 text-sm font-medium rounded-lg flex items-center gap-1.5 transition-colors ${
                    location.pathname === '/app/map' ? 'bg-brand-soft-blue text-brand-navy font-semibold' : 'text-brand-slate hover:text-brand-navy'
                  }`}
                >
                  <MapPin className="w-4 h-4 text-brand-orange" />
                  Live Map
                </Link>
                <Link
                  to="/app/roadscan"
                  className={`px-3 py-2 text-sm font-medium rounded-lg flex items-center gap-1.5 transition-colors ${
                    location.pathname === '/app/roadscan' ? 'bg-brand-soft-blue text-brand-navy font-semibold' : 'text-brand-slate hover:text-brand-navy'
                  }`}
                >
                  <Camera className="w-4 h-4 text-purple-600" />
                  RoadScan AI
                </Link>
                <Link
                  to="/app/ride"
                  className={`px-3 py-2 text-sm font-medium rounded-lg flex items-center gap-1.5 transition-colors ${
                    location.pathname === '/app/ride' ? 'bg-brand-soft-blue text-brand-navy font-semibold' : 'text-brand-slate hover:text-brand-navy'
                  }`}
                >
                  <Activity className="w-4 h-4 text-emerald-600" />
                  Ride Mode
                </Link>
                <Link
                  to="/app/routes"
                  className={`px-3 py-2 text-sm font-medium rounded-lg flex items-center gap-1.5 transition-colors ${
                    location.pathname === '/app/routes' ? 'bg-brand-soft-blue text-brand-navy font-semibold' : 'text-brand-slate hover:text-brand-navy'
                  }`}
                >
                  <Navigation className="w-4 h-4 text-blue-600" />
                  Route Warnings
                </Link>
              </>
            ) : (
              // Authority Experience Links
              <>
                <Link
                  to="/admin"
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    location.pathname === '/admin' ? 'bg-brand-soft-blue text-brand-navy font-semibold' : 'text-brand-slate hover:text-brand-navy'
                  }`}
                >
                  Overview
                </Link>
                <Link
                  to="/admin/map"
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    location.pathname === '/admin/map' ? 'bg-brand-soft-blue text-brand-navy font-semibold' : 'text-brand-slate hover:text-brand-navy'
                  }`}
                >
                  Geo Intelligence
                </Link>
                <Link
                  to="/admin/reports"
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    location.pathname === '/admin/reports' ? 'bg-brand-soft-blue text-brand-navy font-semibold' : 'text-brand-slate hover:text-brand-navy'
                  }`}
                >
                  Hazard Dispatch
                </Link>
                <Link
                  to="/admin/analytics"
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    location.pathname === '/admin/analytics' ? 'bg-brand-soft-blue text-brand-navy font-semibold' : 'text-brand-slate hover:text-brand-navy'
                  }`}
                >
                  Analytics & CSV
                </Link>
                <Link
                  to="/admin/automation"
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
                    location.pathname === '/admin/automation' ? 'bg-brand-soft-blue text-brand-navy font-semibold' : 'text-brand-slate hover:text-brand-navy'
                  }`}
                >
                  <Cpu className="w-4 h-4 text-brand-orange" />
                  Automation (n8n)
                </Link>
              </>
            )}
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Report CTA Button (Available everywhere) */}
            <Link
              to="/app/report"
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-lg bg-brand-orange hover:bg-brand-orange-hover text-white transition-all shadow-sm shadow-brand-orange/20 hover:shadow-md hover:scale-[1.02]"
            >
              <AlertTriangle className="w-4 h-4" />
              Report Hazard
            </Link>

            {/* Portal Switcher Pill */}
            <div className="flex items-center bg-brand-soft-blue/70 p-1 rounded-xl border border-brand-neutral-grey text-xs font-semibold">
              <button
                onClick={() => handleRoleToggle('rider')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all ${
                  !isAdminRoute ? 'bg-white text-brand-navy shadow-sm' : 'text-brand-slate hover:text-brand-navy'
                }`}
              >
                <Bike className="w-3.5 h-3.5 text-brand-orange" />
                <span className="hidden sm:inline">Rider</span>
              </button>
              <button
                onClick={() => handleRoleToggle('authority')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all ${
                  isAdminRoute ? 'bg-brand-navy text-white shadow-sm' : 'text-brand-slate hover:text-brand-navy'
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
              <Bell className="w-5 h-5" />
              {unreadNotifs > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-brand-red ring-2 ring-white" />
              )}
            </Link>

            {/* User Profile Avatar */}
            <Link
              to="/app/profile"
              className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-brand-soft-blue transition-colors"
              title={`${currentUser.name} (${currentUser.points} pts)`}
            >
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-7 h-7 rounded-full object-cover ring-2 ring-brand-orange/30"
              />
            </Link>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-brand-slate hover:text-brand-navy rounded-lg hover:bg-brand-soft-blue"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-brand-neutral-grey bg-white px-4 pt-3 pb-6 space-y-2 shadow-elevated">
          <div className="text-xs font-semibold uppercase tracking-wider text-brand-slate px-2 pt-1">
            Rider Navigation
          </div>
          <Link
            to="/app"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2 text-sm font-medium rounded-lg text-brand-navy hover:bg-brand-soft-blue"
          >
            Dashboard Overview
          </Link>
          <Link
            to="/app/map"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2 text-sm font-medium rounded-lg text-brand-navy hover:bg-brand-soft-blue"
          >
            <MapPin className="w-4 h-4 text-brand-orange" />
            Live Road Hazard Map
          </Link>
          <Link
            to="/app/report"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2 text-sm font-semibold rounded-lg text-brand-orange bg-brand-orange/10"
          >
            <AlertTriangle className="w-4 h-4" />
            Report a Road Hazard (20s)
          </Link>
          <Link
            to="/app/roadscan"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2 text-sm font-medium rounded-lg text-brand-navy hover:bg-brand-soft-blue"
          >
            <Camera className="w-4 h-4 text-purple-600" />
            RoadScan AI Image Analysis
          </Link>
          <Link
            to="/app/ride"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2 text-sm font-medium rounded-lg text-brand-navy hover:bg-brand-soft-blue"
          >
            <Activity className="w-4 h-4 text-emerald-600" />
            Ride Mode & Sensor Telemetry
          </Link>
          <Link
            to="/app/routes"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2 text-sm font-medium rounded-lg text-brand-navy hover:bg-brand-soft-blue"
          >
            <Navigation className="w-4 h-4 text-blue-600" />
            Route Safety & Early Warning
          </Link>
          <Link
            to="/app/my-reports"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2 text-sm font-medium rounded-lg text-brand-navy hover:bg-brand-soft-blue"
          >
            <FileText className="w-4 h-4 text-brand-slate" />
            My Submitted Reports
          </Link>

          <div className="pt-2 border-t border-brand-neutral-grey text-xs font-semibold uppercase tracking-wider text-brand-slate px-2">
            Authority & Platform
          </div>
          <Link
            to="/admin"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2 text-sm font-medium rounded-lg text-brand-navy hover:bg-brand-soft-blue"
          >
            <Building2 className="w-4 h-4 text-brand-orange" />
            Authority & Fleet Portal
          </Link>
          <Link
            to="/admin/automation"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2 text-sm font-medium rounded-lg text-brand-navy hover:bg-brand-soft-blue"
          >
            <Cpu className="w-4 h-4 text-brand-orange" />
            n8n Automation Console
          </Link>
          <Link
            to="/safety"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2 text-sm font-medium rounded-lg text-brand-navy hover:bg-brand-soft-blue"
          >
            <Shield className="w-4 h-4 text-brand-slate" />
            Safety & Privacy Guidelines
          </Link>
        </div>
      )}
    </header>
  );
};

