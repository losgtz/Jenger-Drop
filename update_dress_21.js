const fs = require('fs');
const productsFile = '/Users/thegrower/.openclaw/workspace/Jengerluxurious/data/products.ts';
let content = fs.readFileSync(productsFile, 'utf8');

// Update item_021 to point to the new BCBG lace crop image
const regex = /(id:\s*"item_021"[\s\S]*?image:\s*")\/placeholder\.jpg(")/g;
content = content.replace(regex, `$1/item_021_bcbg_lace_crop.jpg$2`);

// Update the name from "BCBG MAX AZRIA Little Black Dress" to the correct item
content = content.replace(/(id:\s*"item_021"[\s\S]*?name:\s*)"BCBG MAX AZRIA Little Black Dress"/, `$1"BCBG MAXAZRIA Pearle Two-Tone Floral Lace Crop Top"`);

fs.writeFileSync(productsFile, content);
console.log("Updated item_021 image and name.");
