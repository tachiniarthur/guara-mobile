// Expo configures Metro for monorepos automatically (watchFolders, node_modules
// resolution). Only NativeWind needs to be wired in here.
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

module.exports = withNativeWind(config, { input: './global.css' });
