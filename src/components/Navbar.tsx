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
  LayoutDashboard,
  Layers,
  BarChart3,
  Cpu,
  Users,
  Settings,
  HelpCircle,
  LogOut,
  ChevronDown,
  ArrowRight
} from 'lucide-react';

interface NavbarProps {
  currentRole?: 'rider' | 'authority';
  onRoleChange?: (role: 'rider' | 'authority') => void;
}

export const Navbar: React.FC<NavbarProps> = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [toolsDropdownOpen, setToolsDropdownOpen] = useState(false);
  const [showSignoutConfirm, setShowSignoutConfirm] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const currentUser = StorageService.getCurrentUser();
  const unreadNotifs = StorageService.getNotifications().filter((n) => !n.read).length;

  const pathname = location.pathname;
  const isPublicRoute =
    pathname === '/' ||
    pathname === '/about' ||
    pathname === '/how-it-works' ||
    pathname === '/safety' ||
    pathname === '/login' ||
    pathname === '/signup';

  const isAdminRoute = pathname.startsWith('/admin');
  const isRiderRoute = pathname.startsWith('/app');

  // Compute clean user initials
  const userInitials = (currentUser.name || 'RS')
    .split(' ')
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();

  // Active check helper
  const isActive = (path: string) => {
    if (path === '/app') return pathname === '/app';
    if (path === '/admin') return pathname === '/admin';
    return pathname.startsWith(path);
  };

  /* =========================================================================
     1. AUTHORITY / OPERATIONS WORKSPACE HEADER
     ========================================================================= */
  if (isAdminRoute) {
    return (
      <header className="sticky top-0 z-40 bg-brand-navy text-white border-b border-slate-700/80 shadow-card select-none">
        {/* Operations Demonstration Notice Bar */}
        <div className="bg-brand-navy-dark text-slate-300 text-[11px] py-1 px-4 text-center font-medium flex items-center justify-between sm:justify-center gap-2 border-b border-white/10">
          <div className="flex items-center gap-2 truncate">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
            <span className="font-bold text-white">RoadSense Operations:</span>
            <span className="text-slate-300 truncate">
              Demonstration workspace — no official BBMP integration.
            </span>
          </div>
          <Link
            to="/app"
            className="text-xs text-brand-orange hover:underline font-bold flex items-center gap-1 flex-shrink-0"
          >
            <span>Exit to Rider App</span> &rarr;
          </Link>
        </div>

        {/* Main Operations Header */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Left: Brand + Operations Marker */}
            <div className="flex items-center gap-3">
              <Link to="/admin" className="flex items-center group">
                <Logo variant="compact" theme="dark" size="sm" />
              </Link>
              <span className="text-[10px] font-black tracking-widest uppercase bg-white/10 text-brand-orange px-2 py-0.5 rounded border border-white/15 hidden sm:inline-block">
                Operations
              </span>
            </div>

            {/* Desktop Center: Operations Links */}
            <nav className="hidden lg:flex items-center gap-1 text-xs font-semibold">
              <Link
                to="/admin"
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  pathname === '/admin'
                    ? 'bg-white/15 text-white'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                Overview
              </Link>
              <Link
                to="/admin/map"
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  isActive('/admin/map')
                    ? 'bg-white/15 text-white'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                Geo Intelligence
              </Link>
              <Link
                to="/admin/reports"
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  isActive('/admin/reports') || isActive('/admin/hazards')
                    ? 'bg-white/15 text-white'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                Hazard Dispatch
              </Link>
              <Link
                to="/admin/analytics"
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  isActive('/admin/analytics')
                    ? 'bg-white/15 text-white'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                Analytics
              </Link>
              <Link
                to="/admin/automation"
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  isActive('/admin/automation')
                    ? 'bg-white/15 text-white'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                Automation
              </Link>
              <Link
                to="/admin/users"
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  isActive('/admin/users')
                    ? 'bg-white/15 text-white'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                Users
              </Link>
              <Link
                to="/admin/settings"
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  isActive('/admin/settings')
                    ? 'bg-white/15 text-white'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                Settings
              </Link>
            </nav>

            {/* Right: Quick Role Exit & Avatar */}
            <div className="flex items-center gap-3">
              <Link
                to="/app"
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all border border-white/15"
              >
                <Bike className="w-3.5 h-3.5 text-brand-orange" />
                <span>Rider View</span>
              </Link>

              {/* Admin Avatar */}
              <div className="w-8 h-8 rounded-full bg-brand-orange text-white font-black text-xs flex items-center justify-center border border-white/20">
                MO
              </div>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10"
                aria-label="Toggle Navigation Menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Operations Dropdown Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-brand-navy-dark border-t border-white/10 px-4 py-3 space-y-1">
            <Link
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-xs font-bold text-slate-200 hover:bg-white/10"
            >
              Overview
            </Link>
            <Link
              to="/admin/map"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-xs font-bold text-slate-200 hover:bg-white/10"
            >
              Geo Intelligence
            </Link>
            <Link
              to="/admin/reports"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-xs font-bold text-slate-200 hover:bg-white/10"
            >
              Hazard Dispatch
            </Link>
            <Link
              to="/admin/analytics"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-xs font-bold text-slate-200 hover:bg-white/10"
            >
              Analytics
            </Link>
            <Link
              to="/admin/automation"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-xs font-bold text-slate-200 hover:bg-white/10"
            >
              Automation
            </Link>
            <Link
              to="/admin/users"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-xs font-bold text-slate-200 hover:bg-white/10"
            >
              Users
            </Link>
            <Link
              to="/admin/settings"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-xs font-bold text-slate-200 hover:bg-white/10"
            >
              Settings
            </Link>
            <div className="pt-2 border-t border-white/10">
              <Link
                to="/app"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold text-brand-orange bg-white/5"
              >
                <Bike className="w-4 h-4" />
                <span>Switch to Rider Application</span>
              </Link>
            </div>
          </div>
        )}
      </header>
    );
  }

  /* =========================================================================
     2. PUBLIC MARKETING WEBSITE HEADER
     ========================================================================= */
  if (isPublicRoute) {
    return (
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-brand-neutral-grey/80 shadow-subtle select-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left: RoadSense Logo */}
            <Link to="/" className="flex items-center group">
              <Logo variant="full" theme="light" size="md" />
            </Link>

            {/* Center: Marketing Navigation Links */}
            <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-brand-slate">
              <Link
                to="/how-it-works"
                className={`transition-colors hover:text-brand-navy ${
                  pathname === '/how-it-works' ? 'text-brand-navy font-bold' : ''
                }`}
              >
                How It Works
              </Link>
              <Link
                to="/about"
                className={`transition-colors hover:text-brand-navy ${
                  pathname === '/about' ? 'text-brand-navy font-bold' : ''
                }`}
              >
                Problem & Vision
              </Link>
              <Link
                to="/safety"
                className={`transition-colors hover:text-brand-navy ${
                  pathname === '/safety' ? 'text-brand-navy font-bold' : ''
                }`}
              >
                Safety & Privacy
              </Link>
            </nav>

            {/* Right: Actions */}
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="hidden sm:inline-block px-3.5 py-2 text-xs font-bold text-brand-slate hover:text-brand-navy transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/app"
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-navy hover:bg-brand-navy-light text-white text-xs font-bold transition-all shadow-subtle"
              >
                <span>Open RoadSense</span>
                <ArrowRight className="w-3.5 h-3.5 text-brand-orange" />
              </Link>

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-xl text-brand-slate hover:text-brand-navy hover:bg-brand-soft-blue"
                aria-label="Toggle Public Menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Public Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-brand-neutral-grey px-4 py-4 space-y-3">
            <Link
              to="/how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-semibold text-brand-navy hover:text-brand-orange py-1"
            >
              How It Works
            </Link>
            <Link
              to="/about"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-semibold text-brand-navy hover:text-brand-orange py-1"
            >
              Problem & Vision
            </Link>
            <Link
              to="/safety"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-semibold text-brand-navy hover:text-brand-orange py-1"
            >
              Safety & Privacy
            </Link>
            <div className="pt-2 border-t border-brand-neutral-grey flex flex-col gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2 text-xs font-bold text-brand-slate hover:text-brand-navy"
              >
                Sign In
              </Link>
              <Link
                to="/app"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 rounded-xl bg-brand-navy text-white text-xs font-bold shadow-subtle"
              >
                Open RoadSense
              </Link>
            </div>
          </div>
        )}
      </header>
    );
  }

  /* =========================================================================
     3. RIDER APPLICATION SHELL HEADER
     ========================================================================= */
  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-brand-neutral-grey/80 shadow-subtle select-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Left: RoadSense Logo */}
            <Link to="/app" className="flex items-center group flex-shrink-0">
              <Logo variant="compact" theme="light" size="sm" />
            </Link>

            {/* Desktop Center: Rider Navigation Items */}
            <nav className="hidden lg:flex items-center gap-1 text-xs font-bold text-brand-slate">
              <Link
                to="/app"
                className={`px-3 py-2 rounded-xl transition-all ${
                  pathname === '/app'
                    ? 'text-brand-navy bg-brand-soft-blue'
                    : 'hover:text-brand-navy hover:bg-slate-50'
                }`}
              >
                Dashboard
              </Link>
              <Link
                to="/app/map"
                className={`px-3 py-2 rounded-xl transition-all ${
                  isActive('/app/map')
                    ? 'text-brand-navy bg-brand-soft-blue'
                    : 'hover:text-brand-navy hover:bg-slate-50'
                }`}
              >
                Live Map
              </Link>
              <Link
                to="/app/routes"
                className={`px-3 py-2 rounded-xl transition-all ${
                  isActive('/app/routes')
                    ? 'text-brand-navy bg-brand-soft-blue'
                    : 'hover:text-brand-navy hover:bg-slate-50'
                }`}
              >
                Route Warnings
              </Link>

              {/* Tools Dropdown (Photo Inspection + Ride Mode) */}
              <div className="relative">
                <button
                  onClick={() => setToolsDropdownOpen(!toolsDropdownOpen)}
                  onBlur={() => setTimeout(() => setToolsDropdownOpen(false), 200)}
                  className={`flex items-center gap-1 px-3 py-2 rounded-xl transition-all cursor-pointer ${
                    isActive('/app/roadscan') || isActive('/app/ride')
                      ? 'text-brand-navy bg-brand-soft-blue'
                      : 'hover:text-brand-navy hover:bg-slate-50'
                  }`}
                >
                  <span>Tools</span>
                  <ChevronDown className="w-3.5 h-3.5 text-brand-slate" />
                </button>
                {toolsDropdownOpen && (
                  <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-2xl border border-brand-neutral-grey shadow-elevated py-1.5 z-50 animate-fadeIn">
                    <Link
                      to="/app/roadscan"
                      onClick={() => setToolsDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-brand-navy hover:bg-brand-soft-blue"
                    >
                      <Camera className="w-4 h-4 text-brand-orange" />
                      <span>Photo Inspection</span>
                    </Link>
                    <Link
                      to="/app/ride"
                      onClick={() => setToolsDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-brand-navy hover:bg-brand-soft-blue"
                    >
                      <Activity className="w-4 h-4 text-emerald-600" />
                      <span>Passive Ride Mode</span>
                    </Link>
                  </div>
                )}
              </div>
            </nav>

            {/* Right: Primary Action + Notifications + User Menu */}
            <div className="flex items-center gap-2.5 sm:gap-3">
              {/* Primary Action Button: Report Road Hazard */}
              <Link
                to="/app/report"
                className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl bg-brand-orange hover:bg-brand-orange-hover text-white text-xs font-bold transition-all shadow-subtle hover:scale-[1.01] cursor-pointer"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Report Hazard</span>
              </Link>

              {/* Notification Bell */}
              <Link
                to="/app/alerts"
                className="relative p-2 rounded-xl text-brand-slate hover:text-brand-navy hover:bg-brand-soft-blue transition-colors cursor-pointer"
                title="View road alerts"
                aria-label="Alerts"
              >
                <Bell className="w-4 h-4" />
                {unreadNotifs > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-brand-red ring-2 ring-white" />
                )}
              </Link>

              {/* User Avatar with Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  onBlur={() => setTimeout(() => setUserDropdownOpen(false), 250)}
                  className="flex items-center gap-1.5 p-1 rounded-full hover:ring-2 hover:ring-brand-orange/40 transition-all cursor-pointer"
                  aria-label="User Account Menu"
                >
                  <div className="w-8 h-8 rounded-full bg-brand-navy text-white text-xs font-black flex items-center justify-center border border-slate-300">
                    {userInitials}
                  </div>
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl border border-brand-neutral-grey shadow-modal py-2 z-50 animate-fadeIn font-sans text-xs">
                    <div className="px-3.5 py-2 border-b border-brand-neutral-grey">
                      <div className="font-extrabold text-brand-navy">{currentUser.name}</div>
                      <div className="text-[11px] text-brand-slate truncate">{currentUser.email}</div>
                    </div>

                    <div className="py-1">
                      <Link
                        to="/app/my-reports"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3.5 py-2 text-brand-navy hover:bg-brand-soft-blue font-semibold"
                      >
                        <FileText className="w-4 h-4 text-brand-slate" />
                        <span>My Reports</span>
                      </Link>
                      <Link
                        to="/app/profile"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3.5 py-2 text-brand-navy hover:bg-brand-soft-blue font-semibold"
                      >
                        <User className="w-4 h-4 text-brand-slate" />
                        <span>Profile</span>
                      </Link>
                      <Link
                        to="/app/settings"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3.5 py-2 text-brand-navy hover:bg-brand-soft-blue font-semibold"
                      >
                        <Settings className="w-4 h-4 text-brand-slate" />
                        <span>Settings</span>
                      </Link>
                    </div>

                    <div className="pt-1 border-t border-brand-neutral-grey">
                      <Link
                        to="/admin"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3.5 py-2 text-brand-orange hover:bg-brand-orange/10 font-bold"
                      >
                        <Building2 className="w-4 h-4 text-brand-orange" />
                        <span>Operations Workspace</span>
                      </Link>
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          setShowSignoutConfirm(true);
                        }}
                        className="w-full text-left flex items-center gap-2.5 px-3.5 py-2 text-brand-red hover:bg-brand-red-light font-semibold cursor-pointer"
                      >
                        <LogOut className="w-4 h-4 text-brand-red" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* =========================================================================
         4. MANDATORY FIXED MOBILE BOTTOM NAVIGATION BAR (Thumb reach on mobile)
         ========================================================================= */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-brand-neutral-grey/90 shadow-elevated select-none">
        <div className="grid grid-cols-5 h-14">
          {/* 1. Dashboard */}
          <Link
            to="/app"
            className={`flex flex-col items-center justify-center gap-0.5 text-[10px] font-bold ${
              pathname === '/app' ? 'text-brand-orange' : 'text-brand-slate hover:text-brand-navy'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Home</span>
          </Link>

          {/* 2. Live Map */}
          <Link
            to="/app/map"
            className={`flex flex-col items-center justify-center gap-0.5 text-[10px] font-bold ${
              isActive('/app/map') ? 'text-brand-orange' : 'text-brand-slate hover:text-brand-navy'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>Map</span>
          </Link>

          {/* 3. Report Hazard (Raised prominent orange action) */}
          <Link
            to="/app/report"
            className="flex flex-col items-center justify-center relative -top-3"
            aria-label="Report Hazard"
          >
            <div className="w-12 h-12 rounded-full bg-brand-orange hover:bg-brand-orange-hover text-white flex items-center justify-center shadow-lg shadow-brand-orange/30 border-2 border-white transition-transform active:scale-95">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </Link>

          {/* 4. Ride Mode */}
          <Link
            to="/app/ride"
            className={`flex flex-col items-center justify-center gap-0.5 text-[10px] font-bold ${
              isActive('/app/ride') ? 'text-brand-orange' : 'text-brand-slate hover:text-brand-navy'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Ride</span>
          </Link>

          {/* 5. More Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="flex flex-col items-center justify-center gap-0.5 text-[10px] font-bold text-brand-slate hover:text-brand-navy cursor-pointer"
            aria-label="More Options"
          >
            <Menu className="w-4 h-4" />
            <span>More</span>
          </button>
        </div>
      </nav>

      {/* Slide-out Mobile "More" Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-brand-navy/60 backdrop-blur-xs flex justify-end animate-fadeIn">
          <div className="w-72 bg-white h-full p-5 shadow-modal flex flex-col justify-between overflow-y-auto">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-brand-neutral-grey">
                <Logo variant="compact" theme="light" size="sm" />
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 rounded-lg text-brand-slate hover:text-brand-navy"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Rider Navigation Links */}
              <div className="space-y-1 text-xs font-bold text-brand-navy">
                <div className="text-[10px] font-black uppercase tracking-wider text-brand-slate px-2 py-1">
                  Navigation
                </div>
                <Link
                  to="/app"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-xl hover:bg-brand-soft-blue"
                >
                  Dashboard
                </Link>
                <Link
                  to="/app/map"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-xl hover:bg-brand-soft-blue"
                >
                  Live Road Map
                </Link>
                <Link
                  to="/app/routes"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-xl hover:bg-brand-soft-blue"
                >
                  Route Warnings
                </Link>
                <Link
                  to="/app/roadscan"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-xl hover:bg-brand-soft-blue"
                >
                  Road Photo Inspection
                </Link>
                <Link
                  to="/app/ride"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-xl hover:bg-brand-soft-blue"
                >
                  Ride Mode
                </Link>
                <Link
                  to="/app/my-reports"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-xl hover:bg-brand-soft-blue"
                >
                  My Reports
                </Link>
                <Link
                  to="/app/alerts"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-xl hover:bg-brand-soft-blue"
                >
                  Road Alerts ({unreadNotifs})
                </Link>
                <Link
                  to="/app/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-xl hover:bg-brand-soft-blue"
                >
                  Profile
                </Link>
                <Link
                  to="/app/settings"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-xl hover:bg-brand-soft-blue"
                >
                  Settings
                </Link>
              </div>

              {/* Authority Link in Mobile Drawer */}
              <div className="pt-3 border-t border-brand-neutral-grey space-y-1">
                <div className="text-[10px] font-black uppercase tracking-wider text-brand-slate px-2 py-1">
                  Workspaces
                </div>
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-brand-orange bg-brand-warm-white font-bold text-xs"
                >
                  <Building2 className="w-4 h-4" />
                  <span>RoadSense Operations</span>
                </Link>
              </div>
            </div>

            <div className="pt-4 border-t border-brand-neutral-grey text-[11px] text-brand-slate">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setShowSignoutConfirm(true);
                }}
                className="w-full text-left py-2 font-bold text-brand-red flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sign Out Confirmation Modal */}
      <ConfirmModal
        isOpen={showSignoutConfirm}
        title="Sign Out of RoadSense"
        description="Are you sure you want to sign out of your commuter session?"
        confirmText="Sign Out"
        variant="danger"
        onClose={() => setShowSignoutConfirm(false)}
        onConfirm={() => {
          setShowSignoutConfirm(false);
          navigate('/login');
        }}
      />
    </>
  );
};
