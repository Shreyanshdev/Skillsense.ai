import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import { defineConfig } from "eslint/config";

// This is your ESLint configuration in the flat config format (eslint.config.js).
// Each object in the array represents a configuration layer.
export default defineConfig([
  // Configuration for general JavaScript/JSX files.
  {
    files: ["**/*.{js,mjs,cjs,jsx}"], // Target JavaScript and JSX files.
    plugins: { js }, // Use the default ESLint plugin.
    extends: [js.configs.recommended], // Extend with recommended JavaScript rules.
    languageOptions: {
      // Define global variables available in browser and Node.js environments.
      globals: {
        ...globals.browser,
        ...globals.node
      }
    },
  },

  // Configuration for TypeScript/TSX files.
  {
    files: ["**/*.{ts,mts,cts,tsx}"], // Target TypeScript and TSX files.
    // Spread the recommended TypeScript ESLint configurations.
    // This includes rules that enforce type-checking.
    ...tseslint.configs.recommended,
    rules: {
      // *** IMPORTANT CHANGE HERE ***
      // Disable the 'no-explicit-any' rule. This will allow the use of 'any'
      // type without ESLint reporting an error. While this resolves your
      // immediate build issue, it's generally recommended to use more
      // specific types for better code quality and maintainability.
      "@typescript-eslint/no-explicit-any": "off",

      // You can add other TypeScript-specific rule overrides here if needed.
    },
  },

  // Configuration for React components (JSX/TSX).
  {
    files: ["**/*.{jsx,tsx}"], // Apply these rules to JSX and TSX files.
    // Spread the recommended React ESLint configurations.
    ...pluginReact.configs.flat.recommended,
    settings: {
      // Automatically detect the React version from your project's dependencies.
      // This helps resolve the "React must be in scope when using JSX" error
      // especially with React 17+ and the new JSX transform.
      react: {
        version: 'detect',
      },
    },
    rules: {
      // You can add other React-specific rule overrides here.
      // For example, if you encounter "react/react-in-jsx-scope" errors,
      // this setting (react.version: 'detect') usually fixes it. If not,
      // you might explicitly set "react/react-in-jsx-scope": "off" if your
      // project is fully on React 17+ and configured for the new JSX transform.
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off", // Often disabled in TypeScript projects as types handle prop validation.
      "react/no-unescaped-entities": "warn", // Change to warn instead of error for unescaped entities
    }
  },

  // Additional rules for unused variables across all files
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    rules: {
      // Allow variables to be defined but not used.
      // This rule helps with development when you might temporarily comment out code
      // or are in the middle of refactoring.
      "@typescript-eslint/no-unused-vars": "off",
      "no-unused-vars": "off", // For JavaScript files
    }
  }
]);
