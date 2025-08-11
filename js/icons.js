export const iconMap = {
  angular: 'assets/icons/skills/angular.svg',
  css3: 'assets/icons/skills/css3.svg',
  figma: 'assets/icons/skills/figma.svg',
  flutter: 'assets/icons/skills/flutter.svg',
  html5: 'assets/icons/skills/html5.svg',
  illustrator: 'assets/icons/skills/Illustrator.svg',
  javascript: 'assets/icons/skills/javascript.svg',
  mongodb: 'assets/icons/skills/mongodb.svg',
  node: 'assets/icons/skills/node.svg',
  photoshop: 'assets/icons/skills/photoshop.svg',
  react: 'assets/icons/skills/react.svg',
  shopify: 'assets/icons/skills/shopify.svg',
  sql: 'assets/icons/skills/sql.svg',
  tailwind: 'assets/icons/skills/tailwind.svg',
  vue: 'assets/icons/skills/vue.svg',
  wordpress: 'assets/icons/skills/wordpress.svg',
  json: 'assets/icons/skills/json.svg',
  c: 'assets/icons/skills/C.svg',
};

export function getIconMarkup(name, useWhiteIcon = false) {
  if (!name) return '';
  if (iconMap[name]) {
    let src = iconMap[name];
    if (useWhiteIcon) {
      src = src.replace('.svg', '-w.svg');
    }
    return `<img loading="lazy" width="30" height="30" src="${src}" alt="${name} icon">`;
  }
  if (name.includes('fa-')) {
    return `<i class="${name}"></i>`;
  }
  return '';
}