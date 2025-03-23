import React from 'react';
import { motion } from 'framer-motion';
import { Camera } from 'lucide-react';
import usePhotoboothStore from '../store/photoboothStore';

function PhotoCountSelector() {
  const setPhotoCount = usePhotoboothStore((state) => state.setPhotoCount);
  const setStep = usePhotoboothStore((state) => state.setStep);

  const handleSelect = (count: 3 | 4) => {
    setPhotoCount(count);
    setStep(2);
  };

  return (
    <div className="flex flex-col items-center justify-center gap-8">
      <h2 className="text-2xl font-semibold text-center">How many photos would you like to take?</h2>
      
      <div className="flex gap-6">
        {[3, 4].map((count) => (
          <motion.button
            key={count}
            className="bg-white/10 hover:bg-white/20 backdrop-blur-lg rounded-xl p-8 flex flex-col items-center gap-4 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleSelect(count as 3 | 4)}
          >
            <div className="relative">
              <Camera size={48} className="text-white" />
              <span className="absolute -top-2 -right-2 w-6 h-6 bg-white text-purple-900 rounded-full flex items-center justify-center text-sm font-bold">
                {count}
              </span>
            </div>
            <span className="text-xl font-medium">{count} Photos</span>
            <p className="text-sm text-white/60 text-center">
              {count === 3 ? 'Perfect for portraits' : 'Great for group shots'}
            </p>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

export default PhotoCountSelector;