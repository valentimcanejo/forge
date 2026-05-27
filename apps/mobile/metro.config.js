const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// Watch the whole monorepo so Metro picks up changes in packages/
config.watchFolders = [monorepoRoot];

// Resolve modules from the app first, then the monorepo root
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules'),
];

// Expo 54 enables unstable_enablePackageExports by default, which causes
// @firebase/component to resolve to two different builds (ESM for import
// callers, CJS for require callers) — giving each a separate component
// registry so Firebase auth registration is invisible to initializeAuth.
// Disabling it reverts to resolverMainFields, which is consistent for all
// callers and still routes @firebase/auth to its react-native build via the
// top-level "react-native" field in @firebase/auth/package.json.
config.resolver.unstable_enablePackageExports = false;

// Force async-storage to always use the version declared in apps/mobile so
// the JS bridge and the native TurboModule are always in sync (v2.x)
config.resolver.extraNodeModules = {
  '@react-native-async-storage/async-storage': path.resolve(
    projectRoot,
    'node_modules/@react-native-async-storage/async-storage',
  ),
};

module.exports = config;
