import module from '../darksouls';
import helper from '../test-helper';
import wiki from '../wiki';

describe('darksouls', () => {
  beforeEach(() => {
    helper.mockMarkup('darksouls');
  });
  describe('isListingPage', () => {
    it('Weapons_(Dark_Souls_II)', async () => {
      const actual = await module.isListingPage('Weapons_Dark_Souls_II');

      expect(actual).toEqual(true);
    });
    it('Pyromancy_Flames', async () => {
      const actual = await module.isListingPage('Pyromancy_Flames');

      expect(actual).toEqual(true);
    });
    it('Reapers', async () => {
      const actual = await module.isListingPage('Reapers');

      expect(actual).toEqual(true);
    });
    it('Ultra Greatswords', async () => {
      const actual = await module.isListingPage('Ultra_Greatswords');

      expect(actual).toEqual(true);
    });
    it('Weapon Types', async () => {
      const actual = await module.isListingPage('Weapon_Types');

      expect(actual).toEqual(true);
    });
    it('Daggers', async () => {
      const actual = await module.isListingPage('Daggers');

      expect(actual).toEqual(true);
    });
    it('Fists', async () => {
      const actual = await module.isListingPage('Fists');

      expect(actual).toEqual(true);
    });
    it('Talismans', async () => {
      const actual = await module.isListingPage('Talismans');

      expect(actual).toEqual(true);
    });
    it('Unique Armor', async () => {
      const actual = await module.isListingPage('Unique_Armor');

      expect(actual).toEqual(true);
    });
    it('Armor', async () => {
      const actual = await module.isListingPage('Armor');

      expect(actual).toEqual(true);
    });
    it('Axes (Dark Souls III)', async () => {
      const actual = await module.isListingPage('Axes_Dark_Souls_III');

      expect(actual).toEqual(true);
    });
    it('Staves (Dark Souls III)', async () => {
      const actual = await module.isListingPage('Staves_Dark_Souls_III');

      expect(actual).toEqual(true);
    });
  });
  describe('isAchievement', () => {
    it('Knight Honor', async () => {
      const actual = await module.isAchievement('Knight_Honor');

      expect(actual).toEqual(true);
    });
  });
  describe('isSet', () => {
    it('Drakeblood Set', async () => {
      const actual = await module.isSet('Drakeblood Set');

      expect(actual).toEqual(true);
    });
    it('Starting Armor Sets', async () => {
      const actual = await module.isSet('Starting Armor Sets');

      expect(actual).toEqual(true);
    });
    it('Set of Artorias', async () => {
      const actual = await module.isSet('Set of Artorias');

      expect(actual).toEqual(true);
    });
    it('Heavy Armor Sets (Dark Souls)', async () => {
      const actual = await module.isSet('Heavy Armor Sets (Dark Souls)');

      expect(actual).toEqual(true);
    });
    it('Dingy Set (Dark Souls II)', async () => {
      const actual = await module.isSet('Dingy Set (Dark Souls II)');

      expect(actual).toEqual(true);
    });
    it("Aurous' Set (transparent)", async () => {
      const actual = await module.isSet("Aurous' Set (transparent)");

      expect(actual).toEqual(true);
    });
  });
  describe('isComparison', () => {
    it('Armor Piece Comparison', async () => {
      const actual = await module.isComparison('Armor Piece Comparison');

      expect(actual).toEqual(true);
    });
  });
  describe('isRemoved', () => {
    it('Black_Dagger', async () => {
      const actual = await module.isRemoved('Black_Dagger');

      expect(actual).toEqual(true);
    });
  });
  describe('isBeta', () => {
    it('Bell of the Idol', async () => {
      const actual = await module.isBeta('Bell_of_the_Idol');

      expect(actual).toEqual(true);
    });
  });
  describe('description', () => {
    it('Abyss Greatsword', async () => {
      const actual = await module.description('Abyss_Greatsword');

      expect(actual).toEqual(
        "This greatsword belonged to Lord Gwyn's Knight Artorias, who fell to the abyss.\nSwallowed by the Dark with its master, this sword is tainted by the abyss, and now its strength reflects its wielder's humanity."
      );
    });
    it('Aged Smelter Sword', async () => {
      const actual = await module.description('Aged_Smelter_Sword');

      expect(actual).toEqual(
        "Ultra greatsword crafted from the soul of the Smelter Demon. Its blade is imbued with a great flame. Use the strong attack to unleash its latent power.\nWhen the old king acquired the power to grant life to heaps of iron, he molded a great array of metallic automatons.The iron monstrosity itself was perhaps one of the king's puppets."
      );
    });
    it('Curved Dragon Greatsword', async () => {
      const actual = await module.description('Curved_Dragon_Greatsword');

      expect(actual).toMatch(/and everlasting dragons.$/);
    });
    it('Balder Shield', async () => {
      const actual = await module.description('Balder_Shield');

      expect(actual).toMatch(/after a widespread outbreak of Undead.$/);
    });
    it('Sage Big Hat', async () => {
      const actual = await module.description('Sage_Big_Hat');

      expect(actual).toMatch(
        / to the great sage Logan, and this big hat is a symbol of their pedigree.$/
      );
    });
    it('East West Shield', async () => {
      const actual = await module.description('East_West_Shield');

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
      await module.picture('Abyss_Greatsword');

      expect(wiki.imageUrl).toHaveBeenCalledWith('wpn Abyss Greatsword.png');
    });
    it('Beatrice Catalyst', async () => {
      await module.picture('Beatrice_Catalyst');

      expect(wiki.imageUrl).toHaveBeenCalledWith('Cata Beatrices Catalyst.png');
    });
    it('Anklet of the Great Lord', async () => {
      await module.picture('Anklet_of_the_Great_Lord');

      expect(wiki.imageUrl).toHaveBeenCalledWith(
        'Anklet of the Great Lord.png'
      );
    });
    it('Black Manchette', async () => {
      await module.picture('Black_Manchette');

      expect(wiki.imageUrl).toHaveBeenCalledWith('Black Manchette.png');
    });
    it('Black Leather Boots', async () => {
      await module.picture('Black_Leather_Boots');

      expect(wiki.imageUrl).toHaveBeenCalledWith('Black Leather Boots.png');
    });
    it('Bellowing Dragoncrest Ring', async () => {
      await module.picture('Bellowing_Dragoncrest_Ring');

      expect(wiki.imageUrl).toHaveBeenCalledWith(
        'Ring bellowing dragoncrest ring.png'
      );
    });
    it('Aged_Smelter_Sword', async () => {
      await module.picture('Aged_Smelter_Sword');

      expect(wiki.imageUrl).toHaveBeenCalledWith('Aged_Smelter_Sword.png');
    });
    it('Ivory Talisman', async () => {
      await module.picture('Ivory_Talisman');

      expect(wiki.imageUrl).toHaveBeenCalledWith('111.png');
    });
    it('Binoculars', async () => {
      await module.picture('Binoculars');

      expect(wiki.imageUrl).toHaveBeenCalledWith('Binoculars II.png');
    });
    it('Blue Dagger', async () => {
      await module.picture('Blue_Dagger');

      expect(wiki.imageUrl).toHaveBeenCalledWith('Blue Dagger.png');
    });
    it('Greataxe (Dark Souls II)', async () => {
      await module.picture('Greataxe_Dark_Souls_II');

      expect(wiki.imageUrl).toHaveBeenCalledWith('Greataxe II.png');
    });
  });
});
