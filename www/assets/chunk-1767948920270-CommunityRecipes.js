import { r as reactExports, f as firestoreService, j as jsxRuntimeExports, y as showToast } from "./entry-1767948920134-index.js";
function CommunityRecipes({ isOpen, onClose }) {
  const [recipes, setRecipes] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(true);
  const [searchQuery, setSearchQuery] = reactExports.useState("");
  const [filterDietary, setFilterDietary] = reactExports.useState("all");
  const [filterCuisine, setFilterCuisine] = reactExports.useState("all");
  const [selectedRecipe, setSelectedRecipe] = reactExports.useState(null);
  reactExports.useEffect(() => {
    if (isOpen) {
      loadRecipes();
    }
  }, [isOpen]);
  const loadRecipes = async () => {
    try {
      setLoading(true);
      const allRecipes = await firestoreService.queryCollection("communityRecipes");
      const sorted = allRecipes.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setRecipes(sorted);
      console.log(`✅ Loaded ${sorted.length} community recipes`);
    } catch (error) {
      console.error("Error loading recipes:", error);
      showToast("❌ Failed to load recipes", "error");
    } finally {
      setLoading(false);
    }
  };
  const filteredRecipes = recipes.filter((recipe) => {
    const matchesSearch = searchQuery === "" || recipe.name?.toLowerCase().includes(searchQuery.toLowerCase()) || recipe.cuisine?.toLowerCase().includes(searchQuery.toLowerCase()) || recipe.category?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDietary = filterDietary === "all" || filterDietary === "halal" && recipe.dietary?.halal || filterDietary === "vegetarian" && recipe.dietary?.vegetarian || filterDietary === "vegan" && recipe.dietary?.vegan || filterDietary === "glutenFree" && recipe.dietary?.glutenFree;
    const matchesCuisine = filterCuisine === "all" || recipe.cuisine === filterCuisine;
    return matchesSearch && matchesDietary && matchesCuisine;
  });
  const cuisines = ["All", ...new Set(recipes.map((r) => r.cuisine).filter(Boolean))];
  if (!isOpen) return null;
  if (selectedRecipe) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      RecipeDetailView,
      {
        recipe: selectedRecipe,
        onClose: () => setSelectedRecipe(null),
        onBack: () => setSelectedRecipe(null)
      }
    );
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "recipes-overlay", onClick: onClose, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "recipes-modal", onClick: (e) => e.stopPropagation(), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "recipes-header", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { children: "👨‍🍳 Community Recipes" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "close-btn", onClick: onClose, children: "✕" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "recipes-controls", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "input",
        {
          type: "text",
          placeholder: "🔍 Search recipes...",
          value: searchQuery,
          onChange: (e) => setSearchQuery(e.target.value),
          className: "recipe-search"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "filter-row", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "select",
          {
            value: filterDietary,
            onChange: (e) => setFilterDietary(e.target.value),
            className: "filter-select",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "all", children: "All Dietary" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "halal", children: "🕌 Halal" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "vegetarian", children: "🥗 Vegetarian" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "vegan", children: "🌱 Vegan" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "glutenFree", children: "🌾 Gluten-Free" })
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "select",
          {
            value: filterCuisine,
            onChange: (e) => setFilterCuisine(e.target.value),
            className: "filter-select",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "all", children: "All Cuisines" }),
              cuisines.filter((c) => c !== "All").map((cuisine) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: cuisine, children: cuisine }, cuisine))
            ]
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "recipes-grid", children: loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "loading-state", children: "⏳ Loading recipes..." }) : filteredRecipes.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "empty-state", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "📝 No recipes found" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Be the first to share a recipe!" })
    ] }) : filteredRecipes.map((recipe) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: "recipe-card",
        onClick: () => setSelectedRecipe(recipe),
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "recipe-card-header", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: recipe.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "recipe-category", children: recipe.category })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "recipe-card-meta", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              "🍴 ",
              recipe.cuisine
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              "👤 ",
              recipe.servings,
              " servings"
            ] })
          ] }),
          recipe.prepTime && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "recipe-time", children: [
            "⏱️ ",
            recipe.prepTime,
            " ",
            recipe.cookTime && `+ ${recipe.cookTime}`
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "recipe-dietary-tags", children: [
            recipe.dietary?.halal && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "tag", children: "🕌 Halal" }),
            recipe.dietary?.vegetarian && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "tag", children: "🥗 Vegetarian" }),
            recipe.dietary?.vegan && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "tag", children: "🌱 Vegan" }),
            recipe.dietary?.glutenFree && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "tag", children: "🌾 GF" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "recipe-card-footer", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              "by ",
              recipe.author?.name || "Anonymous"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "view-btn", children: "View Recipe →" })
          ] })
        ]
      },
      recipe.id
    )) })
  ] }) });
}
function RecipeDetailView({ recipe, onClose, onBack }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "recipe-detail-overlay", onClick: onClose, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "recipe-detail-modal", onClick: (e) => e.stopPropagation(), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "detail-header", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "back-btn", onClick: onBack, children: "← Back" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "close-btn", onClick: onClose, children: "✕" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "detail-content", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { children: recipe.name }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "detail-meta", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
          "🍴 ",
          recipe.cuisine
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
          "📂 ",
          recipe.category
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
          "👤 ",
          recipe.servings,
          " servings"
        ] })
      ] }),
      (recipe.prepTime || recipe.cookTime) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "detail-time", children: [
        recipe.prepTime && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
          "⏱️ Prep: ",
          recipe.prepTime
        ] }),
        recipe.cookTime && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
          "🔥 Cook: ",
          recipe.cookTime
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "detail-dietary-tags", children: [
        recipe.dietary?.halal && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "tag", children: "🕌 Halal" }),
        recipe.dietary?.vegetarian && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "tag", children: "🥗 Vegetarian" }),
        recipe.dietary?.vegan && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "tag", children: "🌱 Vegan" }),
        recipe.dietary?.glutenFree && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "tag", children: "🌾 Gluten-Free" })
      ] }),
      recipe.nutrition && (recipe.nutrition.calories > 0 || recipe.nutrition.protein > 0) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "nutrition-info", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "📊 Nutrition (per serving)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "nutrition-grid", children: [
          recipe.nutrition.calories > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Calories:" }),
            " ",
            recipe.nutrition.calories
          ] }),
          recipe.nutrition.protein > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Protein:" }),
            " ",
            recipe.nutrition.protein,
            "g"
          ] }),
          recipe.nutrition.carbs > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Carbs:" }),
            " ",
            recipe.nutrition.carbs,
            "g"
          ] }),
          recipe.nutrition.fat > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Fat:" }),
            " ",
            recipe.nutrition.fat,
            "g"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "ingredients-section", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "🥘 Ingredients" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { children: recipe.ingredients?.map((ing, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
          ing.quantity && `${ing.quantity} `,
          ing.unit && `${ing.unit} `,
          ing.name
        ] }, idx)) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "instructions-section", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "👨‍🍳 Instructions" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "instructions-text", children: recipe.instructions?.split("\n").map((line, idx) => /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: line }, idx)) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "recipe-author", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
          "Recipe by ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: recipe.author?.name || "Anonymous" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "recipe-date", children: [
          "Shared ",
          new Date(recipe.createdAt).toLocaleDateString()
        ] })
      ] })
    ] })
  ] }) });
}
export {
  CommunityRecipes as default
};
