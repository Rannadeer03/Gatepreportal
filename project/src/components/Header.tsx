import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Menu,
  X,
  LogOut,
  LayoutDashboard,
  ClipboardList,
  BarChart2,
  Plus,
  User,
  Settings,
  HelpCircle,
  ChevronDown,
  MessageCircle,
  Shield,
  Users,
  Activity,
  LogIn
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import NotificationBell from './NotificationBell';

export const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<'profile' | 'help' | 'notification' | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, profile, user } = useAuthStore();
  
  const isAuthenticated = !!user && !!profile;
  const isTeacher = profile?.role === 'teacher';
  const isSuperAdmin = profile?.role === 'super_admin';

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (activeDropdown) {
        const target = event.target as HTMLElement;
        if (!target.closest('.profile-menu') && 
            !target.closest('.help-menu') &&
            !target.closest('.notification-menu')) {
          setActiveDropdown(null);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activeDropdown]);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  const handleDropdownToggle = (dropdownType: 'profile' | 'help' | 'notification') => {
    if (activeDropdown === dropdownType) {
      setActiveDropdown(null);
    } else {
      setActiveDropdown(dropdownType);
    }
  };

  const handleLogout = async () => {
    try {
      // Close any open dropdowns and menus first
      setActiveDropdown(null);
      setIsMenuOpen(false);
      
      console.log('Starting logout process...');
      
      // Perform logout - this should handle errors gracefully
      await signOut();
      
      console.log('Logout completed, redirecting...');
      
      // Force navigation to login page with replace to prevent back navigation
      navigate('/login', { replace: true });
      
      // Add a small delay then force page reload to ensure completely clean state
      setTimeout(() => {
        window.location.href = '/login';
      }, 100);
      
    } catch (error) {
      console.error('Logout error:', error);
      
      // Even if logout fails, we must redirect to login page
      // This ensures user can always logout from the UI perspective
      try {
        navigate('/login', { replace: true });
      } catch (navError) {
        console.error('Navigation error:', navError);
      }
      
      // Force redirect as fallback
      setTimeout(() => {
        window.location.href = '/login';
      }, 100);
    }
  };

  const getNavLinks = () => {
    if (isSuperAdmin) {
      return [
        {
          to: '/super-admin-dashboard',
          icon: <Shield className="h-4 w-4 sm:h-5 sm:w-5" />,
          text: 'Super Admin',
          active: location.pathname === '/super-admin-dashboard'
        },
        {
          to: '/super-admin-dashboard',
          icon: <Users className="h-4 w-4 sm:h-5 sm:w-5" />,
          text: 'User Management',
          active: location.pathname === '/super-admin-dashboard'
        },
        {
          to: '/super-admin-dashboard',
          icon: <Activity className="h-4 w-4 sm:h-5 sm:w-5" />,
          text: 'System Logs',
          active: location.pathname === '/super-admin-dashboard'
        }
      ];
    }
    if (isTeacher) {
      return [
        {
          to: '/teacher-main-dashboard',
          icon: <LayoutDashboard className="h-4 w-4 sm:h-5 sm:w-5" />,
          text: 'Dashboard',
          active: location.pathname === '/teacher-main-dashboard'
        },
        {
          to: '/create-test',
          icon: <Plus className="h-4 w-4 sm:h-5 sm:w-5" />,
          text: 'Create Test',
          active: location.pathname === '/create-test'
        },
        {
          to: '/manage-tests',
          icon: <ClipboardList className="h-4 w-4 sm:h-5 sm:w-5" />,
          text: 'Manage Tests',
          active: location.pathname === '/manage-tests'
        },
        {
          to: '/teacher/test-results',
          icon: <BarChart2 className="h-4 w-4 sm:h-5 sm:w-5" />,
          text: 'Results',
          active: location.pathname === '/teacher/test-results'
        }
      ];
    }
    return [
      {
        to: '/student-main-dashboard',
        icon: <LayoutDashboard className="h-4 w-4 sm:h-5 sm:w-5" />,
        text: 'Dashboard',
        active: location.pathname === '/student-main-dashboard'
      }
    ];
  };

  return (
    <header className="bg-white/95 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-gray-200/50">
      <div className="container mx-auto px-4 xs:px-6 sm:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16 lg:h-18">
          {/* Logo and Brand */}
          <Link
            to={isAuthenticated ? (isSuperAdmin ? '/super-admin-dashboard' : isTeacher ? '/teacher-main-dashboard' : '/student-main-dashboard') : '/'}
            className="flex items-center space-x-2 hover:opacity-75 transition-opacity touch-target"
          >
            <BookOpen className="h-6 w-6 sm:h-8 sm:w-8 text-indigo-600" />
            <span className="text-fluid-lg font-bold text-gray-900 hidden sm:block">SRM Lab</span>
            <span className="text-fluid-base font-bold text-gray-900 sm:hidden">SRM</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            {isAuthenticated ? (
              <>
                {getNavLinks().map((link) => (
                  link.text === 'Results' ? (
                    <button
                      key={link.to + link.text}
                      onClick={() => navigate('/teacher/test-results')}
                      className={`flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-lg text-fluid-sm font-medium transition-all duration-200 touch-target
                        ${location.pathname === '/teacher/test-results' 
                          ? 'bg-indigo-50 text-indigo-700 shadow-sm' 
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                        }`}
                      style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                      {link.icon}
                      <span>{link.text}</span>
                    </button>
                  ) : link.text === 'Manage Tests' ? (
                    <button
                      key={link.to + link.text}
                      onClick={() => navigate('/teacher/test-management')}
                      className={`flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-lg text-fluid-sm font-medium transition-all duration-200 touch-target
                        ${location.pathname === '/teacher/test-management' 
                          ? 'bg-indigo-50 text-indigo-700 shadow-sm' 
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                        }`}
                      style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                      {link.icon}
                      <span>{link.text}</span>
                    </button>
                  ) : (
                    <Link
                      key={link.to + link.text}
                      to={link.to}
                      className={`flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-lg text-fluid-sm font-medium transition-all duration-200 touch-target
                        ${link.active 
                          ? 'bg-indigo-50 text-indigo-700 shadow-sm' 
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                        }`}
                    >
                      {link.icon}
                      <span>{link.text}</span>
                    </Link>
                  )
                ))}

                {/* Notifications */}
                <NotificationBell 
                  isOpen={activeDropdown === 'notification'}
                  onToggle={() => handleDropdownToggle('notification')}
                />

                {/* Profile Menu */}
                <div className="relative profile-menu">
                  <button
                    onClick={() => handleDropdownToggle('profile')}
                    className={`flex items-center space-x-2 p-2 rounded-lg transition-all duration-200 touch-target ${
                      activeDropdown === 'profile' 
                        ? 'bg-gray-100 text-gray-900 shadow-sm' 
                        : 'text-gray-400 hover:text-gray-500 hover:bg-gray-50'
                    }`}
                    aria-expanded={activeDropdown === 'profile'}
                    aria-haspopup="true"
                  >
                    <User className="h-4 w-4 sm:h-5 sm:w-5" />
                    <ChevronDown className={`h-3 w-3 sm:h-4 sm:w-4 transition-transform duration-200 ${
                      activeDropdown === 'profile' ? 'transform rotate-180' : ''
                    }`} />
                  </button>
                  
                  {activeDropdown === 'profile' && (
                    <div className="absolute right-0 mt-2 w-48 sm:w-56 rounded-xl shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-dropdown animate-fade-in">
                      <div className="py-1">
                        <button
                          onClick={() => {
                            navigate('/profile');
                            handleDropdownToggle('profile');
                          }}
                          className="group flex w-full items-center px-4 py-3 text-fluid-sm text-gray-700 hover:bg-gray-50 touch-target transition-colors"
                        >
                          <User className="h-4 w-4 mr-3 text-gray-400 group-hover:text-gray-500" />
                          Your Profile
                        </button>
                        <button
                          onClick={() => {
                            navigate('/settings');
                            handleDropdownToggle('profile');
                          }}
                          className="group flex w-full items-center px-4 py-3 text-fluid-sm text-gray-700 hover:bg-gray-50 touch-target transition-colors"
                        >
                          <Settings className="h-4 w-4 mr-3 text-gray-400 group-hover:text-gray-500" />
                          Settings
                        </button>
                        <button
                          onClick={handleLogout}
                          className="group flex w-full items-center px-4 py-3 text-fluid-sm text-red-700 hover:bg-red-50 touch-target transition-colors"
                        >
                          <LogOut className="h-4 w-4 mr-3 text-red-400 group-hover:text-red-500" />
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Help Menu */}
                <div className="relative help-menu ml-2">
                  <button
                    onClick={() => handleDropdownToggle('help')}
                    className={`flex items-center space-x-2 p-2 rounded-lg transition-all duration-200 touch-target ${
                      activeDropdown === 'help' 
                        ? 'bg-gray-100 text-gray-900 shadow-sm' 
                        : 'text-gray-400 hover:text-gray-500 hover:bg-gray-50'
                    }`}
                    aria-expanded={activeDropdown === 'help'}
                    aria-haspopup="true"
                  >
                    <HelpCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                    <ChevronDown className={`h-3 w-3 sm:h-4 sm:w-4 transition-transform duration-200 ${
                      activeDropdown === 'help' ? 'transform rotate-180' : ''
                    }`} />
                  </button>
                  
                  {activeDropdown === 'help' && (
                    <div className="absolute right-0 mt-2 w-56 sm:w-64 rounded-xl shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-dropdown animate-fade-in">
                      <div className="py-1">
                        <Link
                          to="/faq"
                          className="group flex items-center px-4 py-3 text-fluid-sm text-gray-700 hover:bg-gray-50 touch-target transition-colors"
                        >
                          <HelpCircle className="h-4 w-4 mr-3 text-gray-400 group-hover:text-gray-500" />
                          FAQ
                        </Link>
                        <Link
                          to="/tutorials"
                          className="group flex items-center px-4 py-3 text-fluid-sm text-gray-700 hover:bg-gray-50 touch-target transition-colors"
                        >
                          <BookOpen className="h-4 w-4 mr-3 text-gray-400 group-hover:text-gray-500" />
                          Tutorials
                        </Link>
                        <Link
                          to="/support"
                          className="group flex items-center px-4 py-3 text-fluid-sm text-gray-700 hover:bg-gray-50 touch-target transition-colors"
                        >
                          <MessageCircle className="h-4 w-4 mr-3 text-gray-400 group-hover:text-gray-500" />
                          Contact Support
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                {/* Login Button for unauthenticated users */}
                <Link
                  to="/login"
                  className="inline-flex items-center px-3 sm:px-4 py-2 border border-transparent text-fluid-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 touch-target shadow-sm hover:shadow-md"
                >
                  <LogIn className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Login</span>
                  <span className="sm:hidden">Sign In</span>
                </Link>
                
                {/* Register Button for unauthenticated users */}
                <Link
                  to="/register"
                  className="inline-flex items-center px-3 sm:px-4 py-2 border border-indigo-600 text-fluid-sm font-medium rounded-lg text-indigo-600 bg-white hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 touch-target ml-2"
                >
                  <span className="hidden sm:inline">Sign Up</span>
                  <span className="sm:hidden">Register</span>
                </Link>
              </>
            )}

          </nav>

          {/* Mobile menu button */}
          <div className="lg:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-3 rounded-lg text-gray-400 hover:text-gray-500 hover:bg-gray-50 touch-target transition-all duration-200"
              aria-expanded={isMenuOpen}
              aria-label="Toggle navigation menu"
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <X className="block h-6 w-6" />
              ) : (
                <Menu className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu overlay */}
      {isMenuOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setIsMenuOpen(false)}
          />
          
          {/* Mobile menu */}
          <div className="lg:hidden fixed top-14 sm:top-16 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50 animate-slide-down max-h-[calc(100vh-4rem)] overflow-y-auto safe-area-bottom">
            <div className="px-4 py-3 space-y-2">
              {isAuthenticated ? (
                <>
                  {getNavLinks().map((link) => (
                    link.text === 'Results' ? (
                      <button
                        key={link.to + link.text}
                        onClick={() => { navigate('/teacher/test-results'); setIsMenuOpen(false); }}
                        className={`flex items-center space-x-3 px-4 py-4 rounded-lg text-fluid-base font-medium touch-target w-full text-left transition-all duration-200 ${
                          location.pathname === '/teacher/test-results' 
                            ? 'bg-indigo-50 text-indigo-700 shadow-sm' 
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                        }`}
                        style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                      >
                        {link.icon}
                        <span>{link.text}</span>
                      </button>
                    ) : link.text === 'Manage Tests' ? (
                      <button
                        key={link.to + link.text}
                        onClick={() => { navigate('/teacher/test-management'); setIsMenuOpen(false); }}
                        className={`flex items-center space-x-3 px-4 py-4 rounded-lg text-fluid-base font-medium touch-target w-full text-left transition-all duration-200 ${
                          location.pathname === '/teacher/test-management' 
                            ? 'bg-indigo-50 text-indigo-700 shadow-sm' 
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                        }`}
                        style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                      >
                        {link.icon}
                        <span>{link.text}</span>
                      </button>
                    ) : (
                      <Link
                        key={link.to + link.text}
                        to={link.to}
                        className={`flex items-center space-x-3 px-4 py-4 rounded-lg text-fluid-base font-medium touch-target w-full transition-all duration-200 ${
                          link.active 
                            ? 'bg-indigo-50 text-indigo-700 shadow-sm' 
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                        }`}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {link.icon}
                        <span>{link.text}</span>
                      </Link>
                    )
                  ))}
                  
                  {/* Mobile Help & Support Actions */}
                  <div className="border-t border-gray-200 pt-2 mt-2 space-y-1">
                    <Link
                      to="/faq"
                      className="flex items-center space-x-3 px-4 py-4 rounded-lg text-fluid-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 touch-target w-full transition-all duration-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <HelpCircle className="h-5 w-5" />
                      <span>FAQ</span>
                    </Link>
                    <Link
                      to="/tutorials"
                      className="flex items-center space-x-3 px-4 py-4 rounded-lg text-fluid-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 touch-target w-full transition-all duration-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <BookOpen className="h-5 w-5" />
                      <span>Tutorials</span>
                    </Link>
                    <Link
                      to="/support"
                      className="flex items-center space-x-3 px-4 py-4 rounded-lg text-fluid-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 touch-target w-full transition-all duration-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <MessageCircle className="h-5 w-5" />
                      <span>Contact Support</span>
                    </Link>
                  </div>

                  {/* Mobile Profile Actions */}
                  <div className="border-t border-gray-200 pt-2 mt-2 space-y-1">
                    <Link
                      to="/profile"
                      className="flex items-center space-x-3 px-4 py-4 rounded-lg text-fluid-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 touch-target w-full transition-all duration-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <User className="h-5 w-5" />
                      <span>Your Profile</span>
                    </Link>
                    <Link
                      to="/settings"
                      className="flex items-center space-x-3 px-4 py-4 rounded-lg text-fluid-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 touch-target w-full transition-all duration-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Settings className="h-5 w-5" />
                      <span>Settings</span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center space-x-3 px-4 py-4 rounded-lg text-fluid-base font-medium text-red-700 hover:bg-red-50 touch-target transition-all duration-200"
                    >
                      <LogOut className="h-5 w-5" />
                      <span>Logout</span>
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <Link
                    to="/about"
                    className="block px-4 py-4 rounded-lg text-fluid-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 touch-target transition-all duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    About
                  </Link>
                  <Link
                    to="/contact"
                    className="block px-4 py-4 rounded-lg text-fluid-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 touch-target transition-all duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Contact
                  </Link>
                  
                  {/* Mobile Help & Support for unauthenticated users */}
                  <div className="border-t border-gray-200 pt-2 mt-2 space-y-1">
                    <Link
                      to="/faq"
                      className="flex items-center space-x-3 px-4 py-4 rounded-lg text-fluid-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 touch-target w-full transition-all duration-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <HelpCircle className="h-5 w-5" />
                      <span>FAQ</span>
                    </Link>
                    <Link
                      to="/tutorials"
                      className="flex items-center space-x-3 px-4 py-4 rounded-lg text-fluid-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 touch-target w-full transition-all duration-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <BookOpen className="h-5 w-5" />
                      <span>Tutorials</span>
                    </Link>
                    <Link
                      to="/support"
                      className="flex items-center space-x-3 px-4 py-4 rounded-lg text-fluid-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 touch-target w-full transition-all duration-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <MessageCircle className="h-5 w-5" />
                      <span>Contact Support</span>
                    </Link>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-2 mt-2 space-y-2">
                    <Link
                      to="/login"
                      className="block px-4 py-4 rounded-lg text-fluid-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 touch-target text-center transition-all duration-200 shadow-sm hover:shadow-md"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      className="block px-4 py-4 rounded-lg text-fluid-base font-medium text-indigo-600 border border-indigo-600 hover:bg-indigo-50 touch-target text-center transition-all duration-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Sign Up
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </header>
  );
};