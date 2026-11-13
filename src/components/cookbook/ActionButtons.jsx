import React from "react";
import { useCookbookStorage, toggleInArray } from "../../utils/cookbookStore.js";
import { COOKBOOK_STORAGE_KEYS, COOKBOOK_UI_TEXT } from "../../data/cookbook";

const copy = COOKBOOK_UI_TEXT.actionButtons;

export default function ActionButtons({ recipeId }) {
  const [favorites] = useCookbookStorage(COOKBOOK_STORAGE_KEYS.favorites, []);
  const [activeRecipes] = useCookbookStorage(COOKBOOK_STORAGE_KEYS.activeRecipes, []);

  const isFavorited = favorites.includes(recipeId);
  const isActive = activeRecipes.includes(recipeId);

  const handleFavoriteClick = () => {
    toggleInArray(COOKBOOK_STORAGE_KEYS.favorites, recipeId);
  };

  const handleActiveClick = () => {
    toggleInArray(COOKBOOK_STORAGE_KEYS.activeRecipes, recipeId);
  };

  return (
    <div className="flex flex-wrap items-center gap-3 my-6 print:hidden">
      <button
        onClick={handleFavoriteClick}
        className={`btn inline-flex items-center gap-2 cursor-pointer transition-all ${
          isFavorited
            ? "bg-pink-100 text-pink-700 dark:bg-pink-950/60 dark:text-pink-300 border border-pink-300 dark:border-pink-800"
            : "btn-secondary"
        }`}
        aria-label={isFavorited ? copy.removeFavoriteAriaLabel : copy.addFavoriteAriaLabel}
      >
        <span className="text-base">{isFavorited ? "❤️" : "🤍"}</span>
        <span className="text-sm font-semibold">{isFavorited ? copy.favoritedLabel : copy.addFavoriteLabel}</span>
      </button>
      <button
        onClick={handleActiveClick}
        className={`btn inline-flex items-center gap-2 cursor-pointer transition-all ${isActive ? "btn-primary shadow-sm" : "btn-secondary"}`}
        aria-label={isActive ? copy.removeActiveAriaLabel : copy.addActiveAriaLabel}
      >
        <span className="text-base">{isActive ? "✓" : "+"}</span>
        <span className="text-sm font-semibold">{isActive ? copy.inActiveLabel : copy.addActiveLabel}</span>
      </button>
    </div>
  );
}
