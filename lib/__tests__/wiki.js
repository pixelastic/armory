import module from '../wiki';
import helper from '../test-helper';
import firost from 'firost';

describe('wiki', () => {
  describe('markup', () => {
    it('returns raw markup', async () => {
      const fixture = await firost.readJson(
        `./lib/fixtures/baldur/Carsomyr.json`
      );
      jest.spyOn(module, 'readJsonUrl').mockReturnValue(fixture);

      const actual = await module.markup();

      expect(actual).toMatch(/\{\{infobox item\n\|image =CSW2H1000000.PNG /);
    });
  });
  describe('imageUrl', () => {
    it('returns json markup', async () => {
      const fixture = await firost.readJson(
        `./lib/fixtures/baldur/images/CSW2H1000000.PNG.json`
      );
      jest.spyOn(module, 'readJsonUrl').mockReturnValue(fixture);

      const actual = await module.imageUrl();

      expect(actual).toEqual(
        'https://vignette.wikia.nocookie.net/baldursgategame/images/5/5f/CSW2H1000000.PNG/revision/latest?cb=20171009143511'
      );
    });
  });
  describe('depends on markup', () => {
    beforeEach(() => {
      helper.mockMarkup('baldur');
    });
    describe('json', () => {
      it('returns json markup', async () => {
        const actual = await module.json('Carsomyr');

        expect(actual).toHaveProperty('title', 'Carsomyr');
      });
    });
    describe('isStub', () => {
      it('returns true if contains {{stub}}', async () => {
        const actual = await module.isStub('A_Note_from_Mazzy_Fentan');

        expect(actual).toEqual(true);
      });
      it('returns false if not a stub', async () => {
        const actual = await module.isStub('Carsomyr');

        expect(actual).toEqual(false);
      });
    });
  });
});
