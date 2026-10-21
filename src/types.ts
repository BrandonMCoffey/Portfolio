export interface RecipeIngredient {
  item: string;
  quantity?: number | string;
  unit?: string;
  note?: string;
}

export interface RecipeTime {
  prep?: number;
  cook?: number;
  rest?: number;
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  author: string;
  date?: string;
  collections?: string[];
  category: string;
  cuisines?: string[];
  diets?: string[];
  cookware?: string[];
  time: RecipeTime;
  servings?: number | string;
  ingredients: RecipeIngredient[];
  instructions: string[];
  tips: string[];
}
