const indexing = require('algolia-indexing');
const pMap = require('golgoth/lib/pMap');
const _ = require('golgoth/lib/lodash');
const readJson = require('firost/lib/readJson');
const glob = require('firost/lib/glob');
const algoliaConfig = require('../src/_data/algolia.js');

(async function() {
  const credentials = {
    appId: algoliaConfig.appId,
    apiKey: process.env.ALGOLIA_API_KEY,
    indexName: algoliaConfig.indexName,
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

  const files = await glob('./src/_data/baldur.json');
  const gameRecords = await pMap(files, async filepath => {
    return await readJson(filepath);
  });
  const records = _.flatten(gameRecords);
  await indexing.fullAtomic(credentials, records, settings);
})();
