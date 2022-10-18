require("@rushstack/eslint-patch/modern-module-resolution");

module.exports = {
  extends: ["@inrupt/eslint-config-lib"],
  parserOptions: {
    project: "./tsconfig.eslint.json",
  },
  rules: {
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-unused-vars": "off",
    "@typescript-eslint/no-use-before-define": "off",
    "import/prefer-default-export": "off",
    "import/no-unresolved": "off",
    "no-param-reassign": "off",
    "@typescript-eslint/ban-ts-comment": "off",
    "@typescript-eslint/no-non-null-assertion": "off",
    "no-underscore-dangle": "off"
  },
};
