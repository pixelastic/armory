const wiki = require('./wiki');
const { _, firost } = require('golgoth');

const module = {
  mockMarkup(gameName) {
    jest.spyOn(wiki, 'markup').mockImplementation(async pageName => {
      const fixture = await firost.readJson(
        `./lib/fixtures/${gameName}/${pageName}.json`
      );
      const pages = _.get(fixture, 'query.pages');
      const id = _.first(_.keys(pages));
      return _.get(pages, `${id}.revisions[0]['*']`);
    });
  },
  /**
   * Returns a method to mock the specified module
   * @param {object} moduleToMock The module to mock
   * @returns {Function} Function to call with methodName and (optional) return value
   **/
  mock(moduleToMock) {
    return function(methodName, value) {
      return jest.spyOn(moduleToMock, methodName).mockReturnValue(value);
    };
  },
};

module.exports = _.bindAll(module, _.functions(module));
