import module from '../darksouls';
import helper from '../test-helper';
import wiki from '../wiki';

describe('darksouls', () => {
  beforeEach(() => {
    helper.mockMarkup('darksouls');
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
  });
});
