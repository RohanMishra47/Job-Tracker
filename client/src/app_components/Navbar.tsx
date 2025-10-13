import { motion } from 'framer-motion';
import { Briefcase, ChevronDown, Menu, User, X } from 'lucide-react';
import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';

const NAVBAR_SHADOW = '0_4px_10px_rgba(128,0,128,0.2)';

type NavItemProps = {
  to: string;
  children: React.ReactNode;
};

const NavItem = ({ to, children }: NavItemProps) => (
  <NavLink
    to={to}
    className={({ isActive: active }) =>
      `pb-1 border-b-2 transition-all ${
        active
          ? 'text-purple-600 font-semibold border-purple-600'
          : 'text-gray-700 border-b-2 border-transparent hover:text-purple-600 hover:border-purple-300'
      }`
    }
  >
    {children}
  </NavLink>
);

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  // Track scroll to add/remove shadow
  React.useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 0);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const getBreadcrumb = () => {
    const routes: Record<string, string> = {
      '/dashboard': 'Dashboard',
      '/createJob': 'Create Job',
      '/editJob': 'Edit Job',
    };
    return routes[location.pathname] || 'Dashboard';
  };

  return (
    <motion.nav
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={`bg-white sticky top-0 left-0 w-full z-50 transition-shadow ${
        scrolled ? `shadow-[${NAVBAR_SHADOW}]` : ''
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        {/* Left: Logo and Brand */}
        <div className="flex items-center gap-2">
          <Briefcase size={24} className="text-purple-600" />
          <h1 className="text-xl font-bold text-gray-900 hidden sm:block">Job Tracker</h1>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 rounded p-1 transition"
            aria-label="Toggle navigation menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Center: Desktop Menu */}
        <ul className="hidden md:flex gap-8 items-center">
          <NavItem to="/dashboard">Dashboard</NavItem>

          {/* Dropdown */}
          <div className="relative group">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-1 text-gray-700 hover:text-purple-600 pb-1 border-b-2 border-transparent transition-all focus:outline-none focus:ring-2 focus:ring-purple-500 rounded px-2"
              aria-label="Job Actions menu"
            >
              Job Actions
              <ChevronDown
                size={16}
                className={`transition-transform duration-300 ${showDropdown ? 'rotate-180' : ''}`}
              />
            </button>

            {/* Dropdown Menu with Animation */}
            <motion.ul
              initial={{ opacity: 0, y: -10 }}
              animate={showDropdown ? { opacity: 1, y: 0 } : { opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className={`absolute top-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg w-44 py-2 z-10 ${
                showDropdown ? 'block' : 'hidden'
              }`}
            >
              <NavLink
                to="/createJob"
                onClick={() => setShowDropdown(false)}
                className={({ isActive }) =>
                  `block px-4 py-2 transition-colors ${
                    isActive
                      ? 'bg-purple-100 text-purple-700 font-medium'
                      : 'text-gray-700 hover:bg-purple-50 hover:text-purple-700'
                  }`
                }
              >
                Create Job
              </NavLink>
              <NavLink
                to="/editJob"
                onClick={() => setShowDropdown(false)}
                className={({ isActive }) =>
                  `block px-4 py-2 transition-colors ${
                    isActive
                      ? 'bg-purple-100 text-purple-700 font-medium'
                      : 'text-gray-700 hover:bg-purple-50 hover:text-purple-700'
                  }`
                }
              >
                Edit Job
              </NavLink>
            </motion.ul>
          </div>
        </ul>

        {/* Right: User Profile */}
        <div className="flex items-center gap-4">
          <button
            className="p-2 text-gray-600 hover:text-purple-600 hover:bg-gray-100 rounded-lg transition focus:outline-none focus:ring-2 focus:ring-purple-500"
            aria-label="User profile"
          >
            <User size={20} />
          </button>
        </div>
      </div>

      {/* Breadcrumb (Desktop) */}
      <div className="hidden md:block max-w-7xl mx-auto px-4 pb-2">
        <p className="text-xs text-gray-500">
          You are currently on: <span className="text-gray-700 font-medium">{getBreadcrumb()}</span>
        </p>
      </div>

      {/* Mobile Menu */}
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={isOpen ? { opacity: 1, height: 'auto' } : { opacity: 0, height: 0 }}
        transition={{ duration: 0.3 }}
        className="md:hidden overflow-hidden"
      >
        <ul className="flex flex-col gap-1 px-4 py-3 bg-gray-50 border-t border-gray-200">
          <NavLink
            to="/dashboard"
            onClick={() => setIsOpen(false)}
            className={({ isActive }) =>
              `px-3 py-2 rounded-md transition ${
                isActive
                  ? 'bg-purple-100 text-purple-700 font-medium'
                  : 'text-gray-700 hover:bg-purple-50 hover:text-purple-700'
              }`
            }
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/createJob"
            onClick={() => setIsOpen(false)}
            className={({ isActive }) =>
              `px-3 py-2 rounded-md transition ${
                isActive
                  ? 'bg-purple-100 text-purple-700 font-medium'
                  : 'text-gray-700 hover:bg-purple-50 hover:text-purple-700'
              }`
            }
          >
            Create Job
          </NavLink>
          <NavLink
            to="/editJob"
            onClick={() => setIsOpen(false)}
            className={({ isActive }) =>
              `px-3 py-2 rounded-md transition ${
                isActive
                  ? 'bg-purple-100 text-purple-700 font-medium'
                  : 'text-gray-700 hover:bg-purple-50 hover:text-purple-700'
              }`
            }
          >
            Edit Job
          </NavLink>
        </ul>
      </motion.div>
    </motion.nav>
  );
};

export default Navbar;
