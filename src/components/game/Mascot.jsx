import React, { useMemo } from "react";
import { motion } from "framer-motion";

const PHRASES = {
  thinking: ["Хммм...", "Подумай!", "Ты знаешь!", "Думай-думай!"],
  happy: ["Молодец!", "Супер!", "Класс!", "Так держать!", "Ура!"],
  sad: ["Ничего!", "Бывает!", "Попробуй ещё!"],
  hurry: ["Быстрее!", "Тик-так!", "Скорее!"],
  celebrating: ["Ты гений!", "Браво!", "Вот это да!"],
  encouraging: ["Не сдавайся!", "Ты сможешь!", "Ещё разок!"],
  greeting: ["Привет!", "Поехали!", "Готов?"],
};

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function WizardEyes({ mood }) {
  if (mood === "happy" || mood === "celebrating") {
    return (
      <>
        <path d="M30 52 Q33 47 36 52" stroke="#4a3728" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <path d="M44 52 Q47 47 50 52" stroke="#4a3728" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <circle cx="29" cy="56" r="3.5" fill="#ff9999" opacity="0.4" />
        <circle cx="51" cy="56" r="3.5" fill="#ff9999" opacity="0.4" />
      </>
    );
  }
  if (mood === "sad") {
    return (
      <>
        <ellipse cx="33" cy="51" rx="3" ry="3.5" fill="#4a3728" />
        <ellipse cx="47" cy="51" rx="3" ry="3.5" fill="#4a3728" />
        <path d="M29 46 Q33 48 37 46" stroke="#4a3728" strokeWidth="1.5" fill="none" />
        <path d="M43 46 Q47 48 51 46" stroke="#4a3728" strokeWidth="1.5" fill="none" />
      </>
    );
  }
  if (mood === "hurry") {
    return (
      <>
        <circle cx="33" cy="50" r="4.5" fill="white" stroke="#4a3728" strokeWidth="1.5" />
        <circle cx="33" cy="50" r="2.5" fill="#4a3728" />
        <circle cx="47" cy="50" r="4.5" fill="white" stroke="#4a3728" strokeWidth="1.5" />
        <circle cx="47" cy="50" r="2.5" fill="#4a3728" />
      </>
    );
  }
  if (mood === "encouraging") {
    return (
      <>
        <circle cx="33" cy="51" r="3" fill="#4a3728" />
        <circle cx="33" cy="49" r="1" fill="white" />
        <path d="M44 51 Q47 47 50 51" stroke="#4a3728" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      </>
    );
  }
  return (
    <>
      <circle cx="33" cy="51" r="3" fill="#4a3728" />
      <circle cx="33" cy="49" r="1" fill="white" />
      <circle cx="47" cy="51" r="3" fill="#4a3728" />
      <circle cx="47" cy="49" r="1" fill="white" />
      {mood === "thinking" && (
        <path d="M28 44 Q33 41 38 44" stroke="#4a3728" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      )}
    </>
  );
}

function WizardMouth({ mood }) {
  if (mood === "happy" || mood === "celebrating" || mood === "greeting") {
    return <path d="M33 60 Q40 68 47 60" stroke="#4a3728" strokeWidth="2" fill="none" strokeLinecap="round" />;
  }
  if (mood === "sad") {
    return <path d="M34 63 Q40 58 46 63" stroke="#4a3728" strokeWidth="2" fill="none" strokeLinecap="round" />;
  }
  if (mood === "hurry") {
    return <ellipse cx="40" cy="62" rx="4" ry="5" fill="#4a3728" />;
  }
  if (mood === "encouraging") {
    return <path d="M34 59 Q40 65 46 59" stroke="#4a3728" strokeWidth="2" fill="none" strokeLinecap="round" />;
  }
  return <path d="M35 60 Q40 63 45 60" stroke="#4a3728" strokeWidth="2" fill="none" strokeLinecap="round" />;
}

function WizardExtras({ mood }) {
  if (mood === "celebrating") {
    return (
      <>
        <motion.text x="12" y="35" fontSize="9" animate={{ opacity: [0, 1, 0], y: [35, 25] }} transition={{ duration: 1.2, repeat: Infinity }}>✨</motion.text>
        <motion.text x="60" y="30" fontSize="7" animate={{ opacity: [0, 1, 0], y: [30, 20] }} transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}>⭐</motion.text>
        <motion.text x="8" y="65" fontSize="6" animate={{ opacity: [0, 1, 0] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.8 }}>✨</motion.text>
      </>
    );
  }
  if (mood === "happy") {
    return (
      <motion.text x="58" y="38" fontSize="8" animate={{ opacity: [0, 1, 0], y: [38, 30] }} transition={{ duration: 1.5, repeat: Infinity }}>✨</motion.text>
    );
  }
  if (mood === "sad") {
    return (
      <motion.ellipse cx="50" cy="56" rx="1.5" ry="2" fill="#7cc8ff" animate={{ cy: [56, 64], opacity: [0.7, 0] }} transition={{ duration: 1.5, repeat: Infinity }} />
    );
  }
  if (mood === "hurry") {
    return (
      <motion.path d="M58 40 Q60 44 58 46 Q56 44 58 40Z" fill="#7cc8ff" animate={{ opacity: [0, 1, 1, 0] }} transition={{ duration: 1.5, repeat: Infinity }} />
    );
  }
  return null;
}

