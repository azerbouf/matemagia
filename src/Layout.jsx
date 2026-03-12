import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "@/lib/AuthContext";
import { createPageUrl } from "@/utils";
import { LogOut, BarChart3, Trophy, User } from "lucide-react";

function ProfileDropdown({ avatarUrl, displayName, logout }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("touchstart", handleClick);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("touchstart", handleClick);
    };
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:ring-2 hover:ring-violet-300"
      >
        {avatarUrl ? (
          <img src={avatarUrl} className="w-8 h-8 rounded-full object-cover" alt="" />
        ) : (
          <div className="w-8 h-8 rounded-full bg-violet-200 flex items-center justify-center text-violet-700 text-sm font-bold">
            {(displayName || "?")[0]?.toUpperCase()}
          </div>
        )}
      </button>
      {open && (
        <div className="absolute right-0 top-10 bg-white rounded-xl shadow-lg border border-gray-100 py-1 w-44 z-50">
          <a
            href={createPageUrl("Profile")}
            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-violet-50 transition-colors"
          >
            <User className="w-4 h-4 text-violet-500" />
            Профиль
          </a>
          <button
            onClick={() => { setOpen(false); logout(); }}
            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors w-full text-left"
          >
            <LogOut className="w-4 h-4" />
            Выйти
          </button>
        </div>
      )}
    </div>
  );
}

export default function Layout({ children, currentPageName }) {
  const { user, profile, isAuthenticated, logout } = useAuth();

  const showHeader = currentPageName !== "Game";
  const displayName = profile?.display_name || user?.user_metadata?.full_name || user?.email;
  const avatarUrl = profile?.avatar_url;

  return (
    <div className={showHeader ? "h-[100dvh] flex flex-col" : ""}>
      {showHeader && (
        <div className="bg-violet-50">
          <div className="px-4 pt-3 pb-2 max-w-md mx-auto flex items-center justify-between">
            <a
              href={createPageUrl("Home")}
              className="text-xl font-extrabold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent"
            >
              🧮 МатеМагия
            </a>
            <div className="flex items-center gap-2">
              <a
                href={createPageUrl("Leaderboard")}
                className="text-gray-400 hover:text-amber-600 w-8 h-8 rounded-full flex items-center justify-center transition-all hover:bg-amber-50"
                title="Таблица лидеров"
              >
                <Trophy className="w-4 h-4" />
              </a>
              {isAuthenticated && (
                <>
                  <a
                    href={createPageUrl("Stats")}
                    className="text-gray-400 hover:text-violet-600 w-8 h-8 rounded-full flex items-center justify-center transition-all hover:bg-violet-100"
                    title="Статистика"
                  >
                    <BarChart3 className="w-4 h-4" />
                  </a>
                  <ProfileDropdown
                    avatarUrl={avatarUrl}
                    displayName={displayName}
                    logout={logout}
                  />
                </>
              )}
            </div>
          </div>
        </div>
      )}
      <div className={showHeader ? "flex-1 min-h-0 overflow-y-auto flex flex-col" : ""}>
        {children}
      </div>
    </div>
  );
}
