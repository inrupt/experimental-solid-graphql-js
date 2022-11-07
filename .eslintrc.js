require("@rushstack/eslint-patch/modern-module-resolution");

module.exports = {
  extends: ["@inrupt/eslint-config-lib"],
  parserOptions: {
    project: "./tsconfig.eslint.json",
  },
  // TODO: re-enable most of these rules
  rules: {
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-unused-vars": "off",
    "import/prefer-default-export": "off",
    // We need this for the way we are currently applying directives *however*
    // this does cause some weird side effects that we are seeing in tests if we want
    // to test different mappings on the same schema (since it mutates the schema)
    "no-param-reassign": "off",
    "@typescript-eslint/ban-ts-comment": "off",

    // Keep these
    "@typescript-eslint/consistent-type-imports": ["error", { prefer: "type-imports" }],
  },
};
