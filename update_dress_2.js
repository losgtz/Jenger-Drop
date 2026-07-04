const fs = require('fs');
const productsFile = '/Users/thegrower/.openclaw/workspace/Jengerluxurious/data/products.ts';
let content = fs.readFileSync(productsFile, 'utf8');

const regex = /(id:\s*"item_002"[\s\S]*?image:\s*")\/placeholder\.jpg(")/g;
content = content.replace(regex, `$1/item_002_derek_heart_striped.jpg$2`);

fs.writeFileSync(productsFile, content);
console.log("Updated item_002 image.");
