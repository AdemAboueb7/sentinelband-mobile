import js from '@eslint/js';
import pluginReact from 'eslint-plugin-react';
import pluginReactHooks from 'eslint-plugin-react-hooks';

export default [
  js.configs.recommended,
  {
    files: ['App.js', 'src/**/*.{js,jsx}', '__tests__/**/*.{js,jsx}'],
    plugins: {
      react: pluginReact,
      'react-hooks': pluginReactHooks,
    },
    rules: {
      // React
      'react/prop-types': 'off', // JSDoc utilisé à la place
      'react/react-in-jsx-scope': 'off', // React 17+
      'react/display-name': 'off',
      'react/jsx-uses-vars': 'error',

      // Hooks
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // JS général
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^(_|React)' }],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-undef': 'error',
      'no-empty': ['error', { allowEmptyCatch: true }],
      'no-unsafe-finally': 'off',

      // Sécurité : pas de données sensibles dans les logs
      'no-debugger': 'error',
    },
    settings: {
      react: { version: 'detect' },
    },
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
      globals: {
        require: 'readonly',
        module: 'readonly',
        // React Native
        __DEV__: 'readonly',
        fetch: 'readonly',
        console: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        AbortController: 'readonly',
        Promise: 'readonly',
        // Jest
        describe: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        jest: 'readonly',
      },
    },
  },
];
