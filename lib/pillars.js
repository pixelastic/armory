import wiki from './wiki';
import firost from 'firost';
import { _, progress as ProgressBar, pMap, pAll } from 'golgoth';

const module = {
  /**
   * Crawl all Baldur pages and get a list of all magical items
   * @returns {Void}
   **/
  async run() {
    wiki.init('https://pillarsofeternity.gamepedia.com');
    const pages = _.flatten(
      await pAll([
        async () =>
          await wiki.categoryMembers('Pillars_of_Eternity_unique_items'),
        async () =>
          await wiki.categoryMembers(
            'Pillars_of_Eternity_II:_Deadfire_unique_items'
          ),
      ])
    );
    const progress = new ProgressBar('[:bar] :current/:total', {
      total: pages.length,
    });

    let records = await pMap(
      pages,
      async page => {
        const originalUrl = page.url;
        const pageName = page.title;

        const title = await this.title(pageName);
        const description = await this.description(pageName);
        const price = await this.price(pageName);
        const picture = await this.picture(pageName);
        progress.tick();

        if (!description || !picture) {
          return null;
        }

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

    records = _.chain(records)
      .compact()
      .sortBy(['title'])
      .value();

    await firost.writeJson('./records/pillars.json', records);
  },

  /**
   * Return the item name
   * @param {String} pageName Name of the page
   * @returns {String} Name of the item
   **/
  async title(pageName) {
    const infobox = await wiki.infobox(pageName);
    return _.get(infobox, 'name');
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
