import wiki from './wiki';
import firost from 'firost';
import { _, chalk, pMap } from 'golgoth';

const module = {
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
      async category => await wiki.categoryMembers(category)
    );

    const pages = _.chain(responses)
      .flatten()
      .reject(page => _.startsWith(page.title, 'Category:'))
      .value();

    const spinner = firost.spinner(pages.length);
    let records = await pMap(
      pages,
      async page => {
        const title = page.title;
        const originalUrl = page.url;

        const description = await this.description(title);
        const price = await this.price(title);
        const picture = await this.picture(title);

        if (!description || !picture || price <= 0) {
          spinner.tick(chalk.red(title));
          return null;
        }

        spinner.tick(chalk.green(title));

        return {
          title,
          originalUrl,
          description,
          price,
          picture,
        };
      },
      { concurrency: 10 }
    );
    spinner.succeed('All pages downloaded');

    records = _.chain(records)
      .compact()
      .sortBy(['title'])
      .value();

    await firost.writeJson('./records/pillars.json', records);
  },

  /**
   * Returns the price of the item
   * @param {String} itemName Name of the item
   * @returns {Number} Price
   **/
  async price(itemName) {
    const infobox = await wiki.infobox(itemName);
    return _.chain(infobox)
      .get('value', 0)
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
      .get('icon')
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
    const infobox = await wiki.infobox(itemName);
    return _.chain(infobox)
      .get('description')
      .value();
  },
};

export default _.bindAll(module, _.functions(module));
