const fs = require('fs');
const productsFile = '/Users/thegrower/.openclaw/workspace/Jengerluxurious/data/products.ts';
let content = fs.readFileSync(productsFile, 'utf8');

// Replace the single image entry for item 048 with the full array of detailed images
const regex = /(id:\s*"item_048"[\s\S]*?image:\s*"\/item_new_black_lace_bralette\.jpg",\n)/g;
const replacement = `$1    images: [
      "/item_new_black_lace_bralette.jpg",
      "/item_new_details/model_studio.jpg",
      "/item_new_details/model_cafe.jpg",
      "/item_new_details/straps.jpg",
      "/item_new_details/flat_1.jpg"
    ],\n`;

content = content.replace(regex, replacement);
fs.writeFileSync(productsFile, content);
console.log("Updated item 048 to include all gallery images.");
