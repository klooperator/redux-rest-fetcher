const pkg = require("./package.json");

const external = Object.keys(pkg.dependencies);

export default {
  input: "./index.js",
  plugins: [
    babel({
      babelrc: true,
      comments: true
    }),
    nodeResolve({
      jsnext: true
    })
  ],
  external,
  output: [
    {
      file: pkg.main,
      format: "umd",
      sourcemap: true,
      strict: false,
      exports: "named",
      name: "reduxrestfetcher"
    },
    {
      file: pkg["jsnext:main"],
      format: "es",
      sourcemap: true,
      strict: false
    }
  ]
};
