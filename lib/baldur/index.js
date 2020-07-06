const wiki = require('../wiki');
const _ = require('golgoth/lib/lodash');
const spinner = require('firost/lib/spinner');
const chalk = require('golgoth/lib/chalk');
const pMap = require('golgoth/lib/pMap');
const writeJson = require('firost/lib/writeJson');
const pluralize = require('pluralize');
const blocklistCategories = require('./blocklistCategories.js');
const garbageItems = require('./garbageItems.js');
const normalizedTypes = require('./normalizedTypes.js');
const objectHash = require('node-object-hash')().hash;

const list = {};

module.exports = {
  async run() {
    wiki.init('http://baldursgate.wikia.com');
    const items = await wiki.articles('Items');
    // const items = [ { title: 'Carsomyr' } ];

    const progress = spinner(items.length);

    let records = await pMap(
      items,
      async (item) => {
        const title = item.title;

        // Skipping garbage items
        if (_.includes(garbageItems, title)) {
          progress.tick(chalk.red(`${title} (garbage)`));
          return null;
        }

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
        if (type === 'GARBAGE') {
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
        const typePlural = this.typePlural(type);
        const cleanTitle = this.formatTitle(title);

        progress.tick(chalk.green(title));

        return {
          title: cleanTitle,
          originalUrl: item.url,
          description,
          price,
          picture,
          type,
          typePlural,
        };
      },
      { concurrency: 50 }
    );
    progress.success('All pages downloaded');

    _.chain(list)
      .map((value, key) => {
        return { name: key, count: value };
      })
      .sortBy(['count', 'name'])
      .reverse()
      .each((entry) => {
        console.info(`${entry.name}: ${entry.count}`);
      })
      .value();

    const game = "Baldur's Gate";
    const gameSlug = 'baldur';

    records = _.chain(records)
      .compact()
      .sortBy(['title'])
      .map((rawRecord) => {
        const slug = _.camelCase(rawRecord.title);
        const uniqueSlug = `${gameSlug}-${slug}`;
        const record = {
          ...rawRecord,
          game,
          gameSlug,
          uniqueSlug,
          slug,
        };
        const coordinates = this.coordinates(record);
        return {
          ...record,
          _geoloc: coordinates,
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

    let type = _.startCase(pluralize(rawType, 1));
    type = normalizedTypes[type] || type;

    return _.replace(type, 'Two Handed', 'Two-Handed');
  },

  typePlural(type) {
    return pluralize(type);
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
        .replace(new RegExp(`^${itemName}\n`), '')
        .replace(new RegExp('^(.*) \\+[0-9]:? (.*)\\n'), '')
        // Replaces [[link]] and [[title|link]] markup
        .replace(regexpLinks, '$<text>')
        // Removes markup leftovers like header=yes|
        .replace(/(.*?)=(.*?)\|/g, '')
        // Some description end with the object name after a |
        .replace(/(?<description>[^|]*)\|(?<name>.*)$/, '$<description>')
        // Replace <PRO_*>
        .replace(/<PRO_HIMHER>/g, 'them')
        .replace(/<PRO_HISHER>/g, 'their')
        .replace(/<PRO_HESHE>/g, 'they')
        .replace(/<PRO_MANWOMAN>/g, 'person')
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
  /**
   * Cleanup a title
   * @param {string} title Initial title
   * @returns {string} Cleanup title
   **/
  formatTitle(title) {
    return title.replace(/(.*) \(.*\)/, '$1');
  },
  /**
   * Return random coordinates from the object
   * We get a hash of the object, and then parse parts of it in base 16 to have
   * an integer
   * @param {object} record Record to get coordinates from
   * @returns {object} Object to be used with _geoloc key
   **/
  coordinates(record) {
    const hash = objectHash(record);
    const lat = this.hexa2coordinate(hash.slice(0, 4));
    const lng = this.hexa2coordinate(hash.slice(4, 8));
    return { lat, lng };
  },
  /**
   * Converts an hexa string to a float usable as a coordinate
   * @param {string} input hexadecima string (4 chars long)
   * @returns {number} float number for a coordinate
   **/
  hexa2coordinate(input) {
    const value = _.parseInt(input, 16) / 1000;
    // Check for sign based on if last number is odd or even
    return _.parseInt(input[0], 16) % 2 ? value : -value;
  },
};
