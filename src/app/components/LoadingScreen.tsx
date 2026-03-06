import { motion } from 'motion/react';
import { useEffect, useState } from 'react';

interface LoadingScreenProps {
  onComplete: () => void;
}

export function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [startFade, setStartFade] = useState(false);

  useEffect(() => {
    // Após 3 segundos, inicia o fade
    const timer = setTimeout(() => {
      setStartFade(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.div
      className="fixed inset-0 z-[100] overflow-hidden"
      initial={{ opacity: 1 }}
      animate={{ opacity: startFade ? 0 : 1 }}
      transition={{ duration: 1, ease: "easeInOut" }}
      onAnimationComplete={() => {
        if (startFade) {
          onComplete();
        }
      }}
    >
      {/* Background com GIF animado */}
      <div 
        className="absolute inset-0 w-full h-full"
      >
        <img 
          src="https://i.imgur.com/RfJIuEz.gif"
          alt="Background"
          className="w-full h-full object-cover"
          style={{ 
            imageRendering: 'auto',
            pointerEvents: 'none',
          }}
        />
      </div>
    </motion.div>
  );
}