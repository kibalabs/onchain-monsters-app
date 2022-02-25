/* eslint-disable */
const InjectSeoPlugin = require('@kibalabs/build/scripts/plugins/injectSeoPlugin');

const title = 'web3images';
const description = 'web3images is the easiest way to add avatars for eth accounts in your dapp 🖼';
const url = 'https://web3-images.kibalabs.com'
const imageUrl = `${url}/assets/w3i-banner.png`;

const seoTags = [
  new InjectSeoPlugin.MetaTag('description', description),
  new InjectSeoPlugin.Tag('meta', {property: 'og:title', content: title}),
  new InjectSeoPlugin.Tag('meta', {property: 'og:description', content: description}),
  new InjectSeoPlugin.Tag('meta', {property: 'og:image', content: imageUrl}),
  new InjectSeoPlugin.Tag('meta', {property: 'og:url', content: url}),
  new InjectSeoPlugin.MetaTag('twitter:card', 'summary_large_image'),
  // new InjectSeoPlugin.MetaTag('twitter:site', '@mdtp_app'),
  new InjectSeoPlugin.Tag('link', {rel: 'canonical', href: url}),
  new InjectSeoPlugin.Tag('link', {rel: 'icon', type: 'image/png', href: '/assets/w3i-logo.png'}),
];

module.exports = (config) => {
  config.seoTags = seoTags;
  config.title = title;
  return config;
};
