const isProduction = process.env.NODE_ENV === 'production';
const norskaConfig = require('../../norska.config.js');
const siteConfig = require('./site.js');
const baseUrl = isProduction ? siteConfig.defaultUrl : 'http://127.0.0.1:8083/';
module.exports = {
  isProduction,
  baseUrl,
  cloudinary: norskaConfig.cloudinary,
  algolia: {
    appId: 'O3F8QXYK6R',
    apiKey: '730f3328ddee2cec9d3407c72626c825',
    indexName: 'gamemaster_artefacts',
  },
};
