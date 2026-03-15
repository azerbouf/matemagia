import React, { useState } from "react";
import { createPageUrl } from "@/utils";
import { ArrowLeft } from "lucide-react";

const SIZE = 10;

export default function MultiplicationTable() {
  const [highlight, setHighlight] = useState(null);

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 via-white to-indigo-50">
      <div className="px-4 py-6 max-w-md mx-auto pb-12">
        <a
          href={createPageUrl("Home")}
          className="inline-flex items-center gap-1 text-gray-500 hover:text-violet-600 mb-4 -ml-2"
        >
          <ArrowLeft className="w-4 h-4" />
          На главную
        </a>
        <h1 className="text-2xl font-extrabold text-gray-800 mb-2">Таблица умножения</h1>
        <p className="text-gray-500 text-sm mb-4">Нажми на число — подсветится строка и столбец</p>

        <div className="overflow-x-auto -mx-4 px-4">
          <div
            className="inline-grid gap-px bg-gray-200 rounded-xl p-px text-center min-w-[280px]"
            style={{ gridTemplateColumns: `auto repeat(${SIZE}, minmax(0, 1fr))` }}
          >
            {/* Top-left corner */}
            <div className="bg-violet-100 rounded-tl-lg w-8 h-8 flex items-center justify-center text-xs font-bold text-violet-700" />
            {/* Top row: 1..10 */}
            {Array.from({ length: SIZE }, (_, i) => i + 1).map((c) => (
              <div
                key={`h-${c}`}
                className={`w-8 h-8 flex items-center justify-center text-xs font-bold rounded-t-lg ${
                  highlight !== null && highlight.col === c
                    ? "bg-violet-200 text-violet-800"
                    : "bg-violet-100 text-violet-700"
                }`}
              >
                {c}
              </div>
            ))}
            {/* Rows */}
            {Array.from({ length: SIZE }, (_, r) => r + 1).map((row) => (
              <React.Fragment key={row}>
                <div
                  className={`w-8 h-8 flex items-center justify-center text-xs font-bold ${
                    highlight !== null && highlight.row === row
                      ? "bg-violet-200 text-violet-800"
                      : "bg-violet-100 text-violet-700"
                  } ${row === 1 ? "rounded-l-lg" : ""}`}
                >
                  {row}
                </div>
                {Array.from({ length: SIZE }, (_, c) => c + 1).map((col) => {
                  const value = row * col;
                  const isHighlighted =
                    highlight !== null &&
                    (highlight.row === row || highlight.col === col);
                  return (
                    <button
                      key={`${row}-${col}`}
                      type="button"
                      onClick={() =>
                        setHighlight((prev) =>
                          prev?.row === row && prev?.col === col
                            ? null
                            : { row, col }
                        )
                      }
                      className={`min-w-[28px] h-8 flex items-center justify-center text-sm font-medium rounded transition-colors ${
                        isHighlighted
                          ? "bg-violet-500 text-white"
                          : "bg-white hover:bg-violet-50 text-gray-700"
                      }`}
                    >
                      {value}
                    </button>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
