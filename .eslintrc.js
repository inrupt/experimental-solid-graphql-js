require("@rushstack/eslint-patch/modern-module-resolution");

module.exports = {
  extends: ["@inrupt/eslint-config-lib"],
  parserOptions: {
    project: "./tsconfig.eslint.json",
  },
  plugins: ["unused-imports"],
  rules: {
    // This is disabled since we do not have a fixed interface for field configs yet. This may be re-enabled once that
    // is decided upon and all instances of explicit any are removed.
    "@typescript-eslint/no-explicit-any": "off",
    // This is disabled since there are some functions/interfaces that we have to implement where
    // we do not make use of all the parameters and thus trigger this rule
    "@typescript-eslint/no-unused-vars": "off",
    // It is easier to do star exports in an index file without default exports
    "import/prefer-default-export": "off",
    // We need this for the way we are currently applying directives *however*
    // this does cause some weird side effects that we are seeing in tests if we want
    // to test different mappings on the same schema (since it mutates the schema)
    "no-param-reassign": "off",
    // This is here in place until https://github.com/inrupt/typescript-sdk-tools/pull/66 is closed
    "@typescript-eslint/consistent-type-imports": ["error", { prefer: "type-imports" }],
    "unused-imports/no-unused-imports": "error",
  },
};
