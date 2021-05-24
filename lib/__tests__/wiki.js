const current = require('../wiki');
const helper = require('../test-helper');
const readJson = require('firost/readJson');

describe('wiki', () => {
  describe('markup', () => {
    it('returns raw markup', async () => {
      const fixture = await readJson('./lib/fixtures/baldur/Carsomyr.json');
      jest.spyOn(current, 'readJsonUrl').mockReturnValue(fixture);

      const actual = await current.markup();

      expect(actual).toMatch(/\{\{infobox item\n\|image =CSW2H1000000.PNG /);
    });
  });
  describe('titleToUrl', () => {
    it('Carsomyr', () => {
      const actual = current.titleToUrl('Carsomyr');

      expect(actual).toEqual('Carsomyr');
    });
    it('Larder Door', () => {
      const actual = current.titleToUrl('Larder Door');

      expect(actual).toEqual('Larder_Door');
    });
    it('Last Blade of the White Forge', () => {
      const actual = current.titleToUrl('Last Blade of the White Forge');

      expect(actual).toEqual('Last_Blade_of_the_White_Forge');
    });
    it("Lilith's Shawl", () => {
      const actual = current.titleToUrl("Lilith's Shawl");

      expect(actual).toEqual('Lilith%27s_Shawl');
    });
    it("Exarch Lord Sserkal's's head", () => {
      const actual = current.titleToUrl("Exarch Lord Sserkal's's head");

      expect(actual).toEqual('Exarch_Lord_Sserkal%27s%27s_head');
    });
  });
  describe('isRedirect', () => {
    it("Worker's Garb", async () => {
      helper.mockMarkup('darksouls');
      const actual = await current.isRedirect('Workers_Garb');

      expect(actual).toEqual(true);
    });
  });
  describe('depends on markup', () => {
    beforeEach(() => {
      helper.mockMarkup('baldur');
    });
    describe('json', () => {
      it('returns json markup', async () => {
        const actual = await current.json('Carsomyr');

        expect(actual).toHaveProperty('title', 'Carsomyr');
      });
    });
    describe('isStub', () => {
      it('returns true if contains {{stub}}', async () => {
        const actual = await current.isStub('A_Note_from_Mazzy_Fentan');

        expect(actual).toEqual(true);
      });
      it('returns false if not a stub', async () => {
        const actual = await current.isStub('Carsomyr');

        expect(actual).toEqual(false);
      });
    });
  });
});
