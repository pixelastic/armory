import firost from 'firost';
import qs from 'query-string';
import wtf from 'wtf_wikipedia';
import { _ } from 'golgoth';

const module = {
  baseUrl: null,
  _cacheUrl: {},
  _cacheWtf: {},
  init(baseUrl) {
    this.baseUrl = baseUrl;
  },

  /**
   * Read json at a specified url. Uses and internal cache
   * @param {String} url Url of the JSON data
   * @returns {Object} JSON-parsed object
   **/
  async readJsonUrl(url) {
    if (this._cacheUrl[url]) {
      return this._cacheUrl[url];
    }
    const data = await firost.readJsonUrl(url);
    this._cacheUrl[url] = data;
    return data;
  },

  /**
   * Return the list of all articles in a given category
   * @param {String} categoryName Name of the category
   * @param {Object} userOptions Options:
   *     - limit: Max number of items to fetch (default 10k)
   * @returns {Array} List of articles with .id, .title and .url
   **/
  async articles(categoryName, userOptions) {
    const querystring = qs.stringify({
      limit: 10000,
      category: categoryName,
      ...userOptions,
    });
    const url = `${this.baseUrl}/api/v1/Articles/List?${querystring}`;

    const response = await this.readJsonUrl(url);
    return _.chain(response)
      .get('items')
      .drop(1) // First item is always the list itself, so we remove it
      .map(article => ({
        id: article.id,
        title: article.title,
        url: `${this.baseUrl}/${article.url}`,
      }))
      .sortBy(['title'])
      .value();
  },

  /**
   * Returns the list of all category members of a given category
   * @param {String} categoryName Name of the category
   * @returns {Array} List of child pages of this category
   **/
  async categoryMembers(categoryName) {
    const querystring = qs.stringify({
      action: 'query',
      cmlimit: 'max',
      cmtitle: `Category:${categoryName}`,
      format: 'json',
      list: 'categorymembers',
    });
    const url = `${this.baseUrl}/api.php?${querystring}`;

    const response = await this.readJsonUrl(url);
    return _.chain(response)
      .get('query.categorymembers')
      .map(page => ({
        url: `${this.baseUrl}/${page.title}`,
        title: page.title,
      }))
      .value();
  },

  /**
   * Get article raw markup
   * @param {String} pageName Slug of the article
   * @returns {String} Raw page markup
   **/
  async markup(pageName) {
    const options = qs.stringify({
      action: 'query',
      prop: 'revisions',
      rvprop: 'content',
      format: 'json',
      titles: pageName,
    });
    const url = `${this.baseUrl}/api.php?${options}`;

    const response = await this.readJsonUrl(url);
    const pages = _.get(response, 'query.pages');
    const id = _.first(_.keys(pages));
    return _.get(pages, `${id}.revisions[0]['*']`);
  },

  /**
   * Get parsed document, as exposed by wtf_wikipedia
   * https://github.com/spencermountain/wtf_wikipedia
   * @param {String} pageName Slug of the article
   * @returns {Object} wtf_wikipedia document
   **/
  async doc(pageName) {
    if (this._cacheWtf[pageName]) {
      return this._cacheWtf[pageName];
    }
    const content = await this.markup(pageName);
    const doc = wtf(content);
    this._cacheWtf[pageName] = doc;
    return doc;
  },

  /**
   * Return page data as JSON format
   * @param {String} pageName Slug of the article
   * @returns {Object} Data object
   **/
  async json(pageName) {
    const doc = await this.doc(pageName);
    return doc.json();
  },

  /**
   * Returns the url of an image identified by its name
   * @param {String} imageName Name of the image
   * @returns {String} Url of the image
   **/
  async imageUrl(imageName) {
    const options = qs.stringify({
      action: 'query',
      prop: 'imageinfo',
      iiprop: 'url',
      format: 'json',
      titles: `File:${imageName}`,
    });
    const url = `${this.baseUrl}/api.php?${options}`;

    const response = await this.readJsonUrl(url);
    const pages = _.get(response, 'query.pages');
    const id = _.first(_.keys(pages));
    return _.get(pages, `${id}.imageinfo[0].url`);
  },

  /**
   * Returns an object representing the infobox
   * @param {String} pageName Name of the page
   * @returns {Object} Infobox as an object
   **/
  async infobox(pageName) {
    const raw = await this.json(pageName);
    return _.chain(raw)
      .get('sections')
      .find(section => !_.isEmpty(section.infoboxes))
      .get('infoboxes')
      .first()
      .mapValues(value => _.get(value, 'text'))
      .mapKeys((value, key) => _.camelCase(key))
      .value();
  },

  /**
   * Check if the page is a stub
   * @param {String} pageName Name of the page
   * @returns {Boolean} True if is a stub
   **/
  async isStub(pageName) {
    const markup = await this.markup(pageName);
    if (_.includes(markup, '{{stub}}')) {
      return true;
    }
    return false;
  },
};

export default _.bindAll(module, _.functions(module));
