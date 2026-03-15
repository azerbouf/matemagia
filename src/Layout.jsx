import React from "react";
import { useAuth } from "@/lib/AuthContext";
import { createPageUrl } from "@/utils";
import { BarChart3, Trophy } from "lucide-react";
import ProfileDropdown from "@/components/ProfileDropdown";
import ToolsDropdown from "@/components/ToolsDropdown";

export default function Layout({ children, currentPageName }) {
  const { user, profile, isAuthenticated, logout } = useAuth();

  const showHeader = currentPageName !== "Game" && currentPageName !== "Home";
  const displayName = profile?.display_name || user?.user_metadata?.full_name || user?.email;
  const avatarUrl = profile?.avatar_url;

  return (
    <div>
      {showHeader && (
        <div className="bg-violet-50">
          <div className="px-4 pt-3 pb-2 max-w-md mx-auto flex items-center justify-between">
            <a
              href={createPageUrl("Home")}
              className="text-xl font-extrabold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent"
            >
              🧮 МатеМагия
            </a>
            <div className="flex items-center gap-1">
              <a
                href={createPageUrl("Leaderboard")}
                className="text-gray-400 hover:text-amber-600 w-10 h-10 rounded-full flex items-center justify-center transition-all hover:bg-amber-50"
                title="Таблица лидеров"
              >
                <Trophy className="w-5 h-5" />
              </a>
              <ToolsDropdown />
              {isAuthenticated && (
                <>
                  <a
                    href={createPageUrl("Stats")}
                    className="text-gray-400 hover:text-violet-600 w-10 h-10 rounded-full flex items-center justify-center transition-all hover:bg-violet-100"
                    title="Статистика"
                  >
                    <BarChart3 className="w-5 h-5" />
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
      {children}
    </div>
  );
}
