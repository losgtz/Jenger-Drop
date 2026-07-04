const fs = require('fs');
const productsFile = '/Users/thegrower/.openclaw/workspace/Jengerluxurious/data/products.ts';
let content = fs.readFileSync(productsFile, 'utf8');

// Replace the placeholder for item_001
const regex = /(id:\s*"item_001"[\s\S]*?image:\s*")\/placeholder\.jpg(")/g;
content = content.replace(regex, `$1/item_001_xscape_floral.jpg$2`);

fs.writeFileSync(productsFile, content);
console.log("Updated item_001 image.");
