module.exports = function() {
  const isProduction = process.env.NODE_ENV === 'production';
  return {
    defaultDescription:
      'Find inspiration for your custom magic items by browsing lore from other items',
    defaultTitle: 'Artefacts',
    defaultUrl: 'https://gamemaster.pixelastic.com/artefacts/',
    defaultAuthor: 'Tim Carry',
    defaultTwitter: 'pixelastic',
    isProduction,
  };
};
