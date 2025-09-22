module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // The updated Reanimated plugin name
      'react-native-worklets/plugin',
    ],
  };
};