const fs = require('fs');
const productsFile = '/Users/thegrower/.openclaw/workspace/Jengerluxurious/data/products.ts';
let content = fs.readFileSync(productsFile, 'utf8');

const regex = /(id:\s*"item_049"[\s\S]*?image:\s*")\/item_new_black_bikini\.jpg(")/g;
content = content.replace(regex, `$1/item_049_black_chain_bikini.jpg$2`);

const regex2 = /(id:\s*"item_049"[\s\S]*?images:\s*\[\s*")\/item_new_black_bikini\.jpg(")/g;
content = content.replace(regex2, `$1/item_049_black_chain_bikini.jpg$2`);

fs.writeFileSync(productsFile, content);
console.log("Updated item_049 with the correct black bikini image.");
