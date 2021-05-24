const readJson = require('firost/readJson');
const download = require('firost/download');
const spinner = require('firost/spinner');
const _ = require('golgoth/lodash');
const pMap = require('golgoth/pMap');
const path = require('path');

(async function () {
  const items = await readJson('records/baldur.json');
  const progress = spinner(items.length);
  await pMap(
    items,
    async (item) => {
      const name = _.camelCase(item.title);
      const pictureUrl = item.picture;
      const downloadPath = path.resolve(
        `src/assets/pictures/baldur/${name}.png`
      );
      progress.tick(name);
      await download(pictureUrl, downloadPath);
    },
    { concurrency: 5 }
  );
  progress.success('ok');
})();
