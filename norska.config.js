const baldurItems = require('./src/_data/baldur.json');
const pMap = require('golgoth/lib/pMap');
const isProduction = process.env.NODE_ENV === 'production';

module.exports = {
  cloudinary: {
    bucketName: 'pixelastic-artefacts',
  },
  hooks: {
    async afterHtml({ createPage }) {
      const template = '_includes/_layouts/item.pug';

      let items = [...baldurItems];
      // Include fewer items in dev, to make reloading faster
      if (!isProduction) {
        items = [baldurItems[332]];
      }
      await pMap(items, async (item) => {
        const { gameSlug, slug } = item;
        const destination = `${gameSlug}/${slug}/index.html`;
        const pageData = { item };
        await createPage(template, destination, pageData);
      });
    },
  },
};
