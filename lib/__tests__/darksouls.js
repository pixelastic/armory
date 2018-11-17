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
  });
});
