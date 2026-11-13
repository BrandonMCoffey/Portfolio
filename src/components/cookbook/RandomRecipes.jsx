import React, { useMemo } from "react";
import RecipeCard from "./RecipeCard";
import { COOKBOOK_DEFAULTS } from "../../data/cookbook";

export default function RandomRecipes({ allRecipes, count = COOKBOOK_DEFAULTS.recommendationsCount }) {
  const randomRecipes = useMemo(() => {
    if (!allRecipes || allRecipes.length === 0) return [];

    return [...allRecipes].sort(() => 0.5 - Math.random()).slice(0, count);
  }, [allRecipes, count]);

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {randomRecipes.map((recipe) => (
          <RecipeCard key={recipe.id} recipe={recipe} />
        ))}
      </div>
    </div>
  );
}
