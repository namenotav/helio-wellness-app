import { r as reactExports, j as jsxRuntimeExports, a as authService, y as showToast, f as firestoreService } from "./entry-1767948920134-index.js";
import FoodScanner from "./chunk-1767948920247-FoodScanner.js";
import "./chunk-1767948920252-aiVisionService.js";
import "./chunk-1767948920163-index.js";
/* empty css                                 */
function RecipeCreator({ onClose }) {
  const [recipeName, setRecipeName] = reactExports.useState("");
  const [servings, setServings] = reactExports.useState(1);
  const [prepTime, setPrepTime] = reactExports.useState("");
  const [cookTime, setCookTime] = reactExports.useState("");
  const [ingredients, setIngredients] = reactExports.useState([{ name: "", quantity: "", unit: "" }]);
  const [instructions, setInstructions] = reactExports.useState("");
  const [category, setCategory] = reactExports.useState("");
  const [cuisine, setCuisine] = reactExports.useState("");
  const [isHalal, setIsHalal] = reactExports.useState(false);
  const [isVegetarian, setIsVegetarian] = reactExports.useState(false);
  const [isVegan, setIsVegan] = reactExports.useState(false);
  const [isGlutenFree, setIsGlutenFree] = reactExports.useState(false);
  const [calories, setCalories] = reactExports.useState("");
  const [protein, setProtein] = reactExports.useState("");
  const [carbs, setCarbs] = reactExports.useState("");
  const [fat, setFat] = reactExports.useState("");
  const [saving, setSaving] = reactExports.useState(false);
  const categories = [
    "Breakfast",
    "Lunch",
    "Dinner",
    "Snack",
    "Dessert",
    "Beverage",
    "Appetizer",
    "Salad",
    "Soup",
    "Main Course",
    "Side Dish",
    "Other"
  ];
  const cuisines = [
    "American",
    "Italian",
    "Chinese",
    "Japanese",
    "Mexican",
    "Indian",
    "Thai",
    "Greek",
    "French",
    "Mediterranean",
    "Korean",
    "Vietnamese",
    "Middle Eastern",
    "Caribbean",
    "Spanish",
    "German",
    "British",
    "Other"
  ];
  const units = [
    "cup",
    "tbsp",
    "tsp",
    "oz",
    "lb",
    "g",
    "kg",
    "ml",
    "l",
    "piece",
    "slice",
    "clove",
    "pinch",
    "dash",
    "to taste"
  ];
  const addIngredient = () => {
    setIngredients([...ingredients, { name: "", quantity: "", unit: "" }]);
  };
  const removeIngredient = (index) => {
    if (ingredients.length > 1) {
      setIngredients(ingredients.filter((_, i) => i !== index));
    }
  };
  const updateIngredient = (index, field, value) => {
    const updated = [...ingredients];
    updated[index][field] = value;
    setIngredients(updated);
  };
  const handleSave = async () => {
    if (!recipeName.trim()) {
      showToast("❌ Please enter a recipe name", "error");
      return;
    }
    if (ingredients.filter((i) => i.name.trim()).length === 0) {
      showToast("❌ Please add at least one ingredient", "error");
      return;
    }
    if (!instructions.trim()) {
      showToast("❌ Please enter cooking instructions", "error");
      return;
    }
    setSaving(true);
    try {
      const user = authService.getCurrentUser();
      if (!user) {
        showToast("❌ Please log in to save recipes", "error");
        setSaving(false);
        return;
      }
      const recipeData = {
        name: recipeName.trim(),
        servings: parseInt(servings) || 1,
        prepTime: prepTime.trim(),
        cookTime: cookTime.trim(),
        ingredients: ingredients.filter((i) => i.name.trim()),
        instructions: instructions.trim(),
        category: category || "Other",
        cuisine: cuisine || "Other",
        dietary: {
          halal: isHalal,
          vegetarian: isVegetarian,
          vegan: isVegan,
          glutenFree: isGlutenFree
        },
        nutrition: {
          calories: parseInt(calories) || 0,
          protein: parseFloat(protein) || 0,
          carbs: parseFloat(carbs) || 0,
          fat: parseFloat(fat) || 0
        },
        author: {
          uid: user.id,
          email: user.email || "Anonymous",
          name: user.name || "Anonymous"
        },
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        approved: false,
        // Recipes need moderation before appearing globally
        likes: 0,
        views: 0
      };
      await firestoreService.save("recipes", recipeData, user.id);
      const recipeId = `${user.id}_${Date.now()}`;
      await firestoreService.saveToCollection("communityRecipes", recipeId, recipeData);
      showToast("✅ Recipe saved successfully!", "success");
      setRecipeName("");
      setServings(1);
      setPrepTime("");
      setCookTime("");
      setIngredients([{ name: "", quantity: "", unit: "" }]);
      setInstructions("");
      setCategory("");
      setCuisine("");
      setIsHalal(false);
      setIsVegetarian(false);
      setIsVegan(false);
      setIsGlutenFree(false);
      setCalories("");
      setProtein("");
      setCarbs("");
      setFat("");
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      console.error("Error saving recipe:", error);
      showToast("❌ Failed to save recipe. Please try again.", "error");
    } finally {
      setSaving(false);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "recipe-creator-overlay", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "recipe-creator", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "creator-close", onClick: onClose, children: "✕" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "creator-title", children: "👨‍🍳 Create Your Recipe" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "creator-subtitle", children: "Share your culinary masterpiece with the community!" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "creator-form", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "form-group", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { children: "Recipe Name *" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            type: "text",
            value: recipeName,
            onChange: (e) => setRecipeName(e.target.value),
            placeholder: "e.g., Grandma's Apple Pie",
            maxLength: 100
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "form-row", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "form-group", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { children: "Servings" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "number",
              value: servings,
              onChange: (e) => setServings(e.target.value),
              min: "1",
              max: "50"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "form-group", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { children: "Prep Time" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "text",
              value: prepTime,
              onChange: (e) => setPrepTime(e.target.value),
              placeholder: "e.g., 15 min"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "form-group", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { children: "Cook Time" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "text",
              value: cookTime,
              onChange: (e) => setCookTime(e.target.value),
              placeholder: "e.g., 30 min"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "form-row", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "form-group", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { children: "Category" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { value: category, onChange: (e) => setCategory(e.target.value), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Select category" }),
            categories.map((cat) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: cat, children: cat }, cat))
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "form-group", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { children: "Cuisine" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { value: cuisine, onChange: (e) => setCuisine(e.target.value), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Select cuisine" }),
            cuisines.map((cui) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: cui, children: cui }, cui))
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "form-group", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { children: "Dietary Information" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "dietary-tags", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "tag-checkbox", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "checkbox",
                checked: isHalal,
                onChange: (e) => setIsHalal(e.target.checked)
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "🕌 Halal" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "tag-checkbox", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "checkbox",
                checked: isVegetarian,
                onChange: (e) => setIsVegetarian(e.target.checked)
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "🥗 Vegetarian" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "tag-checkbox", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "checkbox",
                checked: isVegan,
                onChange: (e) => setIsVegan(e.target.checked)
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "🌱 Vegan" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "tag-checkbox", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "checkbox",
                checked: isGlutenFree,
                onChange: (e) => setIsGlutenFree(e.target.checked)
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "🌾 Gluten-Free" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "form-group", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { children: "Ingredients *" }),
        ingredients.map((ing, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "ingredient-row", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "text",
              value: ing.name,
              onChange: (e) => updateIngredient(index, "name", e.target.value),
              placeholder: "Ingredient name",
              className: "ingredient-name"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "text",
              value: ing.quantity,
              onChange: (e) => updateIngredient(index, "quantity", e.target.value),
              placeholder: "Amount",
              className: "ingredient-quantity"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "select",
            {
              value: ing.unit,
              onChange: (e) => updateIngredient(index, "unit", e.target.value),
              className: "ingredient-unit",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Unit" }),
                units.map((unit) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: unit, children: unit }, unit))
              ]
            }
          ),
          ingredients.length > 1 && /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              onClick: () => removeIngredient(index),
              className: "remove-ingredient",
              children: "✕"
            }
          )
        ] }, index)),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: addIngredient, className: "add-ingredient", children: "+ Add Ingredient" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "form-group", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { children: "Cooking Instructions *" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "textarea",
          {
            value: instructions,
            onChange: (e) => setInstructions(e.target.value),
            placeholder: "1. Preheat oven to 350°F\n2. Mix dry ingredients...\n3. Bake for 30 minutes...",
            rows: 8
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "form-group", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { children: "Nutrition Information (per serving)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "form-row", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "number",
              value: calories,
              onChange: (e) => setCalories(e.target.value),
              placeholder: "Calories",
              min: "0"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "number",
              value: protein,
              onChange: (e) => setProtein(e.target.value),
              placeholder: "Protein (g)",
              min: "0",
              step: "0.1"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "number",
              value: carbs,
              onChange: (e) => setCarbs(e.target.value),
              placeholder: "Carbs (g)",
              min: "0",
              step: "0.1"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "number",
              value: fat,
              onChange: (e) => setFat(e.target.value),
              placeholder: "Fat (g)",
              min: "0",
              step: "0.1"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "form-actions", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            className: "save-recipe-btn",
            onClick: handleSave,
            disabled: saving,
            children: saving ? "⏳ Saving..." : "✅ Save Recipe"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "cancel-btn", onClick: onClose, disabled: saving, children: "Cancel" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "creator-info", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "💡 Your recipe will be saved to your personal collection and submitted to the community database for approval." }) })
  ] }) });
}
function FoodModal({ isOpen, onClose }) {
  const [showFoodScanner, setShowFoodScanner] = reactExports.useState(false);
  const [showSearchFoods, setShowSearchFoods] = reactExports.useState(false);
  const [showRecipeCreator, setShowRecipeCreator] = reactExports.useState(false);
  const [scannerMode, setScannerMode] = reactExports.useState(null);
  const [searchInitialTab, setSearchInitialTab] = reactExports.useState("usda");
  const foodOptions = [
    { icon: "📸", title: "Scan Label", desc: "Take photo of nutrition label" },
    { icon: "🔍", title: "Search Foods", desc: "6M+ foods database" },
    { icon: "🕌", title: "Halal Scanner", desc: "Check if food is Halal" },
    { icon: "🍔", title: "Restaurants", desc: "Find nutritious meals near you" },
    { icon: "👨‍🍳", title: "Create Recipe", desc: "Build custom meal" }
  ];
  const handleOptionClick = (title) => {
    switch (title) {
      case "Scan Label":
        setScannerMode("label");
        setShowFoodScanner(true);
        break;
      case "Search Foods":
        setSearchInitialTab("foods");
        setShowSearchFoods(true);
        break;
      case "Halal Scanner":
        setScannerMode("halal");
        setShowFoodScanner(true);
        break;
      case "Restaurants":
        setSearchInitialTab("restaurants");
        setShowSearchFoods(true);
        break;
      case "Create Recipe":
        setShowRecipeCreator(true);
        break;
      default:
        setShowFoodScanner(true);
    }
  };
  if (!isOpen) return null;
  if (showFoodScanner) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      FoodScanner,
      {
        isOpen: true,
        onClose: () => {
          setShowFoodScanner(false);
          onClose();
        },
        initialMode: scannerMode,
        lockMode: true
      }
    );
  }
  if (showSearchFoods) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      FoodScanner,
      {
        isOpen: true,
        onClose: () => {
          setShowSearchFoods(false);
          onClose();
        },
        initialMode: "search",
        lockMode: true,
        initialTab: searchInitialTab
      }
    );
  }
  if (showRecipeCreator) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(RecipeCreator, { onClose: () => {
      setShowRecipeCreator(false);
      onClose();
    } });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "modal-overlay", onClick: onClose, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "food-modal", onClick: (e) => e.stopPropagation(), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "modal-header", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { children: "🍽️ Food Scanner" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "close-btn", onClick: onClose, children: "✕" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "food-hero", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "hero-icon", children: "🍕" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "Track Your Nutrition" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "6+ million foods at your fingertips" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "food-options-list", children: foodOptions.map((option, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "button",
      {
        className: "food-option-item",
        onClick: () => handleOptionClick(option.title),
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "option-icon", children: option.icon }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "option-info", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "option-title", children: option.title }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "option-desc", children: option.desc })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "option-arrow", children: "→" })
        ]
      },
      index
    )) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "food-info", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "💡 Scan, search, or browse - we support all major food databases!" }) })
  ] }) });
}
export {
  FoodModal as default
};
