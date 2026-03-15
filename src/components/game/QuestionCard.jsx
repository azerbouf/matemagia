import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Check, X, ArrowRight, Lightbulb, Clock } from "lucide-react";
import { getPointsPerQuestion, getSpeedBonus, getQuestionTime } from "./mathUtils";
import { playCorrectSound, playWrongSound } from "./sounds";
import Confetti from "./Confetti";
import Mascot from "./Mascot";

export default function QuestionCard({
  question,
  questionNumber,
  totalQuestions,
  level,
  onAnswer,
  onTimerTick,
}) {
  const [selected, setSelected] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const totalTime = getQuestionTime(level, question);
  const [timeLeft, setTimeLeft] = useState(totalTime);
  const [timedOut, setTimedOut] = useState(false);
  const [shake, setShake] = useState(false);
  const timerRef = useRef(null);

  const isAnswered = selected !== null || timedOut;
  const isCorrect = selected === question.answer;
  const points = getPointsPerQuestion(level);
  const speedBonus = isAnswered && isCorrect ? getSpeedBonus(level, timeLeft, totalTime) : 0;

  // Reset and start timer on new question
  useEffect(() => {
    setSelected(null);
    setShowExplanation(false);
    setTimedOut(false);
    setShake(false);
    setTimeLeft(totalTime);
  }, [question, totalTime]);

  useEffect(() => {
    if (isAnswered) {
      clearInterval(timerRef.current);
      return;
    }
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setTimedOut(true);
          setShowExplanation(true);
          playWrongSound();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [isAnswered, question]);

  useEffect(() => {
    if (onTimerTick) onTimerTick(timeLeft, totalTime);
  }, [timeLeft, totalTime, onTimerTick]);

  const handleSelect = (option) => {
    if (isAnswered) return;
    clearInterval(timerRef.current);
    setSelected(option);
    if (option === question.answer) {
      playCorrectSound();
    } else {
      playWrongSound();
      setShowExplanation(false);
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };

  const handleNext = () => {
    onAnswer(isCorrect && !timedOut, timeLeft, totalTime);
  };

  const timerColor =
    timeLeft > totalTime * 0.5
      ? "from-green-400 to-emerald-500"
      : timeLeft > totalTime * 0.25
      ? "from-yellow-400 to-amber-500"
      : "from-red-400 to-rose-500";

  const timerTextColor =
    timeLeft > totalTime * 0.5
      ? "text-emerald-600"
      : timeLeft > totalTime * 0.25
      ? "text-amber-600"
      : "text-red-600";

  const getOptionStyle = (option) => {
    if (!isAnswered) return "bg-white border-2 border-gray-200 hover:border-violet-400 hover:bg-violet-50 active:scale-95";
    if (option === question.answer) return "bg-green-50 border-2 border-green-400 text-green-700";
    if (option === selected && !isCorrect) return "bg-red-50 border-2 border-red-400 text-red-700";
    return "bg-gray-50 border-2 border-gray-200 opacity-50";
  };

  return (
    <motion.div
      key={question.display}
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      className="px-4 py-6 max-w-md mx-auto"
    >
      {isAnswered && isCorrect && !timedOut && <Confetti count={18} />}

      {/* Progress */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-medium text-gray-400">
            Вопрос {questionNumber} из {totalQuestions}
          </span>
          <span className="text-xs font-medium text-violet-500">+{points} очков</span>
        </div>
        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-violet-400 to-indigo-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${(questionNumber / totalQuestions) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Mascot */}
      <div className="flex justify-center mb-3">
        <Mascot
          mood={
            isAnswered
              ? (timedOut ? "sad" : isCorrect ? "happy" : "sad")
              : (timeLeft <= totalTime * 0.25 ? "hurry" : "thinking")
          }
          size={52}
        />
      </div>

      {/* Question */}
      <div className="bg-gradient-to-br from-violet-500 to-indigo-600 rounded-3xl p-6 sm:p-8 text-center mb-6 shadow-xl shadow-violet-200">
        <p className="text-white/70 text-sm mb-2">
          {question.display.endsWith("?") ? "Выбери ответ" : "Сколько будет?"}
        </p>
        <h2 className={`font-extrabold text-white tracking-wide ${question.display.length > 30 ? "text-xl sm:text-2xl" : "text-4xl sm:text-5xl"}`}>
          {question.display.endsWith("?") || question.display.includes("=") ? question.display : `${question.display} = ?`}
        </h2>
      </div>

      {/* Options */}
      <motion.div
        animate={shake ? { x: [0, -10, 10, -8, 8, -4, 4, 0] } : {}}
        transition={{ duration: 0.4 }}
        className="grid grid-cols-2 gap-3 mb-4"
      >
        {question.options.map((option, i) => (
          <motion.button
            key={i}
            whileTap={!isAnswered ? { scale: 0.95 } : {}}
            onClick={() => handleSelect(option)}
            className={`p-4 rounded-2xl text-xl font-bold transition-all duration-200 ${getOptionStyle(option)}`}
          >
            <div className="flex items-center justify-center gap-2">
              {isAnswered && option === question.answer && <Check className="w-5 h-5 text-green-500" />}
              {isAnswered && option === selected && !isCorrect && option !== question.answer && <X className="w-5 h-5 text-red-500" />}
              {option}
            </div>
          </motion.button>
        ))}
      </motion.div>

      {/* Result feedback */}
      <AnimatePresence>
        {isAnswered && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            {timedOut ? (
              <div className="text-center py-3 rounded-2xl bg-orange-50 border border-orange-200">
                <span className="text-2xl">⏰</span>
                <p className="text-orange-700 font-bold">Время вышло!</p>
                <p className="text-orange-500 text-sm">Правильный ответ: <strong>{question.answer}</strong></p>
              </div>
            ) : isCorrect ? (
              <div className="text-center py-3 rounded-2xl bg-green-50 border border-green-200">
                <span className="text-2xl">🎉</span>
                <p className="text-green-700 font-bold">
                  Правильно! +{points}
                  {speedBonus > 0 && <span className="text-emerald-500 ml-1">+{speedBonus}⚡</span>}
                </p>
              </div>
            ) : (
              <div className="text-center py-3 rounded-2xl bg-red-50 border border-red-200">
                <span className="text-2xl">😔</span>
                <p className="text-red-700 font-bold">Неправильно</p>
                <p className="text-red-500 text-sm">Правильный ответ: <strong>{question.answer}</strong></p>
              </div>
            )}

            {/* Show explanation button for wrong/timeout */}
            {(timedOut || (!isCorrect && !timedOut)) && !showExplanation && (
              <Button
                variant="ghost"
                onClick={() => setShowExplanation(true)}
                className="w-full text-violet-600 hover:text-violet-700 hover:bg-violet-50 rounded-2xl"
              >
                <Lightbulb className="w-4 h-4 mr-2" />
                Посмотреть решение
              </Button>
            )}

            {showExplanation && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="bg-amber-50 border border-amber-200 rounded-2xl p-4"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb className="w-4 h-4 text-amber-600" />
                  <span className="text-amber-800 font-bold text-sm">Разбор задачи</span>
                </div>
                <pre className="text-amber-800 text-sm whitespace-pre-wrap font-sans leading-relaxed">
                  {question.explanation}
                </pre>
              </motion.div>
            )}

            <Button
              onClick={handleNext}
              className="w-full h-14 rounded-2xl text-lg font-bold bg-gradient-to-r from-violet-500 to-indigo-500 hover:from-violet-600 hover:to-indigo-600 shadow-lg shadow-violet-200"
            >
              <ArrowRight className="w-5 h-5 mr-2" />
              Дальше
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}