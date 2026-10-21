import React, { useState, useEffect, useMemo } from "react";
import { formatTime } from "../../utils/formatters.js";
import { useCookbookStorage, setStorage } from "../../utils/cookbookStore.js";

export default function ActiveRecipeSidebar({ allRecipes }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIds, setActiveIds] = useCookbookStorage("active_recipes", []);

  // Sync body scroll lock when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Filter recipes matching activeIds
  const activeRecipes = useMemo(() => {
    return allRecipes.filter((r) => activeIds.includes(r.id));
  }, [allRecipes, activeIds]);

  // Aggregate times
  const { totalPrep, totalCook, totalCombined } = useMemo(() => {
    let prep = 0;
    let cook = 0;
    activeRecipes.forEach((r) => {
      prep += r.time?.prep || 0;
      cook += r.time?.cook || 0;
    });
    return {
      totalPrep: prep,
      totalCook: cook,
      totalCombined: prep + cook,
    };
  }, [activeRecipes]);

  const handleRemove = (e, recipeId) => {
    e.preventDefault();
    e.stopPropagation();
    const next = activeIds.filter((id) => id !== recipeId);
    setActiveIds(next);

    try {
      const checked = JSON.parse(localStorage.getItem("shopping_list_checked") || "[]");
      const filteredChecked = checked.filter((key) => !key.startsWith(recipeId));
      localStorage.setItem("shopping_list_checked", JSON.stringify(filteredChecked));
    } catch (_) {}
  };

  const handleClearAll = () => {
    setActiveIds([]);
    try {
      localStorage.setItem("shopping_list_checked", JSON.stringify([]));
    } catch (_) {}
  };

  return (
    <>
      {/* Desktop Side Toggle Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="hidden lg:flex fixed top-24 right-0 z-30 items-center gap-2 px-3 py-2.5 rounded-l-xl bg-slate-900/90 text-white dark:bg-emerald-600 dark:text-white backdrop-blur-md shadow-xl hover:bg-slate-800 dark:hover:bg-emerald-500 transition-all cursor-pointer border border-r-0 border-white/10"
        title="Toggle Active Recipes Drawer"
        aria-label="Toggle Active Recipes Drawer"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
          <circle cx="8" cy="21" r="1" />
          <circle cx="19" cy="21" r="1" />
          <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
        </svg>
        <span className="font-bold text-xs">{activeRecipes.length}</span>
      </button>

      {/* Mobile & Tablet Floating Action Button (FAB) */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={`lg:hidden fixed bottom-6 left-6 z-40 flex items-center gap-2 px-4 py-3 rounded-full bg-emerald-600 text-white shadow-xl shadow-emerald-950/20 backdrop-blur-md active:scale-95 transition-all cursor-pointer border border-emerald-400/30 ${
          activeRecipes.length > 0 ? "scale-100 opacity-100" : "scale-95 opacity-90"
        }`}
        aria-label="View Active Recipes Drawer"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
          <circle cx="8" cy="21" r="1" />
          <circle cx="19" cy="21" r="1" />
          <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
        </svg>
        <span className="text-xs font-bold">Active ({activeRecipes.length})</span>
      </button>

      {/* Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs transition-opacity duration-300"
          aria-hidden="true"
        />
      )}

      {/* Slide-over Drawer Panel */}
      <aside
        className={`fixed top-0 right-0 h-full w-full max-w-sm sm:max-w-md bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-l border-slate-200/80 dark:border-slate-800/80 z-50 flex flex-col shadow-2xl transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-label="Active Recipes Drawer"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Active Recipes</h2>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              {activeRecipes.length}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close drawer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Time Summary Banner (if active items exist) */}
        {activeRecipes.length > 0 && (
          <div className="px-5 py-3 bg-emerald-50/80 dark:bg-emerald-950/40 border-b border-emerald-100 dark:border-emerald-900/40 flex items-center justify-around text-xs font-mono">
            <div>
              <span className="text-slate-500 dark:text-slate-400 block">Total Prep:</span>
              <strong className="text-slate-800 dark:text-slate-200 font-bold">{formatTime(totalPrep)}</strong>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400 block">Total Cook:</span>
              <strong className="text-slate-800 dark:text-slate-200 font-bold">{formatTime(totalCook)}</strong>
            </div>
            <div>
              <span className="text-emerald-600 dark:text-emerald-400 block font-semibold">Total Time:</span>
              <strong className="text-emerald-700 dark:text-emerald-300 font-bold">{formatTime(totalCombined)}</strong>
            </div>
          </div>
        )}

        {/* Recipe List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
          {activeRecipes.length === 0 ? (
            <div className="py-16 text-center text-slate-500 dark:text-slate-400">
              <p className="text-4xl mb-3">🛒</p>
              <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200 mb-1">No active recipes yet</h3>
              <p className="text-xs max-w-xs mx-auto">
                Tap the <span className="font-bold text-emerald-600 dark:text-emerald-400">+</span> icon on any recipe card to add it to your current
                meal plan.
              </p>
            </div>
          ) : (
            activeRecipes.map((recipe) => {
              const rTotal = (recipe.time?.prep || 0) + (recipe.time?.cook || 0) + (recipe.time?.rest || 0);
              return (
                <div
                  key={recipe.id}
                  className="flex items-center gap-3 p-3 rounded-xl border border-slate-200/70 dark:border-slate-800/70 bg-white/60 dark:bg-slate-800/40 hover:border-emerald-500/30 transition-colors group"
                >
                  <img
                    src={recipe.thumbnail || "/images/default.jpg"}
                    alt={recipe.title}
                    className="h-12 w-12 rounded-lg object-cover shrink-0"
                    onError={(e) => {
                      e.currentTarget.src = "/images/default.jpg";
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <a
                      href={`/cookbook/${recipe.id}/`}
                      className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors truncate block"
                    >
                      {recipe.title}
                    </a>
                    <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                      ⏱ {formatTime(rTotal)} &bull; {recipe.category}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => handleRemove(e, recipe.id)}
                    className="p-1 rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                    title="Remove from active recipes"
                    aria-label={`Remove ${recipe.title}`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-200/80 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-950/50 space-y-2.5">
          <a href="/cookbook/shopping-list" className="btn btn-primary w-full text-center py-3 text-sm font-semibold shadow-md shadow-emerald-600/20">
            Go to Shopping List ({activeRecipes.length}) &rarr;
          </a>
          {activeRecipes.length > 0 && (
            <button
              type="button"
              onClick={handleClearAll}
              className="w-full text-center text-xs font-semibold text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 py-1 transition-colors cursor-pointer"
            >
              Clear All Active Recipes
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
