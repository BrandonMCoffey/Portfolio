import React, { useState, useMemo } from "react";
import RecipeCard from "./RecipeCard";

const TIME_RANGES = [
  { label: "<30 min", maxMinutes: 30 },
  { label: "30 min - 1 hr", minMinutes: 30, maxMinutes: 60 },
  { label: "1-2 hr", minMinutes: 60, maxMinutes: 120 },
  { label: "2-4 hr", minMinutes: 120, maxMinutes: 240 },
  { label: "4+ hr", minMinutes: 240, maxMinutes: Infinity },
];

const COOKWARE_RANGES = [
  { label: "1 Item", max: 1 },
  { label: "2-3 Items", min: 2, max: 3 },
  { label: "4+ Items", min: 4, max: Infinity },
];

const MANUAL_CATEGORY_ORDER = ["Breakfast", "Appetizer", "Soup", "Main Course", "Side Dish", "Dessert", "Bread", "Sauce", "Condiment"];

const SORT_MODES = ["Default", "Alphabetical", "Complexity", "Random"];

const COLLECTIONS = [
  { id: "all", label: "All Collections" },
  { id: "College Cookbook", label: "College Cookbook" },
  { id: "Brandon Family", label: "Brandon Family" },
  { id: "Jackie Family", label: "Jackie Family" },
  { id: "New", label: "Jackie & Brandon" },
  { id: "Copycat", label: "Copycat Favorites" },
];

