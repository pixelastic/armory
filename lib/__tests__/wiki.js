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
  describe('titleToUrl', () => {
    beforeEach(() => {
      module.init('baseUrl');
    });
    it('Carsomyr', () => {
      const actual = module.titleToUrl('Carsomyr');

      expect(actual).toEqual('baseUrl/Carsomyr');
    });
    it('Larder Door', () => {
      const actual = module.titleToUrl('Larder Door');

      expect(actual).toEqual('baseUrl/Larder_Door');
    });
    it('Last Blade of the White Forge', () => {
      const actual = module.titleToUrl('Last Blade of the White Forge');

      expect(actual).toEqual('baseUrl/Last_Blade_of_the_White_Forge');
    });
    it("Lilith's Shawl", () => {
      const actual = module.titleToUrl("Lilith's Shawl");

      expect(actual).toEqual('baseUrl/Lilith%27s_Shawl');
    });
    it("Exarch Lord Sserkal's's head", () => {
      const actual = module.titleToUrl("Exarch Lord Sserkal's's head");

      expect(actual).toEqual('baseUrl/Exarch_Lord_Sserkal%27s%27s_head');
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
