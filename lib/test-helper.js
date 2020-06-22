const wiki = require('./wiki.js');
const _ = require('golgoth/lib/lodash');
const readJson = require('firost/lib/readJson');

module.exports = {
  mockMarkup(gameName) {
    jest.spyOn(wiki, 'markup').mockImplementation(async pageName => {
      const fixture = await readJson(
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
