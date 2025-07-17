import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Layout from '../components/Layout';
import Hero from '../components/Hero';
import GroundCard from '../components/GroundCard';
import BookingModal from '../components/BookingModal';
import { Ground } from '../types';
import { databaseService } from '../services/database';
import { useAuth } from '../hooks/useAuth';

const HomePage: React.FC = () => {
  const [grounds, setGrounds] = useState<Ground[]>([]);
  const [selectedGround, setSelectedGround] = useState<Ground | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    loadGrounds();
  }, []);

  const loadGrounds = async () => {
    try {
      const groundsData = await databaseService.getGrounds();
      setGrounds(groundsData);
    } catch (error) {
      console.error('Error loading grounds:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookGround = (ground: Ground) => {
    if (!isAuthenticated) {
      alert('Please log in to make a booking');
      window.location.href = '/login';
      return;
    }
    
    setSelectedGround(ground);
    setIsBookingModalOpen(true);
  };

  const handleBookingSuccess = () => {
    loadGrounds();
  };

  return (
    <Layout>
      <Hero />
      
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              Available <span className="bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent">Grounds</span>
            </h2>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
              Choose from our premium indoor sports facilities with professional-grade equipment and modern amenities.
            </p>
          </motion.div>

          {loading ? (
            <div className="flex justify-center items-center py-16">
              <div className="spinner"></div>
              <span className="text-white ml-4">Loading grounds...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {grounds.filter(ground => ground.isActive).map((ground, index) => (
                <motion.div
                  key={ground.id}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <GroundCard
                    ground={ground}
                    onBook={handleBookGround}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {selectedGround && (
        <BookingModal
          ground={selectedGround}
          isOpen={isBookingModalOpen}
          onClose={() => setIsBookingModalOpen(false)}
          onSuccess={handleBookingSuccess}
        />
      )}
    </Layout>
  );
};

export default HomePage;