import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { RotateCcw, Trophy, Home, Zap } from "lucide-react";
import { LEVEL_LABELS, getPointsPerQuestion, TOTAL_QUESTIONS, BONUS_ROUND_QUESTIONS } from "./mathUtils";
import { playVictorySound } from "./sounds";
import Confetti from "./Confetti";
import Mascot from "./Mascot";

export default function GameSummary({
  playerName,
  level,
  score,
  correctAnswers,
  totalQuestions,
  onPlayAgain,
  onGoHome,
  onBonusRound,
  showBonusOption,
}) {
  const qCount = totalQuestions || TOTAL_QUESTIONS;
  const baseMax = getPointsPerQuestion(level) * qCount;
  const maxScore = Math.round(baseMax * 1.5);
  const percentage = Math.round((correctAnswers / qCount) * 100);

  useEffect(() => {
    if (percentage >= 70) playVictorySound();
  }, [percentage]);

  let emoji, message;
  if (percentage === 100) {
    emoji = "🏆";
    message = "Идеально! Ты гений!";
  } else if (percentage >= 80) {
    emoji = "🌟";
    message = "Отлично! Так держать!";
  } else if (percentage >= 50) {
    emoji = "👍";
    message = "Хорошо! Можно лучше!";
  } else {
    emoji = "💪";
    message = "Не сдавайся! Попробуй ещё!";
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="px-4 py-8 max-w-md mx-auto text-center"
    >
      {percentage >= 70 && <Confetti count={40} mode="rain" />}

      <div className="mb-4 flex justify-center">
        <Mascot mood={percentage >= 70 ? "celebrating" : "encouraging"} size={90} />
      </div>

      <h2 className="text-2xl font-extrabold text-gray-800 mb-1">{message}</h2>
      <p className="text-gray-500 mb-6">{playerName}, уровень «{LEVEL_LABELS[level]}»</p>

      <div className="bg-gradient-to-br from-violet-500 to-indigo-600 rounded-3xl p-6 text-white mb-6 shadow-xl shadow-violet-200">
        <p className="text-white/70 text-sm mb-1">Твой результат</p>
        <p className="text-5xl font-extrabold mb-2">{score}</p>
        <p className="text-white/60 text-sm">из {maxScore} возможных очков</p>

        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="bg-white/10 rounded-2xl p-3">
            <p className="text-2xl font-bold">{correctAnswers}</p>
            <p className="text-white/60 text-xs">Правильных</p>
          </div>
          <div className="bg-white/10 rounded-2xl p-3">
            <p className="text-2xl font-bold">{qCount - correctAnswers}</p>
            <p className="text-white/60 text-xs">Ошибок</p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {showBonusOption && onBonusRound && (
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.3 }}>
            <Button
              onClick={onBonusRound}
              className="w-full h-16 rounded-2xl text-lg font-bold bg-gradient-to-r from-amber-400 via-yellow-500 to-orange-500 hover:from-amber-500 hover:via-yellow-600 hover:to-orange-600 shadow-lg shadow-amber-200 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.15)_50%,transparent_75%)] bg-[length:250%_250%] animate-shimmer" />
              <div className="flex flex-col items-center gap-0.5 relative">
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  <span>Бонусный раунд</span>
                  <Zap className="w-5 h-5" />
                </div>
                <span className="text-xs font-normal opacity-80">{BONUS_ROUND_QUESTIONS} доп. вопросов за x1.5 очков</span>
              </div>
            </Button>
          </motion.div>
        )}
        <Button
          onClick={onPlayAgain}
          className="w-full h-14 rounded-2xl text-lg font-bold bg-gradient-to-r from-violet-500 to-indigo-500 hover:from-violet-600 hover:to-indigo-600 shadow-lg shadow-violet-200"
        >
          <RotateCcw className="w-5 h-5 mr-2" />
          Играть ещё
        </Button>
        <Button
          onClick={onGoHome}
          variant="outline"
          className="w-full h-14 rounded-2xl text-lg font-bold border-2 border-gray-200 text-gray-600"
        >
          <Home className="w-5 h-5 mr-2" />
          На главную
        </Button>
      </div>
    </motion.div>
  );
}