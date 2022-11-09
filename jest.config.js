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
  // TODO: bump this to 100 - note that it is low since there are some functions we are moving to other packages,
  // and integration tests in the examples folder cover the code well
  coverageThreshold: {
    global: {
      branches: 20,
      functions: 10,
      lines: 25,
      statements: 10
    }
  }
};
