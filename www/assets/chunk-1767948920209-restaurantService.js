const restaurantDatabase = [
  {
    id: "mcdonalds-uk",
    name: "McDonald's",
    country: "UK",
    logo: "🍔",
    menuItems: [
      // Burgers
      { id: "bigmac", name: "Big Mac", category: "Burgers", calories: 563, protein: 26, carbs: 45, fats: 33, sodium: 950, serving_size: "219g" },
      { id: "quarterpound", name: "Quarter Pounder with Cheese", category: "Burgers", calories: 520, protein: 30, carbs: 42, fats: 27, sodium: 1110, serving_size: "199g" },
      { id: "mcdouble", name: "McDouble", category: "Burgers", calories: 400, protein: 22, carbs: 34, fats: 20, sodium: 920, serving_size: "151g" },
      { id: "cheeseburger", name: "Cheeseburger", category: "Burgers", calories: 301, protein: 15, carbs: 32, fats: 12, sodium: 680, serving_size: "119g" },
      { id: "filet-o-fish", name: "Filet-O-Fish", category: "Burgers", calories: 390, protein: 16, carbs: 39, fats: 19, sodium: 560, serving_size: "142g" },
      // Chicken
      { id: "mcchicken", name: "McChicken", category: "Chicken", calories: 400, protein: 14, carbs: 39, fats: 21, sodium: 560, serving_size: "143g" },
      { id: "nuggets-6", name: "Chicken McNuggets (6pc)", category: "Chicken", calories: 259, protein: 15, carbs: 16, fats: 16, sodium: 483, serving_size: "100g" },
      { id: "nuggets-9", name: "Chicken McNuggets (9pc)", category: "Chicken", calories: 388, protein: 23, carbs: 24, fats: 24, sodium: 725, serving_size: "150g" },
      { id: "selects-3", name: "Chicken Selects (3pc)", category: "Chicken", calories: 380, protein: 23, carbs: 22, fats: 22, sodium: 1020, serving_size: "153g" },
      // Fries & Sides
      { id: "fries-medium", name: "Medium Fries", category: "Sides", calories: 337, protein: 4, carbs: 42, fats: 16, sodium: 211, serving_size: "111g" },
      { id: "fries-large", name: "Large Fries", category: "Sides", calories: 444, protein: 6, carbs: 56, fats: 21, sodium: 271, serving_size: "154g" },
      // Breakfast
      { id: "egg-mcmuffin", name: "Egg McMuffin", category: "Breakfast", calories: 309, protein: 18, carbs: 30, fats: 13, sodium: 829, serving_size: "141g" },
      { id: "sausage-mcmuffin", name: "Sausage McMuffin", category: "Breakfast", calories: 430, protein: 17, carbs: 29, fats: 27, sodium: 830, serving_size: "112g" },
      { id: "bacon-egg-cheese", name: "Bacon, Egg & Cheese Bagel", category: "Breakfast", calories: 450, protein: 20, carbs: 47, fats: 20, sodium: 1250, serving_size: "167g" },
      // Drinks
      { id: "coke-medium", name: "Coca-Cola (Medium)", category: "Drinks", calories: 170, protein: 0, carbs: 44, fats: 0, sodium: 15, serving_size: "500ml" },
      { id: "coffee-latte", name: "Latte", category: "Drinks", calories: 142, protein: 8, carbs: 15, fats: 6, sodium: 120, serving_size: "350ml" }
    ]
  },
  {
    id: "kfc-uk",
    name: "KFC",
    country: "UK",
    logo: "🍗",
    menuItems: [
      { id: "original-chicken-piece", name: "Original Recipe Chicken (1pc)", category: "Chicken", calories: 290, protein: 24, carbs: 9, fats: 18, sodium: 730, serving_size: "113g" },
      { id: "zinger-burger", name: "Zinger Burger", category: "Burgers", calories: 550, protein: 28, carbs: 51, fats: 26, sodium: 1180, serving_size: "210g" },
      { id: "zinger-tower", name: "Zinger Tower Burger", category: "Burgers", calories: 670, protein: 32, carbs: 58, fats: 35, sodium: 1520, serving_size: "265g" },
      { id: "fillet-burger", name: "Fillet Burger", category: "Burgers", calories: 480, protein: 26, carbs: 47, fats: 21, sodium: 940, serving_size: "180g" },
      { id: "popcorn-chicken-regular", name: "Popcorn Chicken (Regular)", category: "Chicken", calories: 295, protein: 17, carbs: 18, fats: 17, sodium: 1010, serving_size: "110g" },
      { id: "hot-wings-6", name: "Hot Wings (6pc)", category: "Chicken", calories: 471, protein: 36, carbs: 18, fats: 28, sodium: 1860, serving_size: "150g" },
      { id: "fries-regular", name: "Regular Fries", category: "Sides", calories: 294, protein: 4, carbs: 38, fats: 14, sodium: 570, serving_size: "100g" },
      { id: "coleslaw-regular", name: "Regular Coleslaw", category: "Sides", calories: 93, protein: 1, carbs: 10, fats: 5, sodium: 210, serving_size: "100g" },
      { id: "beans-regular", name: "Regular Baked Beans", category: "Sides", calories: 120, protein: 6, carbs: 20, fats: 1, sodium: 440, serving_size: "130g" },
      { id: "gravy", name: "Gravy", category: "Sides", calories: 15, protein: 0, carbs: 3, fats: 0, sodium: 290, serving_size: "80ml" }
    ]
  },
  {
    id: "subway-uk",
    name: "Subway",
    country: "UK",
    logo: "🥪",
    menuItems: [
      { id: "turkey-sub-6", name: 'Turkey Breast Sub (6")', category: "Subs", calories: 280, protein: 18, carbs: 46, fats: 3.5, sodium: 810, serving_size: "223g" },
      { id: "italian-bmt-6", name: 'Italian B.M.T. Sub (6")', category: "Subs", calories: 410, protein: 19, carbs: 46, fats: 16, sodium: 1260, serving_size: "243g" },
      { id: "meatball-sub-6", name: 'Meatball Marinara Sub (6")', category: "Subs", calories: 480, protein: 21, carbs: 61, fats: 18, sodium: 1160, serving_size: "284g" },
      { id: "chicken-teriyaki-6", name: 'Chicken Teriyaki Sub (6")', category: "Subs", calories: 370, protein: 25, carbs: 59, fats: 4.5, sodium: 1090, serving_size: "282g" },
      { id: "veggie-delite-6", name: 'Veggie Delite Sub (6")', category: "Subs", calories: 230, protein: 8, carbs: 44, fats: 2.5, sodium: 410, serving_size: "166g" },
      { id: "tuna-sub-6", name: 'Tuna Sub (6")', category: "Subs", calories: 470, protein: 21, carbs: 46, fats: 23, sodium: 640, serving_size: "250g" },
      { id: "steak-cheese-6", name: 'Steak & Cheese Sub (6")', category: "Subs", calories: 380, protein: 24, carbs: 48, fats: 10, sodium: 1120, serving_size: "250g" },
      { id: "crisps", name: "Crisps", category: "Sides", calories: 150, protein: 2, carbs: 15, fats: 9, sodium: 270, serving_size: "28g" },
      { id: "cookies", name: "Chocolate Chip Cookie", category: "Desserts", calories: 210, protein: 2, carbs: 30, fats: 10, sodium: 150, serving_size: "48g" }
    ]
  },
  {
    id: "greggs-uk",
    name: "Greggs",
    country: "UK",
    logo: "🥐",
    menuItems: [
      { id: "sausage-roll", name: "Sausage Roll", category: "Savoury", calories: 327, protein: 10, carbs: 36, fats: 20, sodium: 780, serving_size: "105g" },
      { id: "vegan-sausage-roll", name: "Vegan Sausage Roll", category: "Savoury", calories: 312, protein: 8, carbs: 32, fats: 18, sodium: 720, serving_size: "96g" },
      { id: "steak-bake", name: "Steak Bake", category: "Savoury", calories: 427, protein: 15, carbs: 41, fats: 23, sodium: 920, serving_size: "142g" },
      { id: "chicken-bake", name: "Chicken Bake", category: "Savoury", calories: 342, protein: 14, carbs: 38, fats: 15, sodium: 780, serving_size: "135g" },
      { id: "cheese-onion-bake", name: "Cheese & Onion Bake", category: "Savoury", calories: 445, protein: 12, carbs: 46, fats: 24, sodium: 920, serving_size: "142g" },
      { id: "bacon-sandwich", name: "Bacon Sandwich", category: "Breakfast", calories: 385, protein: 17, carbs: 40, fats: 17, sodium: 1180, serving_size: "130g" },
      { id: "sausage-sandwich", name: "Sausage Sandwich", category: "Breakfast", calories: 441, protein: 15, carbs: 41, fats: 24, sodium: 1070, serving_size: "135g" },
      { id: "yum-yum", name: "Yum Yum", category: "Sweet", calories: 268, protein: 3, carbs: 30, fats: 15, sodium: 130, serving_size: "64g" },
      { id: "glazed-ring", name: "Glazed Ring Doughnut", category: "Sweet", calories: 219, protein: 4, carbs: 28, fats: 10, sodium: 160, serving_size: "58g" },
      { id: "iced-ring", name: "Iced Ring Doughnut", category: "Sweet", calories: 252, protein: 4, carbs: 33, fats: 12, sodium: 170, serving_size: "68g" }
    ]
  },
  {
    id: "nandos-uk",
    name: "Nando's",
    country: "UK",
    logo: "🌶️",
    menuItems: [
      { id: "half-chicken-lemon", name: "1/2 Chicken (Lemon & Herb)", category: "Chicken", calories: 462, protein: 65, carbs: 2, fats: 21, sodium: 1290, serving_size: "350g" },
      { id: "half-chicken-medium", name: "1/2 Chicken (Medium)", category: "Chicken", calories: 478, protein: 65, carbs: 4, fats: 22, sodium: 1410, serving_size: "350g" },
      { id: "half-chicken-hot", name: "1/2 Chicken (Hot)", category: "Chicken", calories: 486, protein: 65, carbs: 5, fats: 23, sodium: 1450, serving_size: "350g" },
      { id: "butterfly-chicken", name: "Butterfly Chicken Breast", category: "Chicken", calories: 310, protein: 58, carbs: 1, fats: 8, sodium: 980, serving_size: "250g" },
      { id: "chicken-wings", name: "Chicken Wings (5)", category: "Chicken", calories: 376, protein: 34, carbs: 2, fats: 26, sodium: 890, serving_size: "175g" },
      { id: "peri-chips-regular", name: "Peri-Peri Chips (Regular)", category: "Sides", calories: 423, protein: 6, carbs: 56, fats: 20, sodium: 780, serving_size: "200g" },
      { id: "coleslaw", name: "Coleslaw", category: "Sides", calories: 154, protein: 1, carbs: 9, fats: 13, sodium: 240, serving_size: "100g" },
      { id: "corn-on-cob", name: "Corn on the Cob", category: "Sides", calories: 153, protein: 4, carbs: 26, fats: 5, sodium: 15, serving_size: "150g" },
      { id: "garlic-bread", name: "Garlic Bread (4 slices)", category: "Sides", calories: 448, protein: 11, carbs: 54, fats: 20, sodium: 720, serving_size: "160g" }
    ]
  },
  {
    id: "pizzahut-uk",
    name: "Pizza Hut",
    country: "UK",
    logo: "🍕",
    menuItems: [
      { id: "margherita-slice", name: "Margherita Pizza (1 slice)", category: "Pizza", calories: 237, protein: 10, carbs: 30, fats: 8, sodium: 520, serving_size: "107g" },
      { id: "pepperoni-slice", name: "Pepperoni Pizza (1 slice)", category: "Pizza", calories: 289, protein: 12, carbs: 30, fats: 13, sodium: 680, serving_size: "114g" },
      { id: "meat-feast-slice", name: "Meat Feast Pizza (1 slice)", category: "Pizza", calories: 320, protein: 15, carbs: 31, fats: 15, sodium: 790, serving_size: "125g" },
      { id: "veggie-slice", name: "Veggie Supreme Pizza (1 slice)", category: "Pizza", calories: 245, protein: 10, carbs: 32, fats: 9, sodium: 540, serving_size: "115g" },
      { id: "bbq-chicken-slice", name: "BBQ Chicken Pizza (1 slice)", category: "Pizza", calories: 268, protein: 13, carbs: 33, fats: 9, sodium: 620, serving_size: "118g" },
      { id: "garlic-bread-sticks", name: "Garlic Bread Sticks (2pc)", category: "Sides", calories: 280, protein: 7, carbs: 38, fats: 11, sodium: 540, serving_size: "85g" },
      { id: "chicken-wings-6", name: "Chicken Wings (6pc)", category: "Sides", calories: 540, protein: 36, carbs: 24, fats: 32, sodium: 1820, serving_size: "180g" },
      { id: "potato-wedges", name: "Potato Wedges", category: "Sides", calories: 380, protein: 6, carbs: 52, fats: 16, sodium: 680, serving_size: "180g" }
    ]
  },
  {
    id: "burgerking-uk",
    name: "Burger King",
    country: "UK",
    logo: "👑",
    menuItems: [
      { id: "whopper", name: "Whopper", category: "Burgers", calories: 628, protein: 28, carbs: 49, fats: 35, sodium: 980, serving_size: "290g" },
      { id: "bacon-king", name: "Bacon King", category: "Burgers", calories: 1040, protein: 57, carbs: 49, fats: 69, sodium: 2150, serving_size: "356g" },
      { id: "chicken-royale", name: "Chicken Royale", category: "Burgers", calories: 670, protein: 28, carbs: 54, fats: 38, sodium: 1240, serving_size: "240g" },
      { id: "plant-based-whopper", name: "Plant-Based Whopper", category: "Burgers", calories: 545, protein: 25, carbs: 53, fats: 25, sodium: 1010, serving_size: "290g" },
      { id: "cheeseburger", name: "Cheeseburger", category: "Burgers", calories: 323, protein: 17, carbs: 31, fats: 14, sodium: 740, serving_size: "133g" },
      { id: "nuggets-9", name: "Chicken Nuggets (9pc)", category: "Chicken", calories: 443, protein: 21, carbs: 27, fats: 27, sodium: 1080, serving_size: "143g" },
      { id: "fries-medium", name: "Medium Fries", category: "Sides", calories: 337, protein: 4, carbs: 44, fats: 16, sodium: 480, serving_size: "116g" },
      { id: "onion-rings", name: "Onion Rings (Large)", category: "Sides", calories: 480, protein: 6, carbs: 53, fats: 27, sodium: 810, serving_size: "137g" }
    ]
  },
  {
    id: "costa-uk",
    name: "Costa Coffee",
    country: "UK",
    logo: "☕",
    menuItems: [
      { id: "latte-medium", name: "Latte (Medium)", category: "Coffee", calories: 143, protein: 8, carbs: 14, fats: 6, sodium: 120, serving_size: "355ml" },
      { id: "cappuccino-medium", name: "Cappuccino (Medium)", category: "Coffee", calories: 110, protein: 7, carbs: 11, fats: 4, sodium: 95, serving_size: "355ml" },
      { id: "flat-white", name: "Flat White", category: "Coffee", calories: 120, protein: 8, carbs: 11, fats: 5, sodium: 105, serving_size: "240ml" },
      { id: "mocha-medium", name: "Mocha (Medium)", category: "Coffee", calories: 258, protein: 10, carbs: 35, fats: 9, sodium: 150, serving_size: "355ml" },
      { id: "hot-chocolate", name: "Hot Chocolate (Medium)", category: "Hot Drinks", calories: 330, protein: 12, carbs: 45, fats: 11, sodium: 190, serving_size: "355ml" },
      { id: "bacon-roll", name: "Bacon Roll", category: "Food", calories: 380, protein: 19, carbs: 38, fats: 17, sodium: 1200, serving_size: "145g" },
      { id: "cheese-ham-toastie", name: "Cheese & Ham Toastie", category: "Food", calories: 420, protein: 22, carbs: 40, fats: 18, sodium: 1340, serving_size: "160g" },
      { id: "tuna-mayo-sandwich", name: "Tuna Mayo Sandwich", category: "Food", calories: 365, protein: 18, carbs: 44, fats: 12, sodium: 820, serving_size: "180g" },
      { id: "blueberry-muffin", name: "Blueberry Muffin", category: "Bakery", calories: 425, protein: 6, carbs: 56, fats: 20, sodium: 450, serving_size: "120g" }
    ]
  },
  {
    id: "pret-uk",
    name: "Pret A Manger",
    country: "UK",
    logo: "🥗",
    menuItems: [
      { id: "chicken-avocado", name: "Chicken & Avocado Sandwich", category: "Sandwiches", calories: 445, protein: 27, carbs: 38, fats: 20, sodium: 890, serving_size: "220g" },
      { id: "tuna-cucumber", name: "Tuna & Cucumber Baguette", category: "Sandwiches", calories: 398, protein: 24, carbs: 45, fats: 12, sodium: 780, serving_size: "240g" },
      { id: "egg-mayo", name: "Egg Mayo & Cress Sandwich", category: "Sandwiches", calories: 380, protein: 16, carbs: 40, fats: 17, sodium: 680, serving_size: "190g" },
      { id: "ham-cheese", name: "Ham & Cheese Baguette", category: "Sandwiches", calories: 465, protein: 26, carbs: 48, fats: 18, sodium: 1120, serving_size: "235g" },
      { id: "super-green-salad", name: "Super Green & Avocado Salad", category: "Salads", calories: 320, protein: 12, carbs: 28, fats: 18, sodium: 560, serving_size: "300g" },
      { id: "chicken-caesar-salad", name: "Chicken Caesar Salad", category: "Salads", calories: 385, protein: 28, carbs: 22, fats: 21, sodium: 920, serving_size: "320g" },
      { id: "coconut-porridge", name: "Coconut Porridge", category: "Breakfast", calories: 290, protein: 8, carbs: 48, fats: 7, sodium: 180, serving_size: "280g" },
      { id: "croissant-plain", name: "Plain Croissant", category: "Bakery", calories: 265, protein: 5, carbs: 28, fats: 15, sodium: 280, serving_size: "65g" },
      { id: "banana", name: "Banana", category: "Snacks", calories: 89, protein: 1, carbs: 23, fats: 0, sodium: 1, serving_size: "100g" }
    ]
  },
  {
    id: "wagamama-uk",
    name: "Wagamama",
    country: "UK",
    logo: "🍜",
    menuItems: [
      { id: "chicken-ramen", name: "Chicken Ramen", category: "Ramen", calories: 618, protein: 38, carbs: 78, fats: 16, sodium: 2450, serving_size: "550g" },
      { id: "beef-ramen", name: "Beef Ramen", category: "Ramen", calories: 748, protein: 42, carbs: 82, fats: 26, sodium: 2680, serving_size: "580g" },
      { id: "vegatsu-curry", name: "Vegatsu Curry", category: "Curry", calories: 885, protein: 22, carbs: 132, fats: 28, sodium: 2140, serving_size: "650g" },
      { id: "chicken-katsu-curry", name: "Chicken Katsu Curry", category: "Curry", calories: 1089, protein: 42, carbs: 142, fats: 38, sodium: 2580, serving_size: "700g" },
      { id: "pad-thai-chicken", name: "Chicken Pad Thai", category: "Noodles", calories: 768, protein: 36, carbs: 98, fats: 24, sodium: 2120, serving_size: "600g" },
      { id: "yaki-soba", name: "Chicken Yaki Soba", category: "Noodles", calories: 692, protein: 34, carbs: 86, fats: 22, sodium: 2340, serving_size: "580g" },
      { id: "gyoza-chicken", name: "Chicken Gyoza (5pc)", category: "Sides", calories: 238, protein: 12, carbs: 28, fats: 8, sodium: 780, serving_size: "125g" },
      { id: "edamame", name: "Edamame", category: "Sides", calories: 98, protein: 9, carbs: 7, fats: 4, sodium: 320, serving_size: "120g" },
      { id: "bang-bang-cauliflower", name: "Bang Bang Cauliflower", category: "Sides", calories: 318, protein: 6, carbs: 38, fats: 16, sodium: 1240, serving_size: "180g" }
    ]
  },
  // ========== GLOBAL FAST FOOD CHAINS ==========
  {
    id: "starbucks-global",
    name: "Starbucks",
    country: "Global",
    logo: "☕",
    menuItems: [
      { id: "pike-place-tall", name: "Pike Place Roast (Tall)", category: "Coffee", calories: 5, protein: 1, carbs: 0, fats: 0, sodium: 10, serving_size: "355ml" },
      { id: "caffe-latte-grande", name: "Caffè Latte (Grande)", category: "Coffee", calories: 190, protein: 13, carbs: 19, fats: 7, sodium: 170, serving_size: "473ml" },
      { id: "cappuccino-grande", name: "Cappuccino (Grande)", category: "Coffee", calories: 140, protein: 10, carbs: 14, fats: 5, sodium: 125, serving_size: "473ml" },
      { id: "caramel-macchiato", name: "Caramel Macchiato (Grande)", category: "Coffee", calories: 250, protein: 11, carbs: 34, fats: 7, sodium: 150, serving_size: "473ml" },
      { id: "white-mocha", name: "White Chocolate Mocha (Grande)", category: "Coffee", calories: 430, protein: 14, carbs: 59, fats: 16, sodium: 250, serving_size: "473ml" },
      { id: "pumpkin-spice-latte", name: "Pumpkin Spice Latte (Grande)", category: "Seasonal", calories: 380, protein: 14, carbs: 52, fats: 14, sodium: 280, serving_size: "473ml" },
      { id: "frappuccino-caramel", name: "Caramel Frappuccino (Grande)", category: "Frappuccino", calories: 370, protein: 5, carbs: 67, fats: 15, sodium: 200, serving_size: "473ml" },
      { id: "bacon-gouda-sandwich", name: "Bacon, Gouda & Egg Sandwich", category: "Breakfast", calories: 360, protein: 18, carbs: 34, fats: 17, sodium: 860, serving_size: "127g" },
      { id: "turkey-bacon-wrap", name: "Turkey Bacon & Cage Free Egg White Wrap", category: "Breakfast", calories: 230, protein: 18, carbs: 26, fats: 6, sodium: 830, serving_size: "130g" },
      { id: "cheese-danish", name: "Cheese Danish", category: "Bakery", calories: 290, protein: 6, carbs: 34, fats: 15, sodium: 220, serving_size: "89g" },
      { id: "blueberry-muffin", name: "Blueberry Muffin", category: "Bakery", calories: 380, protein: 5, carbs: 54, fats: 17, sodium: 330, serving_size: "130g" },
      { id: "chicken-caprese", name: "Chicken Caprese Sandwich", category: "Lunch", calories: 520, protein: 31, carbs: 48, fats: 21, sodium: 1050, serving_size: "240g" },
      { id: "protein-box-egg", name: "Eggs & Cheese Protein Box", category: "Protein Boxes", calories: 470, protein: 28, carbs: 31, fats: 24, sodium: 920, serving_size: "196g" },
      { id: "cake-pop-birthday", name: "Birthday Cake Pop", category: "Treats", calories: 170, protein: 2, carbs: 23, fats: 8, sodium: 90, serving_size: "43g" },
      { id: "oatmeal", name: "Classic Oatmeal", category: "Breakfast", calories: 160, protein: 5, carbs: 28, fats: 2.5, sodium: 125, serving_size: "280g" }
    ]
  },
  {
    id: "dunkin-us",
    name: "Dunkin'",
    country: "US",
    logo: "🍩",
    menuItems: [
      { id: "glazed-donut", name: "Glazed Donut", category: "Donuts", calories: 260, protein: 3, carbs: 31, fats: 14, sodium: 330, serving_size: "66g" },
      { id: "chocolate-frosted", name: "Chocolate Frosted Donut", category: "Donuts", calories: 280, protein: 3, carbs: 35, fats: 15, sodium: 340, serving_size: "70g" },
      { id: "boston-kreme", name: "Boston Kreme Donut", category: "Donuts", calories: 300, protein: 4, carbs: 39, fats: 15, sodium: 340, serving_size: "85g" },
      { id: "jelly-donut", name: "Jelly Donut", category: "Donuts", calories: 270, protein: 3, carbs: 35, fats: 13, sodium: 330, serving_size: "78g" },
      { id: "munchkins-glazed", name: "Glazed Munchkins (5)", category: "Donuts", calories: 260, protein: 3, carbs: 30, fats: 14, sodium: 320, serving_size: "60g" },
      { id: "coffee-medium", name: "Hot Coffee (Medium)", category: "Coffee", calories: 10, protein: 0, carbs: 0, fats: 0, sodium: 10, serving_size: "473ml" },
      { id: "latte-medium", name: "Latte (Medium)", category: "Coffee", calories: 120, protein: 8, carbs: 13, fats: 4.5, sodium: 135, serving_size: "473ml" },
      { id: "iced-coffee-medium", name: "Iced Coffee (Medium)", category: "Coffee", calories: 15, protein: 1, carbs: 2, fats: 0, sodium: 20, serving_size: "473ml" },
      { id: "bacon-egg-cheese", name: "Bacon, Egg & Cheese on Croissant", category: "Breakfast", calories: 510, protein: 19, carbs: 39, fats: 30, sodium: 1060, serving_size: "155g" },
      { id: "sausage-egg-cheese", name: "Sausage, Egg & Cheese on English Muffin", category: "Breakfast", calories: 490, protein: 21, carbs: 34, fats: 28, sodium: 1230, serving_size: "162g" },
      { id: "hash-browns", name: "Hash Browns", category: "Sides", calories: 140, protein: 1, carbs: 15, fats: 9, sodium: 270, serving_size: "57g" },
      { id: "bagel-plain", name: "Plain Bagel", category: "Bakery", calories: 310, protein: 11, carbs: 61, fats: 2.5, sodium: 600, serving_size: "113g" },
      { id: "croissant-plain", name: "Plain Croissant", category: "Bakery", calories: 340, protein: 6, carbs: 37, fats: 18, sodium: 340, serving_size: "80g" },
      { id: "coolatta-strawberry", name: "Strawberry Coolatta (Medium)", category: "Frozen", calories: 290, protein: 0, carbs: 72, fats: 0, sodium: 65, serving_size: "473ml" }
    ]
  },
  {
    id: "wendys-global",
    name: "Wendy's",
    country: "Global",
    logo: "🍔",
    menuItems: [
      { id: "daves-single", name: "Dave's Single", category: "Burgers", calories: 570, protein: 29, carbs: 39, fats: 34, sodium: 1180, serving_size: "253g" },
      { id: "baconator", name: "Baconator", category: "Burgers", calories: 950, protein: 57, carbs: 37, fats: 62, sodium: 1820, serving_size: "370g" },
      { id: "spicy-chicken", name: "Spicy Chicken Sandwich", category: "Chicken", calories: 500, protein: 32, carbs: 48, fats: 20, sodium: 1280, serving_size: "232g" },
      { id: "crispy-chicken", name: "Crispy Chicken Sandwich", category: "Chicken", calories: 490, protein: 30, carbs: 48, fats: 20, sodium: 1230, serving_size: "225g" },
      { id: "nuggets-10", name: "Chicken Nuggets (10pc)", category: "Chicken", calories: 450, protein: 22, carbs: 30, fats: 27, sodium: 920, serving_size: "140g" },
      { id: "jr-bacon-cheeseburger", name: "Jr. Bacon Cheeseburger", category: "Burgers", calories: 370, protein: 19, carbs: 26, fats: 21, sodium: 830, serving_size: "154g" },
      { id: "fries-medium", name: "Natural-Cut Fries (Medium)", category: "Sides", calories: 420, protein: 5, carbs: 55, fats: 20, sodium: 420, serving_size: "150g" },
      { id: "baked-potato-plain", name: "Plain Baked Potato", category: "Sides", calories: 270, protein: 7, carbs: 61, fats: 0, sodium: 25, serving_size: "284g" },
      { id: "chili-small", name: "Chili (Small)", category: "Sides", calories: 240, protein: 17, carbs: 23, fats: 9, sodium: 830, serving_size: "227g" },
      { id: "caesar-side-salad", name: "Caesar Side Salad", category: "Salads", calories: 260, protein: 10, carbs: 14, fats: 18, sodium: 610, serving_size: "147g" },
      { id: "frosty-chocolate-small", name: "Chocolate Frosty (Small)", category: "Desserts", calories: 350, protein: 9, carbs: 58, fats: 9, sodium: 200, serving_size: "341g" },
      { id: "apple-pecan-salad", name: "Apple Pecan Chicken Salad", category: "Salads", calories: 560, protein: 33, carbs: 40, fats: 31, sodium: 1280, serving_size: "379g" }
    ]
  },
  {
    id: "tacobell-global",
    name: "Taco Bell",
    country: "Global",
    logo: "🌮",
    menuItems: [
      { id: "crunchy-taco", name: "Crunchy Taco", category: "Tacos", calories: 170, protein: 8, carbs: 13, fats: 10, sodium: 310, serving_size: "78g" },
      { id: "soft-taco-beef", name: "Soft Taco (Beef)", category: "Tacos", calories: 180, protein: 9, carbs: 18, fats: 9, sodium: 500, serving_size: "99g" },
      { id: "doritos-locos-taco", name: "Doritos Locos Taco", category: "Tacos", calories: 170, protein: 8, carbs: 13, fats: 10, sodium: 350, serving_size: "78g" },
      { id: "chalupa-supreme-beef", name: "Chalupa Supreme (Beef)", category: "Specialties", calories: 350, protein: 13, carbs: 30, fats: 21, sodium: 630, serving_size: "153g" },
      { id: "crunchwrap-supreme", name: "Crunchwrap Supreme", category: "Specialties", calories: 540, protein: 16, carbs: 71, fats: 21, sodium: 1210, serving_size: "254g" },
      { id: "burrito-bean", name: "Bean Burrito", category: "Burritos", calories: 350, protein: 13, carbs: 54, fats: 10, sodium: 1e3, serving_size: "198g" },
      { id: "burrito-beef-5layer", name: "Beefy 5-Layer Burrito", category: "Burritos", calories: 490, protein: 18, carbs: 62, fats: 18, sodium: 1310, serving_size: "255g" },
      { id: "quesadilla-chicken", name: "Chicken Quesadilla", category: "Quesadillas", calories: 510, protein: 27, carbs: 39, fats: 27, sodium: 1250, serving_size: "184g" },
      { id: "mexican-pizza", name: "Mexican Pizza", category: "Specialties", calories: 540, protein: 20, carbs: 46, fats: 31, sodium: 1040, serving_size: "216g" },
      { id: "nachos-bellgrande", name: "Nachos BellGrande", category: "Nachos", calories: 740, protein: 19, carbs: 77, fats: 39, sodium: 1200, serving_size: "308g" },
      { id: "cheesy-gordita-crunch", name: "Cheesy Gordita Crunch", category: "Specialties", calories: 500, protein: 19, carbs: 41, fats: 28, sodium: 1020, serving_size: "191g" },
      { id: "cinnamon-twists", name: "Cinnamon Twists", category: "Desserts", calories: 170, protein: 1, carbs: 26, fats: 7, sodium: 200, serving_size: "35g" },
      { id: "nacho-fries", name: "Nacho Fries", category: "Sides", calories: 320, protein: 4, carbs: 40, fats: 17, sodium: 540, serving_size: "128g" }
    ]
  },
  {
    id: "chipotle-us",
    name: "Chipotle",
    country: "US",
    logo: "🌯",
    menuItems: [
      { id: "chicken-bowl", name: "Chicken Bowl (Rice, Beans, Salsa)", category: "Bowls", calories: 615, protein: 45, carbs: 73, fats: 16, sodium: 1370, serving_size: "550g" },
      { id: "steak-bowl", name: "Steak Bowl (Rice, Beans, Salsa)", category: "Bowls", calories: 630, protein: 44, carbs: 73, fats: 18, sodium: 1420, serving_size: "555g" },
      { id: "carnitas-bowl", name: "Carnitas Bowl (Rice, Beans, Salsa)", category: "Bowls", calories: 670, protein: 44, carbs: 73, fats: 22, sodium: 1540, serving_size: "560g" },
      { id: "barbacoa-bowl", name: "Barbacoa Bowl (Rice, Beans, Salsa)", category: "Bowls", calories: 625, protein: 45, carbs: 73, fats: 17, sodium: 1680, serving_size: "555g" },
      { id: "sofritas-bowl", name: "Sofritas Bowl (Rice, Beans, Salsa)", category: "Bowls", calories: 555, protein: 24, carbs: 77, fats: 18, sodium: 1310, serving_size: "550g" },
      { id: "chicken-burrito", name: "Chicken Burrito", category: "Burritos", calories: 835, protein: 50, carbs: 102, fats: 24, sodium: 2040, serving_size: "650g" },
      { id: "steak-burrito", name: "Steak Burrito", category: "Burritos", calories: 850, protein: 49, carbs: 102, fats: 26, sodium: 2090, serving_size: "655g" },
      { id: "veggie-burrito", name: "Veggie Burrito", category: "Burritos", calories: 780, protein: 22, carbs: 116, fats: 25, sodium: 1690, serving_size: "635g" },
      { id: "chicken-tacos-3", name: "Chicken Tacos (3)", category: "Tacos", calories: 540, protein: 42, carbs: 45, fats: 18, sodium: 1350, serving_size: "420g" },
      { id: "chips-guac", name: "Chips & Guacamole", category: "Sides", calories: 770, protein: 8, carbs: 84, fats: 47, sodium: 800, serving_size: "300g" },
      { id: "chips-queso", name: "Chips & Queso Blanco", category: "Sides", calories: 780, protein: 20, carbs: 80, fats: 42, sodium: 1520, serving_size: "320g" },
      { id: "salad-chicken", name: "Chicken Salad", category: "Salads", calories: 480, protein: 44, carbs: 27, fats: 22, sodium: 1290, serving_size: "500g" }
    ]
  },
  {
    id: "fiveguys-global",
    name: "Five Guys",
    country: "Global",
    logo: "🍔",
    menuItems: [
      { id: "hamburger", name: "Hamburger", category: "Burgers", calories: 700, protein: 39, carbs: 39, fats: 43, sodium: 430, serving_size: "306g" },
      { id: "cheeseburger", name: "Cheeseburger", category: "Burgers", calories: 840, protein: 47, carbs: 40, fats: 55, sodium: 1050, serving_size: "350g" },
      { id: "bacon-burger", name: "Bacon Burger", category: "Burgers", calories: 780, protein: 43, carbs: 39, fats: 50, sodium: 710, serving_size: "336g" },
      { id: "bacon-cheeseburger", name: "Bacon Cheeseburger", category: "Burgers", calories: 920, protein: 51, carbs: 40, fats: 62, sodium: 1330, serving_size: "380g" },
      { id: "little-hamburger", name: "Little Hamburger", category: "Burgers", calories: 480, protein: 26, carbs: 39, fats: 26, sodium: 380, serving_size: "228g" },
      { id: "little-cheeseburger", name: "Little Cheeseburger", category: "Burgers", calories: 550, protein: 30, carbs: 40, fats: 32, sodium: 690, serving_size: "258g" },
      { id: "veggie-sandwich", name: "Veggie Sandwich", category: "Sandwiches", calories: 440, protein: 16, carbs: 60, fats: 15, sodium: 1040, serving_size: "280g" },
      { id: "hotdog", name: "Hot Dog", category: "Hot Dogs", calories: 545, protein: 20, carbs: 41, fats: 35, sodium: 1130, serving_size: "200g" },
      { id: "cheese-hotdog", name: "Cheese Dog", category: "Hot Dogs", calories: 615, protein: 24, carbs: 41, fats: 41, sodium: 1440, serving_size: "228g" },
      { id: "bacon-hotdog", name: "Bacon Dog", category: "Hot Dogs", calories: 625, protein: 24, carbs: 41, fats: 42, sodium: 1410, serving_size: "230g" },
      { id: "fries-regular", name: "Fries (Regular)", category: "Sides", calories: 953, protein: 13, carbs: 131, fats: 41, sodium: 362, serving_size: "350g" },
      { id: "cajun-fries", name: "Cajun Fries (Regular)", category: "Sides", calories: 953, protein: 13, carbs: 131, fats: 41, sodium: 442, serving_size: "350g" },
      { id: "milkshake-vanilla", name: "Vanilla Milkshake", category: "Shakes", calories: 670, protein: 13, carbs: 84, fats: 32, sodium: 360, serving_size: "473ml" }
    ]
  },
  {
    id: "shakeshack-us",
    name: "Shake Shack",
    country: "US",
    logo: "🍔",
    menuItems: [
      { id: "shackburger", name: "ShackBurger", category: "Burgers", calories: 550, protein: 30, carbs: 29, fats: 33, sodium: 1130, serving_size: "219g" },
      { id: "smokeShack", name: "SmokeShack", category: "Burgers", calories: 630, protein: 32, carbs: 30, fats: 40, sodium: 1330, serving_size: "248g" },
      { id: "shack-stack", name: "Shack Stack", category: "Burgers", calories: 770, protein: 44, carbs: 44, fats: 45, sodium: 1590, serving_size: "340g" },
      { id: "hamburger", name: "Hamburger", category: "Burgers", calories: 360, protein: 22, carbs: 27, fats: 18, sodium: 510, serving_size: "140g" },
      { id: "cheeseburger", name: "Cheeseburger", category: "Burgers", calories: 450, protein: 28, carbs: 28, fats: 24, sodium: 1040, serving_size: "176g" },
      { id: "shroom-burger", name: "Shroom Burger", category: "Burgers", calories: 550, protein: 23, carbs: 43, fats: 32, serving_size: "275g" },
      { id: "chicken-shack", name: "Chicken Shack", category: "Chicken", calories: 550, protein: 27, carbs: 47, fats: 28, sodium: 1300, serving_size: "238g" },
      { id: "hot-chicken", name: "Hot Chick'n", category: "Chicken", calories: 560, protein: 28, carbs: 48, fats: 28, sodium: 1500, serving_size: "245g" },
      { id: "fries", name: "Fries", category: "Sides", calories: 470, protein: 6, carbs: 60, fats: 22, sodium: 450, serving_size: "198g" },
      { id: "cheese-fries", name: "Cheese Fries", category: "Sides", calories: 630, protein: 14, carbs: 64, fats: 35, sodium: 1290, serving_size: "255g" },
      { id: "shake-vanilla", name: "Vanilla Shake", category: "Shakes", calories: 580, protein: 13, carbs: 78, fats: 24, sodium: 330, serving_size: "473ml" },
      { id: "shake-chocolate", name: "Chocolate Shake", category: "Shakes", calories: 640, protein: 14, carbs: 86, fats: 26, sodium: 380, serving_size: "473ml" },
      { id: "concrete-birthday", name: "Birthday Cake Concrete", category: "Frozen Custard", calories: 860, protein: 14, carbs: 109, fats: 42, sodium: 420, serving_size: "454g" }
    ]
  },
  {
    id: "popeyes-global",
    name: "Popeyes",
    country: "Global",
    logo: "🍗",
    menuItems: [
      { id: "chicken-leg-mild", name: "Mild Chicken Leg", category: "Chicken", calories: 160, protein: 13, carbs: 5, fats: 9, sodium: 460, serving_size: "72g" },
      { id: "chicken-thigh-mild", name: "Mild Chicken Thigh", category: "Chicken", calories: 280, protein: 19, carbs: 8, fats: 19, sodium: 710, serving_size: "119g" },
      { id: "chicken-breast-mild", name: "Mild Chicken Breast", category: "Chicken", calories: 340, protein: 27, carbs: 11, fats: 20, sodium: 910, serving_size: "159g" },
      { id: "tenders-3pc", name: "Chicken Tenders (3pc)", category: "Chicken", calories: 340, protein: 28, carbs: 17, fats: 17, sodium: 1360, serving_size: "130g" },
      { id: "chicken-sandwich", name: "Classic Chicken Sandwich", category: "Sandwiches", calories: 699, protein: 28, carbs: 50, fats: 42, sodium: 1443, serving_size: "219g" },
      { id: "spicy-chicken-sandwich", name: "Spicy Chicken Sandwich", category: "Sandwiches", calories: 700, protein: 28, carbs: 50, fats: 42, sodium: 1473, serving_size: "220g" },
      { id: "blackened-chicken-sandwich", name: "Blackened Chicken Sandwich", category: "Sandwiches", calories: 394, protein: 30, carbs: 38, fats: 14, sodium: 1260, serving_size: "203g" },
      { id: "cajun-fries-regular", name: "Cajun Fries (Regular)", category: "Sides", calories: 268, protein: 4, carbs: 35, fats: 13, sodium: 585, serving_size: "102g" },
      { id: "mashed-potatoes", name: "Mashed Potatoes with Gravy", category: "Sides", calories: 110, protein: 2, carbs: 18, fats: 4, sodium: 590, serving_size: "142g" },
      { id: "coleslaw", name: "Coleslaw", category: "Sides", calories: 220, protein: 1, carbs: 14, fats: 18, sodium: 260, serving_size: "142g" },
      { id: "red-beans-rice", name: "Red Beans & Rice", category: "Sides", calories: 230, protein: 7, carbs: 38, fats: 6, sodium: 680, serving_size: "170g" },
      { id: "biscuit", name: "Buttermilk Biscuit", category: "Sides", calories: 260, protein: 4, carbs: 26, fats: 15, sodium: 640, serving_size: "65g" },
      { id: "apple-pie", name: "Hot Cinnamon Apple Pie", category: "Desserts", calories: 240, protein: 2, carbs: 37, fats: 10, sodium: 230, serving_size: "85g" }
    ]
  },
  {
    id: "chickfila-us",
    name: "Chick-fil-A",
    country: "US",
    logo: "🐔",
    menuItems: [
      { id: "chicken-sandwich", name: "Chick-fil-A Chicken Sandwich", category: "Sandwiches", calories: 440, protein: 28, carbs: 41, fats: 19, sodium: 1460, serving_size: "185g" },
      { id: "spicy-sandwich", name: "Spicy Chicken Sandwich", category: "Sandwiches", calories: 450, protein: 28, carbs: 43, fats: 19, sodium: 1720, serving_size: "189g" },
      { id: "deluxe-sandwich", name: "Chick-fil-A Deluxe Sandwich", category: "Sandwiches", calories: 500, protein: 32, carbs: 42, fats: 23, sodium: 1640, serving_size: "215g" },
      { id: "grilled-sandwich", name: "Grilled Chicken Sandwich", category: "Sandwiches", calories: 380, protein: 28, carbs: 44, fats: 6, sodium: 1120, serving_size: "192g" },
      { id: "nuggets-8pc", name: "Chicken Nuggets (8pc)", category: "Nuggets", calories: 250, protein: 27, carbs: 11, fats: 11, sodium: 1210, serving_size: "113g" },
      { id: "nuggets-12pc", name: "Chicken Nuggets (12pc)", category: "Nuggets", calories: 380, protein: 40, carbs: 16, fats: 17, sodium: 1820, serving_size: "170g" },
      { id: "grilled-nuggets-8pc", name: "Grilled Nuggets (8pc)", category: "Nuggets", calories: 130, protein: 25, carbs: 2, fats: 3, sodium: 440, serving_size: "113g" },
      { id: "waffle-fries-medium", name: "Waffle Potato Fries (Medium)", category: "Sides", calories: 420, protein: 5, carbs: 45, fats: 24, sodium: 280, serving_size: "125g" },
      { id: "chicken-strips-3", name: "Chick-n-Strips (3pc)", category: "Strips", calories: 340, protein: 27, carbs: 17, fats: 18, sodium: 940, serving_size: "127g" },
      { id: "cobb-salad", name: "Cobb Salad with Grilled Chicken", category: "Salads", calories: 430, protein: 40, carbs: 12, fats: 24, sodium: 1360, serving_size: "327g" },
      { id: "fruit-cup", name: "Fruit Cup", category: "Sides", calories: 50, protein: 1, carbs: 13, fats: 0, sodium: 0, serving_size: "128g" },
      { id: "mac-cheese", name: "Mac & Cheese", category: "Sides", calories: 450, protein: 18, carbs: 45, fats: 22, sodium: 1010, serving_size: "227g" },
      { id: "brownie", name: "Chocolate Fudge Brownie", category: "Desserts", calories: 370, protein: 4, carbs: 50, fats: 18, sodium: 190, serving_size: "88g" },
      { id: "milkshake-chocolate", name: "Chocolate Milkshake", category: "Treats", calories: 610, protein: 13, carbs: 90, fats: 23, sodium: 420, serving_size: "473ml" }
    ]
  },
  {
    id: "papajohns-global",
    name: "Papa John's",
    country: "Global",
    logo: "🍕",
    menuItems: [
      { id: "cheese-pizza-slice", name: "Cheese Pizza (1 slice)", category: "Pizza", calories: 280, protein: 11, carbs: 38, fats: 9, sodium: 670, serving_size: "135g" },
      { id: "pepperoni-pizza-slice", name: "Pepperoni Pizza (1 slice)", category: "Pizza", calories: 320, protein: 13, carbs: 39, fats: 12, sodium: 830, serving_size: "145g" },
      { id: "sausage-pizza-slice", name: "Sausage Pizza (1 slice)", category: "Pizza", calories: 340, protein: 13, carbs: 39, fats: 14, sodium: 870, serving_size: "152g" },
      { id: "works-pizza-slice", name: "The Works Pizza (1 slice)", category: "Pizza", calories: 370, protein: 15, carbs: 40, fats: 16, sodium: 1010, serving_size: "172g" },
      { id: "garden-fresh-slice", name: "Garden Fresh Pizza (1 slice)", category: "Pizza", calories: 280, protein: 11, carbs: 40, fats: 9, sodium: 710, serving_size: "145g" },
      { id: "bbq-chicken-bacon-slice", name: "BBQ Chicken & Bacon Pizza (1 slice)", category: "Pizza", calories: 340, protein: 16, carbs: 42, fats: 11, sodium: 930, serving_size: "160g" },
      { id: "chicken-wings-8", name: "Buffalo Wings (8pc)", category: "Wings", calories: 710, protein: 58, carbs: 8, fats: 48, sodium: 3590, serving_size: "232g" },
      { id: "breadsticks-8", name: "Breadsticks (8)", category: "Sides", calories: 1120, protein: 32, carbs: 152, fats: 40, sodium: 2160, serving_size: "320g" },
      { id: "garlic-knots-10", name: "Garlic Knots (10)", category: "Sides", calories: 940, protein: 28, carbs: 128, fats: 32, sodium: 1840, serving_size: "280g" },
      { id: "cheesesticks-8", name: "Cheesesticks (8)", category: "Sides", calories: 1360, protein: 56, carbs: 152, fats: 56, sodium: 2960, serving_size: "360g" }
    ]
  },
  {
    id: "dominos-global",
    name: "Domino's",
    country: "Global",
    logo: "🍕",
    menuItems: [
      { id: "cheese-hand-tossed-slice", name: "Cheese Pizza Hand Tossed (1 slice)", category: "Pizza", calories: 200, protein: 8, carbs: 25, fats: 7, sodium: 420, serving_size: "102g" },
      { id: "pepperoni-hand-tossed-slice", name: "Pepperoni Pizza Hand Tossed (1 slice)", category: "Pizza", calories: 210, protein: 9, carbs: 25, fats: 8, sodium: 480, serving_size: "105g" },
      { id: "meatzza-slice", name: "MeatZZa Pizza (1 slice)", category: "Pizza", calories: 280, protein: 13, carbs: 25, fats: 14, sodium: 750, serving_size: "130g" },
      { id: "veggie-slice", name: "Pacific Veggie Pizza (1 slice)", category: "Pizza", calories: 180, protein: 7, carbs: 26, fats: 6, sodium: 400, serving_size: "108g" },
      { id: "buffalo-chicken-slice", name: "Buffalo Chicken Pizza (1 slice)", category: "Pizza", calories: 210, protein: 11, carbs: 24, fats: 8, sodium: 640, serving_size: "111g" },
      { id: "bbq-chicken-slice", name: "BBQ Chicken Pizza (1 slice)", category: "Pizza", calories: 220, protein: 11, carbs: 28, fats: 7, sodium: 560, serving_size: "117g" },
      { id: "wings-buffalo-6", name: "Buffalo Wings (6pc)", category: "Wings", calories: 450, protein: 42, carbs: 4, fats: 30, sodium: 2340, serving_size: "174g" },
      { id: "boneless-wings-8", name: "Boneless Wings (8pc)", category: "Wings", calories: 580, protein: 30, carbs: 50, fats: 26, sodium: 1940, serving_size: "232g" },
      { id: "bread-twists-cinnamon", name: "Cinnamon Bread Twists (8)", category: "Desserts", calories: 920, protein: 16, carbs: 136, fats: 32, sodium: 720, serving_size: "280g" },
      { id: "pasta-chicken-alfredo", name: "Chicken Alfredo Pasta", category: "Pasta", calories: 680, protein: 38, carbs: 58, fats: 32, sodium: 1760, serving_size: "397g" },
      { id: "parmesan-bread-bites", name: "Parmesan Bread Bites (16)", category: "Sides", calories: 880, protein: 32, carbs: 112, fats: 32, sodium: 2e3, serving_size: "320g" }
    ]
  },
  {
    id: "littlecaesars-us",
    name: "Little Caesars",
    country: "US",
    logo: "🍕",
    menuItems: [
      { id: "pepperoni-pizza-slice", name: "Pepperoni Pizza (1 slice)", category: "Pizza", calories: 280, protein: 13, carbs: 30, fats: 12, sodium: 610, serving_size: "123g" },
      { id: "cheese-pizza-slice", name: "Cheese Pizza (1 slice)", category: "Pizza", calories: 250, protein: 11, carbs: 30, fats: 9, sodium: 480, serving_size: "115g" },
      { id: "italian-cheese-bread", name: "Italian Cheese Bread (1 piece)", category: "Sides", calories: 140, protein: 5, carbs: 13, fats: 7, sodium: 270, serving_size: "38g" },
      { id: "crazy-bread-stick", name: "Crazy Bread (1 stick)", category: "Sides", calories: 100, protein: 3, carbs: 13, fats: 4, sodium: 150, serving_size: "28g" },
      { id: "caesar-wings-8", name: "Caesar Wings (8pc)", category: "Wings", calories: 560, protein: 48, carbs: 4, fats: 40, sodium: 1920, serving_size: "224g" },
      { id: "deep-dish-pepperoni-slice", name: "Deep! Deep! Dish Pepperoni (1 slice)", category: "Pizza", calories: 390, protein: 16, carbs: 40, fats: 18, sodium: 880, serving_size: "167g" }
    ]
  },
  {
    id: "panera-us",
    name: "Panera Bread",
    country: "US",
    logo: "🥖",
    menuItems: [
      { id: "broccoli-cheddar-soup", name: "Broccoli Cheddar Soup (Bowl)", category: "Soups", calories: 360, protein: 13, carbs: 23, fats: 24, sodium: 1340, serving_size: "340g" },
      { id: "mac-cheese", name: "Mac & Cheese", category: "Soups", calories: 980, protein: 43, carbs: 91, fats: 51, sodium: 2160, serving_size: "453g" },
      { id: "chicken-noodle-soup", name: "Chicken Noodle Soup (Bowl)", category: "Soups", calories: 160, protein: 12, carbs: 18, fats: 4, sodium: 1410, serving_size: "340g" },
      { id: "bacon-turkey-bravo", name: "Bacon Turkey Bravo Sandwich", category: "Sandwiches", calories: 590, protein: 39, carbs: 49, fats: 26, sodium: 1930, serving_size: "331g" },
      { id: "tuna-salad-sandwich", name: "Tuna Salad Sandwich", category: "Sandwiches", calories: 510, protein: 23, carbs: 51, fats: 24, sodium: 1090, serving_size: "292g" },
      { id: "mediterranean-veggie", name: "Mediterranean Veggie Sandwich", category: "Sandwiches", calories: 600, protein: 18, carbs: 77, fats: 24, sodium: 1260, serving_size: "355g" },
      { id: "caesar-salad-chicken", name: "Caesar Salad with Chicken", category: "Salads", calories: 500, protein: 37, carbs: 29, fats: 28, sodium: 1240, serving_size: "372g" },
      { id: "greek-salad", name: "Greek Salad", category: "Salads", calories: 400, protein: 12, carbs: 17, fats: 32, sodium: 1100, serving_size: "329g" },
      { id: "bagel-plain", name: "Plain Bagel", category: "Bakery", calories: 290, protein: 11, carbs: 56, fats: 2, sodium: 460, serving_size: "113g" },
      { id: "cinnamon-crunch-bagel", name: "Cinnamon Crunch Bagel", category: "Bakery", calories: 420, protein: 9, carbs: 83, fats: 6, sodium: 430, serving_size: "142g" },
      { id: "chocolate-chip-cookie", name: "Chocolate Chip Cookie", category: "Bakery", calories: 440, protein: 5, carbs: 59, fats: 21, sodium: 300, serving_size: "99g" }
    ]
  },
  // ========== MORE US CHAINS ==========
  {
    id: "innout-us",
    name: "In-N-Out Burger",
    country: "US",
    logo: "🍔",
    menuItems: [
      { id: "hamburger", name: "Hamburger", category: "Burgers", calories: 390, protein: 16, carbs: 39, fats: 19, sodium: 650, serving_size: "243g" },
      { id: "cheeseburger", name: "Cheeseburger", category: "Burgers", calories: 480, protein: 22, carbs: 39, fats: 27, sodium: 1e3, serving_size: "268g" },
      { id: "double-double", name: "Double-Double", category: "Burgers", calories: 670, protein: 37, carbs: 39, fats: 41, sodium: 1440, serving_size: "328g" },
      { id: "protein-style-burger", name: "Hamburger Protein Style", category: "Burgers", calories: 240, protein: 13, carbs: 11, fats: 17, sodium: 370, serving_size: "300g" },
      { id: "fries", name: "French Fries", category: "Sides", calories: 395, protein: 7, carbs: 54, fats: 18, sodium: 245, serving_size: "125g" },
      { id: "shake-vanilla", name: "Vanilla Shake", category: "Shakes", calories: 580, protein: 9, carbs: 67, fats: 31, sodium: 280, serving_size: "425g" },
      { id: "shake-chocolate", name: "Chocolate Shake", category: "Shakes", calories: 590, protein: 9, carbs: 72, fats: 30, sodium: 350, serving_size: "425g" }
    ]
  },
  {
    id: "jimmyjohns-us",
    name: "Jimmy John's",
    country: "US",
    logo: "🥪",
    menuItems: [
      { id: "turkey-tom", name: 'Turkey Tom (8")', category: "Subs", calories: 554, protein: 36, carbs: 51, fats: 20, sodium: 1595, serving_size: "296g" },
      { id: "big-john", name: 'Big John (8")', category: "Subs", calories: 564, protein: 38, carbs: 52, fats: 20, sodium: 1665, serving_size: "302g" },
      { id: "vito", name: 'The Vito (8")', category: "Subs", calories: 579, protein: 31, carbs: 51, fats: 26, sodium: 1820, serving_size: "296g" },
      { id: "italian-night-club", name: 'Italian Night Club (8")', category: "Clubs", calories: 976, protein: 56, carbs: 73, fats: 48, sodium: 3056, serving_size: "455g" },
      { id: "beach-club", name: 'Beach Club (8")', category: "Clubs", calories: 843, protein: 51, carbs: 73, fats: 36, sodium: 2535, serving_size: "436g" },
      { id: "bootlegger-club", name: 'Bootlegger Club (8")', category: "Clubs", calories: 740, protein: 48, carbs: 73, fats: 26, sodium: 2365, serving_size: "436g" },
      { id: "unwich-turkey", name: "Turkey Tom Unwich (Lettuce Wrap)", category: "Unwich", calories: 315, protein: 34, carbs: 9, fats: 16, sodium: 1585, serving_size: "222g" },
      { id: "chips", name: "Jimmy Chips", category: "Sides", calories: 150, protein: 2, carbs: 16, fats: 9, sodium: 135, serving_size: "28g" },
      { id: "pickle", name: "Jumbo Kosher Dill Pickle", category: "Sides", calories: 15, protein: 1, carbs: 3, fats: 0, sodium: 1200, serving_size: "142g" }
    ]
  },
  {
    id: "arbys-us",
    name: "Arby's",
    country: "US",
    logo: "🥩",
    menuItems: [
      { id: "classic-roast-beef", name: "Classic Roast Beef", category: "Sandwiches", calories: 360, protein: 23, carbs: 37, fats: 14, sodium: 970, serving_size: "154g" },
      { id: "beef-n-cheddar", name: "Beef 'n Cheddar Classic", category: "Sandwiches", calories: 450, protein: 23, carbs: 45, fats: 20, sodium: 1310, serving_size: "195g" },
      { id: "french-dip", name: "French Dip & Swiss", category: "Sandwiches", calories: 540, protein: 31, carbs: 49, fats: 23, sodium: 2070, serving_size: "281g" },
      { id: "smokehouse-brisket", name: "Smokehouse Brisket", category: "Sandwiches", calories: 610, protein: 32, carbs: 49, fats: 31, sodium: 1750, serving_size: "260g" },
      { id: "chicken-bacon-swiss", name: "Roast Chicken Bacon Swiss", category: "Sandwiches", calories: 610, protein: 45, carbs: 48, fats: 27, sodium: 1810, serving_size: "279g" },
      { id: "market-fresh-turkey", name: "Roast Turkey & Swiss Market Fresh", category: "Market Fresh", calories: 720, protein: 44, carbs: 75, fats: 28, sodium: 1920, serving_size: "373g" },
      { id: "curly-fries-medium", name: "Curly Fries (Medium)", category: "Sides", calories: 550, protein: 7, carbs: 69, fats: 28, sodium: 1220, serving_size: "170g" },
      { id: "mozzarella-sticks-6", name: "Mozzarella Sticks (6pc)", category: "Sides", calories: 580, protein: 23, carbs: 57, fats: 28, sodium: 1740, serving_size: "198g" },
      { id: "jamocha-shake", name: "Jamocha Shake", category: "Shakes", calories: 590, protein: 13, carbs: 84, fats: 22, sodium: 420, serving_size: "425g" }
    ]
  },
  {
    id: "carlsjr-us",
    name: "Carl's Jr.",
    country: "US",
    logo: "⭐",
    menuItems: [
      { id: "famous-star", name: "Famous Star with Cheese", category: "Burgers", calories: 660, protein: 27, carbs: 53, fats: 38, sodium: 1260, serving_size: "254g" },
      { id: "super-star", name: "Super Star with Cheese", category: "Burgers", calories: 920, protein: 47, carbs: 54, fats: 58, sodium: 1730, serving_size: "368g" },
      { id: "western-bacon-cheeseburger", name: "Western Bacon Cheeseburger", category: "Burgers", calories: 750, protein: 36, carbs: 71, fats: 35, sodium: 1730, serving_size: "303g" },
      { id: "big-carl", name: "Big Carl", category: "Burgers", calories: 930, protein: 48, carbs: 54, fats: 58, sodium: 1810, serving_size: "370g" },
      { id: "chicken-stars-6", name: "Chicken Stars (6pc)", category: "Chicken", calories: 380, protein: 16, carbs: 27, fats: 23, sodium: 770, serving_size: "113g" },
      { id: "hand-breaded-chicken-sandwich", name: "Hand-Breaded Chicken Sandwich", category: "Chicken", calories: 760, protein: 33, carbs: 72, fats: 38, sodium: 1690, serving_size: "294g" },
      { id: "natural-cut-fries-medium", name: "Natural Cut Fries (Medium)", category: "Sides", calories: 430, protein: 6, carbs: 57, fats: 20, sodium: 940, serving_size: "142g" },
      { id: "onion-rings", name: "Onion Rings", category: "Sides", calories: 530, protein: 6, carbs: 61, fats: 28, sodium: 700, serving_size: "128g" },
      { id: "chocolate-shake", name: "Chocolate Shake (Small)", category: "Shakes", calories: 700, protein: 14, carbs: 85, fats: 33, sodium: 310, serving_size: "397g" }
    ]
  },
  {
    id: "sonic-us",
    name: "Sonic Drive-In",
    country: "US",
    logo: "🔵",
    menuItems: [
      { id: "sonic-cheeseburger", name: "Sonic Cheeseburger", category: "Burgers", calories: 720, protein: 33, carbs: 51, fats: 42, sodium: 1310, serving_size: "283g" },
      { id: "supersonic-bacon-cheeseburger", name: "SuperSONIC Bacon Double Cheeseburger", category: "Burgers", calories: 1160, protein: 62, carbs: 54, fats: 74, sodium: 2170, serving_size: "428g" },
      { id: "crispy-chicken-sandwich", name: "Crispy Chicken Sandwich", category: "Chicken", calories: 550, protein: 23, carbs: 51, fats: 28, sodium: 1200, serving_size: "232g" },
      { id: "corn-dog", name: "Corn Dog", category: "Hot Dogs", calories: 230, protein: 6, carbs: 23, fats: 13, sodium: 500, serving_size: "88g" },
      { id: "chili-cheese-coney", name: "Chili Cheese Coney", category: "Hot Dogs", calories: 470, protein: 17, carbs: 36, fats: 28, sodium: 1250, serving_size: "192g" },
      { id: "popcorn-chicken-medium", name: "Popcorn Chicken (Medium)", category: "Chicken", calories: 380, protein: 19, carbs: 24, fats: 23, sodium: 1240, serving_size: "128g" },
      { id: "tots-medium", name: "Tots (Medium)", category: "Sides", calories: 280, protein: 3, carbs: 35, fats: 14, sodium: 570, serving_size: "103g" },
      { id: "chili-cheese-tots", name: "Chili Cheese Tots (Medium)", category: "Sides", calories: 470, protein: 12, carbs: 45, fats: 27, sodium: 1270, serving_size: "206g" },
      { id: "onion-rings-medium", name: "Onion Rings (Medium)", category: "Sides", calories: 440, protein: 5, carbs: 53, fats: 23, sodium: 420, serving_size: "119g" },
      { id: "ocean-water", name: "Ocean Water (Medium)", category: "Drinks", calories: 170, protein: 0, carbs: 47, fats: 0, sodium: 85, serving_size: "473ml" },
      { id: "oreo-blast", name: "Oreo Sonic Blast (Medium)", category: "Ice Cream", calories: 820, protein: 14, carbs: 110, fats: 36, sodium: 520, serving_size: "425g" }
    ]
  },
  {
    id: "dairyqueen-global",
    name: "Dairy Queen",
    country: "Global",
    logo: "🍦",
    menuItems: [
      { id: "hamburger", name: "Hamburger", category: "Burgers", calories: 350, protein: 17, carbs: 29, fats: 17, sodium: 630, serving_size: "149g" },
      { id: "cheeseburger", name: "Cheeseburger", category: "Burgers", calories: 400, protein: 20, carbs: 30, fats: 20, sodium: 850, serving_size: "163g" },
      { id: "bacon-cheeseburger", name: "Bacon Cheeseburger", category: "Burgers", calories: 470, protein: 23, carbs: 31, fats: 26, sodium: 1070, serving_size: "184g" },
      { id: "chicken-strips-4", name: "Chicken Strips (4pc)", category: "Chicken", calories: 480, protein: 32, carbs: 32, fats: 24, sodium: 1130, serving_size: "177g" },
      { id: "hot-dog", name: "Hot Dog", category: "Hot Dogs", calories: 290, protein: 11, carbs: 23, fats: 17, sodium: 830, serving_size: "114g" },
      { id: "fries-regular", name: "French Fries (Regular)", category: "Sides", calories: 310, protein: 4, carbs: 43, fats: 13, sodium: 640, serving_size: "114g" },
      { id: "onion-rings-regular", name: "Onion Rings (Regular)", category: "Sides", calories: 360, protein: 5, carbs: 42, fats: 19, sodium: 730, serving_size: "113g" },
      { id: "blizzard-oreo-small", name: "Oreo Blizzard (Small)", category: "Blizzards", calories: 570, protein: 12, carbs: 83, fats: 21, sodium: 410, serving_size: "340g" },
      { id: "dilly-bar", name: "Dilly Bar", category: "Treats", calories: 240, protein: 4, carbs: 24, fats: 14, sodium: 75, serving_size: "85g" },
      { id: "soft-serve-cone-small", name: "Vanilla Cone (Small)", category: "Ice Cream", calories: 230, protein: 6, carbs: 38, fats: 7, sodium: 115, serving_size: "142g" }
    ]
  },
  {
    id: "wingstop-us",
    name: "Wingstop",
    country: "US",
    logo: "🍗",
    menuItems: [
      { id: "classic-wings-lemon-pepper-6", name: "Lemon Pepper Wings (6pc)", category: "Wings", calories: 550, protein: 47, carbs: 5, fats: 37, sodium: 1670, serving_size: "189g" },
      { id: "classic-wings-original-hot-6", name: "Original Hot Wings (6pc)", category: "Wings", calories: 480, protein: 46, carbs: 1, fats: 32, sodium: 2370, serving_size: "189g" },
      { id: "classic-wings-garlic-parm-6", name: "Garlic Parmesan Wings (6pc)", category: "Wings", calories: 630, protein: 47, carbs: 10, fats: 45, sodium: 1950, serving_size: "196g" },
      { id: "classic-wings-mango-habanero-6", name: "Mango Habanero Wings (6pc)", category: "Wings", calories: 560, protein: 46, carbs: 18, fats: 33, sodium: 1840, serving_size: "202g" },
      { id: "boneless-wings-6", name: "Boneless Wings (6pc)", category: "Boneless", calories: 550, protein: 30, carbs: 43, fats: 27, sodium: 1610, serving_size: "177g" },
      { id: "louisiana-rub-wings-6", name: "Louisiana Rub Wings (6pc)", category: "Wings", calories: 500, protein: 47, carbs: 3, fats: 33, sodium: 1960, serving_size: "189g" },
      { id: "cajun-fried-corn", name: "Cajun Fried Corn", category: "Sides", calories: 400, protein: 6, carbs: 61, fats: 16, sodium: 1230, serving_size: "198g" },
      { id: "fries-regular", name: "Regular Fries", category: "Sides", calories: 430, protein: 5, carbs: 55, fats: 21, sodium: 690, serving_size: "142g" },
      { id: "veggie-sticks", name: "Veggie Sticks with Ranch", category: "Sides", calories: 230, protein: 2, carbs: 9, fats: 20, sodium: 460, serving_size: "128g" }
    ]
  },
  // ========== UK & EUROPEAN CHAINS ==========
  {
    id: "leon-uk",
    name: "Leon",
    country: "UK",
    logo: "🥙",
    menuItems: [
      { id: "grilled-chicken-wrap", name: "Grilled Chicken Wrap", category: "Wraps", calories: 425, protein: 32, carbs: 42, fats: 14, sodium: 890, serving_size: "280g" },
      { id: "halloumi-wrap", name: "Halloumi & Roasted Veg Wrap", category: "Wraps", calories: 485, protein: 18, carbs: 48, fats: 24, sodium: 980, serving_size: "300g" },
      { id: "love-burger", name: "LOVe Burger", category: "Burgers", calories: 520, protein: 22, carbs: 54, fats: 22, sodium: 1120, serving_size: "310g" },
      { id: "moroccan-meatballs", name: "Moroccan Meatballs", category: "Hot Boxes", calories: 468, protein: 28, carbs: 52, fats: 16, sodium: 1240, serving_size: "380g" },
      { id: "chicken-katsu-curry", name: "Chicken Katsu Curry", category: "Hot Boxes", calories: 642, protein: 32, carbs: 78, fats: 20, sodium: 1680, serving_size: "450g" },
      { id: "aioli-fries", name: "Aioli Fries", category: "Sides", calories: 468, protein: 6, carbs: 52, fats: 26, sodium: 840, serving_size: "180g" },
      { id: "sweet-potato-fries", name: "Sweet Potato Fries", category: "Sides", calories: 420, protein: 4, carbs: 58, fats: 19, sodium: 680, serving_size: "170g" },
      { id: "superfood-salad", name: "Superfood Salad", category: "Salads", calories: 285, protein: 8, carbs: 28, fats: 16, sodium: 540, serving_size: "280g" },
      { id: "porridge-berry", name: "Berry Porridge", category: "Breakfast", calories: 312, protein: 10, carbs: 56, fats: 6, sodium: 180, serving_size: "320g" }
    ]
  },
  {
    id: "honestburgers-uk",
    name: "Honest Burgers",
    country: "UK",
    logo: "🍔",
    menuItems: [
      { id: "honest-burger", name: "Honest Burger", category: "Burgers", calories: 680, protein: 38, carbs: 42, fats: 38, sodium: 1180, serving_size: "320g" },
      { id: "bacon-cheeseburger", name: "Bacon Cheeseburger", category: "Burgers", calories: 780, protein: 44, carbs: 43, fats: 46, sodium: 1420, serving_size: "360g" },
      { id: "plant-burger", name: "Plant Burger", category: "Burgers", calories: 620, protein: 24, carbs: 52, fats: 34, sodium: 980, serving_size: "310g" },
      { id: "buffalo-chicken", name: "Buffalo Chicken Burger", category: "Burgers", calories: 720, protein: 36, carbs: 48, fats: 40, sodium: 1340, serving_size: "340g" },
      { id: "rosemary-fries", name: "Rosemary Salted Chips", category: "Sides", calories: 488, protein: 7, carbs: 64, fats: 22, sodium: 680, serving_size: "200g" },
      { id: "onion-rings-honest", name: "Onion Rings", category: "Sides", calories: 420, protein: 6, carbs: 48, fats: 22, sodium: 720, serving_size: "150g" },
      { id: "coleslaw", name: "Coleslaw", category: "Sides", calories: 180, protein: 2, carbs: 12, fats: 14, sodium: 320, serving_size: "120g" }
    ]
  },
  {
    id: "gbk-uk",
    name: "Gourmet Burger Kitchen",
    country: "UK",
    logo: "🍔",
    menuItems: [
      { id: "classic-burger", name: "Classic Burger", category: "Burgers", calories: 720, protein: 40, carbs: 46, fats: 40, sodium: 1260, serving_size: "340g" },
      { id: "bacon-cheeseburger-gbk", name: "Bacon & Cheese Burger", category: "Burgers", calories: 850, protein: 48, carbs: 47, fats: 50, sodium: 1540, serving_size: "380g" },
      { id: "avocado-bacon", name: "Avocado & Bacon Burger", category: "Burgers", calories: 920, protein: 46, carbs: 52, fats: 56, sodium: 1480, serving_size: "400g" },
      { id: "chicken-burger-gbk", name: "Chicken Burger", category: "Burgers", calories: 680, protein: 38, carbs: 52, fats: 34, sodium: 1180, serving_size: "330g" },
      { id: "vegan-burger-gbk", name: "Vegan Burger", category: "Burgers", calories: 580, protein: 22, carbs: 58, fats: 28, sodium: 940, serving_size: "310g" },
      { id: "skinny-fries", name: "Skinny Fries", category: "Sides", calories: 420, protein: 6, carbs: 54, fats: 20, sodium: 580, serving_size: "180g" },
      { id: "sweet-potato-fries-gbk", name: "Sweet Potato Fries", category: "Sides", calories: 460, protein: 5, carbs: 62, fats: 21, sodium: 640, serving_size: "190g" },
      { id: "onion-rings-gbk", name: "Onion Rings", category: "Sides", calories: 380, protein: 5, carbs: 44, fats: 20, sodium: 680, serving_size: "140g" }
    ]
  },
  {
    id: "itsu-uk",
    name: "itsu",
    country: "UK",
    logo: "🍱",
    menuItems: [
      { id: "chicken-teriyaki-sushi", name: "Chicken Teriyaki Sushi", category: "Sushi", calories: 358, protein: 18, carbs: 62, fats: 4, sodium: 980, serving_size: "280g" },
      { id: "salmon-sashimi", name: "Salmon Sashimi", category: "Sushi", calories: 186, protein: 22, carbs: 0, fats: 11, sodium: 480, serving_size: "140g" },
      { id: "veggie-dragon-roll", name: "Veggie Dragon Roll", category: "Sushi", calories: 268, protein: 8, carbs: 52, fats: 4, sodium: 680, serving_size: "240g" },
      { id: "chicken-noodle-soup-itsu", name: "Chicken Noodle Soup", category: "Hot", calories: 298, protein: 24, carbs: 38, fats: 6, sodium: 1240, serving_size: "450g" },
      { id: "chicken-gyoza-itsu", name: "Chicken Gyoza (5pc)", category: "Sides", calories: 185, protein: 11, carbs: 22, fats: 6, sodium: 680, serving_size: "120g" },
      { id: "miso-soup", name: "Miso Soup", category: "Soups", calories: 68, protein: 4, carbs: 8, fats: 2, sodium: 820, serving_size: "300ml" },
      { id: "edamame-itsu", name: "Edamame", category: "Sides", calories: 110, protein: 10, carbs: 8, fats: 5, sodium: 340, serving_size: "120g" }
    ]
  },
  {
    id: "wasabi-uk",
    name: "Wasabi",
    country: "UK",
    logo: "🍣",
    menuItems: [
      { id: "salmon-avocado-roll", name: "Salmon & Avocado Roll", category: "Sushi", calories: 285, protein: 14, carbs: 42, fats: 8, sodium: 680, serving_size: "220g" },
      { id: "california-roll", name: "California Roll", category: "Sushi", calories: 268, protein: 10, carbs: 44, fats: 6, sodium: 720, serving_size: "230g" },
      { id: "spicy-tuna-roll", name: "Spicy Tuna Roll", category: "Sushi", calories: 312, protein: 16, carbs: 42, fats: 9, sodium: 880, serving_size: "240g" },
      { id: "chicken-katsu-curry-wasabi", name: "Chicken Katsu Curry", category: "Hot Food", calories: 680, protein: 32, carbs: 88, fats: 20, sodium: 1540, serving_size: "480g" },
      { id: "yakisoba-chicken", name: "Chicken Yakisoba", category: "Hot Food", calories: 548, protein: 28, carbs: 72, fats: 16, sodium: 1680, serving_size: "420g" },
      { id: "veg-gyoza-wasabi", name: "Vegetable Gyoza (5pc)", category: "Sides", calories: 168, protein: 6, carbs: 26, fats: 5, sodium: 580, serving_size: "115g" },
      { id: "edamame-wasabi", name: "Edamame", category: "Sides", calories: 98, protein: 9, carbs: 7, fats: 4, sodium: 320, serving_size: "120g" }
    ]
  },
  {
    id: "caffenero-uk",
    name: "Caffè Nero",
    country: "UK",
    logo: "☕",
    menuItems: [
      { id: "latte-regular-nero", name: "Latte (Regular)", category: "Coffee", calories: 134, protein: 7, carbs: 13, fats: 6, sodium: 110, serving_size: "355ml" },
      { id: "cappuccino-regular-nero", name: "Cappuccino (Regular)", category: "Coffee", calories: 103, protein: 6, carbs: 10, fats: 4, sodium: 85, serving_size: "355ml" },
      { id: "flat-white-nero", name: "Flat White", category: "Coffee", calories: 115, protein: 7, carbs: 10, fats: 5, sodium: 95, serving_size: "240ml" },
      { id: "mocha-regular-nero", name: "Mocha (Regular)", category: "Coffee", calories: 245, protein: 9, carbs: 32, fats: 9, sodium: 140, serving_size: "355ml" },
      { id: "bacon-panini-nero", name: "Bacon Panini", category: "Food", calories: 395, protein: 20, carbs: 40, fats: 18, sodium: 1260, serving_size: "150g" },
      { id: "mozzarella-tomato-panini", name: "Mozzarella & Tomato Panini", category: "Food", calories: 420, protein: 18, carbs: 44, fats: 19, sodium: 980, serving_size: "165g" },
      { id: "tuna-melt-panini", name: "Tuna Melt Panini", category: "Food", calories: 458, protein: 22, carbs: 42, fats: 22, sodium: 1140, serving_size: "175g" },
      { id: "carrot-cake-nero", name: "Carrot Cake", category: "Bakery", calories: 448, protein: 5, carbs: 58, fats: 22, sodium: 380, serving_size: "125g" }
    ]
  },
  {
    id: "pizzaexpress-uk",
    name: "Pizza Express",
    country: "UK",
    logo: "🍕",
    menuItems: [
      { id: "margherita-pizzaexpress", name: "Margherita Pizza", category: "Pizza", calories: 792, protein: 32, carbs: 98, fats: 30, sodium: 1680, serving_size: "380g" },
      { id: "americana", name: "Americana Pizza", category: "Pizza", calories: 968, protein: 42, carbs: 100, fats: 42, sodium: 2240, serving_size: "450g" },
      { id: "la-reine", name: "La Reine Pizza", category: "Pizza", calories: 884, protein: 40, carbs: 98, fats: 35, sodium: 2080, serving_size: "420g" },
      { id: "fiorentina", name: "Fiorentina Pizza", category: "Pizza", calories: 864, protein: 38, carbs: 96, fats: 36, sodium: 1920, serving_size: "410g" },
      { id: "vegan-giardiniera", name: "Vegan Giardiniera", category: "Pizza", calories: 748, protein: 24, carbs: 102, fats: 28, sodium: 1640, serving_size: "380g" },
      { id: "dough-balls", name: "Dough Balls (5)", category: "Sides", calories: 412, protein: 12, carbs: 72, fats: 8, sodium: 880, serving_size: "150g" },
      { id: "caesar-salad-pizzaexpress", name: "Caesar Salad", category: "Salads", calories: 368, protein: 12, carbs: 18, fats: 28, sodium: 980, serving_size: "280g" }
    ]
  },
  // ========== ASIAN CHAINS ==========
  {
    id: "yoshinoya-japan",
    name: "Yoshinoya",
    country: "Japan",
    logo: "🍚",
    menuItems: [
      { id: "beef-bowl-regular", name: "Beef Bowl (Regular)", category: "Rice Bowls", calories: 668, protein: 24, carbs: 92, fats: 21, sodium: 1840, serving_size: "420g" },
      { id: "beef-bowl-large", name: "Beef Bowl (Large)", category: "Rice Bowls", calories: 892, protein: 32, carbs: 122, fats: 28, sodium: 2450, serving_size: "560g" },
      { id: "chicken-bowl", name: "Chicken Bowl", category: "Rice Bowls", calories: 584, protein: 28, carbs: 88, fats: 12, sodium: 1680, serving_size: "400g" },
      { id: "curry-beef-bowl", name: "Curry Beef Bowl", category: "Rice Bowls", calories: 748, protein: 26, carbs: 106, fats: 24, sodium: 2140, serving_size: "480g" },
      { id: "gyudon-cheese", name: "Beef Bowl with Cheese", category: "Rice Bowls", calories: 748, protein: 30, carbs: 94, fats: 28, sodium: 2080, serving_size: "450g" },
      { id: "miso-soup-yoshinoya", name: "Miso Soup", category: "Sides", calories: 48, protein: 3, carbs: 6, fats: 1, sodium: 780, serving_size: "250ml" }
    ]
  },
  {
    id: "jollibee-philippines",
    name: "Jollibee",
    country: "Philippines",
    logo: "🐝",
    menuItems: [
      { id: "chickenjoy-1pc", name: "Chickenjoy (1pc)", category: "Chicken", calories: 310, protein: 18, carbs: 12, fats: 21, sodium: 720, serving_size: "125g" },
      { id: "chickenjoy-2pc", name: "Chickenjoy (2pc)", category: "Chicken", calories: 620, protein: 36, carbs: 24, fats: 42, sodium: 1440, serving_size: "250g" },
      { id: "jolly-spaghetti", name: "Jolly Spaghetti", category: "Pasta", calories: 560, protein: 18, carbs: 86, fats: 16, sodium: 1280, serving_size: "380g" },
      { id: "burger-steak", name: "Burger Steak", category: "Meals", calories: 470, protein: 22, carbs: 54, fats: 18, sodium: 1140, serving_size: "320g" },
      { id: "palabok-fiesta", name: "Palabok Fiesta", category: "Noodles", calories: 490, protein: 16, carbs: 72, fats: 15, sodium: 1420, serving_size: "350g" },
      { id: "yumburger", name: "Yumburger", category: "Burgers", calories: 310, protein: 13, carbs: 35, fats: 13, sodium: 680, serving_size: "145g" },
      { id: "aloha-burger", name: "Aloha Yumburger", category: "Burgers", calories: 380, protein: 15, carbs: 40, fats: 18, sodium: 820, serving_size: "170g" },
      { id: "fries-jollibee", name: "Jolly Crispy Fries (Regular)", category: "Sides", calories: 280, protein: 3, carbs: 36, fats: 14, sodium: 340, serving_size: "100g" },
      { id: "peach-mango-pie", name: "Peach Mango Pie", category: "Desserts", calories: 220, protein: 2, carbs: 32, fats: 10, sodium: 180, serving_size: "75g" }
    ]
  },
  {
    id: "mosburger-asia",
    name: "MOS Burger",
    country: "Japan",
    logo: "🍔",
    menuItems: [
      { id: "mos-burger", name: "MOS Burger", category: "Burgers", calories: 376, protein: 17, carbs: 38, fats: 17, sodium: 820, serving_size: "195g" },
      { id: "teriyaki-burger", name: "Teriyaki Burger", category: "Burgers", calories: 428, protein: 20, carbs: 44, fats: 19, sodium: 980, serving_size: "215g" },
      { id: "fish-burger-mos", name: "Fish Burger", category: "Burgers", calories: 364, protein: 15, carbs: 42, fats: 15, sodium: 740, serving_size: "190g" },
      { id: "mos-cheeseburger", name: "MOS Cheeseburger", category: "Burgers", calories: 436, protein: 21, carbs: 39, fats: 22, sodium: 1040, serving_size: "215g" },
      { id: "chicken-nuggets-mos-5", name: "Chicken Nuggets (5pc)", category: "Sides", calories: 268, protein: 14, carbs: 18, fats: 16, sodium: 680, serving_size: "100g" },
      { id: "onion-rings-mos", name: "Onion Rings", category: "Sides", calories: 320, protein: 4, carbs: 38, fats: 17, sodium: 580, serving_size: "110g" },
      { id: "fries-mos", name: "French Fries (M)", category: "Sides", calories: 386, protein: 5, carbs: 50, fats: 18, sodium: 420, serving_size: "135g" }
    ]
  },
  {
    id: "oldchangkee-singapore",
    name: "Old Chang Kee",
    country: "Singapore",
    logo: "🥟",
    menuItems: [
      { id: "curry-puff", name: "Curry Puff", category: "Snacks", calories: 168, protein: 5, carbs: 18, fats: 9, sodium: 340, serving_size: "80g" },
      { id: "chicken-curry-puff", name: "Chicken Curry Puff", category: "Snacks", calories: 178, protein: 7, carbs: 19, fats: 9, sodium: 380, serving_size: "85g" },
      { id: "sardine-puff", name: "Sardine Puff", category: "Snacks", calories: 185, protein: 8, carbs: 18, fats: 10, sodium: 420, serving_size: "85g" },
      { id: "chicken-wing", name: "Chicken Wing", category: "Hot Snacks", calories: 198, protein: 14, carbs: 8, fats: 13, sodium: 480, serving_size: "90g" },
      { id: "spring-roll", name: "Spring Roll", category: "Snacks", calories: 145, protein: 4, carbs: 16, fats: 7, sodium: 320, serving_size: "70g" },
      { id: "sotong-head", name: "Sotong Head", category: "Hot Snacks", calories: 220, protein: 12, carbs: 18, fats: 12, sodium: 580, serving_size: "95g" }
    ]
  },
  {
    id: "cocichibanya-japan",
    name: "CoCo Ichibanya",
    country: "Japan",
    logo: "🍛",
    menuItems: [
      { id: "chicken-katsu-curry", name: "Chicken Katsu Curry (Regular)", category: "Curry", calories: 948, protein: 32, carbs: 128, fats: 32, sodium: 2240, serving_size: "580g" },
      { id: "pork-cutlet-curry", name: "Pork Cutlet Curry (Regular)", category: "Curry", calories: 1024, protein: 34, carbs: 132, fats: 38, sodium: 2380, serving_size: "600g" },
      { id: "beef-curry", name: "Beef Curry (Regular)", category: "Curry", calories: 876, protein: 28, carbs: 124, fats: 28, sodium: 2140, serving_size: "560g" },
      { id: "vegetable-curry", name: "Vegetable Curry (Regular)", category: "Curry", calories: 684, protein: 16, carbs: 118, fats: 16, sodium: 1840, serving_size: "520g" },
      { id: "seafood-curry", name: "Seafood Curry (Regular)", category: "Curry", calories: 824, protein: 26, carbs: 122, fats: 24, sodium: 2080, serving_size: "550g" },
      { id: "cheese-topping", name: "Cheese Topping", category: "Toppings", calories: 124, protein: 8, carbs: 2, fats: 10, sodium: 280, serving_size: "40g" }
    ]
  },
  // ========== AUSTRALIA & OTHER REGIONS ==========
  {
    id: "hungryjacks-australia",
    name: "Hungry Jack's",
    country: "Australia",
    logo: "👑",
    menuItems: [
      { id: "whopper-hj", name: "Whopper", category: "Burgers", calories: 628, protein: 28, carbs: 49, fats: 35, sodium: 980, serving_size: "290g" },
      { id: "aussie-burger", name: "Aussie Burger", category: "Burgers", calories: 742, protein: 32, carbs: 56, fats: 42, sodium: 1240, serving_size: "330g" },
      { id: "bacon-deluxe", name: "Bacon Deluxe", category: "Burgers", calories: 868, protein: 42, carbs: 54, fats: 52, sodium: 1580, serving_size: "370g" },
      { id: "grilled-chicken-burger", name: "Grilled Chicken Burger", category: "Chicken", calories: 512, protein: 34, carbs: 48, fats: 20, sodium: 1120, serving_size: "260g" },
      { id: "nuggets-10-hj", name: "Chicken Nuggets (10pc)", category: "Chicken", calories: 480, protein: 23, carbs: 30, fats: 29, sodium: 1180, serving_size: "150g" },
      { id: "fries-medium-hj", name: "Medium Fries", category: "Sides", calories: 356, protein: 4, carbs: 46, fats: 17, sodium: 520, serving_size: "125g" },
      { id: "onion-rings-hj", name: "Onion Rings", category: "Sides", calories: 420, protein: 5, carbs: 48, fats: 23, sodium: 740, serving_size: "125g" }
    ]
  },
  {
    id: "albaik-saudi",
    name: "Al Baik",
    country: "Saudi Arabia",
    logo: "🍗",
    menuItems: [
      { id: "chicken-meal-4pc", name: "Chicken Meal (4pc)", category: "Chicken", calories: 920, protein: 68, carbs: 48, fats: 48, sodium: 2240, serving_size: "420g" },
      { id: "chicken-fillet-sandwich", name: "Chicken Fillet Sandwich", category: "Sandwiches", calories: 480, protein: 28, carbs: 44, fats: 21, sodium: 1140, serving_size: "220g" },
      { id: "shrimp-meal", name: "Shrimp Meal (10pc)", category: "Seafood", calories: 548, protein: 32, carbs: 52, fats: 22, sodium: 1680, serving_size: "280g" },
      { id: "fish-fillet-meal", name: "Fish Fillet Meal", category: "Seafood", calories: 624, protein: 34, carbs: 58, fats: 26, sodium: 1540, serving_size: "320g" },
      { id: "nuggets-albaik-10", name: "Chicken Nuggets (10pc)", category: "Chicken", calories: 420, protein: 24, carbs: 28, fats: 24, sodium: 1080, serving_size: "160g" },
      { id: "garlic-sauce", name: "Garlic Sauce", category: "Sauces", calories: 180, protein: 1, carbs: 4, fats: 18, sodium: 240, serving_size: "50ml" }
    ]
  },
  {
    id: "steers-southafrica",
    name: "Steers",
    country: "South Africa",
    logo: "🍔",
    menuItems: [
      { id: "king-steer-burger", name: "King Steer Burger", category: "Burgers", calories: 742, protein: 38, carbs: 54, fats: 40, sodium: 1420, serving_size: "340g" },
      { id: "steers-burger", name: "Original Steers Burger", category: "Burgers", calories: 580, protein: 28, carbs: 46, fats: 30, sodium: 1080, serving_size: "280g" },
      { id: "cheese-burger-steers", name: "Cheese Burger", category: "Burgers", calories: 640, protein: 32, carbs: 48, fats: 34, sodium: 1240, serving_size: "300g" },
      { id: "chicken-schnitzel", name: "Chicken Schnitzel Burger", category: "Chicken", calories: 688, protein: 34, carbs: 56, fats: 34, sodium: 1380, serving_size: "320g" },
      { id: "chips-steers", name: "Chips (Regular)", category: "Sides", calories: 420, protein: 5, carbs: 56, fats: 19, sodium: 680, serving_size: "175g" },
      { id: "onion-rings-steers", name: "Onion Rings", category: "Sides", calories: 380, protein: 5, carbs: 44, fats: 20, sodium: 720, serving_size: "135g" }
    ]
  },
  // ========== TURKISH CUISINE (HALAL) ==========
  {
    id: "turkish-traditional",
    name: "Turkish Traditional",
    country: "Turkey",
    logo: "🇹🇷",
    cuisine: "Turkish",
    isHalal: true,
    menuItems: [
      { id: "doner-chicken", name: "Chicken Döner Kebab Wrap", category: "Kebabs", cuisine: "Turkish", isHalal: true, calories: 550, protein: 35, carbs: 45, fats: 22, sodium: 980, serving_size: "300g" },
      { id: "doner-beef", name: "Beef Döner Kebab Wrap", category: "Kebabs", cuisine: "Turkish", isHalal: true, calories: 620, protein: 32, carbs: 46, fats: 28, sodium: 1120, serving_size: "310g" },
      { id: "adana-kebab", name: "Adana Kebab with Rice", category: "Kebabs", cuisine: "Turkish", isHalal: true, calories: 685, protein: 38, carbs: 58, fats: 30, sodium: 1240, serving_size: "420g" },
      { id: "sis-kebab", name: "Şiş Kebab (Chicken)", category: "Kebabs", cuisine: "Turkish", isHalal: true, calories: 420, protein: 42, carbs: 12, fats: 22, sodium: 840, serving_size: "280g" },
      { id: "iskender-kebab", name: "İskender Kebab", category: "Kebabs", cuisine: "Turkish", isHalal: true, calories: 748, protein: 40, carbs: 52, fats: 38, sodium: 1680, serving_size: "480g" },
      { id: "lahmacun", name: "Lahmacun (Turkish Pizza)", category: "Flatbreads", cuisine: "Turkish", isHalal: true, calories: 285, protein: 14, carbs: 38, fats: 9, sodium: 680, serving_size: "160g" },
      { id: "pide-cheese", name: "Cheese Pide", category: "Flatbreads", cuisine: "Turkish", isHalal: true, calories: 520, protein: 22, carbs: 62, fats: 20, sodium: 1040, serving_size: "280g" },
      { id: "pide-meat", name: "Meat Pide", category: "Flatbreads", cuisine: "Turkish", isHalal: true, calories: 580, protein: 28, carbs: 64, fats: 22, sodium: 1180, serving_size: "300g" },
      { id: "borek-cheese", name: "Cheese Börek", category: "Pastries", cuisine: "Turkish", isHalal: true, calories: 340, protein: 14, carbs: 32, fats: 18, sodium: 720, serving_size: "150g" },
      { id: "gozleme-spinach", name: "Spinach Gözleme", category: "Flatbreads", cuisine: "Turkish", isHalal: true, calories: 380, protein: 16, carbs: 48, fats: 14, sodium: 840, serving_size: "220g" },
      { id: "menemen", name: "Menemen (Turkish Scrambled Eggs)", category: "Breakfast", cuisine: "Turkish", isHalal: true, calories: 285, protein: 16, carbs: 12, fats: 20, sodium: 680, serving_size: "240g" },
      { id: "turkish-breakfast", name: "Turkish Breakfast Plate", category: "Breakfast", cuisine: "Turkish", isHalal: true, calories: 680, protein: 28, carbs: 68, fats: 32, sodium: 1480, serving_size: "500g" },
      { id: "imam-bayildi", name: "İmam Bayıldı (Stuffed Eggplant)", category: "Main Dishes", cuisine: "Turkish", isHalal: true, calories: 320, protein: 8, carbs: 38, fats: 16, sodium: 720, serving_size: "350g" },
      { id: "karniyarik", name: "Karnıyarık (Meat Stuffed Eggplant)", category: "Main Dishes", cuisine: "Turkish", isHalal: true, calories: 485, protein: 24, carbs: 42, fats: 24, sodium: 980, serving_size: "400g" },
      { id: "dolma", name: "Dolma (Stuffed Grape Leaves)", category: "Appetizers", cuisine: "Turkish", isHalal: true, calories: 180, protein: 6, carbs: 28, fats: 6, sodium: 520, serving_size: "150g" },
      { id: "kofte", name: "Turkish Köfte (Meatballs)", category: "Main Dishes", cuisine: "Turkish", isHalal: true, calories: 420, protein: 32, carbs: 18, fats: 24, sodium: 880, serving_size: "250g" },
      { id: "manti", name: "Mantı (Turkish Dumplings)", category: "Main Dishes", cuisine: "Turkish", isHalal: true, calories: 540, protein: 22, carbs: 68, fats: 18, sodium: 1140, serving_size: "380g" },
      { id: "baklava", name: "Baklava (2 pieces)", category: "Desserts", cuisine: "Turkish", isHalal: true, calories: 340, protein: 5, carbs: 48, fats: 16, sodium: 180, serving_size: "100g" },
      { id: "kunefe", name: "Künefe", category: "Desserts", cuisine: "Turkish", isHalal: true, calories: 520, protein: 12, carbs: 68, fats: 22, sodium: 420, serving_size: "220g" },
      { id: "turkish-delight", name: "Turkish Delight (5 pieces)", category: "Sweets", cuisine: "Turkish", isHalal: true, calories: 285, protein: 1, carbs: 68, fats: 1, sodium: 45, serving_size: "100g" },
      { id: "ayran", name: "Ayran (Yogurt Drink)", category: "Drinks", cuisine: "Turkish", isHalal: true, calories: 68, protein: 4, carbs: 8, fats: 2, sodium: 180, serving_size: "250ml" },
      { id: "lentil-soup-turkish", name: "Turkish Lentil Soup", category: "Soups", cuisine: "Turkish", isHalal: true, calories: 185, protein: 10, carbs: 32, fats: 3, sodium: 840, serving_size: "350ml" }
    ]
  },
  // ========== ROMANIAN CUISINE ==========
  {
    id: "romanian-traditional",
    name: "Romanian Traditional",
    country: "Romania",
    logo: "🇷🇴",
    cuisine: "Romanian",
    menuItems: [
      { id: "sarmale", name: "Sarmale (Cabbage Rolls, 2 pieces)", category: "Main Dishes", cuisine: "Romanian", calories: 485, protein: 22, carbs: 42, fats: 24, sodium: 1180, serving_size: "320g" },
      { id: "mici", name: "Mici/Mititei (5 pieces)", category: "Grilled Meat", cuisine: "Romanian", calories: 520, protein: 28, carbs: 8, fats: 40, sodium: 1240, serving_size: "250g" },
      { id: "mamaliga", name: "Mămăligă with Cheese & Sour Cream", category: "Main Dishes", cuisine: "Romanian", calories: 420, protein: 16, carbs: 58, fats: 14, sodium: 680, serving_size: "350g" },
      { id: "ciorba-burta", name: "Ciorbă de Burtă (Tripe Soup)", category: "Soups", cuisine: "Romanian", calories: 285, protein: 18, carbs: 22, fats: 14, sodium: 1340, serving_size: "450ml" },
      { id: "ciorba-legume", name: "Ciorbă de Legume (Vegetable Soup)", category: "Soups", cuisine: "Romanian", calories: 168, protein: 6, carbs: 28, fats: 4, sodium: 980, serving_size: "400ml" },
      { id: "cozonac", name: "Cozonac (Romanian Sweet Bread, 1 slice)", category: "Desserts", cuisine: "Romanian", calories: 320, protein: 8, carbs: 48, fats: 12, sodium: 240, serving_size: "120g" },
      { id: "papanasi", name: "Papanași (Fried Doughnuts with Cheese)", category: "Desserts", cuisine: "Romanian", calories: 680, protein: 18, carbs: 82, fats: 32, sodium: 420, serving_size: "280g" },
      { id: "salata-boeuf", name: "Salată de Boeuf", category: "Salads", cuisine: "Romanian", calories: 385, protein: 14, carbs: 32, fats: 22, sodium: 1140, serving_size: "280g" },
      { id: "zacusca", name: "Zacuscă (Vegetable Spread, 100g)", category: "Spreads", cuisine: "Romanian", calories: 120, protein: 3, carbs: 18, fats: 4, sodium: 680, serving_size: "100g" },
      { id: "drob-miel", name: "Drob de Miel (Lamb Haggis)", category: "Main Dishes", cuisine: "Romanian", calories: 420, protein: 24, carbs: 18, fats: 28, sodium: 980, serving_size: "250g" },
      { id: "toba", name: "Tobă (Head Cheese)", category: "Cold Cuts", cuisine: "Romanian", calories: 285, protein: 18, carbs: 6, fats: 20, sodium: 1240, serving_size: "150g" },
      { id: "tochitura", name: "Tochitură Moldovenească", category: "Main Dishes", cuisine: "Romanian", calories: 620, protein: 32, carbs: 38, fats: 36, sodium: 1480, serving_size: "400g" }
    ]
  },
  // ========== GREEK CUISINE ==========
  {
    id: "greek-traditional",
    name: "Greek Traditional",
    country: "Greece",
    logo: "🇬🇷",
    cuisine: "Greek",
    menuItems: [
      { id: "gyros-pork", name: "Pork Gyros Wrap", category: "Wraps", cuisine: "Greek", calories: 580, protein: 32, carbs: 52, fats: 26, sodium: 1240, serving_size: "320g" },
      { id: "gyros-chicken", name: "Chicken Gyros Wrap", category: "Wraps", cuisine: "Greek", isHalal: true, calories: 520, protein: 36, carbs: 48, fats: 20, sodium: 1120, serving_size: "310g" },
      { id: "souvlaki-pork", name: "Pork Souvlaki (2 skewers)", category: "Grilled Meat", cuisine: "Greek", calories: 420, protein: 34, carbs: 12, fats: 26, sodium: 880, serving_size: "220g" },
      { id: "souvlaki-chicken", name: "Chicken Souvlaki (2 skewers)", category: "Grilled Meat", cuisine: "Greek", isHalal: true, calories: 380, protein: 38, carbs: 10, fats: 20, sodium: 780, serving_size: "210g" },
      { id: "moussaka", name: "Moussaka", category: "Main Dishes", cuisine: "Greek", calories: 520, protein: 24, carbs: 38, fats: 28, sodium: 1180, serving_size: "400g" },
      { id: "spanakopita", name: "Spanakopita (Spinach Pie)", category: "Pies", cuisine: "Greek", calories: 340, protein: 12, carbs: 32, fats: 18, sodium: 720, serving_size: "180g" },
      { id: "tiropita", name: "Tiropita (Cheese Pie)", category: "Pies", cuisine: "Greek", calories: 380, protein: 16, carbs: 34, fats: 20, sodium: 840, serving_size: "190g" },
      { id: "greek-salad", name: "Greek Salad (Horiatiki)", category: "Salads", cuisine: "Greek", calories: 285, protein: 8, carbs: 18, fats: 20, sodium: 1040, serving_size: "320g" },
      { id: "tzatziki", name: "Tzatziki (100g)", category: "Dips", cuisine: "Greek", calories: 95, protein: 4, carbs: 6, fats: 6, sodium: 320, serving_size: "100g" },
      { id: "dolmades", name: "Dolmades (Stuffed Grape Leaves, 4 pieces)", category: "Appetizers", cuisine: "Greek", calories: 185, protein: 6, carbs: 28, fats: 6, sodium: 540, serving_size: "160g" },
      { id: "pastitsio", name: "Pastitsio", category: "Main Dishes", cuisine: "Greek", calories: 620, protein: 28, carbs: 64, fats: 26, sodium: 1340, serving_size: "420g" },
      { id: "stifado", name: "Stifado (Beef Stew)", category: "Main Dishes", cuisine: "Greek", calories: 485, protein: 32, carbs: 38, fats: 22, sodium: 1180, serving_size: "450g" },
      { id: "baklava-greek", name: "Greek Baklava (2 pieces)", category: "Desserts", cuisine: "Greek", calories: 340, protein: 5, carbs: 48, fats: 16, sodium: 180, serving_size: "100g" },
      { id: "galaktoboureko", name: "Galaktoboureko", category: "Desserts", cuisine: "Greek", calories: 420, protein: 8, carbs: 58, fats: 18, sodium: 280, serving_size: "180g" }
    ]
  },
  // ========== LEBANESE & MIDDLE EASTERN (HALAL) ==========
  {
    id: "lebanese-middle-eastern",
    name: "Lebanese & Middle Eastern",
    country: "Lebanon",
    logo: "🇱🇧",
    cuisine: "Lebanese",
    isHalal: true,
    menuItems: [
      { id: "shawarma-chicken", name: "Chicken Shawarma Wrap", category: "Wraps", cuisine: "Lebanese", isHalal: true, calories: 520, protein: 34, carbs: 48, fats: 20, sodium: 1140, serving_size: "310g" },
      { id: "shawarma-beef", name: "Beef Shawarma Wrap", category: "Wraps", cuisine: "Lebanese", isHalal: true, calories: 580, protein: 30, carbs: 50, fats: 26, sodium: 1280, serving_size: "320g" },
      { id: "shawarma-lamb", name: "Lamb Shawarma Wrap", category: "Wraps", cuisine: "Lebanese", isHalal: true, calories: 620, protein: 32, carbs: 48, fats: 30, sodium: 1240, serving_size: "330g" },
      { id: "falafel-wrap", name: "Falafel Wrap", category: "Wraps", cuisine: "Lebanese", isHalal: true, calories: 420, protein: 14, carbs: 58, fats: 14, sodium: 880, serving_size: "280g" },
      { id: "falafel-balls", name: "Falafel Balls (6 pieces)", category: "Appetizers", cuisine: "Lebanese", isHalal: true, calories: 320, protein: 12, carbs: 38, fats: 14, sodium: 680, serving_size: "180g" },
      { id: "hummus", name: "Hummus (200g)", category: "Dips", cuisine: "Lebanese", isHalal: true, calories: 340, protein: 12, carbs: 32, fats: 18, sodium: 640, serving_size: "200g" },
      { id: "baba-ghanoush", name: "Baba Ghanoush (200g)", category: "Dips", cuisine: "Lebanese", isHalal: true, calories: 280, protein: 8, carbs: 24, fats: 18, sodium: 520, serving_size: "200g" },
      { id: "tabbouleh", name: "Tabbouleh Salad", category: "Salads", cuisine: "Lebanese", isHalal: true, calories: 185, protein: 4, carbs: 28, fats: 7, sodium: 480, serving_size: "220g" },
      { id: "fattoush", name: "Fattoush Salad", category: "Salads", cuisine: "Lebanese", isHalal: true, calories: 220, protein: 5, carbs: 32, fats: 9, sodium: 620, serving_size: "260g" },
      { id: "kibbeh", name: "Kibbeh (3 pieces)", category: "Appetizers", cuisine: "Lebanese", isHalal: true, calories: 385, protein: 18, carbs: 32, fats: 20, sodium: 780, serving_size: "210g" },
      { id: "manakish-zaatar", name: "Manakish with Za'atar", category: "Flatbreads", cuisine: "Lebanese", isHalal: true, calories: 320, protein: 8, carbs: 52, fats: 10, sodium: 680, serving_size: "200g" },
      { id: "manakish-cheese", name: "Manakish with Cheese", category: "Flatbreads", cuisine: "Lebanese", isHalal: true, calories: 420, protein: 16, carbs: 48, fats: 18, sodium: 840, serving_size: "220g" },
      { id: "fatayer-spinach", name: "Fatayer (Spinach, 3 pieces)", category: "Pastries", cuisine: "Lebanese", isHalal: true, calories: 340, protein: 10, carbs: 48, fats: 12, sodium: 680, serving_size: "210g" },
      { id: "fatayer-meat", name: "Fatayer (Meat, 3 pieces)", category: "Pastries", cuisine: "Lebanese", isHalal: true, calories: 420, protein: 18, carbs: 46, fats: 18, sodium: 840, serving_size: "230g" },
      { id: "shish-tawook", name: "Shish Tawook (2 skewers)", category: "Grilled Meat", cuisine: "Lebanese", isHalal: true, calories: 380, protein: 42, carbs: 8, fats: 20, sodium: 920, serving_size: "260g" },
      { id: "kafta-kebab", name: "Kafta Kebab (2 skewers)", category: "Grilled Meat", cuisine: "Lebanese", isHalal: true, calories: 420, protein: 32, carbs: 12, fats: 28, sodium: 1040, serving_size: "240g" },
      { id: "mixed-grill-lebanese", name: "Mixed Grill Platter", category: "Main Dishes", cuisine: "Lebanese", isHalal: true, calories: 748, protein: 58, carbs: 32, fats: 42, sodium: 1680, serving_size: "480g" },
      { id: "kunafa-lebanese", name: "Kunafa", category: "Desserts", cuisine: "Lebanese", isHalal: true, calories: 520, protein: 10, carbs: 68, fats: 24, sodium: 380, serving_size: "220g" },
      { id: "maamoul", name: "Ma'amoul (3 pieces)", category: "Sweets", cuisine: "Lebanese", isHalal: true, calories: 320, protein: 5, carbs: 48, fats: 12, sodium: 180, serving_size: "120g" },
      { id: "baklava-lebanese", name: "Lebanese Baklava (2 pieces)", category: "Desserts", cuisine: "Lebanese", isHalal: true, calories: 340, protein: 5, carbs: 48, fats: 16, sodium: 180, serving_size: "100g" }
    ]
  },
  // ========== SERBIAN & BOSNIAN CUISINE ==========
  {
    id: "serbian-bosnian",
    name: "Serbian & Bosnian",
    country: "Serbia/Bosnia",
    logo: "🇷🇸",
    cuisine: "Balkan",
    menuItems: [
      { id: "cevapi", name: "Ćevapi (10 pieces with Lepinja)", category: "Grilled Meat", cuisine: "Balkan", isHalal: true, calories: 620, protein: 38, carbs: 42, fats: 32, sodium: 1340, serving_size: "350g" },
      { id: "pljeskavica", name: "Pljeskavica with Lepinja", category: "Burgers", cuisine: "Balkan", isHalal: true, calories: 680, protein: 36, carbs: 44, fats: 38, sodium: 1280, serving_size: "380g" },
      { id: "raznjici", name: "Ražnjići (2 skewers)", category: "Grilled Meat", cuisine: "Balkan", calories: 520, protein: 42, carbs: 8, fats: 36, sodium: 980, serving_size: "280g" },
      { id: "burek-meat", name: "Burek with Meat (1 piece)", category: "Pastries", cuisine: "Balkan", isHalal: true, calories: 485, protein: 20, carbs: 52, fats: 22, sodium: 1040, serving_size: "280g" },
      { id: "burek-cheese", name: "Burek with Cheese (1 piece)", category: "Pastries", cuisine: "Balkan", calories: 520, protein: 18, carbs: 56, fats: 24, sodium: 980, serving_size: "290g" },
      { id: "burek-spinach", name: "Burek with Spinach (1 piece)", category: "Pastries", cuisine: "Balkan", calories: 420, protein: 14, carbs: 54, fats: 18, sodium: 840, serving_size: "270g" },
      { id: "begova-corba", name: "Begova Čorba (Bey's Soup)", category: "Soups", cuisine: "Balkan", isHalal: true, calories: 285, protein: 18, carbs: 24, fats: 14, sodium: 1180, serving_size: "400ml" },
      { id: "ajvar", name: "Ajvar (Red Pepper Spread, 100g)", category: "Spreads", cuisine: "Balkan", calories: 85, protein: 2, carbs: 14, fats: 3, sodium: 480, serving_size: "100g" },
      { id: "kajmak", name: "Kajmak (Dairy Spread, 50g)", category: "Spreads", cuisine: "Balkan", calories: 185, protein: 4, carbs: 2, fats: 18, sodium: 240, serving_size: "50g" },
      { id: "shopska-salad", name: "Shopska Salad", category: "Salads", cuisine: "Balkan", calories: 220, protein: 8, carbs: 16, fats: 14, sodium: 780, serving_size: "280g" },
      { id: "tufahije", name: "Tufahije (Stuffed Apples)", category: "Desserts", cuisine: "Balkan", calories: 320, protein: 4, carbs: 58, fats: 8, sodium: 120, serving_size: "220g" }
    ]
  },
  // ========== PAKISTANI & INDIAN HALAL ==========
  {
    id: "pakistani-indian-halal",
    name: "Pakistani & Indian Halal",
    country: "Pakistan/India",
    logo: "🇵🇰",
    cuisine: "South Asian",
    isHalal: true,
    menuItems: [
      { id: "chicken-biryani", name: "Chicken Biryani", category: "Rice Dishes", cuisine: "South Asian", isHalal: true, calories: 685, protein: 32, carbs: 88, fats: 22, sodium: 1540, serving_size: "450g" },
      { id: "mutton-biryani", name: "Mutton Biryani", category: "Rice Dishes", cuisine: "South Asian", isHalal: true, calories: 748, protein: 34, carbs: 86, fats: 28, sodium: 1620, serving_size: "470g" },
      { id: "nihari", name: "Nihari (Beef Stew)", category: "Main Dishes", cuisine: "South Asian", isHalal: true, calories: 520, protein: 38, carbs: 28, fats: 28, sodium: 1680, serving_size: "420g" },
      { id: "haleem", name: "Haleem", category: "Main Dishes", cuisine: "South Asian", isHalal: true, calories: 485, protein: 32, carbs: 48, fats: 18, sodium: 1420, serving_size: "400g" },
      { id: "chicken-karahi", name: "Chicken Karahi", category: "Curries", cuisine: "South Asian", isHalal: true, calories: 520, protein: 42, carbs: 18, fats: 32, sodium: 1340, serving_size: "380g" },
      { id: "mutton-karahi", name: "Mutton Karahi", category: "Curries", cuisine: "South Asian", isHalal: true, calories: 620, protein: 38, carbs: 16, fats: 42, sodium: 1480, serving_size: "400g" },
      { id: "chicken-korma", name: "Chicken Korma", category: "Curries", cuisine: "South Asian", isHalal: true, calories: 485, protein: 36, carbs: 22, fats: 28, sodium: 1240, serving_size: "380g" },
      { id: "seekh-kebab", name: "Seekh Kebab (2 skewers)", category: "Grilled Meat", cuisine: "South Asian", isHalal: true, calories: 420, protein: 32, carbs: 12, fats: 28, sodium: 980, serving_size: "240g" },
      { id: "chapli-kebab", name: "Chapli Kebab (2 pieces)", category: "Grilled Meat", cuisine: "South Asian", isHalal: true, calories: 520, protein: 28, carbs: 24, fats: 34, sodium: 1140, serving_size: "280g" },
      { id: "butter-chicken-halal", name: "Butter Chicken (Halal)", category: "Curries", cuisine: "South Asian", isHalal: true, calories: 485, protein: 38, carbs: 24, fats: 28, sodium: 1180, serving_size: "380g" },
      { id: "rogan-josh", name: "Rogan Josh", category: "Curries", cuisine: "South Asian", isHalal: true, calories: 520, protein: 36, carbs: 20, fats: 32, sodium: 1340, serving_size: "400g" },
      { id: "tikka-masala", name: "Chicken Tikka Masala", category: "Curries", cuisine: "South Asian", isHalal: true, calories: 485, protein: 40, carbs: 22, fats: 26, sodium: 1280, serving_size: "380g" },
      { id: "samosa-veg", name: "Vegetable Samosa (2 pieces)", category: "Snacks", cuisine: "South Asian", isHalal: true, calories: 285, protein: 6, carbs: 38, fats: 12, sodium: 680, serving_size: "160g" },
      { id: "samosa-meat", name: "Meat Samosa (2 pieces)", category: "Snacks", cuisine: "South Asian", isHalal: true, calories: 340, protein: 12, carbs: 36, fats: 16, sodium: 780, serving_size: "170g" },
      { id: "pakora", name: "Mixed Pakora", category: "Snacks", cuisine: "South Asian", isHalal: true, calories: 320, protein: 8, carbs: 38, fats: 16, sodium: 720, serving_size: "180g" },
      { id: "chana-masala", name: "Chana Masala", category: "Vegetarian", cuisine: "South Asian", isHalal: true, calories: 285, protein: 14, carbs: 42, fats: 8, sodium: 980, serving_size: "320g" },
      { id: "daal-tadka", name: "Daal Tadka", category: "Vegetarian", cuisine: "South Asian", isHalal: true, calories: 220, protein: 12, carbs: 32, fats: 6, sodium: 840, serving_size: "300g" },
      { id: "naan-plain", name: "Plain Naan", category: "Bread", cuisine: "South Asian", isHalal: true, calories: 285, protein: 8, carbs: 52, fats: 5, sodium: 520, serving_size: "120g" },
      { id: "naan-garlic", name: "Garlic Naan", category: "Bread", cuisine: "South Asian", isHalal: true, calories: 320, protein: 9, carbs: 54, fats: 8, sodium: 620, serving_size: "130g" },
      { id: "gulab-jamun", name: "Gulab Jamun (2 pieces)", category: "Desserts", cuisine: "South Asian", isHalal: true, calories: 320, protein: 4, carbs: 58, fats: 8, sodium: 120, serving_size: "110g" },
      { id: "ras-malai", name: "Ras Malai (2 pieces)", category: "Desserts", cuisine: "South Asian", isHalal: true, calories: 285, protein: 8, carbs: 48, fats: 8, sodium: 140, serving_size: "140g" },
      { id: "kheer", name: "Kheer (Rice Pudding)", category: "Desserts", cuisine: "South Asian", isHalal: true, calories: 240, protein: 6, carbs: 42, fats: 6, sodium: 85, serving_size: "200g" }
    ]
  },
  // ========== EGYPTIAN & NORTH AFRICAN (HALAL) ==========
  {
    id: "egyptian-north-african",
    name: "Egyptian & North African",
    country: "Egypt",
    logo: "🇪🇬",
    cuisine: "Egyptian",
    isHalal: true,
    menuItems: [
      { id: "koshari", name: "Koshari", category: "Main Dishes", cuisine: "Egyptian", isHalal: true, calories: 520, protein: 18, carbs: 88, fats: 12, sodium: 1180, serving_size: "450g" },
      { id: "ful-medames", name: "Ful Medames", category: "Breakfast", cuisine: "Egyptian", isHalal: true, calories: 285, protein: 14, carbs: 42, fats: 8, sodium: 840, serving_size: "320g" },
      { id: "taameya", name: "Ta'ameya (Egyptian Falafel, 5 pieces)", category: "Snacks", cuisine: "Egyptian", isHalal: true, calories: 320, protein: 12, carbs: 38, fats: 14, sodium: 680, serving_size: "180g" },
      { id: "shawarma-egyptian", name: "Egyptian Shawarma", category: "Wraps", cuisine: "Egyptian", isHalal: true, calories: 520, protein: 34, carbs: 48, fats: 20, sodium: 1140, serving_size: "310g" },
      { id: "hawawshi", name: "Hawawshi (Stuffed Pita)", category: "Main Dishes", cuisine: "Egyptian", isHalal: true, calories: 485, protein: 24, carbs: 52, fats: 20, sodium: 1080, serving_size: "300g" },
      { id: "mahshi", name: "Mahshi (Stuffed Vegetables)", category: "Main Dishes", cuisine: "Egyptian", isHalal: true, calories: 385, protein: 12, carbs: 58, fats: 12, sodium: 920, serving_size: "380g" },
      { id: "molokhia", name: "Molokhia with Rice", category: "Main Dishes", cuisine: "Egyptian", isHalal: true, calories: 420, protein: 18, carbs: 68, fats: 10, sodium: 1240, serving_size: "450g" },
      { id: "basbousa", name: "Basbousa (Semolina Cake)", category: "Desserts", cuisine: "Egyptian", isHalal: true, calories: 340, protein: 5, carbs: 58, fats: 10, sodium: 180, serving_size: "150g" },
      { id: "umm-ali", name: "Umm Ali (Bread Pudding)", category: "Desserts", cuisine: "Egyptian", isHalal: true, calories: 420, protein: 10, carbs: 58, fats: 16, sodium: 240, serving_size: "220g" },
      { id: "couscous-lamb", name: "Couscous with Lamb", category: "Main Dishes", cuisine: "North African", isHalal: true, calories: 620, protein: 32, carbs: 78, fats: 20, sodium: 1380, serving_size: "480g" },
      { id: "tagine-chicken", name: "Chicken Tagine", category: "Main Dishes", cuisine: "North African", isHalal: true, calories: 485, protein: 36, carbs: 42, fats: 18, sodium: 1180, serving_size: "420g" }
    ]
  },
  // ========== PERSIAN/IRANIAN (HALAL) ==========
  {
    id: "persian-iranian",
    name: "Persian Cuisine",
    country: "Iran",
    logo: "🇮🇷",
    cuisine: "Persian",
    isHalal: true,
    menuItems: [
      { id: "koobideh-kebab", name: "Koobideh Kebab (2 skewers with Rice)", category: "Kebabs", cuisine: "Persian", isHalal: true, calories: 685, protein: 38, carbs: 72, fats: 26, sodium: 1240, serving_size: "480g" },
      { id: "joojeh-kebab", name: "Joojeh Kebab (Chicken)", category: "Kebabs", cuisine: "Persian", isHalal: true, calories: 520, protein: 48, carbs: 38, fats: 18, sodium: 1080, serving_size: "400g" },
      { id: "barg-kebab", name: "Barg Kebab (Lamb)", category: "Kebabs", cuisine: "Persian", isHalal: true, calories: 620, protein: 42, carbs: 36, fats: 30, sodium: 1180, serving_size: "420g" },
      { id: "ghormeh-sabzi", name: "Ghormeh Sabzi with Rice", category: "Stews", cuisine: "Persian", isHalal: true, calories: 485, protein: 28, carbs: 58, fats: 16, sodium: 1340, serving_size: "450g" },
      { id: "fesenjan", name: "Fesenjan (Pomegranate Walnut Stew)", category: "Stews", cuisine: "Persian", isHalal: true, calories: 520, protein: 32, carbs: 42, fats: 24, sodium: 1140, serving_size: "420g" },
      { id: "tahdig", name: "Tahdig (Crispy Rice)", category: "Sides", cuisine: "Persian", isHalal: true, calories: 320, protein: 6, carbs: 58, fats: 8, sodium: 420, serving_size: "200g" },
      { id: "zereshk-polo", name: "Zereshk Polo with Chicken", category: "Rice Dishes", cuisine: "Persian", isHalal: true, calories: 620, protein: 38, carbs: 82, fats: 16, sodium: 1240, serving_size: "480g" },
      { id: "ash-reshteh", name: "Ash Reshteh (Noodle Soup)", category: "Soups", cuisine: "Persian", isHalal: true, calories: 320, protein: 14, carbs: 48, fats: 9, sodium: 1180, serving_size: "420ml" },
      { id: "baghali-polo", name: "Baghali Polo (Dill Rice with Lamb)", category: "Rice Dishes", cuisine: "Persian", isHalal: true, calories: 685, protein: 34, carbs: 88, fats: 22, sodium: 1380, serving_size: "500g" },
      { id: "shirazi-salad", name: "Shirazi Salad", category: "Salads", cuisine: "Persian", isHalal: true, calories: 120, protein: 3, carbs: 18, fats: 5, sodium: 420, serving_size: "220g" }
    ]
  },
  // ========== MOROCCAN (HALAL) ==========
  {
    id: "moroccan-cuisine",
    name: "Moroccan Cuisine",
    country: "Morocco",
    logo: "🇲🇦",
    cuisine: "Moroccan",
    isHalal: true,
    menuItems: [
      { id: "chicken-tagine", name: "Chicken Tagine with Vegetables", category: "Tagines", cuisine: "Moroccan", isHalal: true, calories: 485, protein: 36, carbs: 42, fats: 18, sodium: 1180, serving_size: "420g" },
      { id: "lamb-tagine", name: "Lamb Tagine with Prunes", category: "Tagines", cuisine: "Moroccan", isHalal: true, calories: 620, protein: 38, carbs: 58, fats: 24, sodium: 1340, serving_size: "480g" },
      { id: "beef-tagine", name: "Beef Tagine with Vegetables", category: "Tagines", cuisine: "Moroccan", isHalal: true, calories: 520, protein: 34, carbs: 48, fats: 20, sodium: 1240, serving_size: "450g" },
      { id: "couscous-lamb-moroccan", name: "Moroccan Couscous with Lamb", category: "Main Dishes", cuisine: "Moroccan", isHalal: true, calories: 685, protein: 36, carbs: 88, fats: 22, sodium: 1480, serving_size: "520g" },
      { id: "couscous-chicken", name: "Couscous with Chicken & Vegetables", category: "Main Dishes", cuisine: "Moroccan", isHalal: true, calories: 585, protein: 32, carbs: 82, fats: 16, sodium: 1280, serving_size: "480g" },
      { id: "harira-soup", name: "Harira (Moroccan Soup)", category: "Soups", cuisine: "Moroccan", isHalal: true, calories: 285, protein: 14, carbs: 42, fats: 8, sodium: 1140, serving_size: "400ml" },
      { id: "bastilla", name: "Bastilla (Chicken Pie)", category: "Pastries", cuisine: "Moroccan", isHalal: true, calories: 520, protein: 24, carbs: 58, fats: 22, sodium: 980, serving_size: "280g" },
      { id: "moroccan-mint-tea", name: "Moroccan Mint Tea", category: "Drinks", cuisine: "Moroccan", isHalal: true, calories: 85, protein: 0, carbs: 22, fats: 0, sodium: 8, serving_size: "250ml" }
    ]
  }
];
function searchRestaurants(query) {
  if (!query) return restaurantDatabase;
  const lowerQuery = query.toLowerCase();
  return restaurantDatabase.filter(
    (restaurant) => restaurant.name.toLowerCase().includes(lowerQuery)
  );
}
function searchMenuItems(query, restaurantId = null, filters = {}) {
  let restaurants = restaurantId ? restaurantDatabase.filter((r) => r.id === restaurantId) : restaurantDatabase;
  const lowerQuery = query?.toLowerCase() || "";
  const results = [];
  restaurants.forEach((restaurant) => {
    let matchingItems = restaurant.menuItems.filter((item) => {
      const matchesText = !query || item.name.toLowerCase().includes(lowerQuery) || item.category.toLowerCase().includes(lowerQuery) || item.cuisine && item.cuisine.toLowerCase().includes(lowerQuery);
      const matchesHalal = !filters.halalOnly || item.isHalal === true;
      const matchesCuisine = !filters.cuisine || item.cuisine === filters.cuisine || restaurant.cuisine === filters.cuisine;
      return matchesText && matchesHalal && matchesCuisine;
    });
    matchingItems.forEach((item) => {
      results.push({
        ...item,
        restaurantName: restaurant.name,
        restaurantId: restaurant.id,
        restaurantLogo: restaurant.logo,
        restaurantCuisine: restaurant.cuisine,
        restaurantIsHalal: restaurant.isHalal
      });
    });
  });
  return results;
}
function getRestaurantById(restaurantId) {
  return restaurantDatabase.find((r) => r.id === restaurantId);
}
function getAllCategories() {
  const categories = /* @__PURE__ */ new Set();
  restaurantDatabase.forEach((restaurant) => {
    restaurant.menuItems.forEach((item) => {
      categories.add(item.category);
    });
  });
  return Array.from(categories).sort();
}
class RestaurantService {
  constructor() {
    this.restaurants = restaurantDatabase;
  }
  /**
   * Search restaurants by name
   */
  searchRestaurants(query) {
    return searchRestaurants(query);
  }
  /**
   * Search menu items across all restaurants
   */
  searchMenuItems(query, restaurantId = null, filters = {}) {
    return searchMenuItems(query, restaurantId, filters);
  }
  /**
   * Get all halal items
   */
  getHalalItems(query = "") {
    return this.searchMenuItems(query, null, { halalOnly: true });
  }
  /**
   * Get items by cuisine type
   */
  getItemsByCuisine(cuisine, query = "") {
    return this.searchMenuItems(query, null, { cuisine });
  }
  /**
   * Get all available cuisines
   */
  getAllCuisines() {
    const cuisines = /* @__PURE__ */ new Set();
    this.restaurants.forEach((restaurant) => {
      if (restaurant.cuisine) {
        cuisines.add(restaurant.cuisine);
      }
      restaurant.menuItems.forEach((item) => {
        if (item.cuisine) {
          cuisines.add(item.cuisine);
        }
      });
    });
    return Array.from(cuisines).sort();
  }
  /**
   * Get restaurant by ID
   */
  getRestaurant(restaurantId) {
    return getRestaurantById(restaurantId);
  }
  /**
   * Get all restaurants
   */
  getAllRestaurants() {
    return this.restaurants;
  }
  /**
   * Get all menu categories
   */
  getCategories() {
    return getAllCategories();
  }
  /**
   * Get menu items by category
   */
  getItemsByCategory(category, restaurantId = null) {
    let restaurants = restaurantId ? this.restaurants.filter((r) => r.id === restaurantId) : this.restaurants;
    const results = [];
    restaurants.forEach((restaurant) => {
      const matchingItems = restaurant.menuItems.filter(
        (item) => item.category === category
      );
      matchingItems.forEach((item) => {
        results.push({
          ...item,
          restaurantName: restaurant.name,
          restaurantId: restaurant.id,
          restaurantLogo: restaurant.logo
        });
      });
    });
    return results;
  }
  /**
   * Get specific menu item
   */
  getMenuItem(restaurantId, itemId) {
    const restaurant = this.getRestaurant(restaurantId);
    if (!restaurant) return null;
    return restaurant.menuItems.find((item) => item.id === itemId);
  }
  /**
   * Get popular items (most common across restaurants)
   */
  getPopularItems(limit = 20) {
    const allItems = [];
    this.restaurants.forEach((restaurant) => {
      restaurant.menuItems.forEach((item) => {
        allItems.push({
          ...item,
          restaurantName: restaurant.name,
          restaurantId: restaurant.id,
          restaurantLogo: restaurant.logo
        });
      });
    });
    const popularCategories = ["Burgers", "Chicken", "Pizza", "Sandwiches", "Ramen"];
    const popularItems = allItems.filter(
      (item) => popularCategories.includes(item.category)
    );
    return popularItems.slice(0, limit);
  }
  /**
   * Get low calorie options
   */
  getLowCalorieOptions(maxCalories = 400) {
    const allItems = [];
    this.restaurants.forEach((restaurant) => {
      restaurant.menuItems.forEach((item) => {
        if (item.calories <= maxCalories) {
          allItems.push({
            ...item,
            restaurantName: restaurant.name,
            restaurantId: restaurant.id,
            restaurantLogo: restaurant.logo
          });
        }
      });
    });
    return allItems.sort((a, b) => a.calories - b.calories);
  }
  /**
   * Get high protein options
   */
  getHighProteinOptions(minProtein = 20) {
    const allItems = [];
    this.restaurants.forEach((restaurant) => {
      restaurant.menuItems.forEach((item) => {
        if (item.protein >= minProtein) {
          allItems.push({
            ...item,
            restaurantName: restaurant.name,
            restaurantId: restaurant.id,
            restaurantLogo: restaurant.logo
          });
        }
      });
    });
    return allItems.sort((a, b) => b.protein - a.protein);
  }
  /**
   * Format menu item for food logging
   */
  formatForLogging(restaurantId, itemId, quantity = 1) {
    const restaurant = this.getRestaurant(restaurantId);
    if (!restaurant) return null;
    const item = restaurant.menuItems.find((i) => i.id === itemId);
    if (!item) return null;
    return {
      name: `${item.name} (${restaurant.name})`,
      calories: Math.round(item.calories * quantity),
      protein: Math.round(item.protein * quantity * 10) / 10,
      carbs: Math.round(item.carbs * quantity * 10) / 10,
      fats: Math.round(item.fats * quantity * 10) / 10,
      serving_size: item.serving_size,
      quantity,
      source: "restaurant",
      restaurant: restaurant.name,
      restaurantId,
      itemId,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    };
  }
}
const restaurantService = new RestaurantService();
export {
  restaurantService as default,
  restaurantService
};
