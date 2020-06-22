const wiki = require('./wiki');
const _ = require('golgoth/lib/lodash');
const spinner = require('firost/lib/spinner');
const chalk = require('golgoth/lib/chalk');
const pMap = require('golgoth/lib/pMap');
const writeJson = require('firost/lib/writeJson');

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
        };
      },
      { concurrency: 50 }
    );
    progress.success('All pages downloaded');

    records = _.chain(records)
      .compact()
      .sortBy(['title'])
      .value();

    await writeJson(records, './records/baldur.json');
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
