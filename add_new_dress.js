const fs = require('fs');
const productsFile = '/Users/thegrower/.openclaw/workspace/Jengerluxurious/data/products.ts';
let content = fs.readFileSync(productsFile, 'utf8');

const newItem = `
  {
    id: "item_048",
    name: "Black Bralette Lace Crochet Crop Top Spaghetti Strap",
    price: 35.00, // Guessing price, user can update
    image: "/item_new_black_lace_bralette.jpg",
    category: "Going Out",
    sizes: ["XS"],
    description: "Intricate black lace crochet bralette crop top. Perfect for layering or wearing out.",
    condition: "EXCELLENT"
  }
];
`;

content = content.replace('];', newItem);
fs.writeFileSync(productsFile, content);
console.log("Added new black bralette.");
