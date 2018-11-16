import firost from 'firost';
import wiki from './wiki';
import { _ } from 'golgoth';

const module = {
  // Return the JSON content of a fixture file
  async fixtureAsJson(fixtureName) {
    return await firost.readJson(`./lib/fixtures/${fixtureName}`);
  },
  // Make all wiki.readJsonUrl return the specified fixture
  async mockJson(fixturePath) {
    const mockJson = await this.fixtureAsJson(fixturePath);
    wiki.readJsonUrl = jest.fn().mockReturnValue(mockJson);
  },
  /**
   * Returns a method to mock the specified module
   * @param {Object} moduleToMock The module to mock
   * @returns {Function} Function to call with methodName and (optional) return value
   **/
  mock(moduleToMock) {
    return function(methodName, value) {
      return jest.spyOn(moduleToMock, methodName).mockReturnValue(value);
    };
  },
};

export default _.bindAll(module, _.functions(module));
