module.exports = {
    root: true, // Ensures ESLint doesn't look for configs in parent directories
    parser: "@typescript-eslint/parser", // Specifies the ESLint parser for TypeScript
    parserOptions: {
      ecmaVersion: 2020, // Allows for the parsing of modern ECMAScript features
      sourceType: "module", // Allows for the use of imports
      ecmaFeatures: { jsx: true }, // Allows for the parsing of JSX
    },
    plugins: [
      "@typescript-eslint", // TypeScript ESLint plugin
      "react", // React ESLint plugin
      "@next/next", // Next.js ESLint plugin
    ],
    extends: [
      "eslint:recommended", // ESLint's core recommended rules
      "plugin:@typescript-eslint/recommended", // Recommended rules from @typescript-eslint/eslint-plugin
      "plugin:react/recommended", // Recommended rules from eslint-plugin-react
      "plugin:react/jsx-runtime", // Rules for React's new JSX transform (removes need for import React)
      "plugin:@next/next/recommended", // RECOMMENDED: Next.js specific recommended rules
      "plugin:@next/next/core-web-vitals", // RECOMMENDED: Next.js specific Core Web Vitals rules
    ],
    rules: {

      "@typescript-eslint/no-explicit-any": "off", // Disables error for 'any' type usage
      "@typescript-eslint/no-unused-vars": "off", // Disables error for unused variables in TS
      "@typescript-eslint/ban-ts-comment": "off", // Allows @ts-ignore, @ts-expect-error comments
      "@typescript-eslint/no-empty-interface": "off", // Allows empty interface declarations
      "@typescript-eslint/no-empty-object-type": "off", // Allows empty object type declarations
      "no-var": "warn", // Changes 'var' usage to a warning instead of an error
      "no-useless-escape": "off", // Disables error on useless escape characters in regex
      "no-unsafe-optional-chaining": "off", // Disables error on unsafe optional chaining
      "no-unused-vars": "off", // Disables error for unused variables in JS (for non-TS files)
      "react/react-in-jsx-scope": "off", // Disabled as React 17+ doesn't require explicit React import for JSX
      "react/prop-types": "off", // Disabled as prop validation is handled by TypeScript interfaces
      "react/no-unescaped-entities": "warn", // Changes unescaped entities in JSX to a warning
      "react/no-unknown-property": ["error", { ignore: ["jsx", "global"] }], // Ignores specific unknown properties like 'jsx' and 'global'
    },
    settings: {
      // Settings for ESLint plugins
      react: {
        version: "detect" // Automatically detects the React version
      }
    },
  };
  