const pkg = require("./package.json");
import babel from "rollup-plugin-babel";
import nodeResolve from "rollup-plugin-node-resolve";
const external = Object.keys(pkg.dependencies);

export default {
  input: "./Communicator.js",
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
      file: pkg.rolledup,
      format: "umd",
      sourcemap: true,
      strict: false,
      exports: "named",
      name: "reduxrestfetcher"
    }
    /* {
      file: pkg["jsnext:main"],
      format: "es",
      sourcemap: true,
      strict: false
    } */
  ]
};
