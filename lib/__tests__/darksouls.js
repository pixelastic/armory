const current = require('../darksouls.js');
const helper = require('../test-helper.js');
const wiki = require('../wiki.js');

describe('darksouls', () => {
  beforeEach(() => {
    helper.mockMarkup('darksouls');
  });
  describe('isListingPage', () => {
    it('Weapons_(Dark_Souls_II)', async () => {
      const actual = await current.isListingPage('Weapons_Dark_Souls_II');

      expect(actual).toEqual(true);
    });
    it('Pyromancy_Flames', async () => {
      const actual = await current.isListingPage('Pyromancy_Flames');

      expect(actual).toEqual(true);
    });
    it('Reapers', async () => {
      const actual = await current.isListingPage('Reapers');

      expect(actual).toEqual(true);
    });
    it('Ultra Greatswords', async () => {
      const actual = await current.isListingPage('Ultra_Greatswords');

      expect(actual).toEqual(true);
    });
    it('Weapon Types', async () => {
      const actual = await current.isListingPage('Weapon_Types');

      expect(actual).toEqual(true);
    });
    it('Daggers', async () => {
      const actual = await current.isListingPage('Daggers');

      expect(actual).toEqual(true);
    });
    it('Fists', async () => {
      const actual = await current.isListingPage('Fists');

      expect(actual).toEqual(true);
    });
    it('Talismans', async () => {
      const actual = await current.isListingPage('Talismans');

      expect(actual).toEqual(true);
    });
    it('Unique Armor', async () => {
      const actual = await current.isListingPage('Unique_Armor');

      expect(actual).toEqual(true);
    });
    it('Armor', async () => {
      const actual = await current.isListingPage('Armor');

      expect(actual).toEqual(true);
    });
    it('Axes (Dark Souls III)', async () => {
      const actual = await current.isListingPage('Axes_Dark_Souls_III');

      expect(actual).toEqual(true);
    });
    it('Staves (Dark Souls III)', async () => {
      const actual = await current.isListingPage('Staves_Dark_Souls_III');

      expect(actual).toEqual(true);
    });
  });
  describe('isAchievement', () => {
    it('Knight Honor', async () => {
      const actual = await current.isAchievement('Knight_Honor');

      expect(actual).toEqual(true);
    });
  });
  describe('isSet', () => {
    it('Drakeblood Set', async () => {
      const actual = await current.isSet('Drakeblood Set');

      expect(actual).toEqual(true);
    });
    it('Starting Armor Sets', async () => {
      const actual = await current.isSet('Starting Armor Sets');

      expect(actual).toEqual(true);
    });
    it('Set of Artorias', async () => {
      const actual = await current.isSet('Set of Artorias');

      expect(actual).toEqual(true);
    });
    it('Heavy Armor Sets (Dark Souls)', async () => {
      const actual = await current.isSet('Heavy Armor Sets (Dark Souls)');

      expect(actual).toEqual(true);
    });
    it('Dingy Set (Dark Souls II)', async () => {
      const actual = await current.isSet('Dingy Set (Dark Souls II)');

      expect(actual).toEqual(true);
    });
    it("Aurous' Set (transparent)", async () => {
      const actual = await current.isSet("Aurous' Set (transparent)");

      expect(actual).toEqual(true);
    });
  });
  describe('isComparison', () => {
    it('Armor Piece Comparison', async () => {
      const actual = await current.isComparison('Armor Piece Comparison');

      expect(actual).toEqual(true);
    });
  });
  describe('isRemoved', () => {
    it('Black_Dagger', async () => {
      const actual = await current.isRemoved('Black_Dagger');

      expect(actual).toEqual(true);
    });
  });
  describe('isBeta', () => {
    it('Bell of the Idol', async () => {
      const actual = await current.isBeta('Bell_of_the_Idol');

      expect(actual).toEqual(true);
    });
  });
  describe('description', () => {
    it('Abyss Greatsword', async () => {
      const actual = await current.description('Abyss_Greatsword');

      expect(actual).toEqual(
        "This greatsword belonged to Lord Gwyn's Knight Artorias, who fell to the abyss.\nSwallowed by the Dark with its master, this sword is tainted by the abyss, and now its strength reflects its wielder's humanity."
      );
    });
    it('Aged Smelter Sword', async () => {
      const actual = await current.description('Aged_Smelter_Sword');

      expect(actual).toEqual(
        "Ultra greatsword crafted from the soul of the Smelter Demon. Its blade is imbued with a great flame. Use the strong attack to unleash its latent power.\nWhen the old king acquired the power to grant life to heaps of iron, he molded a great array of metallic automatons.The iron monstrosity itself was perhaps one of the king's puppets."
      );
    });
    it('Curved Dragon Greatsword', async () => {
      const actual = await current.description('Curved_Dragon_Greatsword');

      expect(actual).toMatch(/and everlasting dragons.$/);
    });
    it('Balder Shield', async () => {
      const actual = await current.description('Balder_Shield');

      expect(actual).toMatch(/after a widespread outbreak of Undead.$/);
    });
    it('Sage Big Hat', async () => {
      const actual = await current.description('Sage_Big_Hat');

      expect(actual).toMatch(
        / to the great sage Logan, and this big hat is a symbol of their pedigree.$/
      );
    });
    it('East West Shield', async () => {
      const actual = await current.description('East_West_Shield');

      expect(actual).toMatch(
        /double-headed eagle, painted yellow.\nWooden shields are/
      );
    });
  });
  describe('picture', () => {
    beforeEach(() => {
      jest.spyOn(wiki, 'imageUrl').mockReturnValue('imageUrl');
    });
    it('Abyss Greatsword', async () => {
      await current.picture('Abyss_Greatsword');

      expect(wiki.imageUrl).toHaveBeenCalledWith('wpn Abyss Greatsword.png');
    });
    it('Beatrice Catalyst', async () => {
      await current.picture('Beatrice_Catalyst');

      expect(wiki.imageUrl).toHaveBeenCalledWith('Cata Beatrices Catalyst.png');
    });
    it('Anklet of the Great Lord', async () => {
      await current.picture('Anklet_of_the_Great_Lord');

      expect(wiki.imageUrl).toHaveBeenCalledWith(
        'Anklet of the Great Lord.png'
      );
    });
    it('Black Manchette', async () => {
      await current.picture('Black_Manchette');

      expect(wiki.imageUrl).toHaveBeenCalledWith('Black Manchette.png');
    });
    it('Black Leather Boots', async () => {
      await current.picture('Black_Leather_Boots');

      expect(wiki.imageUrl).toHaveBeenCalledWith('Black Leather Boots.png');
    });
    it('Bellowing Dragoncrest Ring', async () => {
      await current.picture('Bellowing_Dragoncrest_Ring');

      expect(wiki.imageUrl).toHaveBeenCalledWith(
        'Ring bellowing dragoncrest ring.png'
      );
    });
    it('Aged_Smelter_Sword', async () => {
      await current.picture('Aged_Smelter_Sword');

      expect(wiki.imageUrl).toHaveBeenCalledWith('Aged_Smelter_Sword.png');
    });
    it('Ivory Talisman', async () => {
      await current.picture('Ivory_Talisman');

      expect(wiki.imageUrl).toHaveBeenCalledWith('111.png');
    });
    it('Binoculars', async () => {
      await current.picture('Binoculars');

      expect(wiki.imageUrl).toHaveBeenCalledWith('Binoculars II.png');
    });
    it('Blue Dagger', async () => {
      await current.picture('Blue_Dagger');

      expect(wiki.imageUrl).toHaveBeenCalledWith('Blue Dagger.png');
    });
    it('Greataxe (Dark Souls II)', async () => {
      await current.picture('Greataxe_Dark_Souls_II');

      expect(wiki.imageUrl).toHaveBeenCalledWith('Greataxe II.png');
    });
  });
});
