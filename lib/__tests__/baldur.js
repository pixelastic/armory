import module from '../baldur';
import helper from '../test-helper';
import wiki from '../wiki';

describe('baldur', () => {
  describe('price', () => {
    it('Carsomyr', async () => {
      await helper.mockJson('baldur/Carsomyr.json');

      const actual = await module.price();

      expect(actual).toEqual(20000);
    });
    it('Abyssal Blade', async () => {
      await helper.mockJson('baldur/Abyssal_Blade.json');

      const actual = await module.price();

      expect(actual).toEqual(0);
    });
    it('Algernon Cloak', async () => {
      await helper.mockJson('baldur/Algernon_Cloak.json');

      const actual = await module.price();

      expect(actual).toEqual(1750);
    });
    it('Angurvadal', async () => {
      await helper.mockJson('baldur/Angurvadal.json');

      const actual = await module.price();

      expect(actual).toEqual(7750);
    });
  });

  describe('description', () => {
    it('Carsomyr', async () => {
      await helper.mockJson('baldur/Carsomyr.json');

      const actual = await module.description();

      expect(actual).toMatch(
        /^Carsomyr is a weapon of legend, perhaps one of the most/
      );
    });
    it('Adjatha the Drinker', async () => {
      await helper.mockJson('baldur/Adjatha_the_Drinker.json');

      const actual = await module.description();

      expect(actual).toMatch(/^This blade belonged to/);
    });
    it('Aeger Hide', async () => {
      await helper.mockJson('baldur/Aeger_Hide.json');

      const actual = await module.description();

      expect(actual).toMatch(
        /^This heavy and thick bear hide is all that remains of the fabled Aeger./
      );
    });
    it('Amulet of Whispers', async () => {
      await helper.mockJson('baldur/Amulet_of_Whispers.json');

      const actual = await module.description();

      expect(actual).toMatch(/^The archmage Ulcaster/);
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
    it('image with a File: prefix', async () => {
      jest.spyOn(wiki, 'infobox').mockReturnValue({ image: 'File:imageName' });
      jest.spyOn(wiki, 'imageUrl').mockReturnValue('imageUrl');

      const actual = await module.picture();

      expect(wiki.imageUrl).toHaveBeenCalledWith('imageName');
      expect(actual).toEqual('imageUrl');
    });
  });
  describe('isMagical', () => {
    it('Carsomyr', async () => {
      await helper.mockJson('baldur/Carsomyr.json');

      const actual = await module.isMagical();

      expect(actual).toEqual(true);
    });
    it('Abyssal Blade', async () => {
      await helper.mockJson('baldur/Abyssal_Blade.json');

      const actual = await module.isMagical();

      expect(actual).toEqual(true);
    });
    it('Acorns', async () => {
      await helper.mockJson('baldur/Acorns.json');

      const actual = await module.isMagical();

      expect(actual).toEqual(false);
    });
  });

  // async picture(pageName) {
  //   const infobox = await wiki.infobox(pageName);
  //   return await wiki.imageUrl(_.get(infobox, 'image'));
  // },
});
