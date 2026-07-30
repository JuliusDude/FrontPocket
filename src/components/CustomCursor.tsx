import React, { useEffect, useState } from 'react';
import { motion, useSpring } from 'framer-motion';

export const CustomCursor: React.FC = () => {
  const [mounted, setMounted] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  
  // Highly responsive minimal spring
  const springConfigDot = { stiffness: 800, damping: 25, mass: 0.1 };
  
  const cursorX = useSpring(-100, springConfigDot);
  const cursorY = useSpring(-100, springConfigDot);

  useEffect(() => {
    // Only mount on non-touch devices
    if (window.matchMedia('(pointer: coarse)').matches) return;
    
    setMounted(true);
    document.documentElement.classList.add('hide-native-cursor');

    const updateMousePosition = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      
      const target = e.target as HTMLElement;
      const isClickable = !!target.closest('button, a, input, textarea, [role="button"], .cursor-pointer');
      setIsHovering(isClickable);
    };

    window.addEventListener('mousemove', updateMousePosition);
    return () => {
      window.removeEventListener('mousemove', updateMousePosition);
      document.documentElement.classList.remove('hide-native-cursor');
    };
  }, [cursorX, cursorY]);

  if (!mounted) return null;

  return (
    <motion.div
      className="fixed top-0 left-0 rounded-full pointer-events-none z-[9999] mix-blend-difference bg-white"
      style={{
        x: cursorX,
        y: cursorY,
        translateX: '-50%',
        translateY: '-50%',
        width: 12,
        height: 12,
      }}
      animate={{
        scale: isHovering ? 2.5 : 1,
        opacity: isHovering ? 0.5 : 1
      }}
      transition={{ duration: 0.15, ease: "backOut" }}
    />
  );
};