const BODY_ANIM = {
  celebrating: { y: [0, -5, 0], transition: { duration: 0.45, repeat: Infinity, ease: "easeInOut" } },
  happy: { rotate: [0, 4, -4, 0], transition: { duration: 0.5, repeat: 2 } },
  sad: { y: [0, 2, 0], transition: { duration: 2.5, repeat: Infinity, ease: "easeInOut" } },
  hurry: { x: [0, -2, 2, -1, 1, 0], transition: { duration: 0.35, repeat: Infinity } },
  greeting: { rotate: [0, 6, -6, 0], transition: { duration: 1.2, repeat: Infinity, ease: "easeInOut" } },
  thinking: { y: [0, -2, 0], transition: { duration: 2.5, repeat: Infinity, ease: "easeInOut" } },
  encouraging: { y: [0, -3, 0], transition: { duration: 0.7, repeat: 3 } },
};

export default function Mascot({ mood = "thinking", size = 64 }) {
  const phrase = useMemo(() => pickRandom(PHRASES[mood] || PHRASES.thinking), [mood]);

  return (
    <div className="flex items-center justify-center gap-1.5">
      <motion.svg
        viewBox="0 0 80 96"
        width={size}
        height={size * 1.2}
        animate={BODY_ANIM[mood] || {}}
        className="flex-shrink-0"
      >
        <defs>
          <linearGradient id="hatG" x1="0" y1="0" x2="0.3" y2="1">
            <stop offset="0%" stopColor="#a78bfa" />
            <stop offset="100%" stopColor="#6d28d9" />
          </linearGradient>
          <linearGradient id="bodyG" x1="0.5" y1="0" x2="0.5" y2="1">
            <stop offset="0%" stopColor="#fde8d0" />
            <stop offset="100%" stopColor="#f5d0a9" />
          </linearGradient>
        </defs>

        {/* Hat */}
        <path d="M40 4 L22 30 L58 30 Z" fill="url(#hatG)" />
        <ellipse cx="40" cy="30" rx="20" ry="4" fill="#6d28d9" />
        <text x="34" y="22" fontSize="10" fill="#fbbf24">★</text>
        <rect x="24" y="28" width="32" height="3" rx="1.5" fill="#fbbf24" opacity="0.6" />

        {/* Face/Body */}
        <circle cx="40" cy="56" r="24" fill="url(#bodyG)" stroke="#e8c9a4" strokeWidth="0.8" />

        {/* Eyes */}
        <WizardEyes mood={mood} />

        {/* Mouth */}
        <WizardMouth mood={mood} />

        {/* Mood extras */}
        <WizardExtras mood={mood} />

        {/* Wand */}
        {(mood === "thinking" || mood === "celebrating" || mood === "happy" || mood === "greeting") && (
          <>
            <line x1="62" y1="68" x2="74" y2="48" stroke="#92400e" strokeWidth="2" strokeLinecap="round" />
            <motion.circle cx="75" cy="46" r="3" fill="#fbbf24" animate={{ scale: [0.8, 1.3, 0.8], opacity: [0.6, 1, 0.6] }} transition={{ duration: 1.5, repeat: Infinity }} />
          </>
        )}
      </motion.svg>

      {/* Speech bubble */}
      <motion.div
        initial={{ opacity: 0, scale: 0.7, x: -4 }}
        animate={{ opacity: 1, scale: 1, x: 0 }}
        transition={{ type: "spring", stiffness: 400, damping: 20 }}
        key={phrase}
        className="relative bg-white rounded-xl px-2 py-1 shadow border border-gray-100 flex-shrink-0"
      >
        <div className="absolute left-0 top-1/2 -translate-x-[5px] -translate-y-1/2 w-0 h-0 border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent border-r-[5px] border-r-white" />
        <span className="font-bold text-gray-700 whitespace-nowrap" style={{ fontSize: Math.max(size * 0.19, 11) }}>
          {phrase}
        </span>
      </motion.div>
    </div>
  );
}
