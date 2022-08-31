/** @type {import('@remix-run/dev').AppConfig} */
module.exports = {
  ignoredRouteFiles: ["**/.*"],
  // appDirectory: "app",
  // assetsBuildDirectory: "public/build",
  // serverBuildPath: "build/index.js",
  // publicPath: "/build/",
  serverDependenciesToBundle: [
    'remark-gfm',
    /micromark-.*/,
    /mdast-.*/,
    'ccount',
    /unist-.*/,
    'decode-named-character-reference',
    'character-entities',
    'markdown-table'
  ]
};
