require("@rushstack/eslint-patch/modern-module-resolution");

module.exports = {
  extends: ["@inrupt/eslint-config-lib"],
  parserOptions: {
    project: "./tsconfig.eslint.json",
  },
  rules: {
    // It is easier to do star exports in an index file without default exports
    "import/prefer-default-export": "off",
    // We need this for the way we are currently applying directives *however*
    // this does cause some weird side effects that we are seeing in tests if we want
    // to test different mappings on the same schema (since it mutates the schema)
    "no-param-reassign": "off",
    // This is here in place until https://github.com/inrupt/typescript-sdk-tools/pull/66 is closed
    "@typescript-eslint/consistent-type-imports": ["error", { prefer: "type-imports" }],
  },
};
