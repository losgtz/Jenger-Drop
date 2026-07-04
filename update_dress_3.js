const fs = require('fs');
const productsFile = '/Users/thegrower/.openclaw/workspace/Jengerluxurious/data/products.ts';
let content = fs.readFileSync(productsFile, 'utf8');

const regex = /(id:\s*"item_003"[\s\S]*?image:\s*")\/placeholder\.jpg(")/g;
content = content.replace(regex, `$1/item_003_jessica_simpson_maxi.jpg$2`);

fs.writeFileSync(productsFile, content);
console.log("Updated item_003 image.");
