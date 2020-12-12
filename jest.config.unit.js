module.exports = {
  'transform': {
    '^.+\\.tsx?$': 'ts-jest'
  },
  'testEnvironment': 'node',
  'verbose': true,
  'collectCoverage': true,
  'rootDir': `src`,
  'testRegex': '(/__tests__/.*|(\\.|/)(unit))\\.(jsx?|tsx?)$',
  'coverageDirectory': `coverage/unit`,
  'moduleFileExtensions': [
    'ts',
    'tsx',
    'js',
    'jsx',
    'json',
    'node'
  ]
}