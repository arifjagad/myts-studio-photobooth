import React from 'react';
import { motion } from 'framer-motion';
import { Layout as LayoutIcon, LayoutGrid, FlipVertical as LayoutVertical } from 'lucide-react';
import usePhotoboothStore from '../store/photoboothStore';
import { Layout } from '../types';

function LayoutSelector() {
  const { photoCount, selectedLayout, setLayout, setStep } = usePhotoboothStore();

  const layouts: { id: Layout; icon: typeof LayoutIcon; label: string }[] = [
    { id: 'vertical', icon: LayoutVertical, label: 'Vertical' },
    ...(photoCount === 4
      ? [
          { id: 'square', icon: LayoutGrid, label: '2x2 Grid' },
        ]
      : []),
  ];

  const handleLayoutSelect = (layout: Layout) => {
    setLayout(layout);
    setStep(4);
  };

  return (
    <div className="flex flex-col items-center gap-8">
      <h2 className="text-2xl font-semibold">Choose your layout</h2>

      <div className="grid grid-cols-3 gap-6">
        {layouts.map(({ id, icon: Icon, label }) => (
          <motion.button
            key={id}
            className={`p-8 rounded-xl flex flex-col items-center gap-4 transition-colors ${
              selectedLayout === id ? 'bg-white text-neutral-900' : 'bg-white/10 hover:bg-white/20'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleLayoutSelect(id)}
          >
            <Icon size={48} />
            <span className="text-lg font-medium">{label}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

export default LayoutSelector;