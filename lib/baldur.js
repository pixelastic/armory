import firost from 'firost';
import { _, pMap, pMapSeries, chalk } from 'golgoth';
/**
 * Get all items, with id and name
 * For each name, fetch both the revision and the images
 * Extract the quote, the real name and the image
 * Save the image in ./src/assets/baldur/{name}
 * Save the list of records in ./records/baldur.json
 **/

const wikiUrl = 'http://baldursgate.wikia.com';

const module = {
  _cache: {},
  /**
   * Read json at a specified url. Uses and internal cache
   * @param {String} url Url of the JSON data
   * @returns {Object} JSON-parsed object
   **/
  async readJsonUrl(url) {
    if (this._cache[url]) {
      return this._cache[url];
    }
    const data = await firost.readJsonUrl(url);
    this._cache[url] = data;
    return data;
  },
  /**
   * Get all wiki articles
   * @param {String} limit Number of articles to fetch (max 1225)
   * @returns {Array} List of all articles with .id, .title and .slug
   **/
  async getAllArticles(limit) {
    const articleUrls = `${wikiUrl}/api/v1/Articles/List?category=Items&limit=${limit}`;
    const { items } = await this.readJsonUrl(articleUrls);
    // We drop the first one as it's always the list itself
    return _.drop(
      _.map(items, item => ({
        id: item.id,
        title: item.title,
        slug: _.replace(item.url, '/wiki/', ''),
      }))
    );
  },
  /**
   * Get raw page revision
   * @param {String} articleSlug Slug of the article
   * @returns {String} Raw page markup
   **/
  async getRawArticleRevision(articleSlug) {
    const itemUrl = `${wikiUrl}/api.php?action=query&prop=revisions&rvprop=content&format=json&titles=${articleSlug}`;

    // The actual article revision is in a pretty deep nesting of keys...
    let itemData = await this.readJsonUrl(itemUrl);
    itemData = _.get(itemData, 'query.pages');
    const id = _.first(_.keys(itemData));
    itemData = itemData[id];
    itemData = _.get(itemData, 'revisions');
    itemData = _.get(_.first(itemData), '*');

    return itemData;
  },

  async isStub(articleSlug) {
    const revision = await this.getRawArticleRevision(articleSlug);
    const regexpStub = /{{stub}}/i;
    if (regexpStub.test(revision)) {
      return true;
    }

    return false;
  },

  /**
   * Check if the specified item is magical
   * @param {String} itemSlug Slug of the item
   * @returns {Boolean} True if lore to identify is required
   **/
  async isMagical(itemSlug) {
    const revision = await this.getRawArticleRevision(itemSlug);
    // Need lore to identify, must be magical
    const regexpLore = new RegExp('lore_to_identify\\s*=\\s*[0-9]*');
    if (regexpLore.test(revision)) {
      return true;
    }

    // Lore is not always set, so we check if it's an enchanted item
    const regexpEnchanted = new RegExp('enchanted', 'i');
    if (regexpEnchanted.test(revision)) {
      return true;
    }

    return false;
  },
  /**
   * Return the object in-game description
   * @param {String} itemSlug Slug of the item
   * @returns {String} Ingame description (part in {{quote|}})
   **/
  async getItemDescription(itemSlug) {
    const revision = await this.getRawArticleRevision(itemSlug);
    const regexpQuote = /{{Quote\|(?<description>[^}]*)}}/i;
    if (!regexpQuote.test(revision)) {
      return null;
    }
    const matches = regexpQuote.exec(revision);
    const quote = _.get(matches, 'groups.description');

    const regexpLinks = /\[\[((?<linkSlug>[^\]]*)?\|)?(?<text>.*?)\]\]/gi;
    const description = _.chain(quote)
      // Some quotes contain the name of the item in bold as the first line
      .replace(/^'''(.*)'''/, '')
      .replace('<br />', '\n')
      .replace(regexpLinks, '$<text>')
      .trim()
      .value();

    return description;
  },

  async getItemImageName(itemSlug) {
    const revision = await this.getRawArticleRevision(itemSlug);
    const regexpImage = /image\s*=\s*(.*?)\|/is;

    if (!regexpImage.test(revision)) {
      return null;
    }

    const matches = regexpImage.exec(revision);
    const filename = _.trim(matches[1]);
    return filename;
  },

  async getItemImageUrl(itemSlug) {
    let imageName = await this.getItemImageName(itemSlug);
    if (!_.startsWith(imageName, 'File:')) {
      imageName = `File:${imageName}`;
    }

    const imagesUrl = `${wikiUrl}/api.php?action=query&prop=imageinfo&iiprop=url&format=json&titles=${imageName}`;
    const data = await this.readJsonUrl(imagesUrl);

    const pages = _.get(data, 'query.pages');
    const id = _.first(_.keys(pages));
    return _.get(pages[id], 'imageinfo[0].url');
  },

  /**
   * Crawl all Baldur pages and get a list of all magical items
   * @returns {Void}
   **/
  async run() {
    const allArticles = await this.getAllArticles(50);

    let records = await pMapSeries(
      allArticles,
      async item => {
        const link = `${wikiUrl}/${item.slug}`;

        // Skip stubs
        const isStub = await this.isStub(item.slug);
        if (isStub) {
          console.info(chalk.red(`✘ Stub: ${link}`));
          return null;
        }

        // Skip non-magical items
        const isMagical = await this.isMagical(item.slug);
        if (!isMagical) {
          console.info(chalk.red(`✘ Not magical: ${link}`));
          return null;
        }

        // Skip empty description
        const description = await this.getItemDescription(item.slug);
        if (!description) {
          console.info(chalk.red(`✘ No description: ${link}`));
          return null;
        }

        // Skip missing images
        const picture = await this.getItemImageUrl(item.slug);
        if (!picture) {
          console.info(chalk.red(`✘ No image: ${link}`));
          return null;
        }

        return {
          name: item.title,
          description,
          picture,
          url: link,
        };
      },
      { concurrency: 2 }
    );

    records = _.compact(records);

    // TODO: Download pictures to ./src/assets/baldur/{slug.png}
    // TODO: Save all records into one file
  },
};

export default _.bindAll(module, _.functions(module));
