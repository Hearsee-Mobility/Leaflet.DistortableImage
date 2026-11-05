// Rules the existing code still breaks; run with `eslint -c .eslintrc.suggestions.cjs`.
// When a rule reaches 0 hits, move it into .eslintrc.json.
const testTitle = 'CallExpression[callee.name=/^(it|test)$/] > Literal.arguments:first-child';
const testBody = 'CallExpression[callee.name=/^(it|test)$/] > :function > BlockStatement';
const containsExpect = ':has(CallExpression[callee.name="expect"])';

module.exports = {
  reportUnusedDisableDirectives: true,
  rules: {
    'no-undef': 'error',
    'no-extra-semi': 'error',
    'no-unused-vars': 'error',
    'array-callback-return': 'error',
    'eqeqeq': 'error',
    'no-else-return': 'error',
    'id-length': ['error', {min: 2, properties: 'never', exceptions: ['L', 'x', 'y']}],
    'id-denylist': ['error',
      'evt', 'idx', 'el', 'opts', 'obj', 'img', 'imgs', 'arr', 'str', 'req', 'res', 'err', 'cb', 'fn', 'tmp'],
  },
  overrides: [
    {
      files: ['test/**/*.js'],
      rules: {
        'no-restricted-syntax': ['error',
          {selector: `${testTitle}[value=/^[^A-Z]/]`, message: 'Start the test title with an uppercase letter, as a sentence (team test-naming convention).'},
          {selector: `${testTitle}[value=/^[Ss]hould\\b/]`, message: 'Describe the behaviour directly instead of starting with "Should" (team test-naming convention).'},
          {
            selector: 'CallExpression[callee.name=/^(describe|it|test)$/] > Literal.arguments:first-child[value=/#\\w|\\w\\(\\)/]',
            message: 'Name the behaviour, not the method under test (team test-naming convention).',
          },
          {selector: `${testBody} > ${containsExpect} ~ ${containsExpect}`, message: 'Keep one assertion per test; split this into its own test (team test convention).'},
        ],
      },
    },
  ],
};
