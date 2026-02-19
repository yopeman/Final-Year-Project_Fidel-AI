const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Fix for zustand 5 + expo web "import.meta" error
// Disabling package exports forces Metro to use the commonjs version of libraries
config.resolver.unstable_enablePackageExports = false;

module.exports = config;
