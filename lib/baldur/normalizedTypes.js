const _ = require('golgoth/lib/lodash');
const types = {
  Ammunition: ['Arrow', 'Bolt', 'Bullet', 'Dart'],
  Sword: ['Long Sword', 'Short Sword', 'Bastard Sword', 'Large Sword'],
  Bow: ['Shortbow', 'Short Bow', 'Longbow', 'Composite Longbow'],
  Dagger: ['Throwing Dagger'],
  'Light Armor': [
    'Chain Mail',
    'Medium Armor',
    'Splint Mail',
    'Studded Leather Armor',
    'Studded Leather',
  ],
  'Heavy Armor': ['Plate Mail', 'Full Plate'],
  'Curved Sword': [
    'Katana',
    'Ninjato',
    'Scimitar Wakizashi Ninjato',
    'Scimitar',
    'Wakizashi',
  ],
  'Hast Weapon': ['Spear', 'Halberd'],
  'Bludgeoning Weapon': [
    'Club',
    'Flail',
    'Hammer',
    'Mace',
    'Morning Star',
    'Throwing Hammer',
  ],
  Axe: ['Throwing Ax'],
  Staff: ['Quarterstave', 'Quarterstaff'],
  Glove: ['Bracer', 'Gauntlet'],
  Belt: ['Girdle'],
  Shield: ['Medium Shield', 'Large Shield', 'Small Shield', 'Buckler'],
  'Misc Item': [
    'Figurine',
    'Gem',
    'Harp',
    'Ioun Stone',
    'Miscellaneous Item',
    'Miscellaneous',
  ],
  Amulet: ['Silver Amulet', 'Necklace'],
  Crossbow: ['Light Crossbow', 'Heavy Crossbow'],
  Helmet: ['Circlet', 'Hat', 'Headgear'],
  GARBAGE: ['Potion', 'Book', 'Cursed Scroll', 'Component'],
};
module.exports = _.transform(
  types,
  (result, values, key) => {
    _.each(values, (value) => {
      result[value] = key;
    });
  },
  {}
);
