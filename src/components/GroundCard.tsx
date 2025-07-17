import React from 'react';
import { motion } from 'framer-motion';
import { Clock, MapPin, Star, Users } from 'lucide-react';
import { Ground } from '../types';
import { formatCurrency } from '../utils/pricing';

interface GroundCardProps {
  ground: Ground;
  onBook: (ground: Ground) => void;
}

const GroundCard: React.FC<GroundCardProps> = ({ ground, onBook }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -5 }}
      className="bg-white/10 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/20 hover:bg-white/20 transition-all"
    >
      <div className="relative">
        <img
          src={ground.image}
          alt={ground.name}
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-4 right-4 bg-gradient-to-r from-blue-500 to-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
          {ground.sport}
        </div>
      </div>
      
      <div className="p-6">
        <h3 className="text-white font-bold text-xl mb-2">{ground.name}</h3>
        <p className="text-gray-300 text-sm mb-4">{ground.description}</p>
        
        <div className="space-y-3 mb-6">
          <div className="flex items-center space-x-2 text-gray-300">
            <Clock size={16} />
            <span className="text-sm">8:00 AM - 3:00 AM</span>
          </div>
          <div className="flex items-center space-x-2 text-gray-300">
            <MapPin size={16} />
            <span className="text-sm">Indoor Facility</span>
          </div>
          <div className="flex items-center space-x-2 text-gray-300">
            <Users size={16} />
            <span className="text-sm">Professional Ground</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {ground.facilities.map((facility, index) => (
            <span
              key={index}
              className="bg-slate-800 text-gray-300 px-3 py-1 rounded-full text-xs"
            >
              {facility}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <div>
            <span className="text-green-400 font-bold text-2xl">
              {formatCurrency(ground.currentPrice)}
            </span>
            <span className="text-gray-400 text-sm">/hour</span>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onBook(ground)}
            className="bg-gradient-to-r from-blue-500 to-green-500 text-white px-6 py-2 rounded-lg font-medium hover:from-blue-600 hover:to-green-600 transition-all"
          >
            Book Now
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default GroundCard;