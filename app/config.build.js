/* eslint-disable */
const InjectSeoPlugin = require('@kibalabs/build/scripts/plugins/injectSeoPlugin');

const title = 'On-Chain Monsters';
const description = 'The un-official dapp for interacting with On-Chain Monsters';
const url = 'https://onchain-monsters.tokenpage.xyz'
const imageUrl = `${url}/assets/banner.png`;

const seoTags = [
  new InjectSeoPlugin.MetaTag('description', description),
  new InjectSeoPlugin.Tag('meta', {property: 'og:title', content: title}),
  new InjectSeoPlugin.Tag('meta', {property: 'og:description', content: description}),
  new InjectSeoPlugin.Tag('meta', {property: 'og:image', content: imageUrl}),
  new InjectSeoPlugin.Tag('meta', {property: 'og:url', content: url}),
  new InjectSeoPlugin.MetaTag('twitter:card', 'summary_large_image'),
  // new InjectSeoPlugin.MetaTag('twitter:site', '@mdtp_app'),
  new InjectSeoPlugin.Tag('link', {rel: 'canonical', href: url}),
  new InjectSeoPlugin.Tag('link', {rel: 'icon', type: 'image/png', href: '/assets/logo.png'}),
];

module.exports = (config) => {
  config.seoTags = seoTags;
  config.title = title;
  return config;
};
