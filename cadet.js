
var argv = require("optimist")
.usage("Clean up unwanted whitespace.\nUsage: $0 [-r]")
.demand('e')
.default('d', 1)
.alias({
  'd': "depth",
  'e': "extension"
})
.describe({
  'd': "filesystem depth to recurse into checking for files",
  'e': "files matching this extension will be checked"
})
.argv;

if (require.main == module) {
  console.log(argv);
}
