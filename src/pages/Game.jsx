import React, { useState, useCallback, useRef, useEffect } from "react";
import { supabase } from "@/api/supabaseClient";
import QuestionCard from "../components/game/QuestionCard";
import GameSummary from "../components/game/GameSummary";
import ExitConfirmDialog from "../components/game/ExitConfirmDialog";
import AchievementToast from "../components/game/AchievementToast";
import {
  generateQuestion,
  getPointsPerQuestion,
  TOTAL_QUESTIONS,
  LEVEL_LABELS,
  TIMER_SECONDS,
} from "../components/game/mathUtils";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

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

  const streakRef = useRef(0);
  const earnedBadgesRef = useRef(new Set());
  const toastTimerRef = useRef(null);

  const [questions] = useState(() =>
    Array.from({ length: TOTAL_QUESTIONS }, () => generateQuestion(level))
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
    toastTimerRef.current = setTimeout(() => setToastBadge(null), 3000);
  }, []);

  const handleAnswer = useCallback(
    async (isCorrect, timeLeft) => {
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
        const totalTime = TIMER_SECONDS[level] || 30;
        if (timeLeft !== undefined && timeLeft >= totalTime - 4 && !earnedBadgesRef.current.has("lightning")) {
          earnedBadgesRef.current.add("lightning");
          showBadgeToast("lightning");
        }
      } else {
        streakRef.current = 0;
      }

      const newScore = isCorrect ? score + getPointsPerQuestion(level) : score;
      const newCorrect = isCorrect ? correctAnswers + 1 : correctAnswers;

      if (isCorrect) {
        setScore(newScore);
        setCorrectAnswers(newCorrect);
      }

      if (currentIndex + 1 >= TOTAL_QUESTIONS) {
        if (newCorrect === TOTAL_QUESTIONS) earnedBadgesRef.current.add("perfect_game");
        if (level === "bonus" && newCorrect >= 8) earnedBadgesRef.current.add("bonus_champ");

        setFinished(true);
        if (!saved) {
          setSaved(true);
          await supabase.from('game_results').insert({
            player_name: playerName,
            level,
            score: newScore,
            total_questions: TOTAL_QUESTIONS,
            correct_answers: newCorrect,
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
        }
      } else {
        setCurrentIndex(currentIndex + 1);
      }
    },
    [currentIndex, score, correctAnswers, level, playerName, saved, userId, isGuest, showBadgeToast]
  );

  const handlePlayAgain = () => {
    window.location.href = createPageUrl("Game") + `?name=${encodeURIComponent(playerName)}&level=${level}&guest=${isGuest ? "1" : "0"}`;
  };

  const handleGoHome = () => {
    window.location.href = createPageUrl("Home");
  };

  if (finished) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-violet-50 via-white to-indigo-50">
        <GameSummary
          playerName={playerName}
          level={level}
          score={score}
          correctAnswers={correctAnswers}
          onPlayAgain={handlePlayAgain}
          onGoHome={handleGoHome}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 via-white to-indigo-50">
      <AchievementToast badgeId={toastBadge} />
      <ExitConfirmDialog
        open={showExitDialog}
        onConfirm={() => { window.location.href = createPageUrl("Home"); }}
        onCancel={() => setShowExitDialog(false)}
      />
      <div className="px-4 pt-4 max-w-md mx-auto flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowExitDialog(true)}
            className="rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 w-9 h-9"
          >
            <Home className="w-5 h-5" />
          </Button>
          <div>
            <p className="text-xs text-gray-400">{playerName}</p>
            <p className="text-sm font-bold text-gray-700">{LEVEL_LABELS[level]}</p>
          </div>
        </div>
        <div className="bg-violet-100 text-violet-700 font-bold px-4 py-2 rounded-full text-sm">
          ⭐ {score}
        </div>
      </div>

      <QuestionCard
        question={questions[currentIndex]}
        questionNumber={currentIndex + 1}
        totalQuestions={TOTAL_QUESTIONS}
        level={level}
        onAnswer={handleAnswer}
      />
    </div>
  );
}
