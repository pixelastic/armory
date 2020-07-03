const common = require('./_scripts/common.js');
const item = require('./_scripts/item.js');
const isItemPage = !!document.querySelector('#item');

common.run();
if (isItemPage) {
  item.run();
}
