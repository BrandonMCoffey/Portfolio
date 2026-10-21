import React from "react";
import { useCookbookStorage, toggleInArray } from "../../utils/cookbookStore.js";

export default function ActionButtons({ recipeId }) {
  const [favorites] = useCookbookStorage("favorites", []);
  const [activeRecipes] = useCookbookStorage("active_recipes", []);

  const isFavorited = favorites.includes(recipeId);
  const isActive = activeRecipes.includes(recipeId);

  const handleFavoriteClick = () => {
    toggleInArray("favorites", recipeId);
  };

  const handleActiveClick = () => {
    toggleInArray("active_recipes", recipeId);
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
        aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}
      >
        <span className="text-base">{isFavorited ? "❤️" : "🤍"}</span>
        <span className="text-sm font-semibold">{isFavorited ? "Favorited" : "Add to Favorites"}</span>
      </button>
      <button
        onClick={handleActiveClick}
        className={`btn inline-flex items-center gap-2 cursor-pointer transition-all ${isActive ? "btn-primary shadow-sm" : "btn-secondary"}`}
        aria-label={isActive ? "Remove from active recipes" : "Add to active recipes"}
      >
        <span className="text-base">{isActive ? "✓" : "+"}</span>
        <span className="text-sm font-semibold">{isActive ? "In Active Recipes" : "Add to Active Recipes"}</span>
      </button>
    </div>
  );
}
