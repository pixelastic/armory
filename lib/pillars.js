const wiki = require('./wiki');
const _ = require('golgoth/lib/lodash');
const spinner = require('firost/lib/spinner');
const chalk = require('golgoth/lib/chalk');
const pMap = require('golgoth/lib/pMap');
const pMapSeries = require('golgoth/lib/pMapSeries');
const writeJson = require('firost/lib/writeJson');

module.exports = {
  async run() {
    wiki.init('https://pillarsofeternity.gamepedia.com');
    const categories = [
      'Pillars_of_Eternity_unique_items',
      'The_White_March_-_Part_I_unique_items',
      'The_White_March_-_Part_II_unique_items',
      'Pillars_of_Eternity_II:_Deadfire_unique_items',
      'Beast_of_Winter_unique_items',
      'Seeker,_Slayer,_Survivor_unique_items',
    ];
    const responses = await pMap(
      categories,
      async (category) => await wiki.categoryMembers(category)
    );

    const pages = _.chain(responses)
      .flatten()
      .reject((page) => _.startsWith(page.title, 'Category:'))
      .value();

    const progress = spinner(pages.length);
    let records = await pMapSeries(
      pages,
      async (page) => {
        const title = page.title;
        const originalUrl = page.url;

        // No price
        const price = await this.price(title);
        if (price <= 0) {
          progress.tick(chalk.red(`${title} (price)`));
          return null;
        }

        // No description
        const description = await this.description(title);
        if (!description) {
          progress.tick(chalk.red(`${title} (description)`));
          return null;
        }

        // No picture
        const picture = await this.picture(title);
        if (!picture) {
          progress.tick(chalk.red(`${title} (picture)`));
          return null;
        }

        progress.tick(chalk.green(title));

        return {
          title,
          originalUrl,
          description,
          price,
          picture,
        };
      },
      { concurrency: 50 }
    );
    progress.success('All pages downloaded');

    records = _.chain(records).compact().sortBy(['title']).value();

    await writeJson(records, './records/pillars.json');
  },

  /**
   * Returns the price of the item
   * @param {string} itemName Name of the item
   * @returns {number} Price
   **/
  async price(itemName) {
    const infobox = await wiki.infobox(itemName);
    return _.chain(infobox).get('value', 0).toNumber().value();
  },

  /**
   * Returns the url of the picture of a specific item
   * @param {string} itemName Name of the item
   * @returns {string} Url of the image
   **/
  async picture(itemName) {
    const infobox = await wiki.infobox(itemName);
    const imageName = _.get(infobox, 'icon');
    if (!imageName) {
      return null;
    }
    return await wiki.imageUrl(imageName, 'api');
  },

  /**
   * Get an item description
   * @param {string} itemName Name of the item
   * @returns {string} Description
   **/
  async description(itemName) {
    const infobox = await wiki.infobox(itemName);
    return _.chain(infobox).get('description').value();
  },
};
