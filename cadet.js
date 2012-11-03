
/*
Requirements
*/

var fs = require("fs");
var path = require("path");
var async = require("async");

var argv = require('optimist')
.usage("Clean up unwanted whitespace.\nUsage: $0 <dir>")
.options({
  'e': {
    alias: "ext",
    demand: true,
    desc: "files matching this extension will be checked"
  },
  'v': {
    alias: "verbose",
    desc: "enable verbose output"
  },
  'd': {
    alias: "depth",
    default: 1,
    desc: "filesystem depth to recurse into checking for files"
  }
})
.argv;

/*
Global state
*/
var launchpad;
var explorationlimit = 5;
var lineSep = "\n";

function abortLaunch(err) {
  if (err) {
    console.error("Hit an issue while launching:");
    console.error(err.message);
    console.error();
    process.exit(err.code);
  }
}

function mutations(raw) {
  var rawlines = raw.split(lineSep);
  return rawlines.map(function (line) {
    return line.trimRight();
  }).join(lineSep);
}

function visitSector(location) {
  fs.readdir(location, function (err, files) {
    abortLaunch(err);
    if (argv.verbose) console.log("> " + location);
    async.forEachLimit(files, explorationlimit, function (f, next) {
      if (path.extname(f) !== argv.ext) {
        next();
        return;
      }
      fs.readFile(path.join(location, f), 'utf8', function (err, data) {
        abortLaunch(err);
        if (argv.verbose) console.log(". " + path.join(location, f));
        var clean = mutations( String(data) );
        fs.writeFile(path.join(location, f), clean, 'utf8', function (err) {
          abortLaunch(err);
          next();
        });
      });
    }, function (err) {
      abortLaunch(err);
    });
  });
}

function blastOff() {
  if (argv._.length) {
    launchpad = argv._[0];
  } else {
    launchpad = ".";
  }
  if (argv.ext[0] !== '.') {
    argv.ext = "." + argv.ext.trim();
  }
  visitSector(launchpad);
}

if (require.main == module) {
  blastOff();
}
