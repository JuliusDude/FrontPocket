import React, { useMemo, useEffect, useState } from 'react';
import { motion, useSpring } from 'framer-motion';

export const ParticlesBackground: React.FC = () => {
  const [mounted, setMounted] = useState(false);
  const mouseX = useSpring(0, { stiffness: 50, damping: 20 });
  const mouseY = useSpring(0, { stiffness: 50, damping: 20 });

  useEffect(() => {
    setMounted(true);
    
    const handleMouseMove = (e: MouseEvent) => {
      // Normalize mouse coordinates from -1 to 1
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = (e.clientY / window.innerHeight) * 2 - 1;
      mouseX.set(x * 30); // Max offset 30px
      mouseY.set(y * 30);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  // Generate deterministic particles to avoid hydration mismatches if SSR was used,
  // but since it's CRA/Vite client-only, random is fine after mount.
  const particles = useMemo(() => {
    if (!mounted) return [];
    
    // Responsive particle count based on screen width
    const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 1024;
    let particleCount = 40; // Desktop
    if (screenWidth < 768) particleCount = 15; // Mobile
    else if (screenWidth < 1024) particleCount = 25; // Tablet

    return Array.from({ length: particleCount }).map((_, i) => ({
      id: i,
      size: Math.random() * 6 + 2,
      x: Math.random() * 100, // vw
      y: Math.random() * 100, // vh
      duration: Math.random() * 15 + 15,
      delay: Math.random() * -20, // Negative delay so they start immediately at different phases
    }));
  }, [mounted]);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none bg-[var(--color-surface-soft)]">
      {/* Smooth Breathing Gradient Blobs (No string-interpolation flicker) */}
      <motion.div 
        className="absolute top-[-20%] left-[-10%] w-[70vw] h-[70vw] max-w-[800px] max-h-[800px] rounded-full"
        style={{ background: 'radial-gradient(circle, var(--color-primary) 0%, transparent 60%)' }}
        animate={{
          scale: [1, 1.2, 1],
          x: ['0%', '5%', '0%'],
          y: ['0%', '10%', '0%'],
          opacity: [0.15, 0.4, 0.15]
        }}
        transition={{ duration: 18, ease: "easeInOut", repeat: Infinity }}
      />
      <motion.div 
        className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] max-w-[700px] max-h-[700px] rounded-full"
        style={{ background: 'radial-gradient(circle, var(--color-focus) 0%, transparent 60%)' }}
        animate={{
          scale: [1, 1.3, 1],
          x: ['0%', '-10%', '0%'],
          y: ['0%', '-5%', '0%'],
          opacity: [0.15, 0.4, 0.15]
        }}
        transition={{ duration: 22, ease: "easeInOut", repeat: Infinity }}
      />
      
      {/* Floating Particles Container (Responsive to mouse) */}
      <motion.div className="absolute inset-0" style={{ x: mouseX, y: mouseY }}>
        {particles.map((p) => (
          <motion.div
            key={p.id}
            className="absolute rounded-full bg-[var(--color-ash)] dark:bg-[var(--color-mute)]"
            style={{
              width: p.size,
              height: p.size,
              left: `${p.x}vw`,
              top: `${p.y}vh`,
            }}
            animate={{
              y: [0, -40, 0],
              x: [0, 30, 0],
              opacity: [0.1, 0.4, 0.1],
              scale: [1, 1.2, 1]
            }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              delay: p.delay,
              ease: "easeInOut",
            }}
          />
        ))}
      </motion.div>
    </div>
  );
};
