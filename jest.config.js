module.exports = {
  transform: {
    '^.+\\.ts$': 'ts-jest'
  },
  testRegex: '/test/.*-test.ts$',
  moduleFileExtensions: [
    'ts',
    'js'
  ],
  globals: {
    'ts-jest': {
      // Enabling this can fix issues when using prereleases of typings packages
      //isolatedModules: true
    },
  },
  collectCoverage: true,
  "collectCoverageFrom": [
    "packages/**/{!(*.d),}.ts",
    // TODO: re-enable this
    // "examples/**/{!(*.d),}.ts"
  ],
  testEnvironment: 'node',
  // TODO: re-enable this
  // coverageThreshold: {
  //   global: {
  //     branches: 100,
  //     functions: 100,
  //     lines: 100,
  //     statements: 100
  //   }
  // }
};
