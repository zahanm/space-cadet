
var argv = require("optimist")
.usage("Clean up unwanted whitespace.\nUsage: $0 [-r]")
.options({
  'e': {
    alias: "extension",
    demand: true,
    desc: "files matching this extension will be checked"
  },
  'd': {
    alias: "depth",
    default: 1,
    desc: "filesystem depth to recurse into checking for files"
  }
})
.argv;

if (require.main == module) {
  console.log(argv);
}
