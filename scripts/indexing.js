const indexing = require('algolia-indexing');
const pMap = require('golgoth/lib/pMap');
const _ = require('golgoth/lib/lodash');
const readJson = require('firost/lib/readJson');
const glob = require('firost/lib/glob');

(async function () {
  const credentials = {
    appId: process.env.ALGOLIA_APP_ID,
    apiKey: process.env.ALGOLIA_API_KEY,
    indexName: process.env.ALGOLIA_INDEX_NAME,
  };
  const settings = {
    searchableAttributes: ['title', 'description'],
    attributesForFaceting: ['game', 'type'],
    customRanking: ['desc(wordCount)'],
  };

  indexing.verbose();
  indexing.config({
    batchMaxSize: 100,
  });

  const files = await glob('./records/baldur.json');
  const gameRecords = await pMap(files, async (filepath) => {
    const items = await readJson(filepath);
    return _.map(items, (item) => {
      const wordCount = _.words(item.description).length;
      return {
        ...item,
        wordCount,
      };
    });
  });
  const records = _.flatten(gameRecords);
  await indexing.fullAtomic(credentials, records, settings);
})();
