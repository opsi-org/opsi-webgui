module.exports = {
  // preset: 'jest-playwright-preset',
  testRegex: '(<rootDir>/components/.*|)\\.test.unit\\.jsx?$',
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
    '<rootDir>/components/**/*.{vue}'
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
    '<rootDir>/node_modules/',
    '<rootDir>/.*\\config.js',
    '<rootDir>/package.json',
    '<rootDir>/package-lock.json'
  ]
}