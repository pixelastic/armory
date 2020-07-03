const algolia = require('norska/frontend/algolia');
const { configure, hits } = require('norska/frontend/algolia/widgets');
const credentials = window.CONFIG.algolia;
const item = window.ITEM;
const transforms = require('./transforms.js');

module.exports = {
  run() {
    const widgets = [
      {
        type: configure,
        options: {
          hitsPerPage: 4,
          facetFilters: [`type:${item.type}`, `uniqueSlug:-${item.uniqueSlug}`],
          aroundLatLng: `${item._geoloc.lat}, ${item._geoloc.lng}`,
        },
      },
      {
        type: hits,
        options: {
          container: '#previews',
          templates: {
            item: document.getElementById('previewTemplate').value,
          },
        },
      },
    ];

    algolia
      .init(credentials)
      .setWidgets(widgets)
      .setTransforms(transforms)
      .start();
  },
};
