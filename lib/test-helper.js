import firost from 'firost';

const module = {
  async fixtureAsJson(fixtureName) {
    return await firost.readJson(`./lib/fixtures/${fixtureName}`);
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

export default module;
