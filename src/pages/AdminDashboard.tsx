import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Users, 
  Calendar, 
  DollarSign, 
  Settings, 
  Plus,
  Edit,
  Trash2,
  Clock,
  MapPin
} from 'lucide-react';
import Layout from '../components/Layout';
import StatsCard from '../components/StatsCard';
import { databaseService } from '../services/database';
import { useAuth } from '../hooks/useAuth';
import { Ground, BookingSlot, PricingRule, Analytics } from '../types';
import { formatCurrency } from '../utils/pricing';
import { format } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

const AdminDashboard: React.FC = () => {
  const [grounds, setGrounds] = useState<Ground[]>([]);
  const [bookings, setBookings] = useState<BookingSlot[]>([]);
  const [pricingRules, setPricingRules] = useState<PricingRule[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'grounds' | 'bookings' | 'pricing' | 'analytics'>('dashboard');
  const [isAddingGround, setIsAddingGround] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newGround, setNewGround] = useState<Partial<Ground>>({
    name: '',
    sport: 'Cricket',
    defaultPrice: 1500,
    currentPrice: 1500,
    description: '',
    facilities: [],
    isActive: true
  });
  
  const { profile, isAuthenticated } = useAuth();
  
  // Redirect if not admin
  React.useEffect(() => {
    if (isAuthenticated && profile && !profile.is_admin) {
      window.location.href = '/';
    }
  }, [isAuthenticated, profile]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [groundsData, bookingsData, rulesData] = await Promise.all([
        databaseService.getGrounds(),
        databaseService.getBookings(),
        databaseService.getPricingRules()
      ]);
      
      setGrounds(groundsData);
      setBookings(bookingsData);
      setPricingRules(rulesData);
      
      // Calculate analytics
      const totalRevenue = bookingsData.reduce((sum, booking) => sum + booking.price, 0);
      const totalBookings = bookingsData.length;
      
      // Calculate popular time slots
      const timeSlotCounts: { [key: string]: number } = {};
      bookingsData.forEach(booking => {
        timeSlotCounts[booking.time] = (timeSlotCounts[booking.time] || 0) + 1;
      });
      
      const popularTimeSlots = Object.entries(timeSlotCounts)
        .map(([time, count]) => ({ time, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 4);
      
      // Mock revenue by day (in real app, this would be calculated from actual data)
      const revenueByDay = [
        { day: 'Mon', revenue: Math.floor(totalRevenue * 0.12) },
        { day: 'Tue', revenue: Math.floor(totalRevenue * 0.15) },
        { day: 'Wed', revenue: Math.floor(totalRevenue * 0.18) },
        { day: 'Thu', revenue: Math.floor(totalRevenue * 0.16) },
        { day: 'Fri', revenue: Math.floor(totalRevenue * 0.22) },
        { day: 'Sat', revenue: Math.floor(totalRevenue * 0.25) },
        { day: 'Sun', revenue: Math.floor(totalRevenue * 0.20) }
      ];
      
      setAnalytics({
        totalRevenue,
        totalBookings,
        popularTimeSlots,
        revenueByDay,
        groundUtilization: groundsData.map(ground => ({
          groundId: ground.id,
          utilization: Math.floor(Math.random() * 30) + 60 // Mock data
        })),
        peakHours: ['17:00', '18:00', '19:00', '20:00'],
        aiRecommendations: {
          suggestedDiscounts: [
            { timeSlot: '12:00-15:00', discount: 25, reason: 'Low demand detected during lunch hours' },
            { timeSlot: '08:00-10:00', discount: 15, reason: 'Early morning slots underutilized' }
          ],
          peakPricing: [
            { timeSlot: '18:00-21:00', suggestedIncrease: 20, reason: 'High demand during evening peak hours' },
            { timeSlot: '21:00-23:00', suggestedIncrease: 15, reason: 'Weekend premium hours' }
          ]
        }
      });
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddGround = async () => {
    if (!newGround.name || !newGround.description) return;
    
    try {
      const ground: Omit<Ground, 'id'> = {
        name: newGround.name,
       sport: newGround.sport,
        defaultPrice: newGround.defaultPrice || 1500,
        currentPrice: newGround.currentPrice || 1500,
        image: newGround.sport === 'Cricket' 
          ? 'https://images.pexels.com/photos/1661950/pexels-photo-1661950.jpeg?auto=compress&cs=tinysrgb&w=800'
          : 'https://images.pexels.com/photos/114296/pexels-photo-114296.jpeg?auto=compress&cs=tinysrgb&w=800',
        description: newGround.description,
        facilities: newGround.facilities || [],
        isActive: true
      };
      
      await databaseService.addGround(ground);
      await loadData();
      setIsAddingGround(false);
      setNewGround({
        name: '',
        sport: 'Cricket',
        defaultPrice: 1500,
        currentPrice: 1500,
        description: '',
        facilities: [],
        isActive: true
      });
    } catch (error) {
      console.error('Error adding ground:', error);
      alert('Failed to add ground');
    }
  };

  const handleUpdateGroundPrice = async (groundId: string, newPrice: number) => {
    try {
      await databaseService.updateGround(groundId, { currentPrice: newPrice });
      await loadData();
    } catch (error) {
      console.error('Error updating ground price:', error);
    }
  };

  const handleToggleGroundStatus = async (groundId: string) => {
    try {
      const ground = grounds.find(g => g.id === groundId);
      if (ground) {
        await databaseService.updateGround(groundId, { isActive: !ground.isActive });
        await loadData();
      }
    } catch (error) {
      console.error('Error toggling ground status:', error);
    }
  };

  const handleUpdateBookingStatus = async (bookingId: string, status: 'paid' | 'pending' | 'failed') => {
    try {
      await databaseService.updateBooking(bookingId, { paymentStatus: status });
      await loadData();
    } catch (error) {
      console.error('Error updating booking status:', error);
    }
  };

  if (loading) {
    return (
      <Layout showNavbar={false}>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
          <div className="flex items-center space-x-4">
            <div className="spinner"></div>
            <span className="text-white text-lg">Loading admin dashboard...</span>
          </div>
        </div>
      </Layout>
    );
  }

  if (!analytics) {
    return (
      <Layout showNavbar={false}>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
          <div className="text-white text-lg">Failed to load analytics data</div>
        </div>
      </Layout>
    );
  }

  const renderDashboard = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Revenue"
          value={formatCurrency(analytics.totalRevenue)}
          icon={DollarSign}
          color="bg-green-500"
          change="12%"
          changeType="increase"
        />
        <StatsCard
          title="Total Bookings"
          value={analytics.totalBookings.toString()}
          icon={Calendar}
          color="bg-blue-500"
          change="8%"
          changeType="increase"
        />
        <StatsCard
          title="Active Grounds"
          value={grounds.filter(g => g.isActive).length.toString()}
          icon={MapPin}
          color="bg-purple-500"
        />
        <StatsCard
          title="Peak Hours"
          value={analytics.peakHours.length.toString()}
          icon={Clock}
          color="bg-orange-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700"
        >
          <h3 className="text-xl font-bold text-white mb-4">Revenue by Day</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.revenueByDay}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="day" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="revenue" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700"
        >
          <h3 className="text-xl font-bold text-white mb-4">Popular Time Slots</h3>
          <div className="space-y-3">
            {analytics.popularTimeSlots.map((slot, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-gray-300">{slot.time}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-slate-700 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full" 
                      style={{ width: `${(slot.count / Math.max(...analytics.popularTimeSlots.map(s => s.count))) * 100}%` }}
                    />
                  </div>
                  <span className="text-white font-semibold">{slot.count}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700"
      >
        <h3 className="text-xl font-bold text-white mb-4">AI Recommendations</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h4 className="text-lg font-semibold text-green-400 mb-3">Suggested Discounts</h4>
            <div className="space-y-3">
              {analytics.aiRecommendations.suggestedDiscounts.map((rec, index) => (
                <div key={index} className="bg-slate-700/50 rounded-lg p-3">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-white font-medium">{rec.timeSlot}</span>
                    <span className="text-green-400 font-bold">{rec.discount}% OFF</span>
                  </div>
                  <p className="text-gray-400 text-sm">{rec.reason}</p>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-lg font-semibold text-orange-400 mb-3">Peak Pricing</h4>
            <div className="space-y-3">
              {analytics.aiRecommendations.peakPricing.map((rec, index) => (
                <div key={index} className="bg-slate-700/50 rounded-lg p-3">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-white font-medium">{rec.timeSlot}</span>
                    <span className="text-orange-400 font-bold">+{rec.suggestedIncrease}%</span>
                  </div>
                  <p className="text-gray-400 text-sm">{rec.reason}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );

  const renderGrounds = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Manage Grounds</h2>
        <motion.button
          whileHover={{ scale: 1.05 }}
          onClick={() => setIsAddingGround(true)}
          className="bg-gradient-to-r from-blue-500 to-green-500 text-white px-6 py-2 rounded-lg font-medium hover:from-blue-600 hover:to-green-600 transition-all flex items-center space-x-2"
        >
          <Plus size={20} />
          <span>Add Ground</span>
        </motion.button>
      </div>

      {isAddingGround && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700"
        >
          <h3 className="text-xl font-bold text-white mb-4">Add New Ground</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Ground Name"
              value={newGround.name}
              onChange={(e) => setNewGround({...newGround, name: e.target.value})}
              className="bg-slate-800 text-white rounded-lg px-4 py-3 border border-slate-600 focus:border-blue-500 focus:outline-none"
            />
            <select
              value={newGround.sport}
              onChange={(e) => setNewGround({...newGround, sport: e.target.value as 'Cricket' | 'Football'})}
              className="bg-slate-800 text-white rounded-lg px-4 py-3 border border-slate-600 focus:border-blue-500 focus:outline-none"
            >
              <option value="Cricket">Cricket</option>
              <option value="Football">Football</option>
            </select>
            <input
              type="number"
              placeholder="Default Price"
              value={newGround.defaultPrice}
              onChange={(e) => setNewGround({...newGround, defaultPrice: Number(e.target.value), currentPrice: Number(e.target.value)})}
              className="bg-slate-800 text-white rounded-lg px-4 py-3 border border-slate-600 focus:border-blue-500 focus:outline-none"
            />
            <input
              type="text"
              placeholder="Description"
              value={newGround.description}
              onChange={(e) => setNewGround({...newGround, description: e.target.value})}
              className="bg-slate-800 text-white rounded-lg px-4 py-3 border border-slate-600 focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div className="flex space-x-4 mt-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={handleAddGround}
              className="bg-green-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-600 transition-all"
            >
              Add Ground
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={() => setIsAddingGround(false)}
              className="bg-gray-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-600 transition-all"
            >
              Cancel
            </motion.button>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {grounds.map((ground) => (
          <motion.div
            key={ground.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">{ground.name}</h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleToggleGroundStatus(ground.id)}
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    ground.isActive 
                      ? 'bg-green-500 text-white' 
                      : 'bg-red-500 text-white'
                  }`}
                >
                  {ground.isActive ? 'Active' : 'Inactive'}
                </button>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-300">Sport:</span>
                <span className="text-white font-medium">{ground.sport}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Current Price:</span>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    value={ground.currentPrice}
                    onChange={(e) => handleUpdateGroundPrice(ground.id, Number(e.target.value))}
                    className="bg-slate-700 text-white rounded px-2 py-1 text-sm w-20"
                  />
                  <span className="text-gray-400 text-sm">/hour</span>
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Default Price:</span>
                <span className="text-white font-medium">{formatCurrency(ground.defaultPrice)}</span>
              </div>
            </div>
            
            <div className="mt-4 flex flex-wrap gap-2">
              {ground.facilities.map((facility, index) => (
                <span
                  key={index}
                  className="bg-slate-700 text-gray-300 px-3 py-1 rounded-full text-xs"
                >
                  {facility}
                </span>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );

  const renderBookings = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Manage Bookings</h2>
      
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-700">
              <tr>
                <th className="text-left text-white font-semibold p-4">Date</th>
                <th className="text-left text-white font-semibold p-4">Time</th>
                <th className="text-left text-white font-semibold p-4">Ground</th>
                <th className="text-left text-white font-semibold p-4">Customer</th>
                <th className="text-left text-white font-semibold p-4">Duration</th>
                <th className="text-left text-white font-semibold p-4">Price</th>
                <th className="text-left text-white font-semibold p-4">Status</th>
                <th className="text-left text-white font-semibold p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => {
                const ground = grounds.find(g => g.id === booking.groundId);
                return (
                  <tr key={booking.id} className="border-b border-slate-700">
                    <td className="p-4 text-gray-300">{format(new Date(booking.date), 'MMM dd, yyyy')}</td>
                    <td className="p-4 text-gray-300">{booking.time}</td>
                    <td className="p-4 text-gray-300">{ground?.name}</td>
                    <td className="p-4 text-gray-300">{booking.userName}</td>
                    <td className="p-4 text-gray-300">{booking.duration}h</td>
                    <td className="p-4 text-white font-medium">{formatCurrency(booking.price)}</td>
                    <td className="p-4">
                      <select
                        value={booking.paymentStatus}
                        onChange={(e) => handleUpdateBookingStatus(booking.id, e.target.value as any)}
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          booking.paymentStatus === 'paid' 
                            ? 'bg-green-500 text-white' 
                            : booking.paymentStatus === 'pending'
                            ? 'bg-yellow-500 text-white'
                            : 'bg-red-500 text-white'
                        }`}
                      >
                        <option value="paid">Paid</option>
                        <option value="pending">Pending</option>
                        <option value="failed">Failed</option>
                      </select>
                    </td>
                    <td className="p-4">
                      <div className="flex space-x-2">
                        <button className="text-blue-400 hover:text-blue-300">
                          <Edit size={16} />
                        </button>
                        <button className="text-red-400 hover:text-red-300">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
    { id: 'grounds', label: 'Grounds', icon: MapPin },
    { id: 'bookings', label: 'Bookings', icon: Calendar },
    { id: 'pricing', label: 'Pricing', icon: DollarSign },
    { id: 'analytics', label: 'Analytics', icon: Users }
  ];

  return (
    <Layout showNavbar={false}>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="flex h-screen">
          {/* Sidebar */}
          <div className="w-64 bg-slate-900/50 backdrop-blur-sm border-r border-slate-700 p-6">
            <div className="flex items-center space-x-2 mb-8">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-green-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">SB</span>
              </div>
              <span className="text-white font-bold text-xl">Admin</span>
            </div>
            
            <nav className="space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-blue-500 to-green-500 text-white'
                      : 'text-gray-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <tab.icon size={20} />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-auto">
            <div className="p-8">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                {activeTab === 'dashboard' && renderDashboard()}
                {activeTab === 'grounds' && renderGrounds()}
                {activeTab === 'bookings' && renderBookings()}
                {activeTab === 'pricing' && (
                  <div className="text-white">
                    <h2 className="text-2xl font-bold mb-4">Pricing Management</h2>
                    <p>Pricing management interface would go here...</p>
                  </div>
                )}
                {activeTab === 'analytics' && (
                  <div className="text-white">
                    <h2 className="text-2xl font-bold mb-4">Advanced Analytics</h2>
                    <p>Advanced analytics dashboard would go here...</p>
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;