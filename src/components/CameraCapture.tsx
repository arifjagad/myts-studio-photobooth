import React, { useCallback, useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Webcam from 'react-webcam';
import { Camera, RefreshCw } from 'lucide-react';
import usePhotoboothStore from '../store/photoboothStore';

function CameraCapture() {
  const webcamRef = useRef<Webcam>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const { photoCount, photos, addPhoto, setStep } = usePhotoboothStore();
  
  const capture = useCallback(() => {
    if (webcamRef.current && !isCapturing) {
      setIsCapturing(true);
      // Add a small delay to ensure we don't get duplicate captures
      setTimeout(() => {
        const imageSrc = webcamRef.current?.getScreenshot();
        if (imageSrc) {
          addPhoto(imageSrc);
        }
        setIsCapturing(false);
      }, 100);
    }
  }, [addPhoto, isCapturing]);

  const startPhotoSequence = useCallback(() => {
    if (photos.length >= photoCount || isCapturing || countdown !== null) return;
    
    let currentCount = 3;
    setCountdown(currentCount);
    
    const countdownInterval = setInterval(() => {
      currentCount -= 1;
      if (currentCount > 0) {
        setCountdown(currentCount);
      } else {
        clearInterval(countdownInterval);
        setCountdown(null);
        capture();
      }
    }, 1000);

    return () => clearInterval(countdownInterval);
  }, [capture, photoCount, photos.length, isCapturing, countdown]);

  // Automatically start next photo after a delay
  useEffect(() => {
    if (photos.length > 0 && photos.length < photoCount && !countdown && !isCapturing) {
      const timer = setTimeout(() => {
        startPhotoSequence();
      }, 1500); // Increased delay between photos for better timing
      return () => clearTimeout(timer);
    }
  }, [photos.length, photoCount, countdown, isCapturing, startPhotoSequence]);

  const retakePhotos = () => {
    usePhotoboothStore.setState({ photos: [] });
  };

  const proceedToLayout = () => {
    setStep(3);
  };

  return (
    <div className="flex flex-col items-center gap-8">
      <div className="relative">
        <Webcam
          ref={webcamRef}
          audio={false}
          screenshotFormat="image/jpeg"
          className="rounded-xl shadow-lg w-[640px] h-[480px] object-cover"
          mirrored={true}
        />
        {countdown && (
          <motion.div
            initial={{ scale: 2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="absolute inset-0 flex items-center justify-center bg-black/50 text-white text-8xl font-bold rounded-xl"
          >
            {countdown}
          </motion.div>
        )}
      </div>

      <div className="flex gap-4">
        {photos.map((photo, index) => (
          <div key={index} className="w-24 h-24 rounded-lg overflow-hidden">
            <img src={photo} alt={`Photo ${index + 1}`} className="w-full h-full object-cover" />
          </div>
        ))}
        {Array.from({ length: photoCount - photos.length }).map((_, index) => (
          <div key={`empty-${index}`} className="w-24 h-24 rounded-lg bg-white/10 flex items-center justify-center">
            <Camera className="text-white/50" />
          </div>
        ))}
      </div>

      <div className="flex gap-4">
        {photos.length === photoCount ? (
          <>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-lg flex items-center gap-2"
              onClick={retakePhotos}
            >
              <RefreshCw size={20} />
              Retake Photos
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 bg-white rounded-lg text-neutral-900 font-semibold"
              onClick={proceedToLayout}
            >
              Choose Layout
            </motion.button>
          </>
        ) : (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-3 bg-white rounded-lg text-neutral-900 font-semibold"
            onClick={startPhotoSequence}
            disabled={countdown !== null || isCapturing || photos.length > 0}
          >
            Start Photo Session
          </motion.button>
        )}
      </div>

      {photos.length === 0 && (
        <p className="text-white/80 text-center">
          Click "Start Photo Session" to begin. The camera will automatically take {photoCount} photos with a 3-second countdown between each shot.
        </p>
      )}
      {photos.length > 0 && photos.length < photoCount && (
        <p className="text-white/80 text-center">
          Taking photo {photos.length + 1} of {photoCount}...
        </p>
      )}
    </div>
  );
}

export default CameraCapture;