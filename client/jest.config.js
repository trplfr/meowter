const { defaults } = require('jest-config')

module.exports = {
  setupFilesAfterEnv: ['<rootDir>/__mocks__/mocks.js'],
  transform: {
    '^.+\\.svg$': 'jest-svg-transformer',
    '^.+\\.jsx?$': 'babel-jest'
  },
  moduleNameMapper: {
    '\\.(jpg|ico|jpeg|png|gif|eot|otf|webp|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      '<rootDir>/__mocks__/fileMock.js',
    '^common/(.*)$': '<rootDir>/src/common/$1',
    '^assets/(.*)$': '<rootDir>/src/assets/$1',
    '^core/(.*)$': '<rootDir>/src/core/$1',
    '^screens/(.*)$': '<rootDir>/src/screens/$1',
    '^store(.*)$': '<rootDir>/src/store$1',
    '^test-utils$': '<rootDir>/utils/test-utils.js'
  }
}
