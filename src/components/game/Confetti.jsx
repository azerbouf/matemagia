import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";

const COLORS = ['#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#3B82F6', '#EF4444'];

export default function Confetti({ count = 20, mode = "burst" }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setVisible(false), 2500);
    return () => clearTimeout(t);
  }, []);

  const particles = useMemo(() =>
    Array.from({ length: count }, (_, i) => ({
      id: i,
      color: COLORS[i % COLORS.length],
      size: 4 + Math.random() * 5,
      isCircle: Math.random() > 0.5,
      delay: mode === "rain" ? Math.random() * 0.5 : Math.random() * 0.08,
      duration: mode === "rain" ? 1.5 + Math.random() * 1 : 0.6 + Math.random() * 0.3,
      rotation: (Math.random() - 0.5) * 720,
      startX: Math.random() * 100,
      drift: (Math.random() - 0.5) * 60,
      angle: (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.4,
      dist: 40 + Math.random() * 80,
    })), [count, mode]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map(p => {
        if (mode === "rain") {
          return (
            <motion.div
              key={p.id}
              className="absolute"
              initial={{ left: `${p.startX}%`, top: '-3%', opacity: 1, rotate: 0 }}
              animate={{ top: '105%', x: p.drift, opacity: [1, 1, 0], rotate: p.rotation }}
              transition={{ duration: p.duration, delay: p.delay, ease: 'easeIn' }}
              style={{
                width: p.size,
                height: p.isCircle ? p.size : p.size * 1.5,
                backgroundColor: p.color,
                borderRadius: p.isCircle ? '50%' : '2px',
              }}
            />
          );
        }
        const dx = Math.cos(p.angle) * p.dist;
        const dy = Math.sin(p.angle) * p.dist;
        return (
          <motion.div
            key={p.id}
            className="absolute left-1/2 top-[42%]"
            initial={{ opacity: 1, scale: 0, x: 0, y: 0, rotate: 0 }}
            animate={{
              x: dx, y: [dy, dy + 50],
              opacity: [1, 1, 0],
              scale: [0, 1.2, 0.5],
              rotate: p.rotation,
            }}
            transition={{ duration: p.duration, delay: p.delay, ease: 'easeOut' }}
            style={{
              width: p.size,
              height: p.isCircle ? p.size : p.size * 1.5,
              backgroundColor: p.color,
              borderRadius: p.isCircle ? '50%' : '2px',
            }}
          />
        );
      })}
    </div>
  );
}
