const wiki = require('../wiki');
const _ = require('golgoth/lib/lodash');
const spinner = require('firost/lib/spinner');
const chalk = require('golgoth/lib/chalk');
const pMap = require('golgoth/lib/pMap');
const writeJson = require('firost/lib/writeJson');
const pluralize = require('pluralize');
const blocklistCategories = require('./blocklistCategories.js');
const garbageCategories = require('./garbageCategories.js');

module.exports = {
  async run() {
    wiki.init('http://baldursgate.wikia.com');
    const items = await wiki.articles('Items');
    // const items = [ { title: 'Carsomyr' } ];

    const progress = spinner(items.length);

    let records = await pMap(
      items,
      async item => {
        const title = item.title;

        // Skipping stubs
        const isStub = await wiki.isStub(title);
        if (isStub) {
          progress.tick(chalk.red(`${title} (stub)`));
          return null;
        }

        // Not magical
        const isMagical = await this.isMagical(title);
        if (!isMagical) {
          progress.tick(chalk.red(`${title} (not magical)`));
          return null;
        }

        // No type set
        const type = await this.type(title);
        if (_.includes(garbageCategories, type)) {
          progress.tick(chalk.red(`${title} (bad type: ${type})`));
          return null;
        }

        // No description
        const description = await this.description(title);
        if (!description) {
          progress.tick(chalk.red(`${title} (no description)`));
          return null;
        }

        // No picture
        const picture = await this.picture(title);
        if (!picture) {
          progress.tick(chalk.red(`${title} (no picture)`));
          return null;
        }

        const price = await this.price(title);

        progress.tick(chalk.green(title));

        return {
          title,
          originalUrl: item.url,
          description,
          price,
          picture,
          type,
        };
      },
      { concurrency: 50 }
    );
    progress.success('All pages downloaded');

    const game = "Baldur's Gate";
    const gameSlug = 'baldur';

    records = _.chain(records)
      .compact()
      .sortBy(['title'])
      .map(record => {
        const slug = _.camelCase(record.title);
        return {
          ...record,
          game,
          gameSlug,
          slug,
        };
      })
      .value();

    await writeJson(records, './src/_data/baldur.json');
  },

  /**
   * Returns the price of the item
   * @param {string} itemName Name of the item
   * @returns {number} Price
   **/
  async price(itemName) {
    const infobox = await wiki.infobox(itemName);
    return _.chain(infobox)
      .get('itemValue', 0)
      .replace(',', '')
      .replace('.', '')
      .replace(
        /(?<firstNumberPart>[0-9]*)(?<anythingElse>.*)/,
        '$<firstNumberPart>'
      )
      .toNumber()
      .value();
  },

  /**
   * Returns the type of the item
   * @param {string} itemName Name of the item
   * @returns {number} Type
   **/
  async type(itemName) {
    const rawType =
      (await this.typeFromCategories(itemName)) ||
      (await this.typeFromInfobox(itemName)) ||
      'GARBAGE';
    const normalizeHash = {
      'Scimitar/Wakizashi/Ninjatō': 'Scimitar',
    };
    const type = normalizeHash[rawType] || rawType;
    return _.chain(pluralize(type, 1))
      .startCase()
      .replace('Two Handed', 'Two-Handed')
      .value();
  },

  /**
   * Guess the type from the categories
   * @param {string} itemName Name of the item
   * @returns {number} Type
   **/
  async typeFromCategories(itemName) {
    const json = await wiki.json(itemName);

    const categories = _.chain(json)
      .get('categories', [])
      .uniq()
      .difference(blocklistCategories)
      .value();

    return categories[0];
  },

  /**
   * Guess the type from the infobox
   * @param {string} itemName Name of the item
   * @returns {number} Type
   **/
  async typeFromInfobox(itemName) {
    const infobox = await wiki.infobox(itemName);
    return infobox.general || infobox.proficiencyType || infobox.itemGroup;
  },

  /**
   * Returns the url of the picture of a specific item
   * @param {string} itemName Name of the item
   * @returns {string} Url of the image
   **/
  async picture(itemName) {
    const infobox = await wiki.infobox(itemName);
    const imageName = _.get(infobox, 'image');
    if (!imageName) {
      return null;
    }
    return await wiki.imageUrl(imageName);
  },

  /**
   * Get an item description
   * @param {string} itemName Name of the item
   * @returns {string} Description
   **/
  async description(itemName) {
    const regexpQuote = /{{(Quote|Description)\s*\|(?<description>[^}]*)}}/i;
    const regexpLinks = /\[\[((?<linkSlug>[^\]]*)?\|)?(?<text>.*?)\]\]/gi;

    const markup = await wiki.markup(itemName);
    if (!regexpQuote.test(markup)) {
      return null;
    }

    const matches = regexpQuote.exec(markup);
    return (
      _.chain(matches)
        .get('groups.description')
        // Some descriptions start with the item name on the first line
        .replace(/^'''(.*)'''/, '')
        // Replaces [[link]] and [[title|link]] markup
        .replace(regexpLinks, '$<text>')
        // Removes markup leftovers like header=yes|
        .replace(/(.*?)=(.*?)\|/g, '')
        // Some description end with the object name after a |
        .replace(/(?<description>[^|]*)\|(?<name>.*)$/, '$<description>')
        .replace('<br />', '\n')
        .replace('<br>', '\n')
        .trim()
        .value()
    );
  },

  /**
   * Check if an item is magical
   * @param {string} itemName Name of the item
   * @returns {boolean} True if the item is magical
   **/
  async isMagical(itemName) {
    const infobox = await wiki.infobox(itemName);

    // Item needs to be identified. Definitely magical
    const requiredLore = _.chain(infobox)
      .get('loreToIdentify', 0)
      .toNumber()
      .value();
    if (requiredLore > 0) {
      return true;
    }

    // Contains the word "enchanted"
    const description = await wiki.markup(itemName);
    if (_.includes(description, 'enchanted')) {
      return true;
    }

    return false;
  },
};
