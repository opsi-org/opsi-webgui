/** @type {import('vls').VeturConfig} */
module.exports = {
  settings: {
    "vetur.useWorkspaceDependencies": true,
    "vetur.experimental.templateInterpolationService": true,
    "eslint.useFlatConfig": true,
  },
  projects: [
    {
      root: "./frontend",
      package: "./package.json",
      tsconfig: "./tsconfig.json",
      snippetFolder: "./.vscode/vetur/snippets",
      globalComponents: ["./**/*.vue"],
    },
  ],
};
