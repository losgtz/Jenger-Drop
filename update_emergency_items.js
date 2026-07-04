const fs = require('fs');

const productsFile = '/Users/thegrower/.openclaw/workspace/Jengerluxurious/data/products.ts';
let content = fs.readFileSync(productsFile, 'utf8');

// Remove the old emergency items block we just added (if it exists)
content = content.replace(/\/\/ --- E\. EMERGENCY \/ JENGER DROP SUPPLIES ---[\s\S]*?\];/, '];');

const newEmergencyItems = `
  // --- E. FASHION FIX ---
  {
    id: "item_031", name: "Fashion tape", price: 9.00, image: "/boob_tape---e15735e4-761e-4a45-9035-2c0848b33538.jpg", category: "Fashion Fix", sizes: ["OS"], description: "High-quality, sweat-resistant fashion tape.", condition: "NEW"
  },
  {
    id: "item_032", name: "Pasties", price: 9.00, image: "/placeholder.jpg", category: "Fashion Fix", sizes: ["OS"], description: "Seamless silicone pasties.", condition: "NEW"
  },
  {
    id: "item_033", name: "Mini sewing kit", price: 7.00, image: "/placeholder.jpg", category: "Fashion Fix", sizes: ["OS"], description: "Emergency repair kit.", condition: "NEW"
  },
  {
    id: "item_034", name: "Safety pins pack", price: 5.00, image: "/placeholder.jpg", category: "Fashion Fix", sizes: ["OS"], description: "Assorted sizes.", condition: "NEW"
  },

  // --- F. BEAUTY FIX ---
  {
    id: "item_035", name: "Lash glue", price: 6.00, image: "/placeholder.jpg", category: "Beauty Fix", sizes: ["OS"], description: "Strong hold clear lash adhesive.", condition: "NEW"
  },
  {
    id: "item_036", name: "Lashes (1 pair)", price: 8.00, image: "/placeholder.jpg", category: "Beauty Fix", sizes: ["OS"], description: "Fluffy faux-mink lashes.", condition: "NEW"
  },
  {
    id: "item_037", name: "Lip gloss", price: 8.00, image: "/placeholder.jpg", category: "Beauty Fix", sizes: ["OS"], description: "High-shine clear gloss.", condition: "NEW"
  },
  {
    id: "item_038", name: "Lip balm", price: 5.00, image: "/placeholder.jpg", category: "Beauty Fix", sizes: ["OS"], description: "Hydrating recovery balm.", condition: "NEW"
  },
  {
    id: "item_039", name: "Oil-blotting sheets", price: 6.00, image: "/placeholder.jpg", category: "Beauty Fix", sizes: ["OS"], description: "Removes shine instantly.", condition: "NEW"
  },
  {
    id: "item_040", name: "Makeup remover wipes (travel)", price: 7.00, image: "/placeholder.jpg", category: "Beauty Fix", sizes: ["OS"], description: "Gentle cleansing wipes.", condition: "NEW"
  },

  // --- G. GAME DAY & GOING OUT ---
  {
    id: "item_041", name: "Clear stadium bag", price: 18.00, image: "/clear_purse---9254c583-bd95-4c48-89d5-840f19894ece.jpg", category: "Game Day & Going Out", sizes: ["OS"], description: "Chic clear PVC stadium bag.", condition: "NEW"
  },
  {
    id: "item_042", name: "Face stickers/eye black", price: 6.00, image: "/placeholder.jpg", category: "Game Day & Going Out", sizes: ["OS"], description: "Game day spirit.", condition: "NEW"
  },
  {
    id: "item_043", name: "Electrolyte packet", price: 4.00, image: "/placeholder.jpg", category: "Game Day & Going Out", sizes: ["OS"], description: "Rapid hydration powder.", condition: "NEW"
  },
  {
    id: "item_044", name: "Sunscreen packet", price: 4.00, image: "/placeholder.jpg", category: "Game Day & Going Out", sizes: ["OS"], description: "SPF 50 travel packet.", condition: "NEW"
  },

  // --- H. ESSENTIALS ---
  {
    id: "item_045", name: "Phone charger cable", price: 14.00, image: "/phone_charger---51e11673-53f6-4e3d-9938-feb9e8325f41.jpg", category: "Essentials", sizes: ["OS"], description: "Fast-charging iPhone cable.", condition: "NEW"
  },
  {
    id: "item_046", name: "Pain reliever 2-pack", price: 5.00, image: "/placeholder.jpg", category: "Essentials", sizes: ["OS"], description: "Travel-size ibuprofen.", condition: "NEW"
  },
  {
    id: "item_047", name: "Tampons/pads pack", price: 8.00, image: "/placeholder.jpg", category: "Essentials", sizes: ["OS"], description: "Feminine care emergency kit.", condition: "NEW"
  }
];
`;

content = content.replace('];', newEmergencyItems);
fs.writeFileSync(productsFile, content);
console.log("Categorized emergency items added to products.ts");
