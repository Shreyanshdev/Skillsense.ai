module.exports = {
    root: true,
    parser: "@typescript-eslint/parser",
    parserOptions: {
      ecmaVersion: 2020,
      sourceType: "module",
      ecmaFeatures: { jsx: true },
    },
    plugins: ["@typescript-eslint", "react"],
    extends: [
      "eslint:recommended",
      "plugin:@typescript-eslint/recommended",
      "plugin:react/recommended",
      "plugin:react/jsx-runtime"
    ],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "no-unused-vars": "off",
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      "react/no-unescaped-entities": "warn",
    },
    settings: {
      react: {
        version: "detect"
      }
    },
  };
  