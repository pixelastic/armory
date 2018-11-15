import module from '../baldur';
import helper from '../test-helper';
const mock = helper.mock(module);

describe('baldur', () => {
  describe('isMagical', () => {
    it('Angurvadal', async () => {
      mock('readJsonUrl', await helper.fixtureAsJson('baldur/Angurvadal.json'));

      const actual = await module.isMagical();

      expect(actual).toEqual(true);
    });

    it('Abyssal Blade', async () => {
      mock(
        'readJsonUrl',
        await helper.fixtureAsJson('baldur/Abyssal_Blade.json')
      );

      const actual = await module.isMagical();

      expect(actual).toEqual(true);
    });

    it('Amulet of Power', async () => {
      mock(
        'readJsonUrl',
        await helper.fixtureAsJson('baldur/Amulet_of_Power.json')
      );

      const actual = await module.isMagical();

      expect(actual).toEqual(true);
    });
  });
  describe('isStub', () => {
    it("Adoy's Belt", async () => {
      mock('readJsonUrl', await helper.fixtureAsJson('baldur/Adoy_Belt.json'));

      const actual = await module.isStub();

      expect(actual).toEqual(true);
    });
  });
  describe('getItemDescription', () => {
    it('Adjatha the Drinker', async () => {
      mock(
        'readJsonUrl',
        await helper.fixtureAsJson('baldur/Adjatha_the_Drinker.json')
      );

      const actual = await module.getItemDescription();

      expect(actual).toMatch(/^This blade/);
    });
    it("Aeger's Hide", async () => {
      mock('readJsonUrl', await helper.fixtureAsJson('baldur/Aeger_Hide.json'));

      const actual = await module.getItemDescription();

      expect(actual).toMatch(
        /^This heavy and thick bear hide is all that remains of the fabled Aeger/
      );
    });
  });
  describe('getItemImageName', () => {
    it('Abyssal Blade', async () => {
      mock(
        'readJsonUrl',
        await helper.fixtureAsJson('baldur/Abyssal_Blade.json')
      );

      const actual = await module.getItemImageName();

      expect(actual).toEqual('AbyssalBlade.png');
    });
    it('Albruin', async () => {
      mock('readJsonUrl', await helper.fixtureAsJson('baldur/Albruin.json'));

      const actual = await module.getItemImageName();

      expect(actual).toEqual('Albruin item artwork BG2.png');
    });
  });
});
