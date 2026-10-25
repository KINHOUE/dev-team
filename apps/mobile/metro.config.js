// Metro config — permet de consommer le package source `@dev-team/design-system`
// (situé dans packages/design-system) depuis l'app Expo, en transpilant son TS/TSX.
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// 1. Regarder aussi le monorepo (packages/design-system vit hors du projet).
config.watchFolders = [monorepoRoot];

// 2. Autoriser la résolution des node_modules depuis la racine du monorepo.
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules'),
];

// 3. Dédupliquer `react` : le design-system embarque son propre react 18 en
// devDependency. On force la résolution de `react` (et de son runtime JSX)
// vers la copie de l'app, pour qu'un seul react soit embarqué dans le bundle.
config.resolver.extraNodeModules = {
  react: path.resolve(projectRoot, 'node_modules', 'react'),
  'react/jsx-runtime': path.resolve(projectRoot, 'node_modules', 'react', 'jsx-runtime'),
  'react/jsx-dev-runtime': path.resolve(projectRoot, 'node_modules', 'react', 'jsx-dev-runtime'),
};

module.exports = config;
