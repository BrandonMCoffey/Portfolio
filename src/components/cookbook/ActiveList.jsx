import React, { useMemo } from "react";
import RandomRecipes from "./RandomRecipes";
import RecipeCard from "./RecipeCard";
import { useCookbookStorage } from "../../utils/cookbookStore.js";

export default function ActiveList({ allRecipes, hideShoppingListLink = false }) {
  const [activeIds] = useCookbookStorage("active_recipes", []);

  const activeRecipes = useMemo(() => {
    return allRecipes.filter((recipe) => activeIds.includes(recipe.id));
  }, [allRecipes, activeIds]);

  return (
    <div className="space-y-12">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl">🍲</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Your Active Meal Plan</h2>
        </div>
        <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">Recipes currently selected for cooking and grocery planning.</p>
      </div>

      {activeRecipes.length === 0 ? (
        <div className="py-12 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 p-8 bg-white/40 dark:bg-slate-900/40">
          <p className="text-4xl mb-3">🛒</p>
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-2">No active recipes in your list</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-6">
            Tap the <span className="font-bold text-emerald-600 dark:text-emerald-400">+</span> icon on recipe cards to plan your meals.
          </p>
          <a href="/cookbook" className="btn btn-primary text-xs px-4 py-2">
            Explore All Recipes &rarr;
          </a>
        </div>
      ) : (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
            {activeRecipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
          {!hideShoppingListLink && (
            <div className="text-center pt-4">
              <a href="/cookbook/shopping-list" className="btn btn-primary px-6 py-3 text-sm">
                View Aggregated Shopping List &rarr;
              </a>
            </div>
          )}
        </div>
      )}

      {/* Suggestions */}
      <div className="pt-10 border-t border-slate-200/80 dark:border-slate-800/80">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Recipe Suggestions</h2>
        <RandomRecipes allRecipes={allRecipes} count={3} />
      </div>
    </div>
  );
}
