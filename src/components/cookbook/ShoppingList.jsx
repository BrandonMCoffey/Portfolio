import React, { useState, useMemo } from "react";
import { formatQuantity } from "../../utils/formatters.js";
import { useCookbookStorage, setStorageItem, toggleInArray } from "../../utils/cookbookStore.js";

const PRIMARY_SORT_OPTIONS = ["Default", "Alphabetical (A-Z)"];

function RecipeIngredientGroup({ recipe, checkedSet, onToggleCheck, primarySort, groupChecked }) {
  const sortedIngredients = useMemo(() => {
    let sorted = [...recipe.ingredients];
    if (primarySort === "Alphabetical (A-Z)") {
      sorted.sort((a, b) => a.item.localeCompare(b.item));
    }
    if (groupChecked) {
      sorted.sort((a, b) => {
        const keyA = `${recipe.id}_${a.item.toLowerCase()}_${a.unit || ""}`;
        const keyB = `${recipe.id}_${b.item.toLowerCase()}_${b.unit || ""}`;
        return (checkedSet.has(keyA) ? 1 : 0) - (checkedSet.has(keyB) ? 1 : 0);
      });
    }
    return sorted;
  }, [recipe.ingredients, recipe.id, primarySort, groupChecked, checkedSet]);

  return (
    <div className="space-y-2 mt-3 pl-3 sm:pl-4 border-l-2 border-emerald-500/30 dark:border-emerald-500/20">
      {sortedIngredients.map((ing, index) => {
        const key = `${recipe.id}_${ing.item.toLowerCase()}_${ing.unit || ""}`;
        const isChecked = checkedSet.has(key);

        return (
          <label
            key={index}
            className={`flex items-start p-3 rounded-xl border transition-all cursor-pointer ${
              isChecked
                ? "bg-slate-100/50 dark:bg-slate-900/30 border-slate-200/50 dark:border-slate-800/50 opacity-60"
                : "bg-white/80 dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-700/80 hover:border-emerald-500/40"
            }`}
          >
            <input
              type="checkbox"
              checked={isChecked}
              onChange={() => onToggleCheck(key)}
              className="mt-0.5 h-4 w-4 rounded text-emerald-600 focus:ring-emerald-500 shrink-0 cursor-pointer"
            />
            <span
              className={`ml-3 text-sm leading-relaxed w-full ${
                isChecked ? "text-slate-400 dark:text-slate-500 line-through" : "text-slate-800 dark:text-slate-200 font-medium"
              }`}
            >
              {ing.quantity === 0 || !ing.quantity ? `${ing.item}, to taste` : `${formatQuantity(ing.quantity)} ${ing.unit || ""} ${ing.item}`.trim()}
              {ing.note && <span className="text-xs text-slate-500 dark:text-slate-400 italic ml-1.5 font-normal">({ing.note})</span>}
            </span>
          </label>
        );
      })}
    </div>
  );
}

