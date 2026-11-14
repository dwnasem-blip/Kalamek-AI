const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Fix for "Package subpath './src/lib/TerminalReporter' is not defined by 'exports' in metro/package.json"
const defaultSourceExts =
  require('react-native/Libraries/Utilities/Platform').select({
    native: require('metro-config').DEFAULT_EXTENSIONS,
    default: require('metro-config').DEFAULT_EXTENSIONS,
  }) || [];

config.resolver.sourceExts = [
  'mjs',
  'json',
  'ts',
  'tsx',
  ...defaultSourceExts.filter((ext) => ext !== 'json'),
];

module.exports = config;
