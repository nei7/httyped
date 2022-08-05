module.exports = {
  env: {
    es2021: true,
    node: true,
  },
  extends: [],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },
  plugins: ["@typescript-eslint"],
  rules: {},
  ignorePatterns: ["dist", "node_modules", "examples", "scripts"],
};
