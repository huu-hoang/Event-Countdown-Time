module.exports = {
    preset: 'jest-expo',
    setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect'],
    transformIgnorePatterns: [
      "node_modules/(?!(jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|expo-modules-core|react-native-reanimated|@react-navigation/.*)"
    ],
    testPathIgnorePatterns: ['/node_modules/', '/e2e/'],
  };
  