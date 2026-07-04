const fs = require('fs');
const productsFile = '/Users/thegrower/.openclaw/workspace/Jengerluxurious/data/products.ts';
let content = fs.readFileSync(productsFile, 'utf8');

const regex = /(id:\s*"item_008"[\s\S]*?image:\s*")\/placeholder\.jpg(")/g;
content = content.replace(regex, `$1/item_008_hm_white_ruffle.jpg$2`);

fs.writeFileSync(productsFile, content);
console.log("Updated item_008 image.");
