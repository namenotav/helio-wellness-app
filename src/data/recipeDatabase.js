// Recipe Database - 50+ healthy recipes

export const recipeDatabase = [
  // BREAKFAST RECIPES
  {
    id: 'breakfast-1',
    name: 'Protein Oatmeal Bowl',
    category: 'Breakfast',
    prepTime: '5 minutes',
    cookTime: '5 minutes',
    servings: 1,
    difficulty: 'Easy',
    calories: 380,
    protein: 25,
    carbs: 52,
    fats: 8,
    ingredients: [
      '1/2 cup rolled oats',
      '1 cup almond milk',
      '1 scoop vanilla protein powder',
      '1 tbsp honey',
      '1/2 banana sliced',
      'Handful of blueberries',
      '1 tbsp almond butter'
    ],
    instructions: [
      'Cook oats with almond milk in microwave for 2-3 minutes',
      'Stir in protein powder while hot',
      'Top with banana, blueberries, and almond butter',
      'Drizzle with honey',
      'Enjoy warm'
    ],
    benefits: 'High in protein and fiber. Great pre-workout meal. Sustained energy.',
    tags: ['High-Protein', 'Vegetarian', 'Quick']
  },
  {
    id: 'breakfast-2',
    name: 'Egg White Veggie Scramble',
    category: 'Breakfast',
    prepTime: '5 minutes',
    cookTime: '8 minutes',
    servings: 1,
    difficulty: 'Easy',
    calories: 250,
    protein: 28,
    carbs: 12,
    fats: 8,
    ingredients: [
      '4 egg whites + 1 whole egg',
      '1/2 cup spinach',
      '1/4 cup diced bell peppers',
      '1/4 cup mushrooms',
      '1/4 avocado',
      'Salt, pepper, garlic powder'
    ],
    instructions: [
      'Heat pan with cooking spray',
      'Sauté veggies for 2-3 minutes',
      'Add beaten eggs',
      'Scramble until cooked through',
      'Top with avocado'
    ],
    benefits: 'Lean protein, low calorie, nutrient dense. Perfect for fat loss.',
    tags: ['High-Protein', 'Low-Carb', 'Quick']
  },
  {
    id: 'breakfast-3',
    name: 'Greek Yogurt Parfait',
    category: 'Breakfast',
    prepTime: '3 minutes',
    cookTime: '0 minutes',
    servings: 1,
    difficulty: 'Easy',
    calories: 320,
    protein: 22,
    carbs: 38,
    fats: 9,
    ingredients: [
      '1 cup plain Greek yogurt',
      '1/2 cup mixed berries',
      '1/4 cup granola',
      '1 tbsp honey',
      'Sprinkle of chia seeds'
    ],
    instructions: [
      'Layer yogurt in a bowl or glass',
      'Add berries',
      'Top with granola and chia seeds',
      'Drizzle honey',
      'Eat immediately'
    ],
    benefits: 'High protein, probiotic-rich, antioxidants from berries.',
    tags: ['High-Protein', 'Vegetarian', 'No-Cook']
  },

  // LUNCH RECIPES
  {
    id: 'lunch-1',
    name: 'Grilled Chicken Caesar Salad',
    category: 'Lunch',
    prepTime: '10 minutes',
    cookTime: '15 minutes',
    servings: 1,
    difficulty: 'Easy',
    calories: 420,
    protein: 45,
    carbs: 18,
    fats: 18,
    ingredients: [
      '6oz grilled chicken breast',
      '3 cups romaine lettuce',
      '2 tbsp light Caesar dressing',
      '2 tbsp parmesan cheese',
      'Whole wheat croutons',
      'Lemon wedge'
    ],
    instructions: [
      'Season and grill chicken until cooked through',
      'Chop romaine lettuce',
      'Slice chicken',
      'Toss lettuce with dressing',
      'Top with chicken, parmesan, croutons'
    ],
    benefits: 'Lean protein, filling, moderate calories. Great muscle-building meal.',
    tags: ['High-Protein', 'Low-Carb']
  },
  {
    id: 'lunch-2',
    name: 'Turkey & Avocado Wrap',
    category: 'Lunch',
    prepTime: '5 minutes',
    cookTime: '0 minutes',
    servings: 1,
    difficulty: 'Easy',
    calories: 380,
    protein: 32,
    carbs: 35,
    fats: 14,
    ingredients: [
      '1 whole wheat tortilla',
      '4oz sliced turkey breast',
      '1/4 avocado',
      'Lettuce, tomato, cucumber',
      'Mustard or hummus'
    ],
    instructions: [
      'Spread mustard or hummus on tortilla',
      'Layer turkey and veggies',
      'Add avocado',
      'Roll tightly',
      'Cut in half'
    ],
    benefits: 'Portable, lean protein, healthy fats. Perfect meal prep option.',
    tags: ['High-Protein', 'Meal-Prep', 'Quick']
  },
  {
    id: 'lunch-3',
    name: 'Quinoa Buddha Bowl',
    category: 'Lunch',
    prepTime: '10 minutes',
    cookTime: '20 minutes',
    servings: 1,
    difficulty: 'Medium',
    calories: 450,
    protein: 18,
    carbs: 58,
    fats: 16,
    ingredients: [
      '1/2 cup cooked quinoa',
      '1/2 cup roasted chickpeas',
      '1 cup mixed roasted vegetables',
      '2 tbsp tahini dressing',
      'Handful of spinach',
      'Cherry tomatoes'
    ],
    instructions: [
      'Cook quinoa according to package',
      'Roast chickpeas and vegetables',
      'Arrange all ingredients in bowl',
      'Drizzle with tahini dressing',
      'Mix and enjoy'
    ],
    benefits: 'Plant-based protein, fiber-rich, nutrient-dense. Vegan-friendly.',
    tags: ['Vegan', 'High-Fiber', 'Meal-Prep']
  },

  // DINNER RECIPES
  {
    id: 'dinner-1',
    name: 'Baked Salmon with Asparagus',
    category: 'Dinner',
    prepTime: '10 minutes',
    cookTime: '20 minutes',
    servings: 1,
    difficulty: 'Easy',
    calories: 480,
    protein: 42,
    carbs: 22,
    fats: 24,
    ingredients: [
      '6oz salmon fillet',
      '1 bunch asparagus',
      '1/2 cup sweet potato (cubed)',
      'Olive oil, lemon, garlic',
      'Salt, pepper, dill'
    ],
    instructions: [
      'Preheat oven to 400°F',
      'Place salmon and veggies on baking sheet',
      'Drizzle with olive oil, season',
      'Bake for 18-20 minutes',
      'Serve with lemon wedge'
    ],
    benefits: 'Omega-3 rich, lean protein, anti-inflammatory. Heart-healthy meal.',
    tags: ['High-Protein', 'Omega-3', 'Low-Carb']
  },
  {
    id: 'dinner-2',
    name: 'Chicken Stir-Fry with Brown Rice',
    category: 'Dinner',
    prepTime: '15 minutes',
    cookTime: '15 minutes',
    servings: 1,
    difficulty: 'Medium',
    calories: 520,
    protein: 38,
    carbs: 54,
    fats: 14,
    ingredients: [
      '5oz chicken breast (diced)',
      '2 cups mixed vegetables (broccoli, bell peppers, snap peas)',
      '1/2 cup cooked brown rice',
      '2 tbsp low-sodium soy sauce',
      'Garlic, ginger, sesame oil'
    ],
    instructions: [
      'Cook brown rice ahead of time',
      'Heat wok or large pan',
      'Cook chicken until done, set aside',
      'Stir-fry vegetables',
      'Add chicken back, toss with sauce'
    ],
    benefits: 'Balanced macros, veggie-packed, satisfying. Great for muscle recovery.',
    tags: ['High-Protein', 'Balanced', 'Meal-Prep']
  },
  {
    id: 'dinner-3',
    name: 'Lean Beef Tacos',
    category: 'Dinner',
    prepTime: '10 minutes',
    cookTime: '12 minutes',
    servings: 2,
    difficulty: 'Easy',
    calories: 440,
    protein: 35,
    carbs: 38,
    fats: 16,
    ingredients: [
      '6oz 93% lean ground beef',
      '3 corn tortillas',
      'Lettuce, tomato, onion',
      'Salsa, light sour cream',
      'Taco seasoning',
      'Lime wedges'
    ],
    instructions: [
      'Brown ground beef in pan',
      'Add taco seasoning and water',
      'Simmer until thickened',
      'Warm tortillas',
      'Assemble tacos with toppings'
    ],
    benefits: 'High protein, iron-rich, satisfying. Proves healthy eating can taste great.',
    tags: ['High-Protein', 'Quick', 'Family-Friendly']
  },

  // SNACKS
  {
    id: 'snack-1',
    name: 'Protein Energy Balls',
    category: 'Snacks',
    prepTime: '10 minutes',
    cookTime: '0 minutes',
    servings: 12,
    difficulty: 'Easy',
    calories: 120,
    protein: 6,
    carbs: 14,
    fats: 5,
    ingredients: [
      '1 cup oats',
      '1/2 cup protein powder',
      '1/3 cup honey',
      '1/2 cup peanut butter',
      '1/4 cup chocolate chips',
      '2 tbsp chia seeds'
    ],
    instructions: [
      'Mix all ingredients in bowl',
      'Roll into 1-inch balls',
      'Refrigerate for 30 minutes',
      'Store in airtight container',
      'Grab when you need quick energy'
    ],
    benefits: 'Portable protein, meal prep friendly, satisfies sweet cravings.',
    tags: ['High-Protein', 'Meal-Prep', 'No-Cook']
  },
  {
    id: 'snack-2',
    name: 'Apple with Almond Butter',
    category: 'Snacks',
    prepTime: '2 minutes',
    cookTime: '0 minutes',
    servings: 1,
    difficulty: 'Easy',
    calories: 220,
    protein: 6,
    carbs: 28,
    fats: 11,
    ingredients: [
      '1 medium apple',
      '2 tbsp almond butter',
      'Optional: cinnamon'
    ],
    instructions: [
      'Slice apple',
      'Spread almond butter on slices',
      'Sprinkle cinnamon if desired',
      'Enjoy'
    ],
    benefits: 'Fiber, healthy fats, natural sugars. Perfect pre-workout snack.',
    tags: ['Quick', 'Vegetarian', 'No-Cook']
  },

  // POST-WORKOUT
  {
    id: 'post-workout-1',
    name: 'Chocolate Protein Shake',
    category: 'Post-Workout',
    prepTime: '3 minutes',
    cookTime: '0 minutes',
    servings: 1,
    difficulty: 'Easy',
    calories: 350,
    protein: 35,
    carbs: 42,
    fats: 6,
    ingredients: [
      '1 scoop chocolate protein powder',
      '1 cup almond milk',
      '1 banana',
      '1 tbsp peanut butter',
      'Ice cubes',
      'Optional: spinach (you won\'t taste it!)'
    ],
    instructions: [
      'Add all ingredients to blender',
      'Blend until smooth',
      'Drink within 30 min of workout',
      'For thicker shake, add more ice or frozen banana'
    ],
    benefits: 'Fast-digesting protein, replenishes glycogen. Optimal recovery window.',
    tags: ['High-Protein', 'Post-Workout', 'Quick']
  }
]

export const getRecipesByCategory = (category) => {
  return recipeDatabase.filter(recipe => recipe.category === category)
}

export const getRecipesByTag = (tag) => {
  return recipeDatabase.filter(recipe => recipe.tags.includes(tag))
}

export const getHighProteinRecipes = () => {
  return recipeDatabase.filter(recipe => recipe.protein >= 25)
}

export const getQuickRecipes = () => {
  return recipeDatabase.filter(recipe => recipe.tags.includes('Quick'))
}



