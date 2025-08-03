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
  Activity
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
          icon: <Shield className="h-5 w-5" />,
          text: 'Super Admin',
          active: location.pathname === '/super-admin-dashboard'
        },
        {
          to: '/super-admin-dashboard',
          icon: <Users className="h-5 w-5" />,
          text: 'User Management',
          active: location.pathname === '/super-admin-dashboard'
        },
        {
          to: '/super-admin-dashboard',
          icon: <Activity className="h-5 w-5" />,
          text: 'System Logs',
          active: location.pathname === '/super-admin-dashboard'
        }
      ];
    }
    if (isTeacher) {
      return [
        {
          to: '/teacher-main-dashboard',
          icon: <LayoutDashboard className="h-5 w-5" />,
          text: 'Dashboard',
          active: location.pathname === '/teacher-main-dashboard'
        },
        {
          to: '/create-test',
          icon: <Plus className="h-5 w-5" />,
          text: 'Create Test',
          active: location.pathname === '/create-test'
        },
        {
          to: '/manage-tests',
          icon: <ClipboardList className="h-5 w-5" />,
          text: 'Manage Tests',
          active: location.pathname === '/manage-tests'
        },
        {
          to: '/teacher/test-results',
          icon: <BarChart2 className="h-5 w-5" />,
          text: 'Results',
          active: location.pathname === '/teacher/test-results'
        }
      ];
    }
    return [
      {
        to: '/student-main-dashboard',
        icon: <LayoutDashboard className="h-5 w-5" />,
        text: 'Dashboard',
        active: location.pathname === '/student-main-dashboard'
      }
    ];
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo and Brand */}
          <Link
            to={isAuthenticated ? (isSuperAdmin ? '/super-admin-dashboard' : isTeacher ? '/teacher-main-dashboard' : '/student-main-dashboard') : '/'}
            className="flex items-center space-x-2 hover:opacity-75 transition-opacity"
          >
            <BookOpen className="h-8 w-8 text-indigo-600" />
            <span className="text-xl font-bold text-gray-900">SRM Lab</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {isAuthenticated && (
              <>
                {getNavLinks().map((link) => (
                  link.text === 'Results' ? (
                    <button
                      key={link.to + link.text}
                      onClick={() => navigate('/teacher/test-results')}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors
                        ${location.pathname === '/teacher/test-results' 
                          ? 'bg-indigo-50 text-indigo-700' 
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
                      className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors
                        ${location.pathname === '/teacher/test-management' 
                          ? 'bg-indigo-50 text-indigo-700' 
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
                      className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors
                        ${link.active 
                          ? 'bg-indigo-50 text-indigo-700' 
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
                    className={`flex items-center space-x-2 p-2 rounded-md transition-colors ${
                      activeDropdown === 'profile' 
                        ? 'bg-gray-100 text-gray-900' 
                        : 'text-gray-400 hover:text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    <User className="h-5 w-5" />
                    <ChevronDown className={`h-4 w-4 transition-transform ${
                      activeDropdown === 'profile' ? 'transform rotate-180' : ''
                    }`} />
                  </button>
                  
                  {activeDropdown === 'profile' && (
                    <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                      <div className="py-1">
                        <button
                          onClick={() => {
                            navigate('/profile');
                            handleDropdownToggle('profile');
                          }}
                          className="group flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <User className="h-4 w-4 mr-3 text-gray-400 group-hover:text-gray-500" />
                          Your Profile
                        </button>
                        <button
                          onClick={() => {
                            navigate('/settings');
                            handleDropdownToggle('profile');
                          }}
                          className="group flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <Settings className="h-4 w-4 mr-3 text-gray-400 group-hover:text-gray-500" />
                          Settings
                        </button>
                        <button
                          onClick={handleLogout}
                          className="group flex w-full items-center px-4 py-2 text-sm text-red-700 hover:bg-red-50"
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
                    className={`flex items-center space-x-2 p-2 rounded-md transition-colors ${
                      activeDropdown === 'help' 
                        ? 'bg-gray-100 text-gray-900' 
                        : 'text-gray-400 hover:text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    <HelpCircle className="h-5 w-5" />
                    <ChevronDown className={`h-4 w-4 transition-transform ${
                      activeDropdown === 'help' ? 'transform rotate-180' : ''
                    }`} />
                  </button>
                  
                  {activeDropdown === 'help' && (
                    <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                      <div className="py-1">
                        <Link
                          to="/faq"
                          className="group flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <HelpCircle className="h-4 w-4 mr-3 text-gray-400 group-hover:text-gray-500" />
                          FAQ
                        </Link>
                        <Link
                          to="/tutorials"
                          className="group flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <BookOpen className="h-4 w-4 mr-3 text-gray-400 group-hover:text-gray-500" />
                          Tutorials
                        </Link>
                        <Link
                          to="/support"
                          className="group flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <MessageCircle className="h-4 w-4 mr-3 text-gray-400 group-hover:text-gray-500" />
                          Contact Support
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-50"
              aria-expanded="false"
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

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {isAuthenticated ? (
              <>
                {getNavLinks().map((link) => (
                  link.text === 'Results' ? (
                    <button
                      key={link.to + link.text}
                      onClick={() => { navigate('/teacher/test-results'); setIsMenuOpen(false); }}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium ${location.pathname === '/teacher/test-results' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}
                      style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                      {link.icon}
                      <span>{link.text}</span>
                    </button>
                  ) : link.text === 'Manage Tests' ? (
                    <button
                      key={link.to + link.text}
                      onClick={() => { navigate('/teacher/test-management'); setIsMenuOpen(false); }}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium ${location.pathname === '/teacher/test-management' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}
                      style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                      {link.icon}
                      <span>{link.text}</span>
                    </button>
                  ) : (
                    <Link
                      key={link.to + link.text}
                      to={link.to}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium ${link.active ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {link.icon}
                      <span>{link.text}</span>
                    </Link>
                  )
                ))}
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center space-x-2 px-3 py-2 rounded-md text-base font-medium text-red-700 hover:bg-red-50"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/about"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                  onClick={() => setIsMenuOpen(false)}
                >
                  About
                </Link>
                <Link
                  to="/contact"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Contact
                </Link>
                <Link
                  to="/login"
                  className="block px-3 py-2 rounded-md text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};