export default function RecipeFilter({ allRecipes, categories, cuisines, diets, base }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCollection, setActiveCollection] = useState("all");
  const [activeCategories, setActiveCategories] = useState(new Set());
  const [activeCuisines, setActiveCuisines] = useState(new Set());
  const [activeDiets, setActiveDiets] = useState(new Set());
  const [timeFilter, setTimeFilter] = useState(null);
  const [cookwareFilter, setCookwareFilter] = useState(null);
  const [sortMode, setSortMode] = useState("Default");
  const [sortDirection, setSortDirection] = useState("asc");
  const [randomSeed, setRandomSeed] = useState(0);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const handleTagToggle = (stateSet, setter, item) => {
    const newSet = new Set(stateSet);
    if (newSet.has(item)) newSet.delete(item);
    else newSet.add(item);
    setter(newSet);
  };

  const handleRangeToggle = (currentFilter, setter, range) => {
    if (currentFilter?.label === range.label) setter(null);
    else setter(range);
  };

  const handleSortChange = (mode) => {
    if (mode === "Random") {
      setSortMode("Random");
      setRandomSeed(Math.random());
      return;
    }
    if (sortMode === mode) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortMode(mode);
      setSortDirection("asc");
    }
  };

  const clearAllFilters = () => {
    setSearchQuery("");
    setActiveCollection("all");
    setActiveCategories(new Set());
    setActiveCuisines(new Set());
    setActiveDiets(new Set());
    setTimeFilter(null);
    setCookwareFilter(null);
    setSortMode("Default");
    setSortDirection("asc");
  };

  const manuallySortedCategories = useMemo(() => {
    return [...categories].sort((a, b) => {
      const indexA = MANUAL_CATEGORY_ORDER.indexOf(a.name);
      const indexB = MANUAL_CATEGORY_ORDER.indexOf(b.name);
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;
      return indexA - indexB;
    });
  }, [categories]);

  // Search filter
  const searchedRecipes = useMemo(() => {
    if (!searchQuery) return allRecipes;
    const lowerCaseQuery = searchQuery.toLowerCase();
    return allRecipes.filter((recipe) => {
      const searchableContent = [
        recipe.title,
        recipe.description,
        recipe.category,
        recipe.author,
        ...(recipe.collections || []),
        ...(recipe.cuisines || []),
        ...(recipe.diets || []),
        ...(recipe.cookware || []),
        ...(recipe.ingredients?.map((i) => i.item) || []),
      ]
        .join(" ")
        .toLowerCase();
      return searchableContent.includes(lowerCaseQuery);
    });
  }, [allRecipes, searchQuery]);

  // Collection, category, cuisine, diet filter
  const baseFilters = useMemo(() => {
    let filtered = searchedRecipes;
    if (activeCollection !== "all") {
      filtered = filtered.filter((r) => r.collections?.includes(activeCollection));
    }
    if (activeCategories.size > 0) {
      filtered = filtered.filter((r) => activeCategories.has(r.category));
    }
    if (activeCuisines.size > 0) {
      filtered = filtered.filter((r) => r.cuisines?.some((c) => activeCuisines.has(c)));
    }
    if (activeDiets.size > 0) {
      filtered = filtered.filter((r) => r.diets?.some((d) => activeDiets.has(d)));
    }
    return filtered;
  }, [searchedRecipes, activeCollection, activeCategories, activeCuisines, activeDiets]);

  // Range filters
  const filteredRecipes = useMemo(() => {
    let filtered = baseFilters;
    if (timeFilter) {
      filtered = filtered.filter((recipe) => {
        const totalTime = (recipe.time?.prep || 0) + (recipe.time?.cook || 0) + (recipe.time?.rest || 0);
        const min = timeFilter.minMinutes || 0;
        const max = timeFilter.maxMinutes || Infinity;
        return totalTime > min && totalTime <= max;
      });
    }
    if (cookwareFilter) {
      filtered = filtered.filter((recipe) => {
        const count = recipe.cookware?.length || 0;
        const min = cookwareFilter.min || 0;
        const max = cookwareFilter.max || Infinity;
        return count >= min && count <= max;
      });
    }
    return filtered;
  }, [baseFilters, timeFilter, cookwareFilter]);

  // Sorting
  const sortedRecipes = useMemo(() => {
    const toSort = [...filteredRecipes];
    switch (sortMode) {
      case "Alphabetical":
        toSort.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "Complexity":
        toSort.sort((a, b) => {
          const cookwareA = a.cookware?.length || 0;
          const cookwareB = b.cookware?.length || 0;
          const timeA = (a.time?.prep || 0) + (a.time?.cook || 0) + (a.time?.rest || 0);
          const timeB = (b.time?.prep || 0) + (b.time?.cook || 0) + (b.time?.rest || 0);
          return cookwareA - cookwareB + (timeA - timeB) / 120;
        });
        break;
      case "Random":
        toSort.sort(() => Math.random() - 0.5);
        break;
      default:
        return toSort;
    }
    if (sortDirection === "desc") toSort.reverse();
    return toSort;
  }, [filteredRecipes, sortMode, sortDirection, randomSeed]);

  // Total active filter count for badge
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (activeCollection !== "all") count++;
    count += activeCategories.size;
    count += activeCuisines.size;
    count += activeDiets.size;
    if (timeFilter) count++;
    if (cookwareFilter) count++;
    return count;
  }, [activeCollection, activeCategories, activeCuisines, activeDiets, timeFilter, cookwareFilter]);

  const hasAnyFilter = activeFiltersCount > 0 || Boolean(searchQuery);

  return (
    <div className="space-y-6">
      {/* Search, Collection & Control Toolbar */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/60 backdrop-blur-md p-5 shadow-xs space-y-4">
        {/* Top row: Search input & Toggle/Sort buttons */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="relative flex-1 max-w-xl">
            <svg
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search recipes, ingredients, tags..."
              className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-slate-200/90 dark:border-slate-700/80 bg-white dark:bg-slate-950/80 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-bold p-1 cursor-pointer"
                aria-label="Clear search"
              >
                &times;
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {/* Filter Accordion Toggle */}
            <button
              type="button"
              onClick={() => setFiltersOpen(!filtersOpen)}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                filtersOpen || activeFiltersCount > 0
                  ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                  : "bg-white dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700"
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                />
              </svg>
              <span>Filters</span>
              {activeFiltersCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-white text-emerald-800">{activeFiltersCount}</span>
              )}
            </button>

            {/* Sort Select */}
            <select
              value={sortMode}
              onChange={(e) => handleSortChange(e.target.value)}
              className="py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="Default">Sort: Default</option>
              <option value="Alphabetical">Alphabetical (A-Z)</option>
              <option value="Complexity">Complexity</option>
              <option value="Random">🎲 Random</option>
            </select>
          </div>
        </div>

        {/* Collection Filter Tabs */}
        <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 dark:text-slate-500 mr-1 hidden sm:inline">Collection:</span>
          {COLLECTIONS.map((col) => (
            <button
              key={col.id}
              type="button"
              onClick={() => setActiveCollection(col.id)}
              className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeCollection === col.id
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              {col.label}
            </button>
          ))}
        </div>

        {/* Active Filter Chips Row (Visible whenever any filter is applied) */}
        {hasAnyFilter && (
          <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/60 flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 dark:text-slate-500 mr-1">Active:</span>

            {searchQuery && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50">
                <span>Search: "{searchQuery}"</span>
                <button type="button" onClick={() => setSearchQuery("")} className="hover:text-red-500 font-bold ml-1 cursor-pointer">
                  &times;
                </button>
              </span>
            )}

            {activeCollection !== "all" && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50">
                <span>Collection: {activeCollection}</span>
                <button type="button" onClick={() => setActiveCollection("all")} className="hover:text-red-500 font-bold ml-1 cursor-pointer">
                  &times;
                </button>
              </span>
            )}

            {[...activeCategories].map((cat) => (
              <span
                key={cat}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50"
              >
                <span>Category: {cat}</span>
                <button
                  type="button"
                  onClick={() => handleTagToggle(activeCategories, setActiveCategories, cat)}
                  className="hover:text-red-500 font-bold ml-1 cursor-pointer"
                >
                  &times;
                </button>
              </span>
            ))}

            {timeFilter && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50">
                <span>Time: {timeFilter.label}</span>
                <button type="button" onClick={() => setTimeFilter(null)} className="hover:text-red-500 font-bold ml-1 cursor-pointer">
                  &times;
                </button>
              </span>
            )}

            {cookwareFilter && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50">
                <span>Cookware: {cookwareFilter.label}</span>
                <button type="button" onClick={() => setCookwareFilter(null)} className="hover:text-red-500 font-bold ml-1 cursor-pointer">
                  &times;
                </button>
              </span>
            )}

            {[...activeCuisines].map((c) => (
              <span
                key={c}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50"
              >
                <span>Cuisine: {c}</span>
                <button
                  type="button"
                  onClick={() => handleTagToggle(activeCuisines, setActiveCuisines, c)}
                  className="hover:text-red-500 font-bold ml-1 cursor-pointer"
                >
                  &times;
                </button>
              </span>
            ))}

            {[...activeDiets].map((d) => (
              <span
                key={d}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50"
              >
                <span>Diet: {d}</span>
                <button
                  type="button"
                  onClick={() => handleTagToggle(activeDiets, setActiveDiets, d)}
                  className="hover:text-red-500 font-bold ml-1 cursor-pointer"
                >
                  &times;
                </button>
              </span>
            ))}

            <button
              type="button"
              onClick={clearAllFilters}
              className="text-xs font-semibold text-red-600 dark:text-red-400 hover:underline ml-2 cursor-pointer"
            >
              Clear All
            </button>
          </div>
        )}

        {/* Expandable Filter Drawer Accordion */}
        {filtersOpen && (
          <div className="pt-4 border-t border-slate-200/80 dark:border-slate-800/80 space-y-5 animate-fade-in">
            {/* Categories */}
            <div>
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">Category:</h4>
              <div className="flex flex-wrap gap-1.5">
                {manuallySortedCategories.map((cat) => {
                  const isSelected = activeCategories.has(cat.name);
                  return (
                    <button
                      key={cat.name}
                      type="button"
                      onClick={() => handleTagToggle(activeCategories, setActiveCategories, cat.name)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                        isSelected
                          ? "bg-emerald-600 text-white"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                      }`}
                    >
                      {cat.name} ({cat.count})
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Time & Cookware row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">Total Time:</h4>
                <div className="flex flex-wrap gap-1.5">
                  {TIME_RANGES.map((range) => {
                    const isSelected = timeFilter?.label === range.label;
                    return (
                      <button
                        key={range.label}
                        type="button"
                        onClick={() => handleRangeToggle(timeFilter, setTimeFilter, range)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                          isSelected
                            ? "bg-emerald-600 text-white"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                        }`}
                      >
                        {range.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">Cookware Count:</h4>
                <div className="flex flex-wrap gap-1.5">
                  {COOKWARE_RANGES.map((range) => {
                    const isSelected = cookwareFilter?.label === range.label;
                    return (
                      <button
                        key={range.label}
                        type="button"
                        onClick={() => handleRangeToggle(cookwareFilter, setCookwareFilter, range)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                          isSelected
                            ? "bg-emerald-600 text-white"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                        }`}
                      >
                        {range.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Cuisines & Diets */}
            {(cuisines?.length > 0 || diets?.length > 0) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {cuisines?.length > 0 && (
                  <div>
                    <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">Cuisines:</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {cuisines.map((c) => (
                        <button
                          key={c.name}
                          type="button"
                          onClick={() => handleTagToggle(activeCuisines, setActiveCuisines, c.name)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                            activeCuisines.has(c.name)
                              ? "bg-emerald-600 text-white"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                          }`}
                        >
                          {c.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {diets?.length > 0 && (
                  <div>
                    <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">Dietary:</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {diets.map((d) => (
                        <button
                          key={d.name}
                          type="button"
                          onClick={() => handleTagToggle(activeDiets, setActiveDiets, d.name)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                            activeDiets.has(d.name)
                              ? "bg-emerald-600 text-white"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                          }`}
                        >
                          {d.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between text-xs font-mono text-slate-500 dark:text-slate-400 px-1">
        <span>
          Showing <strong>{sortedRecipes.length}</strong> of {allRecipes.length} recipes
        </span>
        {sortedRecipes.length === 0 && (
          <button type="button" onClick={clearAllFilters} className="text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer">
            Reset all filters
          </button>
        )}
      </div>

      {/* Recipes Grid */}
      {sortedRecipes.length === 0 ? (
        <div className="py-16 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 p-8 my-8">
          <p className="text-4xl mb-3">🍳</p>
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-2">No recipes match your criteria</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-6">
            Try loosening your time filters or searching for different ingredients.
          </p>
          <button type="button" onClick={clearAllFilters} className="btn btn-secondary text-xs px-4 py-2">
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sortedRecipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      )}
    </div>
  );
}
