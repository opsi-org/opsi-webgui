module.exports = {
  // preset: 'jest-playwright-preset',
  testRegex: '(<rootDir>/components/.*|)\\.spec-unit\\.jsx?$',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^~/(.*)$': '<rootDir>/$1',
    '^vue$': 'vue/dist/vue.common.js'
  },
  moduleFileExtensions: [
    'ts',
    'js',
    'vue',
    'json'
  ],
  transform: {
    '^.+\\.ts$': 'ts-jest',
    '^.+\\.js$': 'babel-jest',
    '.*\\.(vue)$': 'vue-jest'
  },
  verbose: true,
  collectCoverage: false,
  collectCoverageFrom: [
    'components/**/*.{vue}'
    // 'layouts/**/*.{js,ts,vue}',
    // 'pages/**/*.{js,ts,vue}',
    // 'scripts/**/*.{js,ts,vue}'
  ],
  testPathIgnorePatterns: [
    // 'components/**/*.spec.js',
    'test/integration/',
    'test/e2e/'
  ],
  coveragePathIgnorePatterns: [
    'node_modules/',
    '.*\\config.js',
    'package.json',
    'package-lock.json'
  ]
}
