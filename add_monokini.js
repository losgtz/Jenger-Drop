const fs = require('fs');
const productsFile = '/Users/thegrower/.openclaw/workspace/Jengerluxurious/data/products.ts';
let content = fs.readFileSync(productsFile, 'utf8');

const newItem = `
  {
    id: "item_051",
    name: "Tropical Floral & Zebra Monokini",
    price: 45.00, // Guessing price
    image: "/item_new_monokini_floral.jpg",
    images: [
      "/item_new_monokini_floral.jpg",
      "/item_new_details/monokini_floral_back.jpg"
    ],
    category: "Rush/Event",
    sizes: ["S"], // Guessing size
    description: "Vibrant tropical floral and zebra print monokini swimsuit with brown rectangular rings.",
    condition: "EXCELLENT"
  }
];
`;

content = content.replace('];', newItem);
fs.writeFileSync(productsFile, content);
console.log("Added new monokini.");
