import wiki from './wiki';
import wtf from 'wtf_wikipedia';
import { _, spinner, firost, chalk, pMap } from 'golgoth';

const module = {
  async run() {
    wiki.init('http://darksouls.wikia.com');
    const categories = [
      'Dark_Souls:_Weapons',
      'Dark_Souls:_Armor',
      'Dark_Souls:_Rings',
      'Dark_Souls_II:_Weapons',
      'Dark_Souls_II:_Armor',
      'Dark_Souls_II:_Ring',
      'Dark_Souls_III:_Weapons',
      'Dark_Souls_III:_Armor',
      'Dark_Souls_III:_Ring',
    ];
    const responses = await pMap(
      categories,
      async category => await wiki.categoryMembers(category)
    );

    const pages = _.flatten(responses);
    // const pages = [ { title: "Pate's Spear" } ];

    const progress = spinner(pages.length);
    let records = await pMap(
      pages,
      async page => {
        const title = page.title;
        const originalUrl = page.url;

        // Skip redirects
        if (await wiki.isRedirect(title)) {
          progress.tick(chalk.red(`${title} (redirect)`));
          return null;
        }

        // Skip sets and comparisons
        if (this.isSet(title) || this.isComparison(title)) {
          progress.tick(chalk.red(`${title} (set or comparison)`));
          return null;
        }

        // Skip listings
        if (await this.isListingPage(title)) {
          progress.tick(chalk.red(`${title} (Listing)`));
          return null;
        }

        // Skip items removed from released game
        if (await this.isRemoved(title)) {
          progress.tick(chalk.red(`${title} (removed from game)`));
          return null;
        }

        // Skip items from beta
        if (await this.isBeta(title)) {
          progress.tick(chalk.red(`${title} (beta content)`));
          return null;
        }

        // Skip achievements
        if (await this.isAchievement(title)) {
          progress.tick(chalk.red(`${title} (achievement)`));
          return null;
        }

        const description = await this.description(title);
        // Skip empty descriptions
        if (!description) {
          progress.tick(chalk.red(`${title} (no description)`));
          return null;
        }

        const picture = await this.picture(title);
        // Skip empty pictures
        if (!picture) {
          progress.tick(chalk.red(`${title} (no pictures)`));
          return null;
        }

        progress.tick(chalk.green(title));

        return {
          title,
          originalUrl,
          description,
          picture,
        };
      },
      { concurrency: 25 }
    );
    progress.succeed('All pages downloaded');

    records = _.chain(records)
      .compact()
      .sortBy(['title'])
      .value();

    await firost.writeJson('./records/darksouls.json', records);
  },

  /**
   * Check if the item has been removed from the game
   * @param {String} itemName Name of the item
   * @returns {Boolean} True if removed from the game
   **/
  async isRemoved(itemName) {
    const doc = await wiki.doc(itemName);
    return _.chain(doc.categories())
      .some(category => _.includes(category, 'Removed Content'))
      .value();
  },

  /**
   * Check if the item was from the beta
   * @param {String} itemName Name of the item
   * @returns {Boolean} True if from the beta
   **/
  async isBeta(itemName) {
    const markup = await wiki.markup(itemName);
    return _.includes(markup, '{{BetaContent}}');
  },

  /**
   * Check if the page is a set
   * @param {String} pageName Name of the page
   * @returns {Boolean} True if is a set
   **/
  isSet(pageName) {
    const regexps = [/Sets?( \(.*\))?$/i, /^Set of/i];

    return _.some(regexps, regexp => regexp.test(pageName));
  },

  /**
   * Check if the page is a set
   * @param {String} pageName Name of the page
   * @returns {Boolean} True if is a set
   **/
  isComparison(pageName) {
    const regexp = /Comparison$/i;
    return regexp.test(pageName);
  },

  /**
   * Check if the specified page is a listing (for weapons, armor, etc)
   * @param {String} itemName Name of the item
   * @returns {Boolean} True if is a listing
   **/
  async isListingPage(itemName) {
    const doc = await wiki.doc(itemName);
    const text = doc.text();
    const matches = [
      'are armor pieces',
      'are a catalyst used to',
      'are a class of',
      'are a design and classification',
      'are a property of',
      'are a sub-type of weapons',
      'are a type of',
      'are a weapon type',
      'are casting tools',
      'are catalysts used to',
      'are the weapons in',
      'are used to cast sorceries',
      'is a type of equipment',
    ];
    return _.some(matches, match => _.includes(text, match));
  },

  /**
   * Check if the page is about an achievement
   * @param {String} pageName Name of the page
   * @returns {Boolean} True if is about an achievement
   **/
  async isAchievement(pageName) {
    const doc = await wiki.doc(pageName);
    return _.includes(doc.text(), 'is an achievement');
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
    return (
      _.chain(matches)
        .get('groups.description')
        // Remove new lines
        .replace(/<br ?\/?>/g, ' ')
        .replace('\n', '')
        // Split per paragraph
        .replace(/First paragraph\s*=\s*/gi, '')
        .replace(
          /\s?\|\s?(Second|Third|Fourth) paragraph\s*=\s*/gi,
          '__NEWLINE__'
        )
        // Convert potential links (will remove \n)
        .thru(description => wtf(description).text())
        // Add lines between paragraphs
        .replace(/__NEWLINE__/g, '\n')
        // Remove potential in-game description
        .replace(/Effect: (.*)\n?$/g, '')
        .replace(/Skill: (.*)\n?$/g, '')
        .trim()
        .value()
    );
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
          `{{(Template:)?((DA?SIII?)?(Armor|Item|Weapon|CastingTool|Ring)).*${possibleName}\\s*=\\s*(?<image>.*?)\\n?(\\||}})`,
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
      .replace(/<tabber>(Normal|Original)\s*=\s*/, '')
      .trim()
      .value();

    return await wiki.imageUrl(imageName);
  },
};

export default _.bindAll(module, _.functions(module));
