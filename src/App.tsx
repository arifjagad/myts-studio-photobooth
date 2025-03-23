import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import usePhotoboothStore from './store/photoboothStore';
import PhotoCountSelector from './components/PhotoCountSelector';
import CameraCapture from './components/CameraCapture';
import LayoutSelector from './components/LayoutSelector';
import FrameCustomizer from './components/FrameCustomizer';

function App() {
  const step = usePhotoboothStore((state) => state.step);

  const renderStep = () => {
    switch (step) {
      case 1:
        return <PhotoCountSelector />;
      case 2:
        return <CameraCapture />;
      case 3:
        return <LayoutSelector />;
      case 4:
        return <FrameCustomizer />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 text-white flex flex-col px-8">
      <header className="py-6 text-center">
        <h1 className="text-4xl font-bold">Myts Studio Photobooth</h1>
        <p className="mt-2 text-white/80">Create beautiful memories in seconds</p>
      </header>
      
      <main className="container mx-auto px-4 py-8 flex-grow">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="py-4 text-center text-white/60 mt-auto">
        <p>© 2025 Myts Studio. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;