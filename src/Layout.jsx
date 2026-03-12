import React from "react";
import { useAuth } from "@/lib/AuthContext";
import { createPageUrl } from "@/utils";
import { LogOut } from "lucide-react";

export default function Layout({ children, currentPageName }) {
  const { user, profile, isAuthenticated, logout } = useAuth();

  const showHeader = currentPageName !== "Game";
  const displayName = profile?.display_name || user?.user_metadata?.full_name || user?.email;
  const avatarUrl = profile?.avatar_url;

  return (
    <div>
      {showHeader && isAuthenticated && (
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
                href={createPageUrl("Profile")}
                className="flex items-center gap-2 bg-white hover:bg-violet-100 rounded-full px-3 py-1.5 transition-all border border-violet-200 shadow-sm"
              >
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    className="w-6 h-6 rounded-full object-cover"
                    alt=""
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-violet-200 flex items-center justify-center text-violet-700 text-xs font-bold">
                    {(displayName || "?")[0]?.toUpperCase()}
                  </div>
                )}
                <span className="text-sm font-medium text-gray-700 max-w-[80px] truncate">
                  {displayName}
                </span>
              </a>
              <button
                onClick={logout}
                className="text-gray-400 hover:text-red-500 hover:bg-red-50 w-8 h-8 rounded-full flex items-center justify-center transition-all"
                title="Выйти"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
      {children}
    </div>
  );
}