export default function ShoppingList({ allRecipes = [] }) {
  const [activeIds] = useCookbookStorage("active_recipes", []);
  const [checkedArray] = useCookbookStorage("shopping_list_checked", []);
  const [combinedList] = useCookbookStorage("shopping_list_combined", false);
  const [groupChecked] = useCookbookStorage("shopping_list_group_checked", true);
  const [customItems] = useCookbookStorage("custom_shopping_items", []);

  const [primarySort, setPrimarySort] = useState(PRIMARY_SORT_OPTIONS[0]);
  const [collapsedRecipes, setCollapsedRecipes] = useState(new Set());
  const [customInput, setCustomInput] = useState("");
  const [copiedFeedback, setCopiedFeedback] = useState(false);

  const checkedSet = useMemo(() => new Set(checkedArray), [checkedArray]);

  const activeRecipes = useMemo(() => {
    return allRecipes.filter((recipe) => activeIds.includes(recipe.id));
  }, [allRecipes, activeIds]);

  // Aggregate ingredients for combined view
  const aggregatedIngredients = useMemo(() => {
    if (activeRecipes.length === 0) return [];
    const aggregated = new Map();

    for (const recipe of activeRecipes) {
      for (const ing of recipe.ingredients) {
        const key = `${ing.item.toLowerCase()}_${ing.unit || ""}`;
        const source = { recipeId: recipe.id, recipeTitle: recipe.title, ...ing };
        const qty = typeof ing.quantity === "number" ? ing.quantity : parseFloat(ing.quantity) || 0;

        if (aggregated.has(key)) {
          const existing = aggregated.get(key);
          existing.totalQuantity += qty;
          existing.sources.push(source);
        } else {
          aggregated.set(key, {
            item: ing.item,
            unit: ing.unit || "",
            totalQuantity: qty,
            sources: [source],
          });
        }
      }
    }
    return Array.from(aggregated.values());
  }, [activeRecipes]);

  // Sort aggregated ingredients
  const sortedAggregatedIngredients = useMemo(() => {
    let sorted = [...aggregatedIngredients];
    if (primarySort === "Alphabetical (A-Z)") {
      sorted.sort((a, b) => a.item.localeCompare(b.item));
    }
    if (groupChecked) {
      sorted.sort((a, b) => {
        const isAChecked = a.sources.every((s) => checkedSet.has(`${s.recipeId}_${s.item.toLowerCase()}_${s.unit || ""}`));
        const isBChecked = b.sources.every((s) => checkedSet.has(`${s.recipeId}_${s.item.toLowerCase()}_${s.unit || ""}`));
        return (isAChecked ? 1 : 0) - (isBChecked ? 1 : 0);
      });
    }
    return sorted;
  }, [aggregatedIngredients, primarySort, groupChecked, checkedSet]);

  // Single ingredient check/uncheck
  const handleToggleCheck = (key) => {
    toggleInArray("shopping_list_checked", key);
  };

  // Aggregated ingredient check/uncheck (all matching recipe sources)
  const handleToggleAggregatedCheck = (sources) => {
    const allKeys = sources.map((s) => `${s.recipeId}_${s.item.toLowerCase()}_${s.unit || ""}`);
    const areAllChecked = allKeys.every((k) => checkedSet.has(k));

    let nextChecked;
    if (areAllChecked) {
      nextChecked = checkedArray.filter((k) => !allKeys.includes(k));
    } else {
      const keysToAdd = allKeys.filter((k) => !checkedSet.has(k));
      nextChecked = [...checkedArray, ...keysToAdd];
    }
    setStorageItem("shopping_list_checked", nextChecked);
  };

  // Toggle combined list mode
  const handleCombinedToggle = () => {
    setStorageItem("shopping_list_combined", !combinedList);
  };

  // Toggle group checked to bottom
  const handleGroupToggle = () => {
    setStorageItem("shopping_list_group_checked", !groupChecked);
  };

  // Toggle recipe accordion collapse
  const handleCollapseToggle = (recipeId) => {
    const next = new Set(collapsedRecipes);
    if (next.has(recipeId)) next.delete(recipeId);
    else next.add(recipeId);
    setCollapsedRecipes(next);
  };

  // Remove a single recipe from active recipes
  const handleRemoveRecipe = (recipeId) => {
    const nextActive = activeIds.filter((id) => id !== recipeId);
    setStorageItem("active_recipes", nextActive);

    const nextChecked = checkedArray.filter((k) => !k.startsWith(`${recipeId}_`));
    setStorageItem("shopping_list_checked", nextChecked);
  };

  // Clear all checked items
  const handleClearChecked = () => {
    setStorageItem("shopping_list_checked", []);
    const remainingCustom = customItems.filter((item) => !item.checked);
    setStorageItem("custom_shopping_items", remainingCustom);
  };

  // Clear all active recipes
  const handleClearAllActive = () => {
    if (window.confirm("Are you sure you want to remove all recipes from your active shopping list?")) {
      setStorageItem("active_recipes", []);
      setStorageItem("shopping_list_checked", []);
    }
  };

  // Custom Item Handlers
  const handleAddCustomItem = (e) => {
    e.preventDefault();
    const trimmed = customInput.trim();
    if (!trimmed) return;

    const newItem = {
      id: `custom_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      text: trimmed,
      checked: false,
    };

    setStorageItem("custom_shopping_items", [...customItems, newItem]);
    setCustomInput("");
  };

  const handleToggleCustomItem = (id) => {
    const updated = customItems.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item));
    setStorageItem("custom_shopping_items", updated);
  };

  const handleDeleteCustomItem = (id) => {
    const filtered = customItems.filter((item) => item.id !== id);
    setStorageItem("custom_shopping_items", filtered);
  };

  // Copy clean checklist to clipboard
  const handleCopyChecklist = () => {
    const lines = ["# Shopping List\n"];

    if (combinedList) {
      const uncheckedAggregated = sortedAggregatedIngredients.filter(
        (ing) => !ing.sources.every((s) => checkedSet.has(`${s.recipeId}_${s.item.toLowerCase()}_${s.unit || ""}`)),
      );

      if (uncheckedAggregated.length > 0) {
        lines.push("## Ingredients");
        uncheckedAggregated.forEach((ing) => {
          const qtyStr =
            ing.totalQuantity === 0 ? `${ing.item}, to taste` : `${formatQuantity(ing.totalQuantity)} ${ing.unit || ""} ${ing.item}`.trim();
          lines.push(`- [ ] ${qtyStr}`);
        });
      }
    } else {
      activeRecipes.forEach((recipe) => {
        const unchecked = recipe.ingredients.filter((ing) => !checkedSet.has(`${recipe.id}_${ing.item.toLowerCase()}_${ing.unit || ""}`));
        if (unchecked.length > 0) {
          lines.push(`\n## ${recipe.title}`);
          unchecked.forEach((ing) => {
            const qtyStr = ing.quantity === 0 ? `${ing.item}, to taste` : `${formatQuantity(ing.quantity)} ${ing.unit || ""} ${ing.item}`.trim();
            lines.push(`- [ ] ${qtyStr}`);
          });
        }
      });
    }

    const uncheckedCustom = customItems.filter((item) => !item.checked);
    if (uncheckedCustom.length > 0) {
      lines.push("\n## Additional Staples");
      uncheckedCustom.forEach((item) => {
        lines.push(`- [ ] ${item.text}`);
      });
    }

    const text = lines.join("\n");
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard
        .writeText(text)
        .then(() => {
          setCopiedFeedback(true);
          setTimeout(() => setCopiedFeedback(false), 2200);
        })
        .catch((err) => {
          console.error("Failed to copy shopping list: ", err);
        });
    }
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  // Total ingredients stats
  const totalRecipeIngredients = useMemo(() => {
    return activeRecipes.reduce((sum, r) => sum + r.ingredients.length, 0);
  }, [activeRecipes]);

  const checkedRecipeIngredientsCount = useMemo(() => {
    return activeRecipes.reduce((sum, r) => {
      const checkedInRecipe = r.ingredients.filter((ing) => checkedSet.has(`${r.id}_${ing.item.toLowerCase()}_${ing.unit || ""}`)).length;
      return sum + checkedInRecipe;
    }, 0);
  }, [activeRecipes, checkedSet]);

  const totalItemsCount = totalRecipeIngredients + customItems.length;
  const totalCheckedCount = checkedRecipeIngredientsCount + customItems.filter((i) => i.checked).length;

  const isEmpty = activeRecipes.length === 0 && customItems.length === 0;

  return (
    <div className="space-y-8">
      {/* Page Title & Status Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-3xl">🛒</span>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">Shopping List</h1>
          </div>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">
            Consolidated ingredients from your active recipes and grocery staples.
          </p>
        </div>

        {!isEmpty && (
          <div className="flex items-center gap-2 text-xs font-mono font-semibold px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 self-start sm:self-auto">
            <span className="text-emerald-600 dark:text-emerald-400">{totalCheckedCount}</span>
            <span className="text-slate-400">/</span>
            <span className="text-slate-700 dark:text-slate-300">{totalItemsCount} items completed</span>
          </div>
        )}
      </div>

      {/* Action Toolbar */}
      {!isEmpty && (
        <div className="print:hidden rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/70 backdrop-blur-md p-4 sm:p-5 shadow-xs space-y-4">
          {/* Top row: Actions */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleCopyChecklist}
                className="btn btn-primary text-xs !px-3.5 !py-2 inline-flex items-center gap-2 cursor-pointer transition-all shadow-xs"
                title="Copy markdown checklist to clipboard"
              >
                {copiedFeedback ? (
                  <>
                    <span>✓</span>
                    <span>Copied Checklist!</span>
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                      />
                    </svg>
                    <span>Copy to Clipboard</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handlePrint}
                className="btn btn-secondary text-xs !px-3 !py-2 inline-flex items-center gap-1.5 cursor-pointer"
                title="Print shopping list"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                  />
                </svg>
                <span>Print</span>
              </button>

              {totalCheckedCount > 0 && (
                <button
                  type="button"
                  onClick={handleClearChecked}
                  className="btn btn-secondary text-xs !px-3 !py-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                  title="Uncheck all completed items"
                >
                  Clear Checked
                </button>
              )}
            </div>

            {activeRecipes.length > 0 && (
              <button
                type="button"
                onClick={handleClearAllActive}
                className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 underline underline-offset-4 cursor-pointer transition-colors"
                title="Remove all recipes from active plan"
              >
                Clear All Recipes
              </button>
            )}
          </div>

          {/* Bottom row: View controls */}
          <div className="pt-3 border-t border-slate-200/60 dark:border-slate-800/60 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4 text-xs">
              <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={combinedList}
                  onChange={handleCombinedToggle}
                  className="h-4 w-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                />
                <span>Combine ingredients across recipes</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={groupChecked}
                  onChange={handleGroupToggle}
                  className="h-4 w-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                />
                <span>Group checked items at bottom</span>
              </label>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="font-mono uppercase text-slate-400 text-[11px]">Sort:</span>
              <div className="inline-flex rounded-lg border border-slate-200 dark:border-slate-700 p-0.5 bg-slate-100 dark:bg-slate-800">
                {PRIMARY_SORT_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setPrimarySort(opt)}
                    className={`px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer ${
                      primarySort === opt
                        ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-bold"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {isEmpty && (
        <div className="py-16 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 p-8 bg-white/40 dark:bg-slate-900/40 max-w-lg mx-auto">
          <p className="text-5xl mb-4">🛒</p>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Your shopping list is empty</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
            Add recipes to your Active list by tapping the <strong className="text-emerald-600 dark:text-emerald-400 font-bold">+</strong> button on
            recipe cards, or add custom groceries below.
          </p>
          <a href="/cookbook" className="btn btn-primary text-sm px-5 py-2.5 shadow-sm">
            Explore All Recipes &rarr;
          </a>
        </div>
      )}

      {/* Main Ingredient List */}
      {!isEmpty && activeRecipes.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center justify-between">
            <span>Recipe Ingredients</span>
            <span className="text-xs font-mono text-slate-400 font-normal">
              {activeRecipes.length} {activeRecipes.length === 1 ? "recipe" : "recipes"} active
            </span>
          </h2>

          {combinedList ? (
            /* Combined Ingredients View */
            <div className="space-y-2">
              {sortedAggregatedIngredients.map((ing) => {
                const allKeys = ing.sources.map((s) => `${s.recipeId}_${s.item.toLowerCase()}_${s.unit || ""}`);
                const isChecked = allKeys.length > 0 && allKeys.every((k) => checkedSet.has(k));
                const checkedCount = allKeys.filter((k) => checkedSet.has(k)).length;
                const totalSources = ing.sources.length;

                return (
                  <label
                    key={`${ing.item}_${ing.unit}`}
                    className={`flex items-start p-3.5 rounded-xl border transition-all cursor-pointer ${
                      isChecked
                        ? "bg-slate-100/50 dark:bg-slate-900/30 border-slate-200/50 dark:border-slate-800/50 opacity-60"
                        : "bg-white/80 dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-700/80 hover:border-emerald-500/40"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleToggleAggregatedCheck(ing.sources)}
                      className="mt-0.5 h-4 w-4 rounded text-emerald-600 focus:ring-emerald-500 shrink-0 cursor-pointer"
                    />
                    <div className="ml-3 flex-1 flex flex-wrap items-baseline justify-between gap-2">
                      <span
                        className={`text-sm leading-relaxed ${
                          isChecked ? "text-slate-400 dark:text-slate-500 line-through" : "text-slate-800 dark:text-slate-200 font-medium"
                        }`}
                      >
                        {ing.totalQuantity === 0
                          ? `${ing.item}, to taste`
                          : `${formatQuantity(ing.totalQuantity)} ${ing.unit || ""} ${ing.item}`.trim()}
                      </span>
                      {totalSources > 1 && (
                        <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                          Used in {totalSources} recipes ({checkedCount}/{totalSources})
                        </span>
                      )}
                    </div>
                  </label>
                );
              })}
            </div>
          ) : (
            /* Grouped by Recipe View */
            <div className="space-y-4">
              {activeRecipes.map((recipe) => {
                const isCollapsed = collapsedRecipes.has(recipe.id);
                const totalIng = recipe.ingredients.length;
                const checkedIng = recipe.ingredients.filter((ing) =>
                  checkedSet.has(`${recipe.id}_${ing.item.toLowerCase()}_${ing.unit || ""}`),
                ).length;

                return (
                  <div
                    key={recipe.id}
                    className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/60 p-4 sm:p-5 shadow-xs"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <button
                          type="button"
                          onClick={() => handleCollapseToggle(recipe.id)}
                          className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
                          aria-label={isCollapsed ? "Expand recipe ingredients" : "Collapse recipe ingredients"}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={2.5}
                            stroke="currentColor"
                            className={`w-4 h-4 transition-transform duration-200 ${!isCollapsed ? "rotate-90" : ""}`}
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                          </svg>
                        </button>

                        <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white truncate">{recipe.title}</h3>

                        <span className="text-xs font-mono text-slate-500 dark:text-slate-400 shrink-0">
                          ({checkedIng}/{totalIng})
                        </span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 print:hidden">
                        <a href={`/cookbook/${recipe.id}`} className="btn btn-secondary text-xs !px-2.5 !py-1 font-medium">
                          View Recipe
                        </a>
                        <button
                          type="button"
                          onClick={() => handleRemoveRecipe(recipe.id)}
                          className="h-7 w-7 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center justify-center transition-colors cursor-pointer"
                          title="Remove recipe from shopping list"
                          aria-label={`Remove ${recipe.title}`}
                        >
                          &times;
                        </button>
                      </div>
                    </div>

                    {!isCollapsed && (
                      <RecipeIngredientGroup
                        recipe={recipe}
                        checkedSet={checkedSet}
                        onToggleCheck={handleToggleCheck}
                        primarySort={primarySort}
                        groupChecked={groupChecked}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* Additional Grocery Staples Section */}
      <section className="space-y-4 pt-4 border-t border-slate-200/80 dark:border-slate-800/80">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>🧺</span> Additional Staples
          </h2>
          {customItems.length > 0 && (
            <span className="text-xs font-mono text-slate-400">
              {customItems.filter((i) => i.checked).length} of {customItems.length} checked
            </span>
          )}
        </div>

        {/* Add custom item form */}
        <form onSubmit={handleAddCustomItem} className="flex gap-2 print:hidden">
          <input
            type="text"
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            placeholder="Add custom item (e.g. olive oil, eggs, coffee)..."
            className="flex-1 rounded-xl border border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
          <button
            type="submit"
            disabled={!customInput.trim()}
            className="btn btn-primary text-xs !px-4 !py-2.5 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            + Add
          </button>
        </form>

        {/* Custom items list */}
        {customItems.length > 0 && (
          <div className="space-y-2">
            {customItems.map((item) => (
              <div
                key={item.id}
                className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                  item.checked
                    ? "bg-slate-100/50 dark:bg-slate-900/30 border-slate-200/50 dark:border-slate-800/50 opacity-60"
                    : "bg-white/80 dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-700/80"
                }`}
              >
                <label className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={item.checked}
                    onChange={() => handleToggleCustomItem(item.id)}
                    className="h-4 w-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                  />
                  <span
                    className={`text-sm font-medium truncate ${
                      item.checked ? "text-slate-400 dark:text-slate-500 line-through" : "text-slate-800 dark:text-slate-200"
                    }`}
                  >
                    {item.text}
                  </span>
                </label>

                <button
                  type="button"
                  onClick={() => handleDeleteCustomItem(item.id)}
                  className="h-6 w-6 rounded-md text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-colors cursor-pointer print:hidden"
                  title="Delete item"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
