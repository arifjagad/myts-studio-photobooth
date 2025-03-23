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
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 text-white">
      <header className="py-6 text-center">
        <h1 className="text-4xl font-bold">Myts Studio Photobooth</h1>
        <p className="mt-2 text-white/80">Create beautiful memories in seconds</p>
      </header>
      
      <main className="container mx-auto px-4 py-8">
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

      <footer className="fixed bottom-0 left-0 right-0 py-4 text-center text-white/60">
        <p>© 2025 Myts Studio. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;