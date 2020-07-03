const lazyload = require('norska/frontend/lazyload');
const algolia = require('norska/frontend/algolia');
const {
  configure,
  hits,
  pagination,
  searchBox,
} = require('norska/frontend/algolia/widgets');
const credentials = window.CONFIG.algolia;
const transforms = require('./_scripts/transforms.js');

const widgets = [
  /**
   * Main configuration
   **/
  {
    type: configure,
    options: {
      hitsPerPage: 100,
    },
  },
  /**
   * Searchbar
   **/
  {
    type: searchBox,
    options: {
      container: '#searchbox',
      placeholder: 'Search for item name or description',
      autofocus: true,
      showReset: false,
      showSubmit: false,
      showLoadingIndicator: false,
    },
  },
  /**
   * Hits
   **/
  {
    type: hits,
    options: {
      container: '#hits',
      templates: {
        item: document.getElementById('hitTemplate').value,
        empty: document.getElementById('emptyTemplate').value,
      },
    },
  },
  {
    type: pagination,
    options: {
      container: '#pagination',
    },
  },
];

algolia
  .init(credentials)
  .setWidgets(widgets)
  .setTransforms(transforms)
  .onSearch((query) => {
    if (!query) {
      document.body.removeAttribute('data-hasQuery');
      return;
    }
    document.body.setAttribute('data-hasQuery', '');
  })
  // .onDisplay(hit => {
  //   console.info(hit.picture);
  // })
  .start();

lazyload.init();
