const module = require('../baldur');
const helper = require('../test-helper');
const wiki = require('../wiki');

describe('baldur', () => {
  beforeEach(() => {
    helper.mockMarkup('baldur');
  });
  describe('price', () => {
    it('Carsomyr', async () => {
      const actual = await module.price('Carsomyr');

      expect(actual).toEqual(20000);
    });
    it('Abyssal Blade', async () => {
      const actual = await module.price('Abyssal_Blade');

      expect(actual).toEqual(0);
    });
    it('Algernon Cloak', async () => {
      const actual = await module.price('Algernon_Cloak');

      expect(actual).toEqual(1750);
    });
    it('Angurvadal', async () => {
      const actual = await module.price('Angurvadal');

      expect(actual).toEqual(7750);
    });
  });

  describe('description', () => {
    it('Carsomyr', async () => {
      const actual = await module.description('Carsomyr');

      expect(actual).toMatch(
        /^Carsomyr is a weapon of legend, perhaps one of the most/
      );
    });
    it('Adjatha the Drinker', async () => {
      const actual = await module.description('Adjatha_the_Drinker');

      expect(actual).toMatch(/^This blade belonged to/);
    });
    it('Aeger Hide', async () => {
      const actual = await module.description('Aeger_Hide');

      expect(actual).toMatch(
        /^This heavy and thick bear hide is all that remains of the fabled Aeger./
      );
    });
    it('Amulet of Whispers', async () => {
      const actual = await module.description('Amulet_of_Whispers');

      expect(actual).toMatch(/^The archmage Ulcaster/);
    });
    it('Darksteel Shield', async () => {
      const actual = await module.description('Darksteel_Shield');

      expect(actual).toMatch(/^Fashioned from dwarven darksteel/);
    });
  });
  describe('picture', () => {
    it('url of the image in the infobox', async () => {
      jest.spyOn(wiki, 'infobox').mockReturnValue({ image: 'imageName' });
      jest.spyOn(wiki, 'imageUrl').mockReturnValue('imageUrl');

      const actual = await module.picture();

      expect(wiki.imageUrl).toHaveBeenCalledWith('imageName');
      expect(actual).toEqual('imageUrl');
    });
  });
  describe('isMagical', () => {
    it('Carsomyr', async () => {
      const actual = await module.isMagical('Carsomyr');

      expect(actual).toEqual(true);
    });
    it('Abyssal Blade', async () => {
      const actual = await module.isMagical('Abyssal_Blade');

      expect(actual).toEqual(true);
    });
    it('Acorns', async () => {
      const actual = await module.isMagical('Acorns');

      expect(actual).toEqual(false);
    });
  });
});
