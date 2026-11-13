import React, { useState, useEffect, useRef } from "react";
import { formatQuantity } from "../../utils/formatters.js";
import {
  COOKBOOK_FORMATTER_CONFIG,
  COOKBOOK_INTERACTIVE_CONFIG,
  COOKBOOK_RECOMMENDATION_CONFIG,
  COOKBOOK_UI_TEXT,
} from "../../data/cookbook";

const copy = COOKBOOK_UI_TEXT.interactive;
const { decimalPrecisionFactor } = COOKBOOK_FORMATTER_CONFIG;
const { defaultScale, minScale, scaleStep, quickMultipliers, servingsRoundingFactor, minDisplayedServings } = COOKBOOK_INTERACTIVE_CONFIG;

export default function RecipeInteractiveView({
  ingredients = [],
  instructions = [],
  baseServings = COOKBOOK_RECOMMENDATION_CONFIG.defaultBaseServings,
  recipeTitle = "",
}) {
  const [scale, setScale] = useState(defaultScale);
  const [checkedIngredients, setCheckedIngredients] = useState(new Set());
  const [completedSteps, setCompletedSteps] = useState(new Set());
  const [wakeLockActive, setWakeLockActive] = useState(false);
  const [wakeLockSupported, setWakeLockSupported] = useState(false);
  const wakeLockRef = useRef(null);

  // Check Wake Lock API support
  useEffect(() => {
    if (typeof window !== "undefined" && "wakeLock" in navigator) {
      setWakeLockSupported(true);
    }
  }, []);

  // Handle visibility change to re-acquire wake lock if active
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (wakeLockActive && document.visibilityState === "visible" && "wakeLock" in navigator) {
        try {
          wakeLockRef.current = await navigator.wakeLock.request("screen");
        } catch (_) {}
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (wakeLockRef.current) {
        wakeLockRef.current.release().catch(() => {});
        wakeLockRef.current = null;
      }
    };
  }, [wakeLockActive]);

  const toggleWakeLock = async () => {
    if (!wakeLockSupported) return;

    if (wakeLockActive) {
      if (wakeLockRef.current) {
        await wakeLockRef.current.release().catch(() => {});
        wakeLockRef.current = null;
      }
      setWakeLockActive(false);
    } else {
      try {
        wakeLockRef.current = await navigator.wakeLock.request("screen");
        setWakeLockActive(true);
      } catch (err) {
        console.warn("Wake Lock request failed:", err);
        setWakeLockActive(false);
      }
    }
  };

  const handleIngredientCheck = (index) => {
    const next = new Set(checkedIngredients);
    if (next.has(index)) next.delete(index);
    else next.add(index);
    setCheckedIngredients(next);
  };

  const handleStepToggle = (index) => {
    const next = new Set(completedSteps);
    if (next.has(index)) next.delete(index);
    else next.add(index);
    setCompletedSteps(next);
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const currentServings = Math.max(
    minDisplayedServings,
    Math.round(baseServings * scale * servingsRoundingFactor) / servingsRoundingFactor,
  );

  return (
    <div className="space-y-8">
      {/* Culinary Utilities Bar: Servings Scaler, Cook Mode, Print */}
      <div className="print:hidden rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/60 backdrop-blur-md p-4 sm:p-5 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Servings Scaler */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">{copy.servingsLabel}</span>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setScale(Math.max(minScale, Math.round((scale - scaleStep) * decimalPrecisionFactor) / decimalPrecisionFactor))}
              className="h-8 w-8 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center cursor-pointer transition-colors"
              title={copy.decreaseAriaLabel}
              aria-label={copy.decreaseAriaLabel}
            >
              &minus;
            </button>

            <span className="min-w-16 text-center font-bold font-mono text-sm text-slate-900 dark:text-white px-2">{currentServings}</span>

            <button
              type="button"
              onClick={() => setScale(Math.round((scale + scaleStep) * decimalPrecisionFactor) / decimalPrecisionFactor)}
              className="h-8 w-8 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center cursor-pointer transition-colors"
              title={copy.increaseAriaLabel}
              aria-label={copy.increaseAriaLabel}
            >
              &#43;
            </button>
          </div>

          {/* Quick Multiplier Chips */}
          <div className="flex items-center gap-1 ml-2">
            {quickMultipliers.map((multiplier) => (
              <button
                key={multiplier}
                type="button"
                onClick={() => setScale(multiplier)}
                className={`px-2 py-1 rounded-md text-xs font-mono font-bold transition-all cursor-pointer ${
                  scale === multiplier
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                {multiplier}x
              </button>
            ))}
          </div>
        </div>

        {/* Right Side: Cook Mode & Print Button */}
        <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
          {wakeLockSupported && (
            <button
              type="button"
              onClick={toggleWakeLock}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                wakeLockActive
                  ? "bg-emerald-500 text-slate-950 border-emerald-400 font-bold shadow-xs"
                  : "bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
              title={copy.cookModeTitle}
            >
              <span>{wakeLockActive ? "🟢" : "⚪"}</span>
              <span>{wakeLockActive ? copy.cookModeActiveLabel : copy.cookModeIdleLabel}</span>
            </button>
          )}

          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            title={copy.printTitle}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
              />
            </svg>
            <span>{copy.printLabel}</span>
          </button>
        </div>
      </div>

      {/* Main Columns: Ingredients (left) & Instructions (right) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Ingredients Section (5 cols) */}
        <div className="md:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{copy.ingredientsHeading}</h2>
            {scale !== defaultScale && (
              <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                {copy.scaledPrefix} {scale}x
              </span>
            )}
          </div>

          <ul className="space-y-2">
            {ingredients.map((ing, index) => {
              const isChecked = checkedIngredients.has(index);
              const numericQty = typeof ing.quantity === "number" ? ing.quantity : parseFloat(ing.quantity);
              const scaledQty = !isNaN(numericQty) ? numericQty * scale : ing.quantity;

              return (
                <label
                  key={index}
                  className={`flex items-start p-3 rounded-xl border transition-all cursor-pointer ${
                    isChecked
                      ? "bg-slate-100/60 dark:bg-slate-900/40 border-slate-200/50 dark:border-slate-800/50 opacity-60"
                      : "bg-white/80 dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-700/80 hover:border-emerald-500/40"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleIngredientCheck(index)}
                    className="mt-0.5 h-4 w-4 rounded text-emerald-600 focus:ring-emerald-500 shrink-0 cursor-pointer"
                  />
                  <span
                    className={`ml-3 text-sm leading-relaxed ${isChecked ? "line-through text-slate-400 dark:text-slate-500" : "text-slate-800 dark:text-slate-200"}`}
                  >
                    {scaledQty === 0 || !scaledQty
                      ? `${ing.item}, ${copy.toTasteSuffix}`
                      : `${formatQuantity(scaledQty)} ${ing.unit || ""} ${ing.item}`}
                    {ing.note && <span className="text-xs text-slate-500 dark:text-slate-400 italic ml-1">({ing.note})</span>}
                  </span>
                </label>
              );
            })}
          </ul>
        </div>

        {/* Instructions Section (7 cols) */}
        <div className="md:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{copy.instructionsHeading}</h2>
            <span className="text-xs font-mono text-slate-400 dark:text-slate-500">
              {completedSteps.size} {copy.completedOfSeparator} {instructions.length} {copy.completedSuffix}
            </span>
          </div>

          <ol className="space-y-3.5">
            {instructions.map((step, index) => {
              const isCompleted = completedSteps.has(index);

              return (
                <li
                  key={index}
                  onClick={() => handleStepToggle(index)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                    isCompleted
                      ? "bg-slate-100/50 dark:bg-slate-900/40 border-slate-200/60 dark:border-slate-800/60 opacity-60"
                      : "bg-white/80 dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-700/80 hover:border-emerald-500/40"
                  }`}
                >
                  <span
                    className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold shrink-0 transition-colors ${
                      isCompleted ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300"
                    }`}
                  >
                    {isCompleted ? "✓" : index + 1}
                  </span>
                  <p
                    className={`text-sm sm:text-base leading-relaxed ${isCompleted ? "line-through text-slate-400 dark:text-slate-500" : "text-slate-800 dark:text-slate-200"}`}
                  >
                    {step}
                  </p>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </div>
  );
}
