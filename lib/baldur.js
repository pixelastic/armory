import firost from 'firost';
import wiki from './wiki';
import { _, pMap, pMapSeries, chalk } from 'golgoth';

const module = {
  async getDescription(itemName) {
    const doc = await wiki.doc(itemName);
    return _.chain(doc.templates())
      .find({ template: 'quote' })
      .get('text')
      .value();
  },

  /**
   * Crawl all Baldur pages and get a list of all magical items
   * @returns {Void}
   **/
  async run() {
    wiki.init('http://baldursgate.wikia.com');
    const items = await wiki.articles('Items', { limit: 15 });

    let records = await pMapSeries(items, async item => {
      const isStub = await wiki.isStub(item.title);
      if (isStub) {
        return null;
      }

      const description = await this.getDescription(item.title);

      const infobox = await wiki.infobox(item.title);
      const price = _.toNumber(_.get(infobox, 'itemValue', 0));
      const loreToIdentify = _.toNumber(_.get(infobox, 'loreToIdentify', 0));
      const enchantmentLevel = _.toNumber(
        _.get(infobox, 'enchantmentLevel', 0)
      );

      const imageName = _.get(infobox, 'image');
      const imageUrl = await wiki.imageUrl(imageName);

      return {
        title: item.title,
        url: item.url,
        description,
        picture: imageUrl,
        price,
        loreToIdentify,
        enchantmentLevel,
      };
    });
    records = _.compact(records);

    console.info(records);

    // console.info(records);

    // const content = await wiki.markup('Carsomyr');
    // const isStub = await wiki.isStub('Carsomyr');
    // console.info(content);
    // const allArticles = await this.getAllArticles(50);

    // let records = await pMapSeries(
    //   allArticles,
    //   async item => {
    //     const link = `${wikiUrl}/${item.slug}`;

    //     // Skip stubs
    //     const isStub = await this.isStub(item.slug);
    //     if (isStub) {
    //       console.info(chalk.red(`✘ Stub: ${link}`));
    //       return null;
    //     }

    //     // Skip non-magical items
    //     const isMagical = await this.isMagical(item.slug);
    //     if (!isMagical) {
    //       console.info(chalk.red(`✘ Not magical: ${link}`));
    //       return null;
    //     }

    //     // Skip empty description
    //     const description = await this.getItemDescription(item.slug);
    //     if (!description) {
    //       console.info(chalk.red(`✘ No description: ${link}`));
    //       return null;
    //     }

    //     // Skip missing images
    //     const picture = await this.getItemImageUrl(item.slug);
    //     if (!picture) {
    //       console.info(chalk.red(`✘ No image: ${link}`));
    //       return null;
    //     }

    //     return {
    //       name: item.title,
    //       description,
    //       picture,
    //       url: link,
    //     };
    //   },
    //   { concurrency: 2 }
    // );

    // records = _.compact(records);

    // TODO: Download pictures to ./src/assets/baldur/{slug.png}
    // TODO: Save all records into one file
  },
};

export default _.bindAll(module, _.functions(module));
