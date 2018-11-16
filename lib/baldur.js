import wiki from './wiki';
import firost from 'firost';
import { _, chalk, pMap } from 'golgoth';

const module = {
  /**
   * Crawl all Baldur pages and get a list of all magical items
   * @returns {Void}
   **/
  async run() {
    wiki.init('http://baldursgate.wikia.com');
    const items = await wiki.articles('Items');
    // const items = [ { title: 'Carsomyr' } ];

    let records = await pMap(items, async item => {
      const itemName = item.title;
      const isStub = await wiki.isStub(itemName);
      const isMagical = await this.isMagical(itemName);
      const description = await this.description(itemName);
      const picture = await this.picture(itemName);
      if (isStub || !isMagical || !description || !picture) {
        console.info(chalk.red(`✘ ${itemName}`));
        return null;
      }

      const price = await this.price(itemName);

      console.info(chalk.green(`✔ ${itemName}`));

      return {
        title: itemName,
        originalUrl: item.url,
        description,
        price,
        picture,
      };
    });
    records = _.chain(records)
      .compact()
      .sortBy(['title'])
      .value();

    await firost.writeJson('./records/baldur.json', records);
  },

  /**
   * Returns the price of the item
   * @param {String} itemName Name of the item
   * @returns {Number} Price
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
   * @param {String} itemName Name of the item
   * @returns {String} Url of the image
   **/
  async picture(itemName) {
    const infobox = await wiki.infobox(itemName);
    const imageName = _.chain(infobox)
      .get('image')
      .replace(/^File:/, '')
      .value();
    return await wiki.imageUrl(imageName);
  },

  /**
   * Get an item description
   * @param {String} itemName Name of the item
   * @returns {String} Description
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
        .replace('<br />', '\n')
        .replace('<br>', '\n')
        .trim()
        .value()
    );
  },

  /**
   * Check if an item is magical
   * @param {String} itemName Name of the item
   * @returns {Boolean} True if the item is magical
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

export default _.bindAll(module, _.functions(module));
