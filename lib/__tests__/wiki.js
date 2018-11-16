import module from '../wiki';
import helper from '../test-helper';

describe('wiki', () => {
  describe('markup', () => {
    it('returns raw markup', async () => {
      await helper.mockJson('baldur/Carsomyr.json');

      const actual = await module.markup();

      expect(actual).toMatch(/\{\{infobox item\n\|image =CSW2H1000000.PNG /);
    });
  });
  describe('json', () => {
    it('returns json markup', async () => {
      await helper.mockJson('baldur/Carsomyr.json');

      const actual = await module.json();

      expect(actual).toHaveProperty('title', 'Carsomyr');
    });
  });
  describe('isStub', () => {
    it('returns true if contains {{stub}}', async () => {
      await helper.mockJson('baldur/A_Note_from_Mazzy_Fentan.json');

      const actual = await module.isStub();

      expect(actual).toEqual(true);
    });
    it('returns false if not a stub', async () => {
      await helper.mockJson('baldur/Carsomyr.json');

      const actual = await module.isStub();

      expect(actual).toEqual(false);
    });
  });
  describe('imageUrl', () => {
    it('returns json markup', async () => {
      await helper.mockJson('baldur/images/CSW2H1000000.PNG.json');

      const actual = await module.imageUrl();

      expect(actual).toEqual(
        'https://vignette.wikia.nocookie.net/baldursgategame/images/5/5f/CSW2H1000000.PNG/revision/latest?cb=20171009143511'
      );
    });
  });
});
