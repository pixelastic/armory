const he = require('he');
const wtf = require('wtf_wikipedia');
const _ = require('golgoth/lib/lodash');
const qs = require('golgoth/lib/queryString');
const got = require('golgoth/lib/got');
const readJsonUrl = require('firost/lib/readJsonUrl');
const readJson = require('firost/lib/readJson');
const writeJson = require('firost/lib/writeJson');
const isFile = require('firost/lib/isFile');
const urlToFilepath = require('firost/lib/urlToFilepath');

/**
 * Collection of methods to extract data from wikis following the Wikimedia
 * pattern. This includes Wikipedia and Wikia
 **/
module.exports = {
  baseUrl: null,
  _cacheUrl: {},
  _cacheWtf: {},
  _cacheImage: {},
  init(baseUrl) {
    this.baseUrl = baseUrl;
  },

  /**
   * Read json at a specified url. Uses an internal cache
   * @param {string} url Url of the JSON data
   * @returns {object} JSON-parsed object
   **/
  async readJsonUrl(url) {
    // Return the version cached in RAM if any
    if (this._cacheUrl[url]) {
      return this._cacheUrl[url];
    }

    // Check if we have a copy on disk and return it
    const cachePath = [
      'tmp/cache',
      urlToFilepath(url, { extension: 'json' }),
    ].join('/');
    if (await isFile(cachePath)) {
      return readJson(cachePath);
    }

    // No copy, we get it from the url
    const data = await readJsonUrl(url);
    await writeJson(data, cachePath);
    this._cacheUrl[url] = data;
    return data;
  },

  /**
   * Convert a page title to its url
   * @param {string} title Page title
   * @returns {string} Url of the page
   **/
  titleToUrl(title) {
    return _.chain(title)
      .replace(/ /g, '_')
      .replace(/'/g, '%27')
      .value();
  },

  /**
   * Return the list of all articles in a given category
   * @param {string} categoryName Name of the category
   * @param {object} userOptions Options:
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
        url: `${this.baseUrl}${article.url}`,
      }))
      .sortBy(['title'])
      .value();
  },

  /**
   * Returns the list of all category members of a given category
   * @param {string} categoryName Name of the category
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
      .reject(page => {
        const regexp = /(Category|Thread|User|Portal|Template):/i;
        return regexp.test(page.title);
      })
      .map(page => ({
        url: `${this.baseUrl}/${this.titleToUrl(page.title)}`,
        title: page.title,
      }))
      .value();
  },

  /**
   * Get article raw markup
   * @param {string} pageName Slug of the article
   * @returns {string} Raw page markup
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
   * @param {string} pageName Slug of the article
   * @returns {object} wtf_wikipedia document
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
   * @param {string} pageName Slug of the article
   * @returns {object} Data object
   **/
  async json(pageName) {
    const doc = await this.doc(pageName);
    return doc.json();
  },

  /**
   * Returns the url of an image identified by its name
   * @param {string} imageName Name of the image
   * @param {string} type Either special or api, to use different method of
   * getting the url based on the flavor of wiki
   * @returns {string} Url of the image
   * Note: It will check that the url actually resolve and will use
   * ./tmp/cache/images.json as a cache.
   **/
  async imageUrl(imageName, type = 'special') {
    const cacheFile = 'tmp/cache/images.json';
    const imageUrlName = this.titleToUrl(he.decode(imageName));

    // Load disk cache in RAM
    if (_.isEmpty(this._cacheImage)) {
      const diskCache = await readJson(cacheFile);
      this._cacheImage = diskCache || {};
    }

    // Check the cache in RAM
    const cacheHit = _.chain(this._cacheImage)
      .get(this.baseUrl)
      .get(imageUrlName)
      .value();
    if (cacheHit) {
      return cacheHit;
    }

    // Not in RAM, we fetch the real address
    // Not all wiki allow the same way of getting the url of an image
    // Some have a handy special entry that redirects to the right urls (like
    // wikia). Others (like gamepedia) require a call to the API to get the url
    const methodName = `imageUrlFrom${_.capitalize(type)}`;
    const imageUrl = await this[methodName](imageUrlName);

    const cachePath = `['${this.baseUrl}']['${imageUrlName}']`;
    _.set(this._cacheImage, cachePath, imageUrl);

    if (!imageUrl) {
      return null;
    }
    await writeJson(this._cacheImage, cacheFile);

    return imageUrl;
  },

  // Call the API to get the image url
  // https://pillarsofeternity.gamepedia.com/api.php?action=query&format=json&iiprop=url&prop=imageinfo&titles=File:Dagger_aattuuk_icon.png&
  async imageUrlFromApi(userImageName) {
    // Prefix with File: if not already the case
    const imageName = _.startsWith(userImageName, 'File:')
      ? userImageName
      : `File:${userImageName}`;

    // Query the url
    const querystring = qs.stringify({
      action: 'query',
      prop: 'imageinfo',
      iiprop: 'url',
      format: 'json',
      titles: imageName,
    });
    const apiUrl = `${this.baseUrl}/api.php?${querystring}&`;
    const response = await readJsonUrl(apiUrl);
    const pages = _.get(response, 'query.pages');

    // If pages has a -1 key, the file does not exist
    if (_.has(pages, '-1')) {
      return null;
    }

    const id = _.first(_.keys(pages));
    return _.get(pages, `${id}.imageinfo[0].url`);
  },

  // Returns an image url by using the wiki/Special:FilePath/File:Filename.png
  // endpoint
  async imageUrlFromSpecial(imageName) {
    const specialUrl = `${this.baseUrl}/wiki/Special:FilePath/${imageName}`;
    try {
      const response = await got(specialUrl);
      return response.url;
    } catch (error) {
      return null;
    }
  },

  /**
   * Returns an object representing the infobox
   * @param {string} pageName Name of the page
   * @returns {object} Infobox as an object
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
   * @param {string} pageName Name of the page
   * @returns {boolean} True if is a stub
   **/
  async isStub(pageName) {
    const markup = await this.markup(pageName);
    if (_.includes(markup, '{{stub}}')) {
      return true;
    }
    return false;
  },

  /**
   * Check if the page is a redirect
   * @param {string} pageName Name of the page
   * @returns {boolean} True if is a redirect
   **/
  async isRedirect(pageName) {
    const markup = await this.markup(pageName);
    return _.includes(markup, '#REDIRECT');
  },
};
