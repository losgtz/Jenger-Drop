const fs = require('fs');

const productsFile = '/Users/thegrower/Desktop/jenger_drop_app/data/products.ts';
let content = fs.readFileSync(productsFile, 'utf8');

const replacements = {
  'item_033': '/mini_sewing_kit---dd80f4e7-6b93-4a26-a96c-c0868497623f.jpg',
  'item_034': '/safety_pins---e12086a6-b086-4477-8bc5-6e21f1c22682.jpg',
  'item_035': '/lash_glue---e35b53a3-42b7-41e5-a690-4d1e61503881.jpg',
  'item_036': '/lashes---8d5587ef-8948-4c02-a2b3-c0cebb5fe217.jpg',
  'item_037': '/lip_gloss---a662e684-d9fb-4c3f-9a9f-5a57d946c179.jpg',
  'item_038': '/lip_balm---3c8b39f6-ac8a-4280-a725-fe1be86b5028.jpg',
  'item_039': '/oil_blotting_sheets---39970307-38c3-466d-8b36-e28dc44f8c35.jpg',
  'item_040': '/makeup_wipes---73bf1a20-ba99-4acb-86bd-37d5feb93050.jpg',
  'item_042': '/eye_black---0b707dca-48a6-491a-82f3-e939618e117a.jpg',
  'item_043': '/electrolyte_packet---60fcb1e9-310b-4f6b-8ea1-27075fd0a911.jpg',
  'item_044': '/sunscreen_packet---76e6bcbd-edaf-42bc-b8d9-26954fecab89.jpg',
  'item_046': '/pain_reliever---fe000a2e-c4b7-4626-8585-625ae9c9565c.jpg',
  'item_047': '/feminine_care---4845ec5f-d371-4028-8a52-774d289ad1cf.jpg'
};

for (const id in replacements) {
    const newImg = replacements[id];
    const regex = new RegExp(`(id:\\s*"${id}"[\\s\\S]*?image:\\s*")\\/placeholder\\.jpg(")`, 'g');
    content = content.replace(regex, `$1${newImg}$2`);
}

fs.writeFileSync(productsFile, content);
console.log("Image links updated successfully.");
