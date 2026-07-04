const fs = require('fs');

const productsFile = '/Users/thegrower/.openclaw/workspace/Jengerluxurious/data/products.ts';
let content = fs.readFileSync(productsFile, 'utf8');

const emergencyItems = `
  // --- E. EMERGENCY / JENGER DROP SUPPLIES ---
  {
    id: "item_031",
    name: "Double-Sided Fashion Tape (Boob Tape)",
    price: 12.00,
    image: "/boob_tape---e15735e4-761e-4a45-9035-2c0848b33538.jpg",
    category: "Emergency",
    sizes: ["OS"],
    description: "High-quality, sweat-resistant fashion tape for plunging necklines and backless dresses. Essential.",
    condition: "NEW"
  },
  {
    id: "item_032",
    name: "Clear Stadium-Approved Crossbody",
    price: 25.00,
    image: "/clear_purse---9254c583-bd95-4c48-89d5-840f19894ece.jpg",
    category: "Game Day Essentials",
    sizes: ["OS"],
    description: "Chic clear PVC stadium bag with gold hardware. Meets SEC stadium requirements.",
    condition: "NEW"
  },
  {
    id: "item_033",
    name: "Fast-Charging iPhone Cable & Block",
    price: 18.00,
    image: "/phone_charger---51e11673-53f6-4e3d-9938-feb9e8325f41.jpg",
    category: "Emergency",
    sizes: ["OS"],
    description: "Sleek braided charging cable with fast-charging wall adapter. Dead phone emergency fix.",
    condition: "NEW"
  },
  {
    id: "item_034",
    name: "The 'Morning After' Hangover Kit",
    price: 15.00,
    image: "/hangover_kit---b6bc0aa0-2285-4c63-999f-2218122db4a3.jpg",
    category: "Emergency",
    sizes: ["OS"],
    description: "Aesthetic recovery pouch featuring Advil, Liquid IV, and mints. A lifesaver.",
    condition: "NEW"
  }
];
`;

content = content.replace('];', emergencyItems);
fs.writeFileSync(productsFile, content);
console.log("Emergency items added to products.ts");
