import React, { useState, useEffect } from "react";
import { formatTime } from "../../utils/formatters.js";
import { useCookbookStorage, toggleInArray } from "../../utils/cookbookStore.js";

export default function RecipeCard({ recipe }) {
  const [favorites] = useCookbookStorage("favorites", []);
  const [activeRecipes] = useCookbookStorage("active_recipes", []);
  const [hasError, setHasError] = useState(false);

  const isFavorited = favorites.includes(recipe.id);
  const isActive = activeRecipes.includes(recipe.id);

  useEffect(() => {
    setHasError(false);
  }, [recipe.thumbnail]);

  const handleFavoriteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleInArray("favorites", recipe.id);
  };

  const handleActiveClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isActive) {
      try {
        const checkedItems = JSON.parse(localStorage.getItem("shopping_list_checked") || "[]");
        const newCheckedItems = checkedItems.filter((key) => !key.startsWith(recipe.id));
        localStorage.setItem("shopping_list_checked", JSON.stringify(newCheckedItems));
      } catch (_) {}
    }
    toggleInArray("active_recipes", recipe.id);
  };

  const totalTime = (recipe.time?.prep || 0) + (recipe.time?.cook || 0) + (recipe.time?.rest || 0);
  const servings = recipe.servings || 0;

  return (
    <a
      href={`/cookbook/${recipe.id}/`}
      className="card group flex flex-col h-full bg-white/80 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl overflow-hidden shadow-xs hover:border-emerald-500/50 hover:shadow-xl hover:shadow-emerald-500/5 hover:-translate-y-1 transition-all duration-300"
    >
      {/* Thumbnail & Overlays */}
      <div className="relative aspect-video w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
        <img
          src={hasError ? "/images/default.jpg" : recipe.thumbnail || "/images/default.jpg"}
          alt={`Photo of ${recipe.title}`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          decoding="async"
          onError={() => setHasError(true)}
        />

        {/* Top-left: Category or Collection Badge */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1 z-10">
          {recipe.category && (
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-950/75 text-white backdrop-blur-xs border border-white/10 shadow-sm">
              {recipe.category}
            </span>
          )}
        </div>

        {/* Top-right: Persistent Touch-Friendly Glassmorphic Action Buttons */}
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 z-20">
          <button
            type="button"
            onClick={handleActiveClick}
            title={isActive ? "Remove from Active List" : "Add to Active List"}
            className={`h-8 w-8 rounded-full flex items-center justify-center transition-all duration-200 backdrop-blur-md shadow-md cursor-pointer ${
              isActive
                ? "bg-emerald-600 text-white scale-105"
                : "bg-white/85 text-slate-700 hover:bg-emerald-600 hover:text-white dark:bg-slate-900/85 dark:text-slate-200 dark:hover:bg-emerald-500 dark:hover:text-slate-950"
            }`}
            aria-label={isActive ? "Remove from Active List" : "Add to Active List"}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
              {isActive ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              )}
            </svg>
          </button>

          <button
            type="button"
            onClick={handleFavoriteClick}
            title={isFavorited ? "Remove from Favorites" : "Add to Favorites"}
            className={`h-8 w-8 rounded-full flex items-center justify-center transition-all duration-200 backdrop-blur-md shadow-md cursor-pointer ${
              isFavorited
                ? "bg-pink-600 text-white scale-105"
                : "bg-white/85 text-slate-700 hover:bg-pink-600 hover:text-white dark:bg-slate-900/85 dark:text-slate-200 dark:hover:bg-pink-500"
            }`}
            aria-label={isFavorited ? "Remove from Favorites" : "Add to Favorites"}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill={isFavorited ? "currentColor" : "none"}
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-4 h-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
              />
            </svg>
          </button>
        </div>

        {/* Bottom Image Bar: Metadata Badges (Always Visible on Mobile and Desktop) */}
        <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-[11px] font-semibold text-white pointer-events-none z-10">
          {totalTime > 0 && (
            <span className="px-2 py-0.5 rounded-md bg-slate-950/75 backdrop-blur-xs shadow-xs flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3 h-3">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              <span>{formatTime(totalTime)}</span>
            </span>
          )}
          {servings > 0 && (
            <span className="px-2 py-0.5 rounded-md bg-slate-950/75 backdrop-blur-xs shadow-xs flex items-center gap-1 ml-auto">
              <span>👥 {servings}</span>
            </span>
          )}
        </div>
      </div>

      {/* Card Body Content */}
      <div className="p-5 flex flex-col flex-1 justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-1 mb-1">
            {recipe.title}
          </h3>
          {recipe.author && <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mb-2">From: {recipe.author}</p>}
          {recipe.description && (
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">{recipe.description}</p>
          )}
        </div>

        {/* Footer chips: Diets or Cookware */}
        <div className="pt-3 mt-3 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <div className="flex flex-wrap gap-1">
            {recipe.diets?.slice(0, 2).map((diet, idx) => (
              <span
                key={idx}
                className="inline-block px-1.5 py-0.5 rounded text-[10px] bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300"
              >
                {diet}
              </span>
            ))}
          </div>
          <span className="font-semibold text-emerald-600 dark:text-emerald-400 group-hover:translate-x-1 transition-transform">View &rarr;</span>
        </div>
      </div>
    </a>
  );
}
