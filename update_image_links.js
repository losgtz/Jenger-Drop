const fs = require('fs');

const productsFile = '/Users/thegrower/.openclaw/workspace/Jengerluxurious/data/products.ts';
let content = fs.readFileSync(productsFile, 'utf8');

// Replace placeholder links with the newly generated image links
const replacements = {
  'item_032': '/placeholder.jpg|/pasties---<replace_me>.jpg', // I didn't generate pasties specifically, leaving as placeholder or boob tape
  'item_033': '/placeholder.jpg|/mini_sewing_kit---dd80f4e7-6b93-4a26-a96c-c0868497623f.jpg',
  'item_034': '/placeholder.jpg|/safety_pins---e12086a6-b086-4477-8bc5-6e21f1c22682.jpg',
  'item_035': '/placeholder.jpg|/lash_glue---e35b53a3-42b7-41e5-a690-4d1e61503881.jpg',
  'item_036': '/placeholder.jpg|/lashes---8d5587ef-8948-4c02-a2b3-c0cebb5fe217.jpg',
  'item_037': '/placeholder.jpg|/lip_gloss---a662e684-d9fb-4c3f-9a9f-5a57d946c179.jpg',
  'item_038': '/placeholder.jpg|/lip_balm---3c8b39f6-ac8a-4280-a725-fe1be86b5028.jpg',
  'item_039': '/placeholder.jpg|/oil_blotting_sheets---39970307-38c3-466d-8b36-e28dc44f8c35.jpg',
  'item_040': '/placeholder.jpg|/makeup_wipes---73bf1a20-ba99-4acb-86bd-37d5feb93050.jpg',
  'item_042': '/placeholder.jpg|/eye_black---0b707dca-48a6-491a-82f3-e939618e117a.jpg',
  'item_043': '/placeholder.jpg|/electrolyte_packet---60fcb1e9-310b-4f6b-8ea1-27075fd0a911.jpg',
  'item_044': '/placeholder.jpg|/sunscreen_packet---76e6bcbd-edaf-42bc-b8d9-26954fecab89.jpg',
  'item_046': '/placeholder.jpg|/pain_reliever---fe000a2e-c4b7-4626-8585-625ae9c9565c.jpg',
  'item_047': '/placeholder.jpg|/feminine_care---4845ec5f-d371-4028-8a52-774d289ad1cf.jpg'
};

for (const [id, replacement] = Object.entries(replacements)) {
    const [oldImg, newImg] = replacement.split('|');
    // Simple regex to find the block for the specific ID and replace its image
    const regex = new RegExp(`(id:\\s*"${id}"[\\s\\S]*?image:\\s*")\\/placeholder\\.jpg(")`, 'g');
    content = content.replace(regex, `$1${newImg}$2`);
}

fs.writeFileSync(productsFile, content);
console.log("Image links updated in products.ts");
