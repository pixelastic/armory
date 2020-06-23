const cloudinary = require('norska/frontend/cloudinary');
cloudinary.init(window.CLOUDINARY_CONFIG);
const lazyloadAttributes = require('norska/frontend/lazyload/attributes');

module.exports = {
  preview(item) {
    const { gameSlug, slug } = item;
    const pathToRoot = window.PATH_TO_ROOT;
    const pictureUrl = `${pathToRoot}assets/pictures/${gameSlug}/${slug}.png`;
    const options = { width: 600, placeholder: { width: 200 } };
    return lazyloadAttributes(pictureUrl, options);
  },
};
