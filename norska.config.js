const baldurItems = require('./src/_data/baldur.json');
const pMap = require('golgoth/pMap');
const isProduction = process.env.NODE_ENV === 'production';
const _ = require('golgoth/lodash');

module.exports = {
  cloudinary: 'pixelastic-artefacts',
  hooks: {
    async afterHtml({ createPage }) {
      const template = '_includes/hooks/item.pug';

      let items = [...baldurItems];
      // Include fewer items in dev, to make reloading faster
      if (!isProduction) {
        items = _.filter(items, { title: 'Ring of the Ram' });
      }
      await pMap(items, async (item) => {
        const { gameSlug, slug } = item;
        const destination = `${gameSlug}/${slug}/index.html`;
        const pageData = {
          item,
          meta: {
            title: item.title,
            description: item.description,
          },
        };
        await createPage(template, destination, pageData);
      });
    },
  },
};
