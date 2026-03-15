import React, { useState, useCallback, useRef, useEffect } from "react";
import { supabase } from "@/api/supabaseClient";
import QuestionCard from "../components/game/QuestionCard";
import GameSummary from "../components/game/GameSummary";
import ExitConfirmDialog from "../components/game/ExitConfirmDialog";
import AchievementToast from "../components/game/AchievementToast";
import {
  generateQuestion,
  generateDailyQuestions,
  generateBonusRoundQuestion,
  getPointsPerQuestion,
  getBonusRoundPoints,
  getSpeedBonus,
  TOTAL_QUESTIONS,
  BONUS_ROUND_QUESTIONS,
  LEVEL_LABELS,
  TIMER_SECONDS,
} from "../components/game/mathUtils";
import { playBadgeSound, toggleMute, isMuted } from "../components/game/sounds";
import { createPageUrl } from "@/utils";
import { Home, Volume2, VolumeX, Clock } from "lucide-react";

export default function Game() {
  const urlParams = new URLSearchParams(window.location.search);
  const playerName = urlParams.get("name") || "Игрок";
  const level = urlParams.get("level") || "easy";
  const isGuest = urlParams.get("guest") === "1";

  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [finished, setFinished] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [toastBadge, setToastBadge] = useState(null);
  const [userId, setUserId] = useState(null);
  const [soundMuted, setSoundMuted] = useState(isMuted());
  const [timerInfo, setTimerInfo] = useState({ timeLeft: 0, totalTime: 1 });

  const [inBonusRound, setInBonusRound] = useState(false);
  const [bonusQuestions, setBonusQuestions] = useState(null);
  const [bonusScore, setBonusScore] = useState(0);
  const [bonusCorrect, setBonusCorrect] = useState(0);
  const [bonusFinished, setBonusFinished] = useState(false);

  const streakRef = useRef(0);
  const earnedBadgesRef = useRef(new Set());
  const toastTimerRef = useRef(null);

  const [questions] = useState(() =>
    level === "daily"
      ? generateDailyQuestions()
      : Array.from({ length: TOTAL_QUESTIONS }, () => generateQuestion(level))
  );

  useEffect(() => {
    if (!isGuest) {
      supabase.auth.getUser().then(({ data }) => {
        if (data?.user) setUserId(data.user.id);
      });
    }
  }, [isGuest]);

  const showBadgeToast = useCallback((badgeId) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToastBadge(badgeId);
    playBadgeSound();
    toastTimerRef.current = setTimeout(() => setToastBadge(null), 3000);
  }, []);

  const handleToggleMute = () => {
    setSoundMuted(toggleMute());
  };

  const handleTimerTick = useCallback((timeLeft, totalTime) => {
    setTimerInfo({ timeLeft, totalTime });
  }, []);

  const saveGameResult = useCallback(async (finalScore, finalCorrect, finalTotal) => {
    if (saved) return;
    setSaved(true);
    await supabase.from('game_results').insert({
      player_name: playerName,
      level,
      score: finalScore,
      total_questions: finalTotal,
      correct_answers: finalCorrect,
      is_guest: isGuest,
      user_id: userId,
    });
    if (!isGuest && earnedBadgesRef.current.size > 0 && userId) {
      const { data: profiles } = await supabase
        .from('player_profiles')
        .select('*')
        .eq('user_id', userId);
      const existing = profiles?.[0]?.badges || [];
      const merged = [...new Set([...existing, ...Array.from(earnedBadgesRef.current)])];
      if (profiles?.[0]) {
        await supabase.from('player_profiles').update({ badges: merged }).eq('id', profiles[0].id);
      } else {
        await supabase.from('player_profiles').insert({ user_id: userId, player_name: playerName, badges: merged });
      }
    }
  }, [saved, playerName, level, isGuest, userId]);

  const handleAnswer = useCallback(
    async (isCorrect, timeLeft, totalTimeForQuestion) => {
      const totalTime = totalTimeForQuestion ?? (TIMER_SECONDS[level] || 30);
      if (isCorrect) {
        streakRef.current += 1;
        const s = streakRef.current;
        if (s >= 10 && !earnedBadgesRef.current.has("streak_10")) {
          earnedBadgesRef.current.add("streak_10");
          showBadgeToast("streak_10");
        } else if (s >= 5 && !earnedBadgesRef.current.has("streak_5")) {
          earnedBadgesRef.current.add("streak_5");
          showBadgeToast("streak_5");
        } else if (s >= 3 && !earnedBadgesRef.current.has("streak_3")) {
          earnedBadgesRef.current.add("streak_3");
          showBadgeToast("streak_3");
        }
        if (timeLeft !== undefined && timeLeft >= totalTime - 4 && !earnedBadgesRef.current.has("lightning")) {
          earnedBadgesRef.current.add("lightning");
          showBadgeToast("lightning");
        }
      } else {
        streakRef.current = 0;
      }

      if (inBonusRound) {
        const bonusPoints = getBonusRoundPoints(level);
        const speedBonus = isCorrect ? Math.round(getSpeedBonus(level, timeLeft, totalTime) * 1.5) : 0;
        const newBonusScore = isCorrect ? bonusScore + bonusPoints + speedBonus : bonusScore;
        const newBonusCorrect = isCorrect ? bonusCorrect + 1 : bonusCorrect;

        if (isCorrect) {
          setBonusScore(newBonusScore);
          setBonusCorrect(newBonusCorrect);
        }

        if (currentIndex + 1 >= BONUS_ROUND_QUESTIONS) {
          setBonusFinished(true);
          const totalScore = score + newBonusScore;
          const totalCorrect = correctAnswers + newBonusCorrect;
          const totalQ = TOTAL_QUESTIONS + BONUS_ROUND_QUESTIONS;
          await saveGameResult(totalScore, totalCorrect, totalQ);
        } else {
          setCurrentIndex(currentIndex + 1);
        }
      } else {
        const basePoints = getPointsPerQuestion(level);
        const speedBonus = isCorrect ? getSpeedBonus(level, timeLeft, totalTime) : 0;
        const newScore = isCorrect ? score + basePoints + speedBonus : score;
        const newCorrect = isCorrect ? correctAnswers + 1 : correctAnswers;

        if (isCorrect) {
          setScore(newScore);
          setCorrectAnswers(newCorrect);
        }

        if (currentIndex + 1 >= TOTAL_QUESTIONS) {
          if (newCorrect === TOTAL_QUESTIONS) {
            earnedBadgesRef.current.add("perfect_game");
            showBadgeToast("perfect_game");
          }
          if (level === "bonus" && newCorrect >= 8) {
            earnedBadgesRef.current.add("bonus_champ");
            showBadgeToast("bonus_champ");
          }
          setFinished(true);
        } else {
          setCurrentIndex(currentIndex + 1);
        }
      }
    },
    [currentIndex, score, correctAnswers, bonusScore, bonusCorrect, inBonusRound, level, showBadgeToast, saveGameResult]
  );

  const handleStartBonusRound = useCallback(() => {
    const bQuestions = Array.from({ length: BONUS_ROUND_QUESTIONS }, () => generateBonusRoundQuestion(level));
    setBonusQuestions(bQuestions);
    setInBonusRound(true);
    setBonusScore(0);
    setBonusCorrect(0);
    setBonusFinished(false);
    setCurrentIndex(0);
    setFinished(false);
  }, [level]);

  const handlePlayAgain = () => {
    window.location.href = createPageUrl("Game") + `?name=${encodeURIComponent(playerName)}&level=${level}&guest=${isGuest ? "1" : "0"}`;
  };

  const handleGoHome = () => {
    if (isGuest) {
      sessionStorage.setItem("guest_name", playerName);
    }
    window.location.href = createPageUrl("Home");
  };

  const handleDeclineBonus = useCallback(async (action) => {
    const totalQ = TOTAL_QUESTIONS;
    await saveGameResult(score, correctAnswers, totalQ);
    if (action === "home") {
      handleGoHome();
    } else {
      handlePlayAgain();
    }
  }, [score, correctAnswers, saveGameResult]);

  if (bonusFinished) {
    const totalScore = score + bonusScore;
    const totalCorrect = correctAnswers + bonusCorrect;
    const totalQ = TOTAL_QUESTIONS + BONUS_ROUND_QUESTIONS;
    return (
      <div className="min-h-screen bg-gradient-to-b from-violet-50 via-white to-indigo-50">
        <GameSummary
          playerName={playerName}
          level={level}
          score={totalScore}
          correctAnswers={totalCorrect}
          totalQuestions={totalQ}
          onPlayAgain={handlePlayAgain}
          onGoHome={handleGoHome}
          showBonusOption={false}
        />
      </div>
    );
  }

  if (finished && !inBonusRound) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-violet-50 via-white to-indigo-50">
        <GameSummary
          playerName={playerName}
          level={level}
          score={score}
          correctAnswers={correctAnswers}
          totalQuestions={TOTAL_QUESTIONS}
          onPlayAgain={() => handleDeclineBonus("replay")}
          onGoHome={() => handleDeclineBonus("home")}
          onBonusRound={handleStartBonusRound}
          showBonusOption={true}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 via-white to-indigo-50">
      <AchievementToast badgeId={toastBadge} />
      <ExitConfirmDialog
        open={showExitDialog}
        onConfirm={handleGoHome}
        onCancel={() => setShowExitDialog(false)}
      />
      <div className="px-4 pt-3 pb-1 max-w-md mx-auto flex justify-between items-center">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowExitDialog(true)}
            className="rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 w-10 h-10 flex items-center justify-center transition-all"
          >
            <Home className="w-5 h-5" />
          </button>
          <div>
            <p className="text-xs text-gray-400">{playerName}</p>
            <p className="text-sm font-bold text-gray-700">
              {inBonusRound ? "⚡ Бонус" : LEVEL_LABELS[level]}
            </p>
          </div>
        </div>
        {/* Timer */}
        <div className="flex flex-col items-center">
          <div className={`flex items-center gap-1 font-bold text-lg ${
            timerInfo.timeLeft > timerInfo.totalTime * 0.5
              ? "text-emerald-600"
              : timerInfo.timeLeft > timerInfo.totalTime * 0.25
              ? "text-amber-600"
              : "text-red-600"
          }`}>
            <Clock className="w-4 h-4" />
            <span>{timerInfo.timeLeft}</span>
          </div>
          <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden mt-0.5">
            <div
              className={`h-full rounded-full transition-all duration-1000 bg-gradient-to-r ${
                timerInfo.timeLeft > timerInfo.totalTime * 0.5
                  ? "from-green-400 to-emerald-500"
                  : timerInfo.timeLeft > timerInfo.totalTime * 0.25
                  ? "from-yellow-400 to-amber-500"
                  : "from-red-400 to-rose-500"
              }`}
              style={{ width: `${(timerInfo.timeLeft / timerInfo.totalTime) * 100}%` }}
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleMute}
            className="text-gray-400 hover:text-gray-600 w-10 h-10 rounded-full flex items-center justify-center"
          >
            {soundMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>
          <div className={`font-bold px-3 py-1.5 rounded-full text-sm ${
            inBonusRound
              ? "bg-amber-100 text-amber-700"
              : "bg-violet-100 text-violet-700"
          }`}>
            ⭐ {inBonusRound ? score + bonusScore : score}
          </div>
        </div>
      </div>

      <QuestionCard
        question={inBonusRound ? bonusQuestions[currentIndex] : questions[currentIndex]}
        questionNumber={currentIndex + 1}
        totalQuestions={inBonusRound ? BONUS_ROUND_QUESTIONS : TOTAL_QUESTIONS}
        level={level}
        onAnswer={handleAnswer}
        onTimerTick={handleTimerTick}
      />
    </div>
  );
}
