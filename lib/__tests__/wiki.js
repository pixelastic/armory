const module = require('../wiki');
const helper = require('../test-helper');
const { firost } = require('golgoth');

describe('wiki', () => {
  describe('markup', () => {
    it('returns raw markup', async () => {
      const fixture = await firost.readJson(
        './lib/fixtures/baldur/Carsomyr.json'
      );
      jest.spyOn(module, 'readJsonUrl').mockReturnValue(fixture);

      const actual = await module.markup();

      expect(actual).toMatch(/\{\{infobox item\n\|image =CSW2H1000000.PNG /);
    });
  });
  describe('titleToUrl', () => {
    it('Carsomyr', () => {
      const actual = module.titleToUrl('Carsomyr');

      expect(actual).toEqual('Carsomyr');
    });
    it('Larder Door', () => {
      const actual = module.titleToUrl('Larder Door');

      expect(actual).toEqual('Larder_Door');
    });
    it('Last Blade of the White Forge', () => {
      const actual = module.titleToUrl('Last Blade of the White Forge');

      expect(actual).toEqual('Last_Blade_of_the_White_Forge');
    });
    it("Lilith's Shawl", () => {
      const actual = module.titleToUrl("Lilith's Shawl");

      expect(actual).toEqual('Lilith%27s_Shawl');
    });
    it("Exarch Lord Sserkal's's head", () => {
      const actual = module.titleToUrl("Exarch Lord Sserkal's's head");

      expect(actual).toEqual('Exarch_Lord_Sserkal%27s%27s_head');
    });
  });
  describe('isRedirect', () => {
    it("Worker's Garb", async () => {
      helper.mockMarkup('darksouls');
      const actual = await module.isRedirect('Workers_Garb');

      expect(actual).toEqual(true);
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
