import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { LogOut } from "lucide-react";

export default function Layout({ children, currentPageName }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const showHeader = currentPageName !== "Game";

  return (
    <div>
      {showHeader && user && (
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
                {user.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    className="w-6 h-6 rounded-full object-cover"
                    alt=""
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-violet-200 flex items-center justify-center text-violet-700 text-xs font-bold">
                    {(user.display_name || user.full_name || "?")[0]?.toUpperCase()}
                  </div>
                )}
                <span className="text-sm font-medium text-gray-700 max-w-[80px] truncate">
                  {user.display_name || user.full_name}
                </span>
              </a>
              <button
                onClick={() => base44.auth.logout()}
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