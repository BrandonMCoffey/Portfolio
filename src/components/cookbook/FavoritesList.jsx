import React, { useMemo } from "react";
import RandomRecipes from "./RandomRecipes";
import RecipeCard from "./RecipeCard";
import { useCookbookStorage } from "../../utils/cookbookStore.js";

export default function FavoritesList({ allRecipes }) {
  const [favoriteIds] = useCookbookStorage("favorites", []);

  const favoriteRecipes = useMemo(() => {
    return allRecipes.filter((recipe) => favoriteIds.includes(recipe.id));
  }, [allRecipes, favoriteIds]);

  return (
    <div className="space-y-12">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl">❤️</span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">Your Favorite Recipes</h1>
        </div>
        <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">Quickly access your saved personal culinary favorites.</p>
      </div>

      {favoriteRecipes.length === 0 ? (
        <div className="py-12 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 p-8 bg-white/40 dark:bg-slate-900/40">
          <p className="text-4xl mb-3">🤍</p>
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-2">No favorite recipes saved yet</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-6">
            Tap the heart icon on any recipe card to save it here for quick access while cooking.
          </p>
          <a href="/cookbook" className="btn btn-primary text-xs px-4 py-2">
            Browse All Recipes &rarr;
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {favoriteRecipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      )}

      {/* Recommendations */}
      <div className="pt-10 border-t border-slate-200/80 dark:border-slate-800/80">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">You Might Also Like</h2>
        <RandomRecipes allRecipes={allRecipes} count={3} />
      </div>
    </div>
  );
}
