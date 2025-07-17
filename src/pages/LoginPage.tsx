import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, Lock } from 'lucide-react';
import Layout from '../components/Layout';
import { useAuth } from '../hooks/useAuth';
import GoogleSignInButton from '../components/GoogleSignInButton';

const LoginPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: ''
  });
  
  const { signIn, signUp, isAuthenticated, profile } = useAuth();
  
  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated && profile) {
      if (profile.is_admin) {
        window.location.href = '/admin';
      } else {
        window.location.href = '/';
      }
    }
  }, [isAuthenticated, profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (isLogin) {
        const result = await signIn(formData.email, formData.password);
        if (result.profile.is_admin) {
          window.location.href = '/admin';
        } else {
          window.location.href = '/';
        }
      } else {
        const result = await signUp(formData.email, formData.password, {
          name: formData.name,
          phone: formData.phone
        });
        
        if (result.profile.is_admin) {
          window.location.href = '/admin';
        } else {
          window.location.href = '/';
        }
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      alert(error.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-md w-full space-y-8"
        >
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="mt-2 text-gray-300">
              {isLogin ? 'Sign in to your account' : 'Join SportBook today'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div className="space-y-4">
              {!isLogin && (
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      id="name"
                      type="text"
                      required={!isLogin}
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="bg-slate-800 text-white rounded-lg px-4 py-3 pl-10 border border-slate-600 focus:border-blue-500 focus:outline-none w-full"
                      placeholder="Enter your full name"
                    />
                  </div>
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="bg-slate-800 text-white rounded-lg px-4 py-3 pl-10 border border-slate-600 focus:border-blue-500 focus:outline-none w-full"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              {!isLogin && (
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      id="phone"
                      type="tel"
                      required={!isLogin}
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="bg-slate-800 text-white rounded-lg px-4 py-3 pl-10 border border-slate-600 focus:border-blue-500 focus:outline-none w-full"
                      placeholder="Enter your phone number"
                    />
                  </div>
                </div>
              )}

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    id="password"
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="bg-slate-800 text-white rounded-lg px-4 py-3 pl-10 border border-slate-600 focus:border-blue-500 focus:outline-none w-full"
                    placeholder="Enter your password"
                  />
                </div>
              </div>
            </div>

            <div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-500 to-green-500 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-600 hover:to-green-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <div className="spinner mr-2"></div>
                ) : null}
                {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
              </motion.button>
            </div>

            <div className="my-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-600"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-slate-900 text-gray-400">Or continue with</span>
                </div>
              </div>
            </div>

            <GoogleSignInButton
              onSuccess={(user) => {
                if (user.profile?.is_admin) {
                  window.location.href = '/admin';
                } else {
                  window.location.href = '/';
                }
              }}
              onError={(error) => {
                console.error('Google Sign-In error:', error);
                alert('Google Sign-In failed. Please try again.');
              }}
            />

            <div className="text-center">
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-blue-400 hover:text-blue-300 text-sm"
              >
                {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
              </button>
            </div>
          </form>

          <div className="text-center">
            <p className="text-gray-400 text-sm">
              Admin access: use email "admin@sportbook.com"
            </p>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
};

export default LoginPage;