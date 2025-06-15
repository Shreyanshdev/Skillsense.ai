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
      "@typescript-eslint/ban-ts-comment": "off", // ✅ allow ts-ignore
      "@typescript-eslint/no-empty-interface": "off", // ✅ allows `interface {}` without error
      "@typescript-eslint/no-empty-object-type": "off", // ✅ relax interface rules
      "no-var": "warn", // ✅ downgrade var usage to warning
      "no-useless-escape": "off", // ✅ disable error on \. in regex
      "no-unsafe-optional-chaining": "off", // ✅ disable fatal error
      "no-unused-vars": "off",
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      "react/no-unescaped-entities": "warn", // ✅ warn, not fail
    },
    settings: {
      react: {
        version: "detect"
      }
    },
  };
  