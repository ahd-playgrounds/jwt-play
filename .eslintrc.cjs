module.exports = {
  root: true,
  env: {
    es2021: true,
    node: true,
  },
  extends: ['airbnb-base', 'prettier'],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    'import/extensions': ['error', 'ignorePackages'],
    'no-use-before-define': [
      'error',
      {
        functions: false,
        classes: false,
      },
    ],
  },
};
