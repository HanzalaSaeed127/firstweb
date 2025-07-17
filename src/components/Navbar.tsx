import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Menu, X, User, Calendar, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { profile, signOut } = useAuth();

  const handleLogout = () => {
    signOut();
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 bg-slate-900/90 backdrop-blur-lg border-b border-slate-800"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center space-x-2"
            >
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-green-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">SB</span>
              </div>
              <span className="text-white font-bold text-xl">SportBook</span>
            </motion.div>
          </div>

          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <a href="/" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">
                Home
              </a>
              <a href="/booking" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">
                Book Now
              </a>
              <a href="/about" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">
                About
              </a>
              <a href="/contact" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">
                Contact
              </a>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {profile ? (
              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 text-white bg-slate-800 px-4 py-2 rounded-lg hover:bg-slate-700 transition-colors"
                >
                  <User size={16} />
                  <span className="hidden sm:block">{profile.name}</span>
                </motion.button>
                
                {showUserMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute right-0 mt-2 w-48 bg-slate-800 rounded-lg shadow-lg py-2 z-50"
                  >
                    <a href="/profile" className="flex items-center space-x-2 px-4 py-2 text-gray-300 hover:text-white hover:bg-slate-700">
                      <User size={16} />
                      <span>Profile</span>
                    </a>
                    <a href="/my-bookings" className="flex items-center space-x-2 px-4 py-2 text-gray-300 hover:text-white hover:bg-slate-700">
                      <Calendar size={16} />
                      <span>My Bookings</span>
                    </a>
                    {profile.is_admin && (
                      <a href="/admin" className="flex items-center space-x-2 px-4 py-2 text-gray-300 hover:text-white hover:bg-slate-700">
                        <Settings size={16} />
                        <span>Admin Panel</span>
                      </a>
                    )}
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-2 px-4 py-2 text-gray-300 hover:text-white hover:bg-slate-700 w-full text-left"
                    >
                      <LogOut size={16} />
                      <span>Logout</span>
                    </button>
                  </motion.div>
                )}
              </div>
            ) : (
              <motion.a
                whileHover={{ scale: 1.05 }}
                href="/login"
                className="bg-gradient-to-r from-blue-500 to-green-500 text-white px-6 py-2 rounded-lg font-medium hover:from-blue-600 hover:to-green-600 transition-all"
              >
                Login
              </motion.a>
            )}

            <div className="md:hidden">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="text-gray-300 hover:text-white"
              >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden bg-slate-900/95 backdrop-blur-lg"
        >
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <a href="/" className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium">
              Home
            </a>
            <a href="/booking" className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium">
              Book Now
            </a>
            <a href="/about" className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium">
              About
            </a>
            <a href="/contact" className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium">
              Contact
            </a>
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
};

export default Navbar;