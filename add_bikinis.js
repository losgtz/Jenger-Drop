const fs = require('fs');
const productsFile = '/Users/thegrower/.openclaw/workspace/Jengerluxurious/data/products.ts';
let content = fs.readFileSync(productsFile, 'utf8');

const newItems = `
  {
    id: "item_049",
    name: "Black Shimmer Chain-Link Bikini Set",
    price: 45.00, // Guessing price
    image: "/item_new_black_bikini.jpg",
    images: [
      "/item_new_black_bikini.jpg",
      "/item_new_details/black_bikini_top.jpg",
      "/item_new_details/black_bikini_bottoms.jpg",
      "/item_new_details/black_bikini_bottoms_back.jpg"
    ],
    category: "Rush/Event",
    sizes: ["S"], // Guessing size
    description: "Black shimmer bikini set with gold and silver chain-link hip details. Perfect for pool parties.",
    condition: "EXCELLENT"
  },
  {
    id: "item_050",
    name: "SKYE Blue/Pink Striped Bandeau Bikini Set",
    price: 40.00, // Guessing price
    image: "/item_new_skye_bikini.jpg",
    images: [
      "/item_new_skye_bikini.jpg",
      "/item_new_details/skye_top.jpg",
      "/item_new_details/skye_bottoms.jpg",
      "/item_new_details/skye_bottoms_back.jpg"
    ],
    category: "Rush/Event",
    sizes: ["S"], // Guessing size
    description: "Vibrant blue and pink striped bandeau bikini set by SKYE with side-tie bottoms.",
    condition: "EXCELLENT"
  }
];
`;

content = content.replace('];', newItems);
fs.writeFileSync(productsFile, content);
console.log("Added new bikinis.");
