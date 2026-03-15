import React, { useState, useCallback } from "react";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function Calculator() {
  const [display, setDisplay] = useState("0");
  const [pendingOp, setPendingOp] = useState(null);
  const [pendingVal, setPendingVal] = useState(null);

  const onDigit = useCallback((d) => {
    setDisplay((prev) => {
      if (pendingOp !== null) return d === "." ? "0." : d;
      if (prev === "0" && d !== ".") return d;
      if (d === "." && prev.includes(".")) return prev;
      if (prev === "Ошибка") return d;
      return prev + d;
    });
  }, [pendingOp]);

  const onOperator = useCallback((op) => {
    const val = parseFloat(display);
    if (Number.isNaN(val) || display === "Ошибка") return;
    if (pendingOp !== null && pendingVal !== null) {
      const a = pendingVal;
      const b = val;
      let result = 0;
      if (pendingOp === "+") result = a + b;
      else if (pendingOp === "−") result = a - b;
      else if (pendingOp === "×") result = a * b;
      else if (pendingOp === "÷") result = b === 0 ? NaN : a / b;
      const next = Number.isFinite(result) ? String(result) : "Ошибка";
      setDisplay(next);
      setPendingVal(Number.isFinite(result) ? result : null);
    } else {
      setPendingVal(val);
    }
    setPendingOp(op);
  }, [display, pendingOp, pendingVal]);

  const onEquals = useCallback(() => {
    if (pendingOp === null || pendingVal === null) return;
    const b = parseFloat(display);
    if (Number.isNaN(b) || display === "Ошибка") return;
    let result = 0;
    if (pendingOp === "+") result = pendingVal + b;
    else if (pendingOp === "−") result = pendingVal - b;
    else if (pendingOp === "×") result = pendingVal * b;
    else if (pendingOp === "÷") result = b === 0 ? NaN : pendingVal / b;
    const next = Number.isFinite(result) ? String(result) : "Ошибка";
    setDisplay(next);
    setPendingOp(null);
    setPendingVal(null);
  }, [display, pendingOp, pendingVal]);

  const onClear = useCallback(() => {
    setDisplay("0");
    setPendingOp(null);
    setPendingVal(null);
  }, []);

  const buttons = [
    ["C", "±", "%", "÷"],
    ["7", "8", "9", "×"],
    ["4", "5", "6", "−"],
    ["1", "2", "3", "+"],
    ["0", ".", "="],
  ];

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
        <h1 className="text-2xl font-extrabold text-gray-800 mb-2">Калькулятор</h1>
        <p className="text-gray-500 text-sm mb-6">Посчитай в уме или проверь ответ</p>

        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-4 mb-6">
          <div className="text-right text-3xl font-bold text-gray-800 min-h-[48px] break-all font-mono">
            {display}
          </div>
        </div>

        <div className="grid gap-2">
          {buttons.map((row, i) => (
            <div
              key={i}
              className="grid gap-2 grid-cols-4"
            >
              {row.map((key) => {
                if (key === "C") {
                  return (
                    <Button
                      key={key}
                      variant="outline"
                      onClick={onClear}
                      className="h-14 rounded-2xl text-lg font-bold border-2 border-gray-200 text-gray-600 hover:bg-gray-50"
                    >
                      {key}
                    </Button>
                  );
                }
                if (key === "=") {
                  return (
                    <Button
                      key={key}
                      onClick={onEquals}
                      className="h-14 rounded-2xl text-lg font-bold bg-gradient-to-r from-violet-500 to-indigo-500 hover:from-violet-600 hover:to-indigo-600 text-white"
                    >
                      {key}
                    </Button>
                  );
                }
                if (["+", "−", "×", "÷"].includes(key)) {
                  return (
                    <Button
                      key={key}
                      variant="outline"
                      onClick={() => onOperator(key)}
                      className={`h-14 rounded-2xl text-lg font-bold border-2 ${
                        pendingOp === key ? "border-violet-500 bg-violet-50 text-violet-700" : "border-violet-200 text-violet-600 hover:bg-violet-50"
                      }`}
                    >
                      {key}
                    </Button>
                  );
                }
                if (key === "±") {
                  return (
                    <Button
                      key={key}
                      variant="outline"
                      onClick={() => setDisplay((p) => (p === "0" ? p : p.startsWith("-") ? p.slice(1) : "-" + p))}
                      className="h-14 rounded-2xl text-lg font-bold border-2 border-gray-200 text-gray-600"
                    >
                      ±
                    </Button>
                  );
                }
                if (key === "%") {
                  return (
                    <Button
                      key={key}
                      variant="outline"
                      onClick={() => {
                        const v = parseFloat(display);
                        if (Number.isFinite(v)) setDisplay(String(v / 100));
                      }}
                      className="h-14 rounded-2xl text-lg font-bold border-2 border-gray-200 text-gray-600"
                    >
                      %
                    </Button>
                  );
                }
                return (
                  <Button
                    key={key}
                    variant="outline"
                    onClick={() => onDigit(key)}
                    className={`h-14 rounded-2xl text-lg font-bold border-2 border-gray-200 text-gray-700 hover:bg-gray-50 ${key === "0" ? "col-span-2" : ""}`}
                  >
                    {key}
                  </Button>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
