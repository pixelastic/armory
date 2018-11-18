import wiki from './wiki';
import firost from 'firost';
import { _, chalk, pMap } from 'golgoth';

const module = {
  async run() {
    wiki.init('http://darksouls.wikia.com');
    const categories = [
      'Dark_Souls:_Weapons',
      'Dark_Souls:_Armor',
      'Dark_Souls:_Rings',
      'Dark_Souls_II:_Weapons',
      // 'Dark_Souls_II:_Armor',
      // 'Dark_Souls_II:_Ring',
      // 'Dark_Souls_III:_Weapons',
      // 'Dark_Souls_III:_Armor',
      // 'Dark_Souls_III:_Ring',
    ];
    const responses = await pMap(
      categories,
      async category => await wiki.categoryMembers(category)
    );

    const pages = _.chain(responses)
      .flatten()
      .reject(page => _.startsWith(page.title, 'Category:'))
      .reject(page => _.startsWith(page.title, 'Thread:'))
      .value();

    const spinner = firost.spinner(pages.length);
    let records = await pMap(
      pages,
      async page => {
        const title = page.title;
        const originalUrl = page.url;

        const description = await this.description(title);
        const picture = await this.picture(title);

        if (!description || !picture) {
          console.info(' ');
          console.info(`## ${originalUrl}`);
          console.info(`Desc: ${description}`);
          console.info(`Pic: ${picture}`);
          console.info(' ');
          spinner.tick(chalk.red(title));
          return null;
        }

        spinner.tick(chalk.green(title));

        return {
          title,
          originalUrl,
          description,
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

    await firost.writeJson('./records/darksouls.json', records);
  },

  /**
   * Get an item description
   * @param {String} itemName Name of the item
   * @returns {String} Description
   **/
  async description(itemName) {
    const regexpQuote = /{{Description\s*\|(?<description>[^}]*)}}/i;

    const markup = await wiki.markup(itemName);
    if (!regexpQuote.test(markup)) {
      return null;
    }

    const matches = regexpQuote.exec(markup);
    return _.chain(matches)
      .get('groups.description')
      .replace(/\|/g, '')
      .replace(/(First|Second|Third) paragraph\s*=\s*/gi, '')
      .replace(/ {2}/g, ' ')
      .replace(/<br ?\/?>/g, ' ')
      .replace(/Effect: (.*)\n?$/g, '')
      .trim()
      .value();
  },

  /**
   * Returns the url of the picture of a specific item
   * @param {String} itemName Name of the item
   * @returns {String} Url of the image
   **/
  async picture(itemName) {
    const markup = await wiki.markup(itemName);

    // Images can be saved either in the name-image or image key
    // Images in image can themselves be a template, so we'd rather read the
    // name-image if defined.
    // We check all the regexp until one is matching and we'll use that one
    const possibleNames = ['name-image', 'image'];
    const possibleRegexp = _.map(
      possibleNames,
      possibleName =>
        new RegExp(
          `{{(Armor|DASIIWeapon|CastingTool|Ring|Weapon).*${possibleName}\\s*=\\s*(?<image>.*?)\\n?\\|`,
          'is'
        )
    );
    const regexpImage = _.find(possibleRegexp, regexp => regexp.test(markup));

    if (!regexpImage) {
      return null;
    }

    const matches = regexpImage.exec(markup);
    const imageName = _.chain(matches)
      .get('groups.image')
      .replace(/\[\[File:(?<filename>.*)\]\]/, '$<filename>')
      .trim()
      .value();
    return await wiki.imageUrl(imageName);
  },
};

export default _.bindAll(module, _.functions(module));
