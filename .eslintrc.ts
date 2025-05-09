module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true, // Optional if using Node.js
  },
  extends: [
    'eslint:recommended', // Base ESLint rules
    'plugin:react/recommended', // React-specific linting rules
    'plugin:react-hooks/recommended', // Rules for React Hooks
    'plugin:@typescript-eslint/recommended', // TypeScript rules
    'plugin:prettier/recommended', // Prettier integration
  ],
  parser: '@typescript-eslint/parser', // TypeScript parser
  parserOptions: {
    ecmaFeatures: {
      jsx: true, // Enable JSX linting
    },
    ecmaVersion: 'latest', // Use the latest ECMAScript version
    sourceType: 'module', // Enable ECMAScript modules
  },
  plugins: [
    'react', // React plugin
    'react-hooks', // React Hooks plugin
    '@typescript-eslint', // TypeScript plugin
    'prettier', // Prettier plugin
  ],
  rules: {
    // React Rules
    'react/react-in-jsx-scope': 'off', // Not needed in modern React (e.g., Next.js)
    'react/prop-types': 'off', // Disable prop-types (TypeScript handles this)
    // TypeScript Rules
    '@typescript-eslint/no-unused-vars': [
      'warn',
      { argsIgnorePattern: '^_' }, // Ignore unused vars starting with "_"
    ],
    '@typescript-eslint/no-explicit-any': 'warn', // Warn against `any` type
    '@typescript-eslint/explicit-function-return-type': [
      'off', // Optional rule; enable if strict typing is required
    ],
    '@typescript-eslint/no-empty-function': 'warn', // Warn for empty functions
    // Prettier
    'prettier/prettier': 'error', // Highlight Prettier formatting issues as errors
    // General Rules
    'no-console': ['warn', { allow: ['warn', 'error'] }], // Allow warnings/errors
  },
  settings: {
    react: {
      version: 'detect', // Automatically detect React version
    },
  },
  overrides: [
    {
      // Override settings for test files
      files: ['**/*.test.{js,jsx,ts,tsx}', '**/__tests__/**/*.{js,jsx,ts,tsx}'],
      env: {
        jest: true, // Enable Jest environment for test files
      },
    },
  ],
};
