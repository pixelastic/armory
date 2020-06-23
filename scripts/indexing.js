const indexing = require('algolia-indexing');
const pMap = require('golgoth/lib/pMap');
const _ = require('golgoth/lib/lodash');
const readJson = require('firost/lib/readJson');
const glob = require('firost/lib/glob');
const path = require('path');

(async function() {
  const credentials = {
    appId: process.env.ALGOLIA_APP_ID,
    apiKey: process.env.ALGOLIA_API_KEY,
    indexName: process.env.ALGOLIA_INDEX_NAME,
  };
  const settings = {
    searchableAttributes: ['title', 'description'],
    attributesForFaceting: ['game'],
    customRanking: [],
  };

  indexing.verbose();
  indexing.config({
    batchMaxSize: 100,
  });

  const gameNames = {
    baldur: "Baldur's Gate",
    darksouls: 'Dark Souls',
    pillars: 'Pillars of Eternity',
  };

  const files = await glob('./src/_data/baldur.json');
  const gameRecords = await pMap(files, async filepath => {
    const items = await readJson(filepath);
    const gameSlug = path.basename(filepath, '.json');
    const gameName = gameNames[gameSlug];
    return _.map(items, item => {
      const { title, description, originalUrl } = item;
      const slug = _.camelCase(title);
      return {
        title,
        description,
        originalUrl,
        slug,
        gameSlug,
        gameName,
      };
    });
  });
  const records = _.flatten(gameRecords);
  await indexing.fullAtomic(credentials, records, settings);
})();